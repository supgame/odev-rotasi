import { Avatar, ItemPreview } from './Avatar'
import { SHOP_ITEMS, SLOT_NAMES } from '../data/shopItems'
import { SPECIES } from './catalog'

// #/galeri: bütün eşyaların vitrini (öğretmen kontrolü için).
export function Gallery() {
  const seeds = SPECIES.slice(0, 24)
  return (
    <div className="page wide">
      <h1>Avatar galerisi</h1>
      <p className="muted">{SHOP_ITEMS.length} eşya. Her öğrenci ilk gün kendine özgü bir görünümle başlar, sonra dükkandan değiştirir.</p>
      <h2>Canlı hâli (dokun)</h2>
      <div className="gallery">
        {['side', 'shoulder', 'hug', 'peek', 'head'].map((p, k) => <div key={p} className="g-cell"><Avatar animal={SPECIES[k * 7].id} seed={'canli' + k} equipped={{ pose: 'pose_' + p, fshape: 'fshape_' + ['round', 'long', 'square', 'heart', 'wide'][k] }} size={130} /><span>{p}</span></div>)}
      </div>
      <h2>Başlangıç görünümleri</h2>
      <div className="gallery">
        {seeds.map((s, k) => <div key={s.id} className="g-cell"><Avatar animal={s.id} seed={'ornek' + k} size={84} /><span>{s.name} ile</span></div>)}
      </div>
      {Object.keys(SLOT_NAMES).map((slot) => (
        <section key={slot}>
          <h2>{SLOT_NAMES[slot]}</h2>
          <div className="gallery">
            {SHOP_ITEMS.filter((i) => i.slot === slot).map((i) => (
              <div key={i.id} className="g-cell">
                <ItemPreview id={i.id} slot={slot} animal="fox" equipped={{}} seed="galeri" />
                <span>{i.name}</span><small>{i.price ? `⭐ ${i.price}` : 'Bedava'}</small>
              </div>
            ))}
          </div>
        </section>
      ))}
      <p className="hint">Çocuk ve eşyalar: Ödev Rotası için ImageGen ile çizildi (katmanlı, public/av). Hayvanlar aynı çizgide.</p>
    </div>
  )
}
