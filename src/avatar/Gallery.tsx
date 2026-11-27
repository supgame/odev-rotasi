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
      <p className="hint">Çocuk: Avataaars, Pablo Stanley (avataaars.com, ticari dahil serbest), DiceBear ile. Hayvanlar: Microsoft Fluent Emoji (MIT).</p>
    </div>
  )
}
