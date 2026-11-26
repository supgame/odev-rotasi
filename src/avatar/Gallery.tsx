import { useState } from 'react'
import { Avatar } from './Avatar'
import { ITEMS, SPECIES, type ItemSlot } from './catalog'
import { SLOT_NAMES } from '../data/shopItems'

// #/galeri: bütün karakter ve eşyaların vitrini (öğretmen kontrolü için).
export function Gallery() {
  const [ch, setCh] = useState('fox')
  return (
    <div className="page wide">
      <h1>Avatar galerisi</h1>
      <p className="muted">{SPECIES.length} karakter, {ITEMS.length} eşya. Bir karaktere dokun, eşyalar onun üstünde görünsün.</p>
      <h2>Karakterler</h2>
      <div className="gallery">
        {SPECIES.map((s) => (
          <button key={s.id} className={'g-cell' + (s.id === ch ? ' on' : '')} onClick={() => setCh(s.id)}>
            <Avatar animal={s.id} size={84} /><span>{s.name}</span><small>{s.price ? `⭐ ${s.price}` : 'Bedava'}</small>
          </button>
        ))}
      </div>
      {(['hat', 'glasses', 'neck', 'bg'] as ItemSlot[]).map((slot) => (
        <section key={slot}>
          <h2>{SLOT_NAMES[slot]}</h2>
          <div className="gallery">
            {ITEMS.filter((i) => i.slot === slot).map((i) => (
              <div key={i.id} className="g-cell"><Avatar animal={ch} equipped={{ [slot]: i.id }} size={84} /><span>{i.name}</span><small>⭐ {i.price}</small></div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
