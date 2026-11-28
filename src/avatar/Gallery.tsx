import { Avatar, ItemPreview, availablePoses } from './Avatar'
import { SHOP_ITEMS, SLOT_NAMES } from '../data/shopItems'
import { RABBIT_CRADLE, SPECIES } from './catalog'
import { HERO_PETS } from './companionContact'
import { Icon } from '../ui/Icon'

// #/galeri: bütün eşyaların vitrini (öğretmen kontrolü için).
export function Gallery() {
  const seeds = SPECIES.slice(0, 24)
  return (
    <div className="page wide">
      <h1>Avatar galerisi</h1>
      <p className="muted">{SHOP_ITEMS.length} eşya. Her öğrenci ilk gün kendine özgü bir görünümle başlar, sonra dükkandan değiştirir.</p>
      <div className="g-cell gallery-illustration">
        <Avatar animal="rabbit" equipped={RABBIT_CRADLE} size={220} />
        <strong>Kucağımda · Tavşan</strong>
      </div>
      <h2>Canlı hâli (dokun)</h2>
      <div className="gallery gallery-live">
        {HERO_PETS.map((animal) => (
          <div key={animal} className="g-cell">
            <Avatar animal={animal} seed={'canli-' + animal} size={130} interactive />
            <span>{SPECIES.find((species) => species.id === animal)?.name}</span>
          </div>
        ))}
      </div>
      <h2>Başlangıç görünümleri</h2>
      <div className="gallery">
        {seeds.map((s, k) => <div key={s.id} className="g-cell"><Avatar animal={s.id} seed={'ornek' + k} size={84} /><span>{s.name} ile</span></div>)}
      </div>
      {Object.keys(SLOT_NAMES).map((slot) => (
        <section key={slot}>
          <h2>{SLOT_NAMES[slot]}</h2>
          <div className="gallery">
            {SHOP_ITEMS.filter((i) => i.slot === slot && (slot !== 'pose' || availablePoses('rabbit').includes(i.id))).map((i) => (
              <div key={i.id} className="g-cell">
                <ItemPreview id={i.id} slot={slot} animal="rabbit" equipped={{}} seed="galeri" />
                <span>{i.name}</span><small>{i.price ? <><Icon name="star" size={14} /> {i.price}</> : 'Bedava'}</small>
              </div>
            ))}
          </div>
        </section>
      ))}
      <p className="hint">Çocuk ve eşyalar: Ödev Rotası için ImageGen ile çizildi (katmanlı, public/av). Hayvanlar aynı çizgide.</p>
    </div>
  )
}
