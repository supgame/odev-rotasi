// Taslak avatar: hayvan emojisi + üstüne SVG aksesuar katmanları (100x100 görünüm).
// Sonra Astra'nın çizimleri ya da hazır bir avatar kütüphanesi bunun yerine geçebilir; arayüz aynı kalır.
import type { Equipped } from '../data/types'

const BG: Record<string, string> = {
  none: 'linear-gradient(160deg,#fff4d6,#ffe0b2)',
  bg_sky: 'linear-gradient(180deg,#8fd3ff,#d9f1ff)',
  bg_grass: 'linear-gradient(180deg,#d9f7c4 55%,#7ccf5a 55%)',
  bg_space: 'radial-gradient(circle at 30% 30%,#5b4bdb,#141043)',
  bg_rainbow: 'conic-gradient(from 200deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff,#c77dff,#ff6b6b)',
}

function Hat({ id }: { id: string }) {
  switch (id) {
    case 'hat_party':
      return (
        <g>
          <polygon points="50,2 36,30 64,30" fill="#ff5fa2" stroke="#b02a6b" strokeWidth="1.5" />
          <circle cx="50" cy="3" r="4" fill="#ffd93d" />
          <circle cx="46" cy="20" r="2" fill="#fff" /><circle cx="54" cy="14" r="2" fill="#fff" /><circle cx="52" cy="25" r="2" fill="#fff" />
        </g>
      )
    case 'hat_crown':
      return (
        <g>
          <polygon points="30,30 32,10 41,21 50,6 59,21 68,10 70,30" fill="#ffcc33" stroke="#b8860b" strokeWidth="1.5" />
          <circle cx="50" cy="22" r="3" fill="#e63946" /><circle cx="39" cy="25" r="2" fill="#4d96ff" /><circle cx="61" cy="25" r="2" fill="#4d96ff" />
        </g>
      )
    case 'hat_cap':
      return (
        <g>
          <path d="M30 30 Q32 12 50 12 Q68 12 70 30 Z" fill="#4d96ff" stroke="#1d4f9e" strokeWidth="1.5" />
          <path d="M60 28 Q78 26 82 31 Q70 33 60 31 Z" fill="#1d4f9e" />
          <circle cx="50" cy="12" r="2.5" fill="#ffd93d" />
        </g>
      )
    case 'hat_wizard':
      return (
        <g>
          <path d="M26 31 Q50 25 74 31 Q50 37 26 31 Z" fill="#5b3fb8" />
          <path d="M36 30 Q46 12 58 -2 Q56 14 64 30 Z" fill="#7b5ce0" stroke="#3d2a85" strokeWidth="1.5" />
          <text x="47" y="25" fontSize="9" fill="#ffd93d">★</text>
        </g>
      )
  }
  return null
}

function Glasses({ id }: { id: string }) {
  switch (id) {
    case 'glasses_round':
      return (
        <g fill="rgba(255,255,255,.25)" stroke="#333" strokeWidth="2.5">
          <circle cx="39" cy="47" r="8" /><circle cx="61" cy="47" r="8" /><path d="M47 47 Q50 44 53 47" fill="none" />
        </g>
      )
    case 'glasses_star':
      return (
        <g fill="#ffd93d" stroke="#d4a000" strokeWidth="1.2" opacity=".95">
          <polygon points="39,37 41.5,44 49,44 43,48.5 45.5,56 39,51.5 32.5,56 35,48.5 29,44 36.5,44" />
          <polygon points="61,37 63.5,44 71,44 65,48.5 67.5,56 61,51.5 54.5,56 57,48.5 51,44 58.5,44" />
        </g>
      )
    case 'glasses_sun':
      return (
        <g fill="#222" stroke="#111" strokeWidth="1.5">
          <rect x="29" y="41" width="18" height="11" rx="5" /><rect x="53" y="41" width="18" height="11" rx="5" />
          <path d="M47 45 L53 45" strokeWidth="2.5" />
          <path d="M32 44 L38 44" stroke="#fff" strokeWidth="1.5" opacity=".6" />
        </g>
      )
  }
  return null
}

function Neck({ id }: { id: string }) {
  switch (id) {
    case 'neck_bow':
      return (
        <g fill="#e63946" stroke="#8f1d26" strokeWidth="1.2">
          <polygon points="50,80 36,72 36,88" /><polygon points="50,80 64,72 64,88" /><circle cx="50" cy="80" r="4" />
        </g>
      )
    case 'neck_scarf':
      return (
        <g>
          <path d="M28 76 Q50 86 72 76 L72 83 Q50 93 28 83 Z" fill="#ff8c42" stroke="#b5541a" strokeWidth="1.2" />
          <path d="M60 82 L64 98 L56 98 L54 85 Z" fill="#ff8c42" stroke="#b5541a" strokeWidth="1.2" />
        </g>
      )
    case 'neck_medal':
      return (
        <g>
          <path d="M40 72 L50 86 L60 72" fill="none" stroke="#4d96ff" strokeWidth="4" />
          <circle cx="50" cy="89" r="7" fill="#ffcc33" stroke="#b8860b" strokeWidth="1.5" />
          <text x="46.5" y="92.5" fontSize="8" fill="#b8860b">1</text>
        </g>
      )
  }
  return null
}

export function Avatar({ animal, equipped, size = 96, bounce = false }: { animal: string; equipped?: Equipped; size?: number; bounce?: boolean }) {
  const eq = equipped ?? {}
  return (
    <div
      className={'avatar' + (bounce ? ' bounce' : '')}
      style={{ width: size, height: size, background: BG[eq.bg ?? 'none'] ?? BG.none }}
    >
      <span className="avatar-animal" style={{ fontSize: size * 0.56 }}>{animal}</span>
      <svg viewBox="0 0 100 100" className="avatar-layer" aria-hidden>
        {eq.neck && <Neck id={eq.neck} />}
        {eq.glasses && <Glasses id={eq.glasses} />}
        {eq.hat && <Hat id={eq.hat} />}
      </svg>
    </div>
  )
}

/** Dükkanda tek eşyanın önizlemesi */
export function ItemPreview({ id, slot, animal }: { id: string; slot: string; animal: string }) {
  return <Avatar animal={animal} equipped={{ [slot]: id }} size={72} />
}
