// Basit CSS konfeti: kütüphane yok.
const COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff', '#ff8c42']

export function Confetti() {
  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: 40 }, (_, i) => (
        <i
          key={i}
          style={{
            left: (i * 37) % 100 + '%',
            background: COLORS[i % COLORS.length],
            animationDelay: ((i * 53) % 100) / 100 + 's',
            animationDuration: 1.8 + ((i * 29) % 10) / 10 + 's',
            transform: `rotate(${(i * 47) % 360}deg)`,
          }}
        />
      ))}
    </div>
  )
}
