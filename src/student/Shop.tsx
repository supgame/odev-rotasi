import { useEffect, useState } from 'react'
import { api } from '../data/api'
import { SLOT_NAMES } from '../data/shopItems'
import { errText, type ShopItem, type Slot, type StudentHome } from '../data/types'
import { Avatar, ItemPreview } from '../avatar/Avatar'

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

  const eq = home.me.equipped
  return (
    <div className="page">
      <div className="topbar">
        <button className="link" onClick={onBack}>← Ana sayfa</button>
        <span className="stars-pill">⭐ {home.me.stars}</span>
      </div>
      <section className="me-card shop-head">
        <Avatar animal={home.me.animal} equipped={eq} size={140} bounce />
        <p className="muted">Aldığın eşyalar hep senin. İstediğin zaman takıp çıkarabilirsin.</p>
      </section>
      {msg && <p className="toast">{msg}</p>}
      <div className="tabs">
        {(Object.keys(SLOT_NAMES) as Slot[]).map((s) => (
          <button key={s} className={s === slot ? 'on' : ''} onClick={() => setSlot(s)}>{SLOT_NAMES[s]}</button>
        ))}
      </div>
      <div className="shop-grid">
        {items.filter((it) => it.slot === slot).map((it) => {
          const owned = home.owned.includes(it.id)
          const worn = eq[slot] === it.id
          const canBuy = home.me.stars >= it.price
          return (
            <div key={it.id} className={'shop-item' + (worn ? ' worn' : '')}>
              <ItemPreview id={it.id} slot={it.slot} animal={home.me.animal} />
              <b>{it.name}</b>
              {owned ? (
                <button className="btn small" disabled={busy} onClick={() => act(() => api.equip(token, slot, worn ? null : it.id), worn ? 'Çıkardın.' : 'Taktın! 😎')}>
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
