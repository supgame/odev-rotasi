import { useEffect, useState } from 'react'
import { api } from '../data/api'
import { SLOT_NAMES } from '../data/shopItems'
import { errText, type ShopItem, type Slot, type StudentHome } from '../data/types'
import { Avatar, ItemPreview, currentId, petOf, speciesOf } from '../avatar/Avatar'
import { petItemId } from '../avatar/catalog'

// Çıkarılabilen yuvalar. Diğerlerinde (saç, ten, kıyafet...) hep bir şey takılıdır; çıkarınca varsayılana döner.
const REMOVABLE: Slot[] = ['hat', 'glasses', 'bg', 'pet']

export function Shop({ home, token, onBack, onChange }: {
  home: StudentHome; token: string; onBack: () => void; onChange: () => Promise<void>
}) {
  const [items, setItems] = useState<ShopItem[]>([])
  const [slot, setSlot] = useState<Slot>('hat')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { api.shop().then(setItems) }, [])

  async function act(fn: () => Promise<void>, ok: string) {
    setBusy(true); setMsg('')
    try { await fn(); await onChange(); setMsg(ok) } catch (e) { setMsg(errText(e)) } finally { setBusy(false) }
  }

  const { animal, id: seed } = home.me
  const eq = home.me.equipped
  const basePet = petItemId(speciesOf(animal).id) // öğretmenin verdiği hayvan hep öğrencinin
  const wornId = (s: Slot) => (s === 'pet' ? petItemId(petOf(animal, eq).id) : s === 'hat' || s === 'glasses' || s === 'bg' ? eq[s] : currentId(eq, s, seed))
  return (
    <div className="page">
      <div className="topbar">
        <button className="link" onClick={onBack}>← Ana sayfa</button>
        <span className="stars-pill">⭐ {home.me.stars}</span>
      </div>
      <section className="me-card shop-head">
        <Avatar animal={animal} equipped={eq} seed={seed} size={150} bounce />
        <p className="muted">Aldığın eşyalar hep senin. İstediğin zaman takıp çıkarabilirsin. Bedava olanları istediğin kadar değiştir.</p>
      </section>
      {msg && <p className="toast">{msg}</p>}
      <div className="tabs">
        {(Object.keys(SLOT_NAMES) as Slot[]).map((s) => (
          <button key={s} className={s === slot ? 'on' : ''} onClick={() => setSlot(s)}>{SLOT_NAMES[s]}</button>
        ))}
      </div>
      <div className="shop-grid">
        {items.filter((it) => it.slot === slot).sort((a, b) => a.price - b.price).map((it) => {
          const base = it.id === basePet
          const owned = base || it.price === 0 || home.owned.includes(it.id)
          const worn = wornId(slot) === it.id
          const canBuy = home.me.stars >= it.price
          const removable = REMOVABLE.includes(slot) && !base
          return (
            <div key={it.id} className={'shop-item' + (worn ? ' worn' : '')}>
              <ItemPreview id={it.id} slot={it.slot} animal={animal} equipped={eq} seed={seed} />
              <b>{it.name}</b>
              {worn && !removable ? (
                <span className="muted small-note">Şu an bu</span>
              ) : owned ? (
                <button className="btn small" disabled={busy} onClick={() => act(async () => {
                  if (worn || base) return api.equip(token, slot, null)
                  if (!home.owned.includes(it.id)) await api.buy(token, it.id) // bedava eşya: önce sahiplen
                  await api.equip(token, slot, it.id)
                }, worn ? 'Çıkardın.' : 'Taktın! 😎')}>
                  {worn ? 'Çıkar' : 'Tak'}
                </button>
              ) : (
                <button className="btn small" disabled={busy || !canBuy} onClick={() => act(async () => { await api.buy(token, it.id); await api.equip(token, it.slot, it.id) }, `${it.name} senin! 🎉`)}>
                  ⭐ {it.price}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
