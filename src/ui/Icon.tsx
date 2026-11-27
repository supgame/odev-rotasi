// Oyun arayüzü ikonları: kalın mürekkep çizgili, dolgulu küçük SVG'ler (emoji yok: her cihazda aynı görünsün).
import type { CSSProperties } from 'react'

const INK = 'var(--ink)'
type Name =
  | 'star' | 'lock' | 'bag' | 'home' | 'play' | 'check' | 'x' | 'back' | 'next' | 'chest' | 'flag'
  | 'door' | 'trophy' | 'eye' | 'backspace' | 'clock' | 'sparkle' | 'crown' | 'map' | 'pencil' | 'users' | 'chart' | 'target'

export function Icon({ name, size = 24, style, className }: { name: Name; size?: number; style?: CSSProperties; className?: string }) {
  const p = { width: size, height: size, viewBox: '0 0 32 32', style, className: 'ic ' + (className ?? ''), 'aria-hidden': true } as const
  const s = { stroke: INK, strokeWidth: 2.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
  switch (name) {
    case 'star':
      return (
        <svg {...p}>
          <path d="M16 2.8l3.9 8.1 8.8 1.2-6.4 6.1 1.6 8.8L16 22.8 8.1 27l1.6-8.8-6.4-6.1 8.8-1.2z" fill="var(--gold)" {...s} />
          <path d="M11.5 12.6l2.4-.4" stroke="#fff7cf" strokeWidth={2.4} strokeLinecap="round" />
        </svg>
      )
    case 'lock':
      return (
        <svg {...p}>
          <path d="M10 14v-3.5a6 6 0 0112 0V14" fill="none" {...s} />
          <rect x="6.5" y="13.5" width="19" height="14.5" rx="3.5" fill="var(--gold)" {...s} />
          <circle cx="16" cy="20" r="2" fill={INK} />
        </svg>
      )
    case 'bag':
      return (
        <svg {...p}>
          <path d="M11 11V9a5 5 0 0110 0v2" fill="none" {...s} />
          <path d="M5.5 11h21l-1.6 15.2a2.5 2.5 0 01-2.5 2.3H9.6a2.5 2.5 0 01-2.5-2.3z" fill="var(--pink)" {...s} />
          <path d="M12 17.5a4 4 0 008 0" fill="none" {...s} />
        </svg>
      )
    case 'home':
      return (
        <svg {...p}>
          <path d="M4 15L16 4.5 28 15" fill="none" {...s} />
          <path d="M7.5 13v13.5h17V13" fill="var(--sky-2)" {...s} />
          <rect x="13" y="18" width="6" height="8.5" fill="var(--gold)" {...s} />
        </svg>
      )
    case 'play':
      return <svg {...p}><path d="M10 5.5l16 10.5-16 10.5z" fill="#fff" {...s} /></svg>
    case 'check':
      return <svg {...p}><path d="M6 16.5l6.5 6.5L26 9" fill="none" stroke="currentColor" strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" /></svg>
    case 'x':
      return <svg {...p}><path d="M8 8l16 16M24 8L8 24" fill="none" stroke="currentColor" strokeWidth={4.2} strokeLinecap="round" /></svg>
    case 'back':
      return <svg {...p}><path d="M19 6l-10 10 10 10" fill="none" stroke="currentColor" strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" /></svg>
    case 'next':
      return <svg {...p}><path d="M13 6l10 10-10 10" fill="none" stroke="currentColor" strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" /></svg>
    case 'chest':
      return (
        <svg {...p}>
          <path d="M4 14a6 6 0 016-6h12a6 6 0 016 6v1H4z" fill="#c9773a" {...s} />
          <rect x="4" y="15" width="24" height="12" rx="2" fill="#e08b45" {...s} />
          <path d="M4 15h24" {...s} />
          <rect x="13" y="12.5" width="6" height="7" rx="1.5" fill="var(--gold)" {...s} />
          <path d="M9 8.5V27M23 8.5V27" stroke={INK} strokeWidth={2} opacity=".35" />
        </svg>
      )
    case 'flag':
      return (
        <svg {...p}>
          <path d="M8 29V4" {...s} />
          <path d="M8 5h16l-4 5.5 4 5.5H8z" fill="var(--red)" {...s} />
        </svg>
      )
    case 'door':
      return (
        <svg {...p}>
          <path d="M7 28V5.5h13V28" fill="var(--sky-2)" {...s} />
          <path d="M4 28h24" {...s} />
          <path d="M20 16h8m-3-3l3 3-3 3" fill="none" {...s} />
          <circle cx="16" cy="17" r="1.3" fill={INK} />
        </svg>
      )
    case 'trophy':
      return (
        <svg {...p}>
          <path d="M9 4.5h14v7a7 7 0 01-14 0z" fill="var(--gold)" {...s} />
          <path d="M9 7H4.5a4.5 4.5 0 004.8 6M23 7h4.5a4.5 4.5 0 01-4.8 6" fill="none" {...s} />
          <path d="M16 18.5v4M10.5 27.5h11l-1.5-5h-8z" fill="var(--gold)" {...s} />
        </svg>
      )
    case 'eye':
      return (
        <svg {...p}>
          <path d="M3 16s5-8.5 13-8.5S29 16 29 16s-5 8.5-13 8.5S3 16 3 16z" fill="#fff" {...s} />
          <circle cx="16" cy="16" r="4.2" fill={INK} />
        </svg>
      )
    case 'backspace':
      return (
        <svg {...p}>
          <path d="M11 7h15a2.5 2.5 0 012.5 2.5v13A2.5 2.5 0 0126 25H11l-8-9z" fill="var(--red-soft)" {...s} />
          <path d="M14.5 12.5l7 7m0-7l-7 7" {...s} />
        </svg>
      )
    case 'clock':
      return (
        <svg {...p}>
          <circle cx="16" cy="16" r="12" fill="#fff" {...s} />
          <path d="M16 9v7.5l5 3" fill="none" {...s} />
        </svg>
      )
    case 'sparkle':
      return <svg {...p}><path d="M16 3c1.2 7 3.8 9.6 12 13-8.2 3.4-10.8 6-12 13-1.2-7-3.8-9.6-12-13 8.2-3.4 10.8-6 12-13z" fill="var(--gold)" {...s} /></svg>
    case 'crown':
      return (
        <svg {...p}>
          <path d="M4 10l6 6 6-10 6 10 6-6-2.5 15h-19z" fill="var(--gold)" {...s} />
          <path d="M7 25h18" {...s} />
        </svg>
      )
    case 'map':
      return (
        <svg {...p}>
          <path d="M4 7.5l7.5-3 9 3 7.5-3v20l-7.5 3-9-3-7.5 3z" fill="#bfeaa3" {...s} />
          <path d="M11.5 4.5v20M20.5 7.5v20" {...s} />
        </svg>
      )
    case 'pencil':
      return (
        <svg {...p}>
          <path d="M6 26l1.5-6L21 6.5l4.5 4.5L12 24.5z" fill="var(--gold)" {...s} />
          <path d="M18 9.5l4.5 4.5" {...s} />
        </svg>
      )
    case 'users':
      return (
        <svg {...p}>
          <circle cx="11.5" cy="11" r="4.5" fill="var(--sky-2)" {...s} />
          <path d="M3.5 26a8 8 0 0116 0z" fill="var(--sky-2)" {...s} />
          <circle cx="22" cy="12" r="3.8" fill="var(--pink)" {...s} />
          <path d="M19.5 19.2A7 7 0 0128.5 26h-7" fill="var(--pink)" {...s} />
        </svg>
      )
    case 'chart':
      return (
        <svg {...p}>
          <path d="M4 27.5h24" {...s} />
          <rect x="6" y="15" width="5" height="12.5" fill="var(--sky-2)" {...s} />
          <rect x="13.5" y="8" width="5" height="19.5" fill="var(--gold)" {...s} />
          <rect x="21" y="18" width="5" height="9.5" fill="var(--pink)" {...s} />
        </svg>
      )
    case 'target':
      return (
        <svg {...p}>
          <circle cx="16" cy="16" r="12" fill="var(--red)" {...s} />
          <circle cx="16" cy="16" r="7.5" fill="#fff" {...s} />
          <circle cx="16" cy="16" r="3" fill="var(--red)" {...s} />
        </svg>
      )
  }
}

/** Yıldız sayacı (HUD'daki altın hap). */
export function StarCount({ n, big, bump, plus }: { n: number; big?: boolean; bump?: boolean; plus?: boolean }) {
  return (
    <span className={'star-count' + (big ? ' big' : '') + (bump ? ' bump' : '')}>
      <Icon name="star" size={big ? 34 : 26} />
      <b>{plus ? '+' : ''}{n}</b>
    </span>
  )
}

/** Oyun logosu: pusula rozeti + iki renkli kalın başlık. */
export function Logo({ small }: { small?: boolean }) {
  return (
    <span className={'logo' + (small ? ' small' : '')}>
      <svg className="logo-badge" viewBox="0 0 40 40" aria-hidden>
        <circle cx="20" cy="20" r="17" fill="#fff" stroke="var(--ink)" strokeWidth="3.4" />
        <circle cx="20" cy="20" r="12" fill="var(--sky-2)" />
        <path d="M20 9l4.5 11H15.5z" fill="var(--red)" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M20 31l-4.5-11h9z" fill="#fff" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="20" cy="20" r="2.2" fill="var(--ink)" />
      </svg>
      <span className="logo-text"><span>Ödev</span> <i>Rotası</i></span>
    </span>
  )
}
