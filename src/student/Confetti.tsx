// Basit CSS konfeti (kütüphane yok): kalın çizgili kâğıtlar + altın yıldızlar.
const COLORS = ['#ff5f5f', '#ffcb3d', '#36c86c', '#34a0ff', '#7a5cff', '#ff93c6']

export function Confetti({ n = 46 }: { n?: number }) {
  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <i
          key={i}
          className={i % 5 === 0 ? 'st' : ''}
          style={{
            left: (i * 37) % 100 + '%',
            background: i % 5 === 0 ? '#ffcb3d' : COLORS[i % COLORS.length],
            animationDelay: ((i * 53) % 100) / 120 + 's',
            animationDuration: 1.1 + ((i * 29) % 5) / 10 + 's',
            transform: `rotate(${(i * 47) % 360}deg)`,
          }}
        />
      ))}
    </div>
  )
}
