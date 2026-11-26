// Eşya çizimleri (100x100). id'ler catalog.ts ITEMS ile aynı.
import type { ReactNode } from 'react'

const L = 'rgba(0,0,0,.25)'
const M = ({ children }: { children: ReactNode }) => (<>{children}<g transform="translate(100 0) scale(-1 1)">{children}</g></>)

export const BG: Record<string, string> = {
  none: 'linear-gradient(160deg,#fff4d6,#ffe0b2)',
  bg_sky: 'linear-gradient(180deg,#8fd3ff,#d9f1ff)',
  bg_grass: 'linear-gradient(180deg,#d9f7c4 55%,#7ccf5a 55%)',
  bg_space: 'radial-gradient(circle at 30% 30%,#5b4bdb,#141043)',
  bg_rainbow: 'conic-gradient(from 200deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff,#c77dff,#ff6b6b)',
  bg_polka: 'radial-gradient(circle,#ffa8c5 22%,transparent 24%) 0 0/14px 14px,#fff0f6',
  bg_checker: 'conic-gradient(#c5e3ff 25%,#fff 0 50%,#c5e3ff 0 75%,#fff 0) 0 0/20px 20px',
  bg_sunset: 'linear-gradient(180deg,#ffb347,#ff5e78 60%,#6a4c93)',
  bg_sea: 'linear-gradient(180deg,#a5d8ff 52%,#339af0 52%,#1864ab)',
  bg_board: 'linear-gradient(180deg,#2f5233,#22401f)',
  bg_forest: 'radial-gradient(circle at 15% 100%,#2b8a3e 32%,transparent 33%),radial-gradient(circle at 85% 100%,#37b24d 32%,transparent 33%),linear-gradient(180deg,#d3f9d8,#8ce99a)',
  bg_snow: 'radial-gradient(circle,#fff 18%,transparent 20%) 0 0/18px 18px,radial-gradient(circle,#fff 12%,transparent 14%) 9px 9px/18px 18px,linear-gradient(180deg,#74c0fc,#d0ebff)',
  bg_desert: 'radial-gradient(circle at 78% 22%,#fff3bf 11%,transparent 12%),linear-gradient(180deg,#ffd8a8 62%,#f4a261 62%)',
  bg_autumn: 'radial-gradient(circle at 22% 28%,#e8590c 8%,transparent 9%),radial-gradient(circle at 75% 72%,#f08c00 8%,transparent 9%),radial-gradient(circle at 82% 18%,#c92a2a 6%,transparent 7%),radial-gradient(circle at 20% 80%,#f59f00 6%,transparent 7%),linear-gradient(180deg,#fff4e6,#ffd8a8)',
  bg_candy: 'repeating-linear-gradient(45deg,#ffc9de 0 9px,#fff 9px 18px)',
  bg_mountain: 'conic-gradient(from 135deg at 30% 42%,#868e96 90deg,transparent 0),conic-gradient(from 135deg at 72% 55%,#495057 90deg,transparent 0),linear-gradient(#a5d8ff,#e7f5ff)',
  bg_night: 'radial-gradient(circle,#fff 7%,transparent 9%) 0 0/22px 22px,radial-gradient(circle,#ffe066 6%,transparent 8%) 11px 7px/26px 26px,linear-gradient(180deg,#1b1f4b,#3b2f7a)',
  bg_bubbles: 'radial-gradient(circle,#ff8fab 20%,transparent 22%) 0 0/20px 20px,radial-gradient(circle,#ffc2d1 20%,transparent 22%) 10px 10px/20px 20px,#fff0f3',
  bg_under: 'radial-gradient(circle at 28% 70%,rgba(255,255,255,.7) 4%,transparent 5%),radial-gradient(circle at 72% 38%,rgba(255,255,255,.7) 3%,transparent 4%),radial-gradient(circle at 55% 82%,rgba(255,255,255,.6) 5%,transparent 6%),linear-gradient(180deg,#66d9e8,#1864ab)',
  bg_lava: 'radial-gradient(circle at 50% 125%,#ffd43b 18%,#ff6b00 38%,#c92a2a 58%,#2b0f0f 85%)',
  bg_gold: 'conic-gradient(from 0deg,#fcc419,#fff3bf,#f59f00,#fff3bf,#fcc419)',
}

export function Hat({ id }: { id: string }) {
  switch (id) {
    case 'hat_party':
      return <g><polygon points="50,2 36,30 64,30" fill="#ff5fa2" stroke="#b02a6b" strokeWidth="1.5" /><circle cx="50" cy="3" r="4" fill="#ffd93d" /><circle cx="46" cy="20" r="2" fill="#fff" /><circle cx="54" cy="14" r="2" fill="#fff" /><circle cx="52" cy="25" r="2" fill="#fff" /></g>
    case 'hat_crown':
      return <g><polygon points="30,30 32,10 41,21 50,6 59,21 68,10 70,30" fill="#ffcc33" stroke="#b8860b" strokeWidth="1.5" /><circle cx="50" cy="22" r="3" fill="#e63946" /><circle cx="39" cy="25" r="2" fill="#4d96ff" /><circle cx="61" cy="25" r="2" fill="#4d96ff" /></g>
    case 'hat_cap':
      return <g><path d="M30 30 Q32 12 50 12 Q68 12 70 30 Z" fill="#4d96ff" stroke="#1d4f9e" strokeWidth="1.5" /><path d="M60 28 Q78 26 82 31 Q70 33 60 31 Z" fill="#1d4f9e" /><circle cx="50" cy="12" r="2.5" fill="#ffd93d" /></g>
    case 'hat_wizard':
      return <g><path d="M26 31 Q50 25 74 31 Q50 37 26 31 Z" fill="#5b3fb8" /><path d="M36 30 Q46 12 58 -2 Q56 14 64 30 Z" fill="#7b5ce0" stroke="#3d2a85" strokeWidth="1.5" /><text x="47" y="25" fontSize="9" fill="#ffd93d">★</text></g>
    case 'hat_sprout':
      return <g><path d="M50 27 L50 13" stroke="#2f9e44" strokeWidth="2.5" strokeLinecap="round" /><path d="M50 16 Q40 6 33 12 Q41 19 50 16Z" fill="#51cf66" /><path d="M50 14 Q60 3 68 9 Q60 17 50 14Z" fill="#69db7c" /></g>
    case 'hat_bow':
      return <g transform="translate(14 -2)" stroke="#c2255c" strokeWidth="1.2"><path d="M50 24 L38 16 L38 32Z" fill="#f06595" /><path d="M50 24 L62 16 L62 32Z" fill="#f06595" /><circle cx="50" cy="24" r="4" fill="#e64980" /></g>
    case 'hat_band':
      return <g fill="none" strokeLinecap="round"><path d="M22 36 Q50 22 78 36" stroke="#ff6b6b" strokeWidth="7" /><path d="M22 36 Q50 22 78 36" stroke="#fff" strokeWidth="2" /></g>
    case 'hat_beanie':
      return <g><path d="M26 32 Q27 9 50 9 Q73 9 74 32Z" fill="#4dabf7" stroke="#1c7ed6" strokeWidth="1.2" /><rect x="24" y="27" width="52" height="8" rx="4" fill="#1c7ed6" /><path d="M36 14 L36 27 M44 11 L44 27 M56 11 L56 27 M64 14 L64 27" stroke="#74c0fc" strokeWidth="1.5" /><circle cx="50" cy="8" r="5.5" fill="#fff" stroke={L} /></g>
    case 'hat_straw':
      return <g><ellipse cx="50" cy="30" rx="35" ry="6" fill="#e9c46a" stroke="#b08a2e" strokeWidth="1.2" /><path d="M34 30 Q35 13 50 13 Q65 13 66 30Z" fill="#f4d58d" stroke="#b08a2e" strokeWidth="1.2" /><rect x="34.5" y="23" width="31" height="5" fill="#e76f51" /></g>
    case 'hat_flower':
      return (
        <g>
          <path d="M24 33 Q50 20 76 33" stroke="#2f9e44" strokeWidth="3" fill="none" />
          {[[28, 30, '#ff8787'], [38, 25, '#ffd43b'], [50, 23, '#f783ac'], [62, 25, '#74c0fc'], [72, 30, '#ff8787']].map(([x, y, c]) => (
            <g key={String(x)}><circle cx={x as number} cy={y as number} r="5" fill={c as string} stroke={L} /><circle cx={x as number} cy={y as number} r="1.8" fill="#fff3bf" /></g>
          ))}
        </g>
      )
    case 'hat_builder':
      return <g><path d="M26 31 Q27 9 50 9 Q73 9 74 31Z" fill="#fcc419" stroke="#e67700" strokeWidth="1.2" /><rect x="21" y="28" width="58" height="6" rx="3" fill="#f59f00" stroke="#e67700" /><rect x="46" y="9" width="8" height="20" rx="3" fill="#ffd43b" stroke="#e67700" strokeWidth=".8" /></g>
    case 'hat_bunny':
      return <g><path d="M24 34 Q50 22 76 34" stroke="#f783ac" strokeWidth="3.5" fill="none" /><M><ellipse cx="40" cy="10" rx="6" ry="16" transform="rotate(-12 40 10)" fill="#fff" stroke={L} /><ellipse cx="40" cy="11" rx="3" ry="11" transform="rotate(-12 40 11)" fill="#ffc2d1" /></M></g>
    case 'hat_chef':
      return <g fill="#fff" stroke="#ced4da" strokeWidth="1.2"><circle cx="37" cy="15" r="10" /><circle cx="63" cy="15" r="10" /><circle cx="50" cy="9" r="12" /><rect x="33" y="15" width="34" height="16" rx="2" /><path d="M33 26 L67 26" /></g>
    case 'hat_propeller':
      return <g><path d="M28 31 Q29 13 50 13 Q71 13 72 31Z" fill="#ff6b6b" stroke="#c92a2a" strokeWidth="1.2" /><path d="M50 13 Q42 22 42 31 M50 13 Q58 22 58 31" stroke="#ffd43b" strokeWidth="4" fill="none" /><path d="M50 13 L50 6" stroke="#495057" strokeWidth="2" /><ellipse cx="41" cy="5" rx="9" ry="2.6" fill="#4dabf7" /><ellipse cx="59" cy="5" rx="9" ry="2.6" fill="#ffd43b" /><circle cx="50" cy="5" r="2" fill="#495057" /></g>
    case 'hat_cowboy':
      return <g stroke="#5c3317" strokeWidth="1.2"><path d="M14 29 Q30 37 50 32 Q70 37 86 29 Q80 24 68 27 L32 27 Q20 24 14 29Z" fill="#a0522d" /><path d="M32 28 Q31 9 42 11 Q50 16 58 11 Q69 9 68 28Z" fill="#b5651d" /><rect x="32" y="23" width="36" height="4" fill="#5c3317" /></g>
    case 'hat_headphones':
      return <g><path d="M23 50 Q22 13 50 13 Q78 13 77 50" stroke="#343a40" strokeWidth="5" fill="none" /><M><rect x="15" y="40" width="11" height="19" rx="5" fill="#ff6b6b" stroke="#c92a2a" /></M></g>
    case 'hat_detective':
      return <g stroke="#6b5537" strokeWidth="1.2"><path d="M27 31 Q27 11 50 11 Q73 11 73 31Z" fill="#a68a64" /><path d="M34 15 L34 30 M42 12 L42 30 M50 11 L50 30 M58 12 L58 30 M66 15 L66 30 M28 22 L72 22" stroke="#8c7350" strokeWidth="1" /><path d="M34 30 Q50 38 66 30" fill="#8c7350" /><path d="M50 11 L50 6" strokeWidth="2" /></g>
    case 'hat_pirate':
      return <g><path d="M18 31 Q50 42 82 31 Q76 10 50 13 Q24 10 18 31Z" fill="#2b2b2b" stroke="#000" strokeWidth="1" /><path d="M20 30 Q50 40 80 30" stroke="#fcc419" strokeWidth="1.5" fill="none" /><circle cx="50" cy="21" r="4.5" fill="#fff" /><path d="M44 26 L56 32 M56 26 L44 32" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></g>
    case 'hat_top':
      return <g><ellipse cx="50" cy="30" rx="24" ry="4.5" fill="#212529" /><rect x="36" y="1" width="28" height="29" rx="2" fill="#212529" /><rect x="36" y="22" width="28" height="5" fill="#e03131" /></g>
    case 'hat_fire':
      return <g><path d="M24 31 Q25 9 50 9 Q75 9 76 31Z" fill="#e03131" stroke="#a51111" strokeWidth="1.2" /><ellipse cx="50" cy="31" rx="31" ry="4.5" fill="#c92a2a" /><path d="M50 9 L50 28" stroke="#ff8787" strokeWidth="3" /><circle cx="50" cy="20" r="5.5" fill="#ffd43b" stroke="#e67700" /></g>
    case 'hat_tiara':
      return <g><path d="M33 31 L37 21 L44 27 L50 13 L56 27 L63 21 L67 31Z" fill="#e9ecef" stroke="#adb5bd" strokeWidth="1.2" /><circle cx="50" cy="22" r="3.2" fill="#f783ac" /><circle cx="38" cy="25" r="1.8" fill="#74c0fc" /><circle cx="62" cy="25" r="1.8" fill="#74c0fc" /></g>
    case 'hat_viking':
      return <g><M><path d="M28 25 Q12 22 12 6 Q19 17 31 18Z" fill="#fff3bf" stroke="#c9a227" strokeWidth="1.2" /></M><path d="M26 31 Q27 11 50 11 Q73 11 74 31Z" fill="#adb5bd" stroke="#6c757d" strokeWidth="1.2" /><rect x="24" y="27" width="52" height="6" rx="3" fill="#868e96" /><path d="M50 11 L50 27" stroke="#868e96" strokeWidth="4" /></g>
    case 'hat_grad':
      return <g><path d="M34 21 L34 31 Q50 37 66 31 L66 21" fill="#212529" /><polygon points="18,18 50,7 82,18 50,29" fill="#343a40" stroke="#000" strokeWidth="1" /><path d="M50 18 L74 21 L74 33" stroke="#fcc419" strokeWidth="2" fill="none" /><circle cx="74" cy="34" r="2.5" fill="#fcc419" /><circle cx="50" cy="18" r="2" fill="#fcc419" /></g>
    case 'hat_astro':
      return <g><circle cx="50" cy="52" r="41" fill="rgba(186,225,255,.22)" stroke="#dee2e6" strokeWidth="4" /><path d="M24 34 Q30 20 44 15" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".8" /><rect x="22" y="84" width="56" height="10" rx="5" fill="#dee2e6" stroke="#adb5bd" /><circle cx="50" cy="89" r="2.5" fill="#ff6b6b" /></g>
  }
  return null
}

export function Glasses({ id }: { id: string }) {
  switch (id) {
    case 'glasses_round':
      return <g fill="rgba(255,255,255,.25)" stroke="#333" strokeWidth="2.5"><circle cx="40" cy="48" r="8" /><circle cx="60" cy="48" r="8" /><path d="M48 48 Q50 45 52 48" fill="none" /></g>
    case 'glasses_star':
      return (
        <g fill="#ffd93d" stroke="#d4a000" strokeWidth="1.2" opacity=".95" transform="translate(1 1)">
          <polygon points="39,37 41.5,44 49,44 43,48.5 45.5,56 39,51.5 32.5,56 35,48.5 29,44 36.5,44" />
          <polygon points="61,37 63.5,44 71,44 65,48.5 67.5,56 61,51.5 54.5,56 57,48.5 51,44 58.5,44" />
        </g>
      )
    case 'glasses_sun':
      return <g fill="#222" stroke="#111" strokeWidth="1.5"><rect x="30" y="42" width="19" height="12" rx="5" /><rect x="51" y="42" width="19" height="12" rx="5" /><path d="M48 46 L52 46" strokeWidth="2.5" /><path d="M33 45 L39 45" stroke="#fff" strokeWidth="1.5" opacity=".6" /></g>
    case 'glasses_nerd':
      return <g fill="rgba(255,255,255,.2)" stroke="#212529" strokeWidth="2.8"><rect x="31" y="41" width="18" height="14" rx="3" /><rect x="51" y="41" width="18" height="14" rx="3" /><path d="M49 46 L51 46" /></g>
    case 'glasses_goggles':
      return <g><path d="M20 47 L80 47" stroke="#4dabf7" strokeWidth="4" /><M><circle cx="40" cy="48" r="8.5" fill="rgba(77,171,247,.35)" stroke="#1c7ed6" strokeWidth="3" /></M></g>
    case 'glasses_party':
      return <g fill="rgba(255,192,203,.35)" stroke="#e64980" strokeWidth="2.5"><M><path d="M30 43 Q40 39 48 44 Q48 55 39 55 Q30 55 30 43Z" /><path d="M30 43 L26 38" strokeLinecap="round" /></M></g>
    case 'glasses_3d':
      return <g stroke="#212529" strokeWidth="2.5"><rect x="30" y="42" width="19" height="12" rx="2" fill="rgba(255,60,60,.55)" /><rect x="51" y="42" width="19" height="12" rx="2" fill="rgba(0,200,255,.55)" /><path d="M49 47 L51 47" /></g>
    case 'glasses_heart':
      return <g fill="#ff4d6d" stroke="#c9184a" strokeWidth="1.2" opacity=".92"><M><path d="M40 56 Q29 49 31 43 Q34 38 40 43 Q46 38 49 43 Q51 49 40 56Z" /></M></g>
    case 'glasses_swirl':
      return <g><M><circle cx="40" cy="48" r="8" fill="#fff" stroke="#212529" strokeWidth="2.2" /><path d="M40 48 m0 -1 a1 1 0 1 1 -1 1 a2.5 2.5 0 1 1 2.5 2.5 a4 4 0 1 1 -4 -4 a5.5 5.5 0 1 1 5.5 5.5" stroke="#845ef7" strokeWidth="1.4" fill="none" /></M><path d="M48 48 L52 48" stroke="#212529" strokeWidth="2.2" /></g>
    case 'glasses_pilot':
      return <g stroke="#d4a000" strokeWidth="1.8"><M><path d="M31 43 L48 43 Q49 55 41 56 Q31 56 31 43Z" fill="rgba(40,40,60,.8)" /></M><path d="M48 44 Q50 42 52 44" fill="none" /></g>
    case 'glasses_monocle':
      return <g><circle cx="60" cy="48" r="8.5" fill="rgba(255,255,255,.25)" stroke="#d4a000" strokeWidth="2.6" /><path d="M67 52 Q74 64 70 76" stroke="#d4a000" strokeWidth="1.2" fill="none" strokeDasharray="2 1.5" /></g>
    case 'glasses_mask':
      return <path fillRule="evenodd" d="M24 45 Q37 37 50 44 Q63 37 76 45 Q75 57 63 56 Q55 55 50 51 Q45 55 37 56 Q25 57 24 45Z M33 48 a7 6 0 1 0 14 0 a7 6 0 1 0 -14 0Z M53 48 a7 6 0 1 0 14 0 a7 6 0 1 0 -14 0Z" fill="#e03131" stroke="#a51111" strokeWidth="1" />
    case 'glasses_visor':
      return <g><rect x="25" y="41" width="50" height="14" rx="7" fill="rgba(0,230,255,.38)" stroke="#868e96" strokeWidth="2.6" /><path d="M30 46 L44 46" stroke="#fff" strokeWidth="1.5" opacity=".8" /></g>
  }
  return null
}

export function Neck({ id }: { id: string }) {
  switch (id) {
    case 'neck_bow':
      return <g fill="#e63946" stroke="#8f1d26" strokeWidth="1.2"><polygon points="50,82 36,74 36,90" /><polygon points="50,82 64,74 64,90" /><circle cx="50" cy="82" r="4" /></g>
    case 'neck_scarf':
      return <g><path d="M27 77 Q50 87 73 77 L73 84 Q50 94 27 84 Z" fill="#ff8c42" stroke="#b5541a" strokeWidth="1.2" /><path d="M60 83 L64 99 L56 99 L54 86 Z" fill="#ff8c42" stroke="#b5541a" strokeWidth="1.2" /></g>
    case 'neck_medal':
      return <g><path d="M40 76 L50 88 L60 76" fill="none" stroke="#4d96ff" strokeWidth="4" /><circle cx="50" cy="91" r="7" fill="#ffcc33" stroke="#b8860b" strokeWidth="1.5" /><text x="47" y="94.5" fontSize="8" fill="#b8860b">1</text></g>
    case 'neck_tie':
      return <g stroke="#1c3faa" strokeWidth="1"><M><polygon points="50,80 38,78 44,88" fill="#fff" stroke={L} /></M><polygon points="47,81 53,81 52,86 48,86" fill="#4263eb" /><path d="M48 86 L44 100 L50 104 L56 100 L52 86Z" fill="#4263eb" /></g>
    case 'neck_bandana':
      return <g><path d="M29 79 Q50 88 71 79 L50 101Z" fill="#e03131" stroke="#a51111" strokeWidth="1.2" /><g fill="#fff"><circle cx="42" cy="86" r="1.5" /><circle cx="58" cy="86" r="1.5" /><circle cx="50" cy="92" r="1.5" /><circle cx="50" cy="85" r="1.2" /></g></g>
    case 'neck_bell':
      return <g><path d="M29 80 Q50 89 71 80" stroke="#e03131" strokeWidth="5" fill="none" strokeLinecap="round" /><circle cx="50" cy="90" r="5.5" fill="#fcc419" stroke="#e67700" /><path d="M46 91 L54 91" stroke="#e67700" /><circle cx="50" cy="93" r="1" fill="#e67700" /></g>
    case 'neck_heart':
      return <g><path d="M32 79 Q50 92 68 79" stroke="#ced4da" strokeWidth="1.5" fill="none" /><path d="M50 97 Q42 92 43 88 Q45 84 50 88 Q55 84 57 88 Q58 92 50 97Z" fill="#ff4d6d" stroke="#c9184a" /></g>
    case 'neck_winter':
      return <g stroke="#1864ab" strokeWidth="1.2"><path d="M27 77 Q50 87 73 77 L73 84 Q50 94 27 84 Z" fill="#339af0" /><path d="M33 80 L33 87 M41 82 L41 90 M50 83 L50 91 M59 82 L59 90 M67 80 L67 87" stroke="#fff" strokeWidth="2.5" /><path d="M38 84 L34 100 L42 100 L44 88Z" fill="#339af0" /><path d="M35 94 L42 94" stroke="#fff" strokeWidth="2.5" /></g>
    case 'neck_lei':
      return (
        <g>
          {Array.from({ length: 9 }, (_, i) => {
            const t = i / 8
            const x = 28 + t * 44
            const y = 79 + Math.sin(t * Math.PI) * 11
            return <circle key={i} cx={x} cy={y} r="4.2" fill={['#ff8787', '#ffd43b', '#f783ac', '#74c0fc'][i % 4]} stroke={L} />
          })}
        </g>
      )
    case 'neck_sailor':
      return <g><path d="M24 82 L50 100 L76 82 L82 100 L18 100Z" fill="#1c7ed6" stroke="#1864ab" /><path d="M27 86 L50 102 L73 86" stroke="#fff" strokeWidth="1.8" fill="none" /><path d="M50 96 L44 92 L44 100Z M50 96 L56 92 L56 100Z" fill="#e03131" /></g>
    case 'neck_pearls':
      return (
        <g fill="#fff" stroke="#ced4da" strokeWidth=".8">
          {Array.from({ length: 13 }, (_, i) => {
            const t = i / 12
            return <circle key={i} cx={30 + t * 40} cy={79 + Math.sin(t * Math.PI) * 10} r="2.6" />
          })}
        </g>
      )
    case 'neck_camera':
      return <g><path d="M32 79 L44 90 M68 79 L56 90" stroke="#495057" strokeWidth="2" /><rect x="39" y="87" width="22" height="14" rx="3" fill="#343a40" /><circle cx="50" cy="94" r="4.5" fill="#74c0fc" stroke="#adb5bd" strokeWidth="1.5" /><rect x="54" y="88.5" width="4" height="2.5" fill="#ffd43b" /></g>
    case 'neck_stetho':
      return <g fill="none" stroke="#495057" strokeWidth="2.4" strokeLinecap="round"><path d="M34 79 Q30 95 43 97 Q50 98 50 91 M66 79 Q70 95 57 97 Q50 98 50 91" /><circle cx="50" cy="91" r="3.8" fill="#adb5bd" stroke="#495057" strokeWidth="1.5" /></g>
    case 'neck_chain':
      return <g><path d="M31 79 Q50 93 69 79" stroke="#f59f00" strokeWidth="3" fill="none" strokeDasharray="3 1.5" /><circle cx="50" cy="91" r="6.5" fill="#fcc419" stroke="#e67700" strokeWidth="1.5" /><text x="46.5" y="94.5" fontSize="9" fill="#e67700" fontWeight="bold">★</text></g>
    case 'neck_cape':
      return <g><path d="M18 100 Q20 84 34 79 L66 79 Q80 84 82 100Z" fill="#e03131" stroke="#a51111" strokeWidth="1.2" /><path d="M34 79 Q50 86 66 79" stroke="#a51111" strokeWidth="2" fill="none" /><circle cx="50" cy="83" r="3.5" fill="#fcc419" stroke="#e67700" /></g>
  }
  return null
}
