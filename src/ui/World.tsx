// Sabit oyun dünyası arka planı: gökyüzü, dönen güneş, kayan bulutlar, iki kat tepe. İçerik bunun üstünde kayar.
export function World({ calm }: { calm?: boolean }) {
  return (
    <div className={'world' + (calm ? ' calm' : '')} aria-hidden>
      <div className="sun"><i /></div>
      <svg className="cloud c1" viewBox="0 0 120 50"><path d="M20 44a14 14 0 010-28 20 20 0 0138-6 16 16 0 0130 8 13 13 0 0112 26z" /></svg>
      <svg className="cloud c2" viewBox="0 0 120 50"><path d="M20 44a14 14 0 010-28 20 20 0 0138-6 16 16 0 0130 8 13 13 0 0112 26z" /></svg>
      <svg className="cloud c3" viewBox="0 0 120 50"><path d="M20 44a14 14 0 010-28 20 20 0 0138-6 16 16 0 0130 8 13 13 0 0112 26z" /></svg>
      <svg className="hills" viewBox="0 0 1440 260" preserveAspectRatio="none">
        <path className="h1" d="M0 150 C 180 70 330 70 520 130 S 860 210 1040 120 S 1320 60 1440 110 V260 H0z" />
        <path className="h2" d="M0 210 C 220 140 420 150 640 200 S 1000 250 1200 180 S 1380 160 1440 175 V260 H0z" />
      </svg>
    </div>
  )
}
