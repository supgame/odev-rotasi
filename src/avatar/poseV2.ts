import manifest from '../../public/av/pose/v2/manifest.json' with { type: 'json' }
import type { Part } from './render'
import { registerClip } from './render'
import { POSE_JAWS } from './poseV2Jaw'

export interface PoseReaction {
  type: 'nod' | 'nose'
  pivot: [number, number]
  label: string
  reply: string
}

interface PoseGarment {
  body: string
  skinMask: string
  clothMask: string
  skinRef: number
  clothRef: number
  front?: string
  frontSkinMask?: string
  frontClothMask?: string
  pet: string
  /** Actual animal hit target in full-scene 512px coordinates. */
  petRect?: [number, number, number, number]
  /** Head/nose removed from pet, placed here at its exact resting position. */
  detail: string
  reaction?: PoseReaction
}

interface PoseTemplate {
  animal: string
  /** Existing persisted IDs without the pose_ prefix; rabbit uses hug. */
  pose: string
  head: { scale: number; dx: number; dy: number; clip: string | string[] }
  garments: Record<string, PoseGarment>
  reaction: PoseReaction
}

export interface PoseV2Selection { template: PoseTemplate; garment: PoseGarment; reaction: PoseReaction }

/** Missing garments/poses deliberately keep the original renderer. */
const finiteArray = (v: unknown, length: number): v is number[] => Array.isArray(v) && v.length === length && v.every(Number.isFinite)
function validReaction(value: unknown): value is PoseReaction {
  if (!value || typeof value !== 'object') return false
  const r = value as Partial<PoseReaction>
  return (r.type === 'nod' || r.type === 'nose') && finiteArray(r.pivot, 2) && typeof r.label === 'string' && typeof r.reply === 'string'
}
function validTemplate(value: unknown): value is PoseTemplate {
  if (!value || typeof value !== 'object') return false
  const p = value as Partial<PoseTemplate>
  const h = p.head
  return typeof p.animal === 'string' && typeof p.pose === 'string' && !!h && Number.isFinite(h.scale) && h.scale > 0 && Number.isFinite(h.dx) && Number.isFinite(h.dy)
    && (typeof h.clip === 'string' || Array.isArray(h.clip) && h.clip.every((c) => typeof c === 'string'))
    && validReaction(p.reaction) && !!p.garments && typeof p.garments === 'object'
    && Object.values(p.garments).every((g) => ['body', 'skinMask', 'clothMask', 'pet', 'detail'].every((key) => typeof g[key as keyof PoseGarment] === 'string')
      && Number.isFinite(g.skinRef) && g.skinRef > 0 && Number.isFinite(g.clothRef) && g.clothRef > 0
      && (!g.petRect || finiteArray(g.petRect, 4) && g.petRect[2] > 0 && g.petRect[3] > 0)
      && (!g.reaction || validReaction(g.reaction)))
}
const templates: PoseTemplate[] = (manifest.poses as unknown[]).filter(validTemplate)

export function poseV2For(animal: string, pose: string, clothes: string | undefined): PoseV2Selection | undefined {
  const template = templates.find((p) => p.animal === animal && p.pose === pose)
  const garment = clothes && template?.garments[clothes]
  return template && garment ? { template, garment, reaction: garment.reaction ?? template.reaction } : undefined
}

function atHead(part: Part, head: PoseTemplate['head']): Part {
  return {
    ...part,
    scale: (part.scale ?? 1) * head.scale,
    ...(part.scaleY !== undefined ? { scaleY: part.scaleY * head.scale } : {}),
    dx: head.dx + (part.dx ?? 0) * head.scale,
    dy: head.dy + (part.dy ?? 0) * head.scale,
  }
}

export function poseV2Parts(pose: PoseV2Selection, back: Part[], head: Part[], hairFront: Part[], skin?: string, cloth?: string, metallic?: boolean, faceShape = 'oval') {
  const art = pose.garment
  const materials = (src: string, skinMask?: string, clothMask?: string): Part => ({
    src,
    dyes: [
      ...(skin && skinMask ? [{ mask: skinMask, ref: art.skinRef, color: skin }] : []),
      ...(cloth && clothMask ? [{ mask: clothMask, ref: art.clothRef, color: cloth, metallic }] : []),
    ],
  })
  const transform = (p: Part) => atHead(p, pose.template.head)
  // Jaw points follow each original face's dark chin outline. Transform the
  // source path into the compositor's 640px scene coordinates; unlike a flat
  // crop this removes old neck/shirt without flattening round or long chins.
  const h = pose.template.head
  const point = ([x, y]: [number, number]) => `${+(((x - 256) * h.scale + 256 + h.dx) * 1.25).toFixed(3)} ${+(((y - 256) * h.scale + 256 + h.dy) * 1.25).toFixed(3)}`
  const jaw = POSE_JAWS[faceShape] ?? POSE_JAWS.oval
  const jawClip = `M${point([0, 0])}L${point([512, 0])}L${point([512, 260])}L${[...jaw].reverse().map(point).join('L')}L${point([0, 260])}Z`
  const jawId = `jaw:${pose.template.animal}:${pose.template.pose}:${faceShape}:${h.scale}:${h.dx}:${h.dy}`
  registerClip(jawId, jawClip)
  return {
    base: [
      ...back.map(transform),
      materials(art.body, art.skinMask, art.clothMask),
      ...head.map((p) => {
        const transformed = transform(p)
        const clips = typeof transformed.clip === 'string' ? [transformed.clip] : transformed.clip ?? []
        const headClips = typeof pose.template.head.clip === 'string' ? [pose.template.head.clip] : pose.template.head.clip
        return { ...transformed, clip: [...clips, ...headClips], clipId: jawId }
      }),
      ...hairFront.map(transform),
      { src: art.pet },
    ],
    detail: [{ src: art.detail }],
    front: art.front ? [materials(art.front, art.frontSkinMask, art.frontClothMask)] : [],
  }
}
