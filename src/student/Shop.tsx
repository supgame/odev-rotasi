import { useEffect, useState } from 'react'
import { api } from '../data/api'
import { SLOT_NAMES } from '../data/shopItems'
import { errText, type ShopItem, type Slot, type StudentHome } from '../data/types'
import { Avatar, ItemPreview, currentId, petOf, speciesOf } from '../avatar/Avatar'
import { petItemId } from '../avatar/catalog'
import { Icon, StarCount } from '../ui/Icon'
import { Confetti } from './Confetti'

// Çıkarılabilen yuvalar. Diğerlerinde (saç, ten, kıyafet...) hep bir şey takılıdır; çıkarınca varsayılana döner.
const REMOVABLE: Slot[] = ['hat', 'glasses', 'bg', 'pet']
const GROUPS: [string, Slot[]][] = [
  ['Giysi', ['hat', 'glasses', 'clothes', 'ccolor']],
  ['Görünüş', ['hair', 'hcolor', 'face', 'skin', 'fshape', 'ears', 'eyes', 'cheek']],
  ['Sahne', ['pet', 'pose', 'bg']],
]

// Nadirlik fiyattan gelir: oyunlardaki gibi çerçeve rengi.
const RARITY = [
  { min: 50, cls: 'legend', name: 'Efsanevi' },
  { min: 35, cls: 'epic', name: 'Destansı' },
  { min: 20, cls: 'rare', name: 'Nadir' },
  { min: 1, cls: 'common', name: 'Sıradan' },
  { min: 0, cls: 'free', name: 'Bedava' },
]
const rarity = (price: number) => RARITY.find((r) => price >= r.min)!

export function Shop({ home, token, onBack, onChange }: {
  home: StudentHome; token: string; onBack: () => void; onChange: () => Promise<void>
}) {
  const [items, setItems] = useState<ShopItem[]>([])
  const [slot, setSlot] = useState<Slot>('hat')
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [party, setParty] = useState(0) // satın alınca konfeti
  const [busy, setBusy] = useState(false)
  useEffect(() => { api.shop().then(setItems) }, [])
  const [small, setSmall] = useState(() => matchMedia('(max-width: 780px)').matches)
  useEffect(() => {
    const m = matchMedia('(max-width: 780px)')
    const f = () => setSmall(m.matches)
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [])
  useEffect(() => { if (!party) return; const t = window.setTimeout(() => setParty(0), 3500); return () => window.clearTimeout(t) }, [party])

  async function act(fn: () => Promise<void>, ok: string, bought = false) {
    setBusy(true); setMsg(null)
    try { await fn(); await onChange(); setMsg({ text: ok, ok: true }); if (bought) setParty((n) => n + 1) } catch (e) { setMsg({ text: errText(e), ok: false }) } finally { setBusy(false) }
  }

  const { animal, id: seed } = home.me
  const eq = home.me.equipped
  const basePet = petItemId(speciesOf(animal).id) // öğretmenin verdiği hayvan hep öğrencinin
  const wornId = (s: Slot) => (s === 'pet' ? petItemId(petOf(animal, eq).id) : s === 'hat' || s === 'glasses' || s === 'bg' ? eq[s] : currentId(eq, s, seed))
  const list = items.filter((it) => it.slot === slot).sort((a, b) => a.price - b.price)
  const owned = (it: ShopItem) => it.id === basePet || it.price === 0 || home.owned.includes(it.id)
  return (
    <div className="page shop">
      {party > 0 && <Confetti key={party} n={30} />}
      <div className="hud">
        <button className="icon-btn" onClick={onBack} aria-label="Ana sayfa"><Icon name="back" size={26} /></button>
        <span className="hud-title pop">Dükkan</span>
        <span className="grow" />
        <StarCount n={home.me.stars} key={home.me.stars} bump={party > 0} />
      </div>
      <div className="shop-layout">
        <aside className="panel mirror">
          {!small && <span className="ribbon" style={{ left: '50%', transform: 'translateX(-50%)' }}><Icon name="sparkle" size={22} />Ayna</span>}
          <div className="stage"><Avatar animal={animal} equipped={eq} seed={seed} size={small ? 84 : 170} bounce /></div>
          <div>
            {!small && <h2>{home.me.display_name}</h2>}
            <p className={'say' + (msg?.ok ? ' ok' : msg ? ' err' : '')} key={msg?.text}>
              {msg ? msg.text : 'Aldığın eşya hep senin. Bedava olanları dilediğin kadar değiştir.'}
            </p>
          </div>
        </aside>
        <div>
          <nav className="panel cats">
            <span className="ribbon"><Icon name="bag" size={22} />Reyonlar</span>
            {GROUPS.map(([name, slots]) => (
              <div key={name} className="cat-group">
                <span className="cat-label">{name}</span>
                <div className="cat-row">
                  {slots.map((s) => (
                    <button key={s} className={s === slot ? 'on' : ''} onClick={() => { setSlot(s); setMsg(null) }}>{SLOT_NAMES[s]}</button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="slot-head">
            <h2 className="pop">{SLOT_NAMES[slot]}</h2>
            <div className="legend">
              {RARITY.slice().reverse().map((r) => <span key={r.cls} style={{ ['--rc' as string]: `var(--r-${r.cls})` }}>{r.name}</span>)}
            </div>
          </div>
          {!items.length && <p className="center-text loading" style={{ fontSize: '1.3rem' }}>Raflar diziliyor…</p>}
          <div className="shop-grid">
            {list.map((it) => {
              const base = it.id === basePet
              const has = owned(it)
              const worn = wornId(slot) === it.id
              const canBuy = home.me.stars >= it.price
              const removable = REMOVABLE.includes(slot) && !base
              const r = rarity(it.price)
              return (
                <div key={it.id} className={`item ${r.cls}` + (worn ? ' worn' : '') + (!has && !canBuy ? ' poor' : '')}>
                  {worn ? <span className="worn-tag"><Icon name="check" size={14} />Takılı</span> : null}
                  {it.price > 0 && <span className="rarity">{r.name}</span>}
                  <div className="item-thumb">
                    <ItemPreview id={it.id} slot={it.slot} animal={animal} equipped={eq} seed={seed} />
                    {!has && !canBuy && <Icon name="lock" size={30} className="lock" />}
                  </div>
                  <span className="item-name">{it.name}</span>
                  <div className="item-foot">
                    {worn && !removable ? (
                      <span className="now">Şu an bu</span>
                    ) : has ? (
                      <button className={'btn small ' + (worn ? 'ghost' : 'blue')} disabled={busy} onClick={() => act(async () => {
                        if (worn || base) return api.equip(token, slot, null)
                        if (!home.owned.includes(it.id)) await api.buy(token, it.id) // bedava eşya: önce sahiplen
                        await api.equip(token, slot, it.id)
                      }, worn ? 'Çıkardın.' : 'Taktın, çok yakıştı!')}>
                        {worn ? 'Çıkar' : 'Tak'}
                      </button>
                    ) : (
                      <>
                        <button className={'btn small gold' + (canBuy ? '' : ' cant')} disabled={busy || !canBuy}
                          onClick={() => act(async () => { await api.buy(token, it.id); await api.equip(token, it.slot, it.id) }, `${it.name} artık senin!`, true)}>
                          <Icon name="star" size={22} />{it.price}
                        </button>
                        {!canBuy && <span className="need">{it.price - home.me.stars} yıldız daha</span>}
                      </>
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
