import { Avatar, ItemPreview, availablePoses } from './Avatar'
import { SHOP_ITEMS, SLOT_NAMES } from '../data/shopItems'
import { RABBIT_CRADLE, SPECIES } from './catalog'
import { HERO_PETS } from './companionContact'
import { Icon } from '../ui/Icon'

// #/galeri: bütün eşyaların vitrini (öğretmen kontrolü için).
export function Gallery() {
  const seeds = SPECIES.slice(0, 24)
  const pilotLooks = [
    { name: 'Kısa saç · açık ten · kız', gender: 'kiz' as const, hair: 'hair_short', skin: 'skin_light', clothes: 'clothes_tshirt', color: 'ccolor_blue' },
    { name: 'Uzun saç · buğday ten · erkek', gender: 'erkek' as const, hair: 'hair_straight_long', skin: 'skin_wheat', clothes: 'clothes_hoodie', color: 'ccolor_green' },
    { name: 'Başörtüsü · kahverengi ten · kız', gender: 'kiz' as const, hair: 'hair_headscarf', skin: 'skin_brown', clothes: 'clothes_hoodie', color: 'ccolor_pink' },
    { name: 'Örgüler · bronz ten · erkek', gender: 'erkek' as const, hair: 'hair_braids', skin: 'skin_tan', clothes: 'clothes_tshirt', color: 'ccolor_red' },
    { name: 'Kıvırcık saç · koyu ten · kız', gender: 'kiz' as const, hair: 'hair_curly', skin: 'skin_dark', clothes: 'clothes_hoodie', color: 'ccolor_purple' },
  ]
  const pilotScenes = [
    { title: 'Avuçta · Civciv', animal: 'chick', pose: 'pose_side' },
    { title: 'Kucakta · Tavşan', animal: 'rabbit', pose: 'pose_hug' },
  ]
  return (
    <div className="page wide">
      <h1>Avatar galerisi</h1>
      <p className="muted">{SHOP_ITEMS.length} eşya. Her öğrenci ilk gün kendine özgü bir görünümle başlar, sonra dükkandan değiştirir.</p>
      <section className="v2-pilot" aria-labelledby="v2-pilot-title">
        <h2 id="v2-pilot-title">V2 pilotu · eski ve yeni poz</h2>
        <p className="muted">Aynı çocuk ve eşya ayarlarıyla karşılaştırma. Örnekler beş ten tonunu, tişörtü ve kapüşonluyu; kısa ve uzun saçı, örgüleri ve başörtüsünü; kız ve erkek başlangıçlarını kapsar.</p>
        {pilotScenes.map((scene) => (
          <section className="v2-scene" key={scene.animal}>
            <h3>{scene.title}</h3>
            <div className="v2-cases">
              {pilotLooks.map((look, index) => {
                const equipped = { skin: look.skin, hair: look.hair, clothes: look.clothes, ccolor: look.color, pose: scene.pose }
                const seed = `v2-${scene.animal}-${index}`
                return <article className="v2-case" key={look.name}>
                  <strong>{look.name}</strong>
                  <div className="v2-pair">
                    <div><span>Eski</span><Avatar animal={scene.animal} equipped={equipped} seed={seed} gender={look.gender} size={160} legacyPose /></div>
                    <div><span>Yeni</span><Avatar animal={scene.animal} equipped={equipped} seed={seed} gender={look.gender} size={160} /></div>
                  </div>
                  <div className="v2-size-checks">
                    <div className="v2-small-check"><span>84 px kart</span><Avatar animal={scene.animal} equipped={equipped} seed={seed} gender={look.gender} size={84} pet /></div>
                    <div className="v2-large-check"><span>240 px ayna · eski / yeni</span>
                      <small>Eski</small>
                      <Avatar animal={scene.animal} equipped={equipped} seed={seed} gender={look.gender} size={240} legacyPose />
                      <small>Yeni</small>
                      <Avatar animal={scene.animal} equipped={equipped} seed={seed} gender={look.gender} size={240} />
                    </div>
                  </div>
                </article>
              })}
            </div>
          </section>
        ))}
      </section>
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
      <h2>Aynı öğrenci: cinsiyetsiz (eski) · kız · erkek</h2>
      <div className="gallery">
        {seeds.slice(0, 8).map((s, k) => (['', 'kiz', 'erkek'] as const).map((g) => (
          <div key={s.id + g} className="g-cell"><Avatar animal={s.id} seed={'ornek' + k} gender={g || null} size={84} pet={false} />
            <span>{g === 'kiz' ? 'Kız' : g === 'erkek' ? 'Erkek' : 'Boş'}</span></div>
        )))}
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
