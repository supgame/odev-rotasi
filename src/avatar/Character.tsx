// Karakter çizimi (100x100 SVG koordinatı). Tür tanımları catalog.ts'de; burası yalnız çizer.
// Kafa merkezi (50,52), gözler (40,48)/(60,48), burun (50,57), omuzlar altta.
import type { ReactNode } from 'react'
import type { Species } from './catalog'

export type Mood = 'idle' | 'happy' | 'wow'
export interface Look { x: number; y: number } // -1..1

const INK = '#2b2140'
const LINE = 'rgba(0,0,0,.2)'

/** Bir parçayı ve x=50'ye göre aynasını çizer. */
function Mirror({ children }: { children: ReactNode }) {
  return (<>{children}<g transform="translate(100 0) scale(-1 1)">{children}</g></>)
}

export function headShape(sp: Species, props: Record<string, unknown> = {}) {
  switch (sp.shape) {
    case 'wide': return <ellipse cx="50" cy="53" rx="32" ry="25" {...props} />
    case 'tall': return <ellipse cx="50" cy="51" rx="26" ry="29" {...props} />
    case 'square': return <rect x="22" y="25" width="56" height="54" rx="13" {...props} />
    case 'drop': return <path d="M50 21 C79 21 83 46 77 62 C71 78 60 82 50 82 C40 82 29 78 23 62 C17 46 21 21 50 21Z" {...props} />
    default: return <ellipse cx="50" cy="52" rx="29" ry="27" {...props} />
  }
}

// ---------- arka (kafanın arkası) ----------
export function BackFeature({ sp }: { sp: Species }) {
  const c = sp.back ?? sp.body
  const ring = (n: number, rad: number, r: number, fill: string, stroke = LINE) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2
      return <circle key={i} cx={50 + Math.cos(a) * rad} cy={52 + Math.sin(a) * rad} r={r} fill={fill} stroke={stroke} strokeWidth="1" />
    })
  switch (sp.backKind) {
    case 'mane': return <g><circle cx="50" cy="52" r="36" fill={c} />{ring(16, 32, 9, c, 'none')}</g>
    case 'wool': return <g>{ring(14, 27, 11, c)}</g>
    case 'petals': return <g>{ring(12, 31, 10, c)}</g>
    case 'spikes':
      return (
        <g fill={c} stroke={LINE}>
          {Array.from({ length: 11 }, (_, i) => {
            const a = Math.PI + (i / 10) * Math.PI * 1.0 - 0.0
            const a1 = a - 0.16, a2 = a + 0.16
            const p = (ang: number, r: number) => `${50 + Math.cos(ang) * r},${54 + Math.sin(ang) * r}`
            return <polygon key={i} points={`${p(a1, 26)} ${p(a, 42)} ${p(a2, 26)}`} />
          })}
        </g>
      )
    case 'rays':
      return (
        <g fill={c}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2
            const p = (ang: number, r: number) => `${50 + Math.cos(ang) * r},${52 + Math.sin(ang) * r}`
            return <polygon key={i} points={`${p(a - 0.18, 28)} ${p(a, 44)} ${p(a + 0.18, 28)}`} />
          })}
        </g>
      )
    case 'dinospikes':
      return <g fill={c} stroke={LINE}><polygon points="36,30 40,14 46,27" /><polygon points="45,26 50,8 55,26" /><polygon points="54,27 60,14 64,30" /></g>
    case 'wings':
      return <Mirror><path d="M27 58 Q2 46 4 18 Q12 28 18 26 Q16 36 24 38 Q22 46 32 50Z" fill={c} stroke={LINE} strokeWidth="1.2" /></Mirror>
    case 'leaf':
      return (
        <g>
          <path d="M50 28 L50 14" stroke={c} strokeWidth="3" strokeLinecap="round" />
          <path d="M50 16 Q38 4 30 12 Q40 20 50 16Z" fill={c} /><path d="M50 14 Q62 0 72 8 Q62 18 50 14Z" fill={c} />
        </g>
      )
  }
  return null
}

// ---------- kulaklar ----------
export function Ears({ sp, front }: { sp: Species; front: boolean }) {
  const c = sp.ear ?? sp.body
  const inner = sp.inner ?? sp.accent
  const st = { stroke: LINE, strokeWidth: 1.2 }
  if (front) {
    switch (sp.ears) {
      case 'droop': return <Mirror><ellipse cx="22" cy="52" rx="8" ry="17" transform="rotate(18 22 52)" fill={c} {...st} /></Mirror>
      case 'tuft': return <g fill={sp.back ?? sp.body} {...st}><path d="M44 27 Q42 14 47 12 Q48 20 50 25 Q52 18 55 13 Q58 20 56 27Z" /></g>
    }
    if (sp.backKind === 'crest') return <path d="M36 30 Q40 14 56 15 Q50 19 53 22 Q60 18 66 24 Q56 24 54 31 Q47 24 36 30Z" fill={sp.back} stroke={LINE} />
    return null
  }
  switch (sp.ears) {
    case 'point': return <Mirror><path d="M25 40 Q22 16 30 12 Q40 18 46 28Z" fill={c} {...st} /><path d="M29 33 Q28 21 31 18 Q36 22 40 28Z" fill={inner} /></Mirror>
    case 'round': return <Mirror><circle cx="28" cy="30" r="10" fill={c} {...st} /><circle cx="28" cy="30" r="5.5" fill={inner} /></Mirror>
    case 'smallround': return <Mirror><circle cx="30" cy="31" r="7.5" fill={c} {...st} /><circle cx="30" cy="31" r="4" fill={inner} /></Mirror>
    case 'biground': return <Mirror><circle cx="24" cy="32" r="15" fill={c} {...st} /><circle cx="25" cy="33" r="9.5" fill={inner} /></Mirror>
    case 'long': return <Mirror><ellipse cx="39" cy="14" rx="7" ry="20" transform="rotate(-10 39 14)" fill={c} {...st} /><ellipse cx="39" cy="15" rx="3.5" ry="14" transform="rotate(-10 39 15)" fill={inner} /></Mirror>
    case 'big': return <Mirror><ellipse cx="18" cy="50" rx="16" ry="19" fill={c} {...st} /><ellipse cx="19" cy="50" rx="10" ry="13" fill={inner} /></Mirror>
    case 'side': return <Mirror><circle cx="20" cy="52" r="9" fill={c} {...st} /><circle cx="20" cy="52" r="5" fill={inner} /></Mirror>
    case 'horns':
      return (
        <Mirror>
          {sp.inner && <ellipse cx="21" cy="42" rx="8" ry="4.5" transform="rotate(-20 21 42)" fill={sp.body} {...st} />}
          <path d="M34 30 Q24 26 25 13 Q30 22 39 26Z" fill={c} {...st} />
        </Mirror>
      )
    case 'goat': return <Mirror><ellipse cx="21" cy="44" rx="8" ry="4" transform="rotate(25 21 44)" fill={sp.body} {...st} /><path d="M38 27 Q30 12 20 14 Q28 18 33 30Z" fill={c} {...st} /></Mirror>
    case 'antenna': return <Mirror><path d="M40 28 L33 10" stroke={sp.ear ?? INK} strokeWidth="2.5" strokeLinecap="round" /><circle cx="33" cy="9" r="4.5" fill={c} {...st} /></Mirror>
    case 'unihorn':
      return (
        <g>
          <Mirror><path d="M28 36 Q26 20 32 16 Q38 22 42 30Z" fill={sp.body} {...st} /></Mirror>
          <polygon points="44,27 50,0 56,27" fill={c} stroke="#e6a700" strokeWidth="1.2" />
          <path d="M46 21 L54 18 M47 13 L53 11" stroke="#e6a700" strokeWidth="1.5" />
        </g>
      )
    case 'dragon': return <Mirror><path d="M36 28 Q26 18 30 4 Q34 16 42 25Z" fill={c} {...st} /><path d="M23 42 L12 34 L26 36Z" fill={sp.body} {...st} /></Mirror>
    case 'antlers':
      return (
        <g>
          <Mirror><path d="M37 28 L30 10 M33 19 L23 15 M31 13 L35 4" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" /></Mirror>
          <Mirror><path d="M24 40 Q16 30 22 28 Q30 30 32 36Z" fill={sp.body} {...st} /></Mirror>
        </g>
      )
    case 'ossicone':
      return (
        <g>
          <Mirror><path d="M42 28 L40 14" stroke={sp.body} strokeWidth="5" strokeLinecap="round" /><circle cx="40" cy="12" r="4.5" fill={c} /></Mirror>
          <Mirror><ellipse cx="22" cy="40" rx="8" ry="4" transform="rotate(-25 22 40)" fill={sp.body} {...st} /></Mirror>
        </g>
      )
    case 'fin': return <path d="M40 30 Q48 2 64 26Z" fill={c} {...st} />
    case 'bat': return <Mirror><path d="M25 42 L18 6 L45 27Z" fill={c} {...st} /><path d="M27 34 L23 15 L38 27Z" fill={inner} /></Mirror>
    case 'comb': return <path d="M40 28 Q38 16 45 18 Q46 10 52 15 Q57 10 59 19 Q65 18 61 28Z" fill="#e5484d" />
  }
  return null
}

// ---------- desenler (kafa şekline kırpılır) ----------
export function Marks({ sp }: { sp: Species }) {
  const m = sp.mark ?? 'rgba(0,0,0,.25)'
  const a = sp.accent
  return (
    <>
      {sp.marks?.map((k) => {
        switch (k) {
          case 'muzzle': return <ellipse key={k} cx="50" cy="63" rx="14" ry="10" fill={a} />
          case 'facedisc': return <g key={k} fill={a}><circle cx="40" cy="48" r="12" /><circle cx="60" cy="48" r="12" /><ellipse cx="50" cy="58" rx="15" ry="12" /></g>
          case 'monkeyface': return <g key={k} fill={a}><circle cx="41" cy="48" r="10.5" /><circle cx="59" cy="48" r="10.5" /><ellipse cx="50" cy="62" rx="15" ry="11" /></g>
          case 'faceheart': return <path key={k} d="M50 37 C41 27 22 32 24 50 C26 66 40 76 50 82 C60 76 74 66 76 50 C78 32 59 27 50 37Z" fill={a} />
          case 'mask': return <ellipse key={k} cx="50" cy="48" rx="27" ry="8.5" fill={m} />
          case 'patches': return <g key={k} fill={m}><ellipse cx="39" cy="49" rx="7.5" ry="9.5" transform="rotate(28 39 49)" /><ellipse cx="61" cy="49" rx="7.5" ry="9.5" transform="rotate(-28 61 49)" /></g>
          case 'stripes':
            return (
              <g key={k} stroke={m} strokeWidth="3" strokeLinecap="round">
                <path d="M50 25 L50 34 M43 26 L45 33 M57 26 L55 33" />
                <Mirror><path d="M21 49 L29 51 M21 56 L28 56" /></Mirror>
              </g>
            )
          case 'zebra':
            return <g key={k} stroke={m} strokeWidth="4" fill="none" strokeLinecap="round"><path d="M40 24 Q44 32 40 38 M50 22 L50 34 M60 24 Q56 32 60 38" /><Mirror><path d="M20 46 Q28 48 30 42 M20 56 Q28 58 30 54" /></Mirror></g>
          case 'spots': return <g key={k} fill={m}><circle cx="31" cy="37" r="5" /><circle cx="66" cy="33" r="4" /><circle cx="73" cy="56" r="5" /><circle cx="27" cy="63" r="4" /><circle cx="56" cy="29" r="2.8" /></g>
          case 'belly': return <ellipse key={k} cx="50" cy="78" rx="26" ry="14" fill={a} />
          case 'cheekfluff': return <g key={k} fill={a}><circle cx="30" cy="61" r="11" /><circle cx="70" cy="61" r="11" /></g>
          case 'blaze': return <path key={k} d="M46 24 L54 24 L52.5 56 L47.5 56Z" fill={a} />
          case 'freckles': return <g key={k} fill={m} opacity=".7"><Mirror><circle cx="29" cy="58" r="1.6" /><circle cx="33" cy="62" r="1.6" /><circle cx="27" cy="63" r="1.4" /><circle cx="40" cy="31" r="2" /></Mirror></g>
          case 'bands': return <g key={k} fill={m}><rect x="20" y="28" width="60" height="5" /><rect x="20" y="72" width="60" height="5" /></g>
          case 'ribs': return <g key={k} stroke={m} strokeWidth="2" fill="none"><path d="M40 29 Q34 53 40 77 M60 29 Q66 53 60 77 M50 28 L50 78" /></g>
          case 'hexes': return <g key={k} fill={m}><polygon points="44,28 50,25 56,28 56,34 50,37 44,34" /><polygon points="30,36 35,33 40,36 40,41 35,44 30,41" /><polygon points="60,36 65,33 70,36 70,41 65,44 60,41" /></g>
          case 'seeds': return <g key={k} stroke={m} strokeWidth="1.6" strokeLinecap="round"><path d="M32 36 l2 2 M66 34 l-2 2 M30 66 l2 -2 M70 66 l-2 -2 M50 28 l0 3 M26 50 l3 0 M74 50 l-3 0" /></g>
          case 'screen': return <rect key={k} x="27" y="37" width="46" height="22" rx="9" fill={a} />
        }
        return null
      })}
    </>
  )
}

// ---------- vücut (omuzlar) ----------
export function Body({ sp }: { sp: Species }) {
  const ex = sp.extras ?? []
  if (ex.includes('tentacles'))
    return (
      <g strokeLinecap="round" fill="none">
        {['M34 72 Q26 88 18 92', 'M43 76 Q40 92 34 100', 'M57 76 Q60 92 66 100', 'M66 72 Q74 88 82 92'].map((d) => (
          <g key={d}><path d={d} stroke={LINE} strokeWidth="10" /><path d={d} stroke={sp.body} strokeWidth="8" /></g>
        ))}
      </g>
    )
  if (ex.includes('wavy'))
    return <path d="M22 66 L22 98 Q27 92 32 98 Q37 92 42 98 Q47 92 52 98 Q57 92 62 98 Q67 92 72 98 Q76 94 78 98 L78 66Z" fill={sp.body} stroke={LINE} strokeWidth="1.2" />
  return (
    <g>
      <ellipse cx="50" cy="104" rx="31" ry="22" fill={sp.body} stroke={LINE} strokeWidth="1.2" />
      {sp.accent !== sp.body && <ellipse cx="50" cy="104" rx="14" ry="12" fill={sp.accent} opacity=".9" />}
    </g>
  )
}

// ---------- yüz: göz, burun, ağız, süsler ----------
export function Face({ sp, look, mood }: { sp: Species; look: Look; mood: Mood }) {
  const ex = sp.extras ?? []
  const big = ex.includes('bigeyes')
  const robot = sp.marks?.includes('screen')
  const r = big ? 7.5 : 6
  const pr = big ? 4.2 : 3.3
  const dx = Math.max(-1, Math.min(1, look.x)) * (r - pr - 0.3)
  const dy = Math.max(-1, Math.min(1, look.y)) * (r - pr - 0.3)
  const beaky = ['beak', 'bill', 'hook', 'trunk'].includes(sp.nose)
  const wide = ex.includes('wideMouth')

  const eye = (cx: number, cy: number, key: string) =>
    mood === 'happy' ? (
      <path key={key} d={`M${cx - 5.5} ${cy + 1} Q${cx} ${cy - 6} ${cx + 5.5} ${cy + 1}`} stroke={robot ? '#7fe7ff' : INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    ) : (
      <g key={key}>
        <circle cx={cx} cy={cy} r={mood === 'wow' ? r + 0.8 : r} fill={robot ? '#7fe7ff' : '#fff'} stroke={LINE} strokeWidth="1" />
        <circle cx={cx + dx} cy={cy + dy} r={pr} fill={INK} />
        <circle cx={cx + dx - 1.2} cy={cy + dy - 1.3} r={1.2} fill="#fff" />
      </g>
    )

  return (
    <g>
      {!ex.includes('nocheeks') && <g fill="#ff7f9a" opacity=".5"><ellipse cx="30" cy="59" rx="4.5" ry="2.8" /><ellipse cx="70" cy="59" rx="4.5" ry="2.8" /></g>}
      {ex.includes('bolts') && <g fill="#6b7280" stroke={LINE}><circle cx="21" cy="52" r="4" /><circle cx="79" cy="52" r="4" /></g>}
      {ex.includes('whiskers') && <g stroke="rgba(0,0,0,.35)" strokeWidth="1.1" strokeLinecap="round"><Mirror><path d="M34 60 L19 57 M34 63 L19 65" /></Mirror></g>}

      {/* ağız */}
      {!beaky && (
        mood === 'happy' ? (
          <g><path d={wide ? 'M38 61 Q50 76 62 61Z' : 'M43 61 Q50 72 57 61Z'} fill="#8b2c3b" /><ellipse cx="50" cy={wide ? 68 : 66} rx="3.5" ry="2" fill="#ff8fa3" /></g>
        ) : mood === 'wow' ? (
          <ellipse cx="50" cy="65" rx="3.2" ry="4" fill="#8b2c3b" />
        ) : wide ? (
          <path d="M38 62 Q50 72 62 62" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : ['tri', 'round', 'pink'].includes(sp.nose) ? (
          <path d="M50 60 L50 62.5 M45 62.5 Q47.5 66 50 62.5 Q52.5 66 55 62.5" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M45 63 Q50 67 55 63" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        )
      )}
      {ex.includes('teeth') && mood !== 'wow' && <rect x="47.5" y={wide ? 64 : 63} width="5" height="4" rx="1" fill="#fff" stroke={LINE} strokeWidth=".8" />}
      {ex.includes('fangs') && mood !== 'wow' && <g fill="#fff" stroke={LINE} strokeWidth=".6"><polygon points={wide ? '42,64 46,65 44,69' : '45,63 48,64 46.5,67'} /><polygon points={wide ? '58,64 54,65 56,69' : '55,63 52,64 53.5,67'} /></g>}

      {/* burun */}
      {sp.nose === 'tri' && <path d="M46 55.5 Q50 53.5 54 55.5 Q52 59.5 50 60 Q48 59.5 46 55.5Z" fill={INK} />}
      {sp.nose === 'round' && <ellipse cx="50" cy="57" rx="3.8" ry="2.9" fill={INK} />}
      {sp.nose === 'pink' && <path d="M47 56 Q50 54.5 53 56 Q51.5 59 50 59.5 Q48.5 59 47 56Z" fill="#ff7f9a" />}
      {sp.nose === 'bignose' && <ellipse cx="50" cy="57" rx="5.5" ry="6.5" fill="#3a3a44" />}
      {sp.nose === 'snout' && <g><ellipse cx="50" cy="59" rx="8.5" ry="6" fill={sp.inner ?? '#f58fa8'} stroke={LINE} /><ellipse cx="47" cy="59" rx="1.6" ry="2.2" fill="#9c3b55" /><ellipse cx="53" cy="59" rx="1.6" ry="2.2" fill="#9c3b55" /></g>}
      {sp.nose === 'beak' && <path d="M44 55 Q50 53 56 55 L50 63Z" fill="#ffa94d" stroke="#e8590c" strokeWidth="1" />}
      {sp.nose === 'hook' && <path d="M44 54 Q51 50 57 55 Q58 63 50 67 Q53 60 44 58Z" fill={sp.id === 'flamingo' ? '#3a3a44' : '#ffd43b'} stroke={LINE} />}
      {sp.nose === 'bill' && <g><ellipse cx="50" cy="60" rx="10" ry="5" fill="#ffa94d" stroke="#e8590c" strokeWidth="1" /><path d="M41 60 L59 60" stroke="#e8590c" strokeWidth="1" /></g>}
      {sp.nose === 'carrot' && <path d="M48 54 L66 58 L48 61Z" fill="#ff922b" stroke="#e8590c" strokeWidth="1" />}
      {sp.nose === 'trunk' && <g strokeLinecap="round" fill="none"><path d="M50 54 Q45 70 50 77 Q55 82 59 76" stroke={LINE} strokeWidth="10" /><path d="M50 54 Q45 70 50 77 Q55 82 59 76" stroke={sp.body} strokeWidth="8" /></g>}
      {sp.id === 'snowman' && <g fill={INK}><circle cx="42" cy="66" r="1.5" /><circle cx="46" cy="68" r="1.5" /><circle cx="50" cy="69" r="1.5" /><circle cx="54" cy="68" r="1.5" /><circle cx="58" cy="66" r="1.5" /></g>}

      {/* gözler (göz kırpma CSS ile) */}
      <g className="av-eyes">
        {eye(40, 48, 'l')}
        {eye(60, 48, 'r')}
        {ex.includes('thirdeye') && eye(50, 33, 't')}
      </g>

      {ex.includes('beard') && <path d="M45 79 L50 93 L55 79Z" fill={sp.ear ?? '#c9b79c'} />}
      {ex.includes('flower') && <g><Mirror><circle cx="45" cy="21" r="4" fill="#f783ac" /></Mirror><circle cx="50" cy="16" r="4" fill="#f783ac" /><circle cx="50" cy="21" r="3" fill="#ffd43b" /></g>}
      {ex.includes('stem') && <g><rect x="47" y="18" width="6" height="10" rx="2" fill="#6b4226" /><path d="M53 22 Q62 14 68 20 Q60 26 53 22Z" fill="#40c057" /></g>}
      {ex.includes('frogdomes') && <g fill="#fff" opacity=".35"><circle cx="37" cy="30" r="2" /><circle cx="61" cy="30" r="2" /></g>}
      {ex.includes('sparkle') && <g fill="#ffd43b" className="av-sparkle"><path d="M84 22 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2Z" /><path d="M14 34 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5Z" /></g>}
    </g>
  )
}

/** Kurbağa/timsah göz tümsekleri: kafadan önce çizilir. */
export function PreHead({ sp }: { sp: Species }) {
  if (!sp.extras?.includes('frogdomes')) return null
  return <g fill={sp.body} stroke={LINE} strokeWidth="1.2"><circle cx="37" cy="33" r="10" /><circle cx="63" cy="33" r="10" /></g>
}
