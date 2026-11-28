import type { CSSProperties } from 'react'
import type { HeldArt, HeldKind } from './held'

const ASSETS = (import.meta.env.BASE_URL ?? '/') + 'av/'

export function HeldScene({ art, kind, grip, style, playing }: {
  art: HeldArt; kind: HeldKind; grip?: string; style: CSSProperties; playing: boolean
}) {
  return <div className={`av-held av-held-${kind}${playing ? ' av-held-playing' : ''}`} style={style} aria-hidden="true">
    {grip && <>
      <img className="av-held-object" src={ASSETS + art.item} alt="" draggable={false} />
      {art.motion && <img className="av-held-flight" src={ASSETS + art.motion} alt="" draggable={false} />}
      {playing && art.page && <img className="av-book-leaf" src={ASSETS + art.page} alt="" draggable={false} />}
      <img className="av-held-grip" src={grip} alt="" draggable={false} />
    </>}
  </div>
}
