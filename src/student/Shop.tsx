import { useEffect, useState } from 'react'
import { api } from '../data/api'
import { SLOT_NAMES } from '../data/shopItems'
import { errText, type ShopItem, type Slot, type StudentHome } from '../data/types'
import { Avatar, ItemPreview, currentId, petOf, speciesOf } from '../avatar/Avatar'
import { petItemId } from '../avatar/catalog'

// Çıkarılabilen yuvalar. Diğerlerinde (saç, ten, kıyafet...) hep bir şey takılıdır; çıkarınca varsayılana döner.
const REMOVABLE: Slot[] = ['hat', 'glasses', 'bg', 'pet']
const GROUPS: [string, Slot[]][] = [
  ['Giysi', ['hat', 'glasses', 'clothes', 'ccolor']],
  ['Görünüş', ['hair', 'hcolor', 'face', 'skin', 'fshape', 'ears', 'eyes', 'cheek']],
  ['Sahne', ['pet', 'pose', 'bg']],
]

export function Shop({ home, token, onBack, onChange }: {
  home: StudentHome; token: string; onBack: () => void; onChange: () => Promise<void>
}) {
  const [items, setItems] = useState<ShopItem[]>([])
  const [slot, setSlot] = useState<Slot>('hat')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { api.shop().then(setItems) }, [])
  const [small, setSmall] = useState(() => matchMedia('(max-width: 760px)').matches)
  useEffect(() => {
    const m = matchMedia('(max-width: 760px)')
    const f = () => setSmall(m.matches)
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [])

  async function act(fn: () => Promise<void>, ok: string) {
    setBusy(true); setMsg('')
    try { await fn(); await onChange(); setMsg(ok) } catch (e) { setMsg(errText(e)) } finally { setBusy(false) }
  }

  const { animal, id: seed } = home.me
  const eq = home.me.equipped
  const basePet = petItemId(speciesOf(animal).id) // öğretmenin verdiği hayvan hep öğrencinin
  const wornId = (s: Slot) => (s === 'pet' ? petItemId(petOf(animal, eq).id) : s === 'hat' || s === 'glasses' || s === 'bg' ? eq[s] : currentId(eq, s, seed))
  const list = items.filter((it) => it.slot === slot).sort((a, b) => a.price - b.price)
  return (
    <div className="page shop">
      <div className="topbar">
        <button className="link" onClick={onBack}>← Ana sayfa</button>
        <span className="stars-pill">{home.me.stars} yıldız</span>
      </div>
      <div className="shop-layout">
        <aside className="shop-mirror">
          <Avatar animal={animal} equipped={eq} seed={seed} size={small ? 110 : 170} bounce />
          <div className="shop-mirror-text">
            <h1>Dükkan</h1>
            <p className="muted">Aldığın eşya hep senin, istediğin zaman takıp çıkarırsın. Bedava olanları dilediğin kadar değiştir.</p>
            {msg && <p className="toast">{msg}</p>}
          </div>
        </aside>
        <div className="shop-main">
          <nav className="shop-nav">
            {GROUPS.map(([name, slots]) => (
              <div key={name} className="shop-nav-group">
                <span className="shop-nav-label">{name}</span>
                <div className="shop-nav-row">
                  {slots.map((s) => (
                    <button key={s} className={s === slot ? 'on' : ''} onClick={() => { setSlot(s); setMsg('') }}>{SLOT_NAMES[s]}</button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="shop-slot-head">
            <h2>{SLOT_NAMES[slot]}</h2>
            <span className="muted">{list.length} eşya</span>
          </div>
          <div className="shop-grid">
            {list.map((it) => {
              const base = it.id === basePet
              const owned = base || it.price === 0 || home.owned.includes(it.id)
              const worn = wornId(slot) === it.id
              const canBuy = home.me.stars >= it.price
              const removable = REMOVABLE.includes(slot) && !base
              return (
                <div key={it.id} className={'shop-item' + (worn ? ' worn' : '') + (!owned && !canBuy ? ' locked' : '')}>
                  {worn && <span className="si-flag">Takılı</span>}
                  <div className="si-thumb">
                    <ItemPreview id={it.id} slot={it.slot} animal={animal} equipped={eq} seed={seed} />
                  </div>
                  <span className="si-name">{it.name}</span>
                  <div className="si-foot">
                    {worn && !removable ? (
                      <span className="si-note">Şu an bu</span>
                    ) : owned ? (
                      <button className="btn small ghost" disabled={busy} onClick={() => act(async () => {
                        if (worn || base) return api.equip(token, slot, null)
                        if (!home.owned.includes(it.id)) await api.buy(token, it.id) // bedava eşya: önce sahiplen
                        await api.equip(token, slot, it.id)
                      }, worn ? 'Çıkardın.' : 'Taktın!')}>
                        {worn ? 'Çıkar' : it.price === 0 && !home.owned.includes(it.id) ? 'Bedava · Tak' : 'Tak'}
                      </button>
                    ) : (
                      <button className="btn small ghost price" disabled={busy || !canBuy} title={canBuy ? '' : `${it.price - home.me.stars} yıldız daha lazım`}
                        onClick={() => act(async () => { await api.buy(token, it.id); await api.equip(token, it.slot, it.id) }, `${it.name} artık senin!`)}>
                        {it.price}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
