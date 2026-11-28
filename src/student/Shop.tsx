import { useEffect, useRef, useState } from 'react'
import { api } from '../data/api'
import { SLOT_NAMES } from '../data/shopItems'
import { errText, type Equipped, type ShopItem, type Slot, type StudentHome } from '../data/types'
import { Avatar, ItemPreview, availablePoses, currentId, petOf, poseOf, speciesOf } from '../avatar/Avatar'
import { ITEMS, petItemId } from '../avatar/catalog'
import { HERO_PETS } from '../avatar/companionContact'
import { isRecommended } from '../avatar/gender'
import { Icon, StarCount } from '../ui/Icon'
import { Confetti } from './Confetti'
import './shop.css'

const REMOVABLE: Slot[] = ['hat', 'glasses', 'bg', 'pet', 'held']
const FACE_SLOTS: Slot[] = ['fshape', 'face', 'mouth', 'nose', 'brow', 'eshape', 'eyes', 'ears', 'cheek']
const BACKEND_GATED_FACE_SLOTS: Slot[] = ['mouth', 'nose', 'brow', 'eshape']
const SECTIONS: { name: string; categories: { label: string; slot: Slot }[] }[] = [
  { name: 'Giyin', categories: [
    { label: 'Şapka', slot: 'hat' }, { label: 'Gözlük', slot: 'glasses' }, { label: 'Kıyafet', slot: 'clothes' }, { label: 'Elimde', slot: 'held' },
  ] },
  { name: 'Görünüşüm', categories: [
    { label: 'Saç', slot: 'hair' }, { label: 'Ten', slot: 'skin' }, { label: 'Yüz', slot: 'fshape' },
  ] },
  { name: 'Arkadaşım', categories: [
    { label: 'Hayvan', slot: 'pet' }, { label: 'Poz', slot: 'pose' }, { label: 'Arka plan', slot: 'bg' },
  ] },
]
const CATALOG = new Map(ITEMS.map((it) => [it.id, it]))

// Renkler ayrı eşya kimliklerini ve sahipliklerini korur, aynı model tek kartta görünür.
function productGroups(items: ShopItem[]) {
  const groups = new Map<string, ShopItem[]>()
  for (const item of items) {
    const coloredModel = (item.slot === 'hat' || item.slot === 'glasses') && CATALOG.get(item.id)?.raw.color
    const key = coloredModel ? item.id.replace(/_[^_]+$/, '') : item.id
    const group = groups.get(key) ?? []
    group.push(item)
    groups.set(key, group)
  }
  return [...groups.entries()]
}

export function Shop({ home, token, onBack, onChange }: {
  home: StudentHome; token: string; onBack: () => void; onChange: () => Promise<void>
}) {
  const [items, setItems] = useState<ShopItem[]>([])
  const [section, setSection] = useState(0)
  const [slot, setSlot] = useState<Slot>('hat')
  const [variants, setVariants] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState<Equipped>({})
  const [msg, setMsg] = useState<{ text: string; ok: boolean; preview?: boolean } | null>(null)
  const [party, setParty] = useState(0)
  const [busy, setBusy] = useState(false)
  const actionLock = useRef(false)
  const [purchase, setPurchase] = useState<ShopItem | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const mirrorDialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { if (purchase) dialog.current?.showModal() }, [purchase])
  useEffect(() => {
    api.shop().then((catalog) => setItems(catalog.map((item) => ({ ...item, name: CATALOG.get(item.id)?.name ?? item.name }))))
      .catch((e) => setMsg({ text: errText(e), ok: false }))
  }, [])
  useEffect(() => {
    if (!party) return
    const t = window.setTimeout(() => setParty(0), 1600)
    return () => window.clearTimeout(t)
  }, [party])

  async function act(fn: () => Promise<void>, ok: string, bought = false) {
    if (actionLock.current) return
    actionLock.current = true
    setBusy(true)
    setMsg(null)
    try {
      await fn()
      if (bought) setParty((n) => n + 1)
      await onChange()
      setMsg({ text: ok, ok: true })
    } catch (e) {
      setMsg({ text: errText(e), ok: false })
    } finally {
      actionLock.current = false
      setBusy(false)
    }
  }

  const { animal, id: seed, gender } = home.me
  const eq = home.me.equipped
  const previewEq = { ...eq, ...draft }
  const basePet = petItemId(speciesOf(animal).id)
  const slotId = (look: Equipped, s: Slot) => {
    if (s === 'pet') return petItemId(petOf(animal, look).id)
    if (s === 'pose') return 'pose_' + poseOf(look, petOf(animal, look).id)
    return REMOVABLE.includes(s) ? look[s] : currentId(look, s, seed, gender)
  }
  const wornId = (s: Slot) => slotId(eq, s)
  const owned = (it: ShopItem) => it.id === basePet || it.price === 0 || home.owned.includes(it.id)
  const ownedPetIds = new Set([...HERO_PETS.map(petItemId), ...home.owned, basePet, petItemId(petOf(animal, eq).id)])
  const previewPet = petOf(animal, previewEq)
  const poses = availablePoses(previewPet.id)
  const handsFull = poseOf(previewEq, previewPet.id) === 'hug'
  const list = items.filter((it) => {
    if (it.slot !== slot) return false
    if (slot === 'pose') return poses.includes(it.id)
    if (slot === 'pet') return ownedPetIds.has(it.id)
    return true
  }).sort((a, b) => Number(isRecommended(b.id, gender)) - Number(isRecommended(a.id, gender)) || a.price - b.price)
  const colorSlot = slot === 'hair' ? 'hcolor' : slot === 'clothes' ? 'ccolor' : null
  const colors = colorSlot ? items.filter((it) => it.slot === colorSlot) : []
  const chosenColor = colorSlot ? colors.find((it) => it.id === slotId(previewEq, colorSlot)) : undefined
  const trials = Object.entries(draft) as [Slot, string][]
  const inFace = FACE_SLOTS.includes(slot)

  function selectSlot(next: Slot) {
    if (slot === next) return
    setSlot(next)
    setMsg(null)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function clearTrial(slot: Slot) {
    setDraft((previous) => {
      const next = { ...previous }
      delete next[slot]
      return next
    })
  }

  function tryItem(it: ShopItem) {
    const base = { ...previewEq, [it.slot]: eq[it.slot] }
    if (slotId(base, it.slot) === it.id) clearTrial(it.slot)
    else setDraft((previous) => ({ ...previous, [it.slot]: it.id }))
    setMsg({ text: `${it.name} aynada.`, ok: true, preview: true })
  }

  function applyItem(it: ShopItem) {
    void act(async () => {
      if (!home.owned.includes(it.id) && it.id !== basePet) await api.buy(token, it.id)
      await api.equip(token, it.slot, it.id === basePet ? null : it.id)
      clearTrial(it.slot)
    }, `${it.name} takıldı.`)
  }

  function itemActions(it: ShopItem, showTry = true) {
    const has = owned(it)
    const worn = wornId(it.slot) === it.id
    const canBuy = home.me.stars >= it.price
    const removable = REMOVABLE.includes(it.slot) && it.id !== basePet
    return <div className="item-foot">
      {showTry && <button className="try-item" aria-pressed={draft[it.slot] === it.id} disabled={busy} onClick={() => tryItem(it)}>Dene</button>}
      {worn ? removable ? <button className="btn small ghost" disabled={busy} onClick={() => {
        void act(async () => {
          await api.equip(token, it.slot, null)
          clearTrial(it.slot)
        }, 'Çıkardın.')
      }}>Çıkar</button> : !showTry ? <span className="now">Takılı</span> : null : has ?
        <button className="btn small blue" disabled={busy} onClick={() => applyItem(it)}>Tak</button> :
        <button className="btn small gold" disabled={busy || !canBuy} aria-label={`${it.name}, ${it.price} yıldızla satın al`} onClick={() => setPurchase(it)}>
          <Icon name="star" size={20} />{it.price} · Satın al
        </button>}
      {!has && !canBuy && <span className="need">{it.price - home.me.stars} yıldız daha gerekiyor</span>}
    </div>
  }

  function colorChoices(group: ShopItem[], selected: string, onSelect: (item: ShopItem) => void) {
    return <div className="product-colors" role="group" aria-label="Renk seçenekleri">
      {group.map((it) => <button key={it.id} className={selected === it.id ? 'selected' : ''} aria-label={`${it.name}${owned(it) ? ', sende var' : `, ${it.price} yıldız`}`} title={`${it.name} · ${owned(it) ? 'Sende var' : `${it.price} yıldız`}`} aria-pressed={selected === it.id} disabled={busy} onClick={() => onSelect(it)}>
        <span style={{ background: '#' + (CATALOG.get(it.id)?.raw.color ?? 'ddd') }} />
      </button>)}
    </div>
  }

  return (
    <div className="page shop shop-refresh">
      <dialog ref={dialog} className="panel buy-dialog" aria-labelledby="purchase-title" onCancel={() => setPurchase(null)} onClose={() => setPurchase(null)}>
        {purchase && <>
          <h2 id="purchase-title">{purchase.name} alınsın mı?</h2>
          <p>{purchase.price} yıldız harcayacaksın. Geriye {home.me.stars - purchase.price} yıldızın kalacak.</p>
          <div className="row">
            <button className="btn ghost" autoFocus disabled={busy} onClick={() => dialog.current?.close()}>Vazgeç</button>
            <button className="btn gold" disabled={busy || owned(purchase) || home.me.stars < purchase.price} onClick={() => {
              const item = purchase
              dialog.current?.close()
              void act(() => api.buy(token, item.id), `${item.name} artık senin! Tak düğmesiyle kullanabilirsin.`, true)
            }}>Evet, {purchase.price} yıldızla al</button>
          </div>
        </>}
      </dialog>
      <dialog ref={mirrorDialog} className="panel mirror-dialog" aria-label="Büyük ayna">
        <Avatar animal={animal} equipped={previewEq} seed={seed} gender={gender} size={260} pet interactive />
        {previewEq.held && handsFull && <p className="shop-caption">Ellerin kucaktaki arkadaşını tutuyor. Eşyanı görmek için Yanımda pozunu seç.</p>}
        <button className="btn ghost" onClick={() => mirrorDialog.current?.close()}>Kapat</button>
      </dialog>
      {party > 0 && <Confetti key={party} n={16} />}
      <div className="hud">
        <button className="icon-btn" onClick={onBack} aria-label="Ana sayfa"><Icon name="back" size={26} /></button>
        <span className="hud-title pop">Dükkân</span>
        <span className="grow" />
        <StarCount n={home.me.stars} key={home.me.stars} bump={party > 0} />
      </div>
      <div className="shop-layout">
        <div className="shop-editor">
          <aside className="panel mirror" aria-label="Kombin aynası">
            <button type="button" className="mirror-open" aria-label="Aynayı büyüt" onClick={() => mirrorDialog.current?.showModal()}>
              <div className="stage"><Avatar animal={animal} equipped={previewEq} seed={seed} gender={gender} size={160} pet /></div>
              <span className="mirror-zoom"><Icon name="eye" size={18} /> Büyüt</span>
            </button>
            {trials.length > 0 && <div className="shop-trials" role="group" aria-label="Denenen parçalar">
              {trials.map(([part, id]) => <button type="button" key={part} disabled={busy}
                aria-label={`${part === 'pet' ? 'Hayvan' : SLOT_NAMES[part]} denemesini geri al`} title={items.find((item) => item.id === id)?.name}
                onClick={() => { clearTrial(part); setMsg(null) }}>
                {part === 'pet' ? 'Hayvan' : SLOT_NAMES[part]} <Icon name="x" size={15} />
              </button>)}
              {trials.length > 1 && <button type="button" className="reset-look" disabled={busy}
                onClick={() => { setDraft({}); setMsg(null) }}>Tümünü geri al</button>}
            </div>}
            <p role="status" className={'shop-status' + (!msg || msg.preview ? ' visually-hidden' : msg.ok ? '' : ' error')}>{msg?.text}</p>
          </aside>
          <div className="shop-controls">
            <nav className="shop-sections" aria-label="Dükkân bölümleri">
              {SECTIONS.map((group, index) => <button type="button" key={group.name} aria-pressed={section === index}
                onClick={() => { if (section !== index) { setSection(index); selectSlot(group.categories[0].slot) } }}>{group.name}</button>)}
            </nav>
            <div className="shop-categories" role="group" aria-label={`${SECTIONS[section].name} seçenekleri`}>
              {SECTIONS[section].categories.map(({ label, slot: category }) => <button type="button" key={category}
                aria-pressed={category === 'fshape' ? inFace : slot === category} onClick={() => selectSlot(category)}>{label}</button>)}
            </div>
            {inFace && <div className="shop-face-options" role="group" aria-label="Yüz ayrıntıları">
              {FACE_SLOTS.filter((part) => !BACKEND_GATED_FACE_SLOTS.includes(part) || items.some((item) => item.slot === part))
                .map((part) => <button type="button" key={part} aria-pressed={slot === part}
                  onClick={() => selectSlot(part)}>{SLOT_NAMES[part]}</button>)}
            </div>}
          </div>
        </div>
        <section className="shop-products" aria-label="Ürünler">
          {colorSlot && chosenColor && <details key={colorSlot} className="clothing-colors">
            <summary className="color-heading"><strong>{SLOT_NAMES[colorSlot]}</strong><span><i style={{ background: '#' + CATALOG.get(chosenColor.id)?.raw.color }} />{chosenColor.name}</span></summary>
            {colorChoices(colors, chosenColor.id, tryItem)}
            <div className="color-actions">{itemActions(chosenColor, false)}</div>
          </details>}
          {slot === 'face' && currentId(previewEq, 'mouth', seed, gender) !== 'mouth_expression' &&
            <p className="shop-caption">Seçtiğin ağız korunur. İfadenin kendi ağzını görmek için Ağız bölümünde <b>İfadeye göre</b> seç.</p>}
          {slot === 'face' && (currentId(previewEq, 'brow', seed, gender) !== 'brow_expression' || currentId(previewEq, 'eshape', seed, gender) !== 'eshape_expression') &&
            <p className="shop-caption">Seçtiğin kaş ve göz biçimi ifadeden bağımsız kalır.</p>}
          {slot === 'pose' && <p className="shop-caption"><b>{previewPet.name} için duruşlar</b></p>}
          {slot === 'held' && <p className="shop-caption">{handsFull
            ? 'Eşyanı aynada görmek için Yanımda pozunu seç.'
            : 'Dene, aynayı büyüt ve eşyana dokun.'}</p>}
          {!items.length && <p className="center-text loading">Raflar diziliyor…</p>}
          <div className="shop-grid">
            {productGroups(list).map(([key, group]) => {
              const it = group.find((item) => item.id === variants[key]) ?? group.find((item) => wornId(slot) === item.id) ?? group[0]
              const worn = wornId(slot) === it.id
              const tier = slot === 'held' ? (it.price >= 20 ? ' rare' : ' common') : ''
              return <article key={key} className={'item' + tier + (worn ? ' worn' : '')}>
                <div className={'item-thumb slot-' + slot}>
                  <ItemPreview id={it.id} slot={it.slot} animal={animal} equipped={previewEq} seed={seed} gender={gender} />
                  {worn && <span className="worn-tag"><Icon name="check" size={14} />Takılı</span>}
                  {!worn && group.some((item) => isRecommended(item.id, gender)) && <span className="pick-tag"><Icon name="star" size={12} />Sana önerilen</span>}
                </div>
                <span className="item-name">{it.name}</span>
                {group.length > 1 && colorChoices(group, it.id, (item) => {
                  setVariants((previous) => ({ ...previous, [key]: item.id }))
                  tryItem(item)
                })}
                {itemActions(it)}
              </article>
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
