import { useCallback, useEffect, useRef, useState } from 'react'
import { api, CLASS_CODE } from '../data/api'
import { errText, type RosterStudent, type StudentHome, type SubmitResult } from '../data/types'
import { Avatar } from '../avatar/Avatar'
import { Icon, Logo, StarCount } from '../ui/Icon'
import { Quiz, loadDraft } from './Quiz'
import { Shop } from './Shop'
import { Confetti } from './Confetti'
import './student.css'

const TOKEN_KEY = 'odevrotasi_token'
const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } }
const setToken = (t: string | null) => {
  try { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY) } catch { /* boş */ }
}

type Screen = 'pick' | 'pin' | 'home' | 'quiz' | 'result' | 'shop'

export function StudentApp() {
  const [token, setTok] = useState<string | null>(getToken())
  const [screen, setScreen] = useState<Screen>(token ? 'home' : 'pick')
  const [chosen, setChosen] = useState<RosterStudent | null>(null)
  const [home, setHome] = useState<StudentHome | null>(null)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [fresh, setFresh] = useState(false) // sonuç ekranı az önce mi gönderildi (konfeti + sayaç)
  const [err, setErr] = useState('')

  const logout = useCallback(() => {
    setToken(null); setTok(null); setHome(null); setChosen(null); setScreen('pick')
  }, [])

  const refresh = useCallback(async () => {
    if (!token) return
    try {
      setHome(await api.home(token))
    } catch (e) {
      if (String(e).includes('OTURUM_YOK')) logout()
      else setErr(errText(e))
    }
  }, [token, logout])

  useEffect(() => { if (token) refresh() }, [token, refresh])
  useEffect(() => { window.scrollTo(0, 0) }, [screen])

  if (screen === 'pick') return <PickName onPick={(s) => { setChosen(s); setScreen('pin') }} />
  if (screen === 'pin' && chosen)
    return (
      <PinScreen
        student={chosen}
        onBack={() => setScreen('pick')}
        onDone={(t) => { setToken(t); setTok(t); setScreen('home') }}
      />
    )
  if (!home) return <Loading text={err} />

  if (screen === 'quiz' && home.assignment)
    return (
      <Quiz
        assignment={home.assignment}
        animal={home.me.animal}
        equipped={home.me.equipped}
        seed={home.me.id}
        onCancel={() => setScreen('home')}
        onSubmit={async (answers) => {
          const r = await api.submit(token!, home.assignment!.id, answers)
          setResult(r); setFresh(true)
          setScreen('result')
          refresh()
        }}
      />
    )
  if (screen === 'result' && result && home.assignment)
    return <ResultScreen result={result} fresh={fresh} home={home} onHome={() => setScreen('home')} onShop={() => setScreen('shop')} />
  if (screen === 'shop')
    return <Shop home={home} token={token!} onBack={() => { refresh(); setScreen('home') }} onChange={refresh} />

  return (
    <HomeScreen
      home={home}
      onStart={() => setScreen('quiz')}
      onShowResult={() => { setResult(home.my_result); setFresh(false); setScreen('result') }}
      onShop={() => setScreen('shop')}
      onLogout={logout}
    />
  )
}

function Loading({ text }: { text?: string }) {
  return <div className="center">{text ? <p className="panel err">{text}</p> : <span className="loading">Yükleniyor…</span>}</div>
}

/** 1-3 yıldız: hepsi doğru 3, yarısı ve fazlası 2, bitirdiysen 1. */
function rating(correct: number, total: number) {
  if (total > 0 && correct === total) return 3
  return total > 0 && correct / total >= 0.5 ? 2 : 1
}
function MiniStars({ n, size = 16 }: { n: number; size?: number }) {
  return <span className="mini-stars">{[0, 1, 2].map((i) => <Icon key={i} name="star" size={size} className={i < n ? '' : 'off'} />)}</span>
}

// ---------- 1) Oyuncu seç ----------
const CARD_COLORS = ['#a9e2ff', '#ffd1e6', '#c8f2b8', '#ffe7a3', '#d9ccff', '#ffd0bd']

function PickName({ onPick }: { onPick: (s: RosterStudent) => void }) {
  const [list, setList] = useState<RosterStudent[] | null>(null)
  const [cls, setCls] = useState('')
  const [err, setErr] = useState('')
  useEffect(() => {
    api.roster(CLASS_CODE).then((r) => { setList(r.students); setCls(r.className) }).catch((e) => setErr(errText(e)))
  }, [])
  if (err) return <Loading text={err} />
  if (!list) return <Loading />
  return (
    <div className="page">
      <header className="title-screen">
        <Logo />
        <div><span className="chip tag"><Icon name="flag" size={20} />{cls}</span></div>
        <h1 className="choose pop">Oyuncunu seç!</h1>
      </header>
      {[3, 4].map((g) => (
        <section key={g} className={'panel team g' + g}>
          <span className="ribbon">{g}. sınıf</span>
          <div className="name-grid">
            {list.filter((s) => s.grade === g).map((s, k) => (
              <button key={s.id} className="player-card" style={{ ['--pc' as string]: CARD_COLORS[(k + g) % CARD_COLORS.length] }} onClick={() => onPick(s)}>
                <span className="pc-stage"><Avatar animal={s.animal} equipped={s.equipped} seed={s.id} size={74} /></span>
                <span className="pc-name">{s.display_name}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

// ---------- 2) Şifre ----------
function PinScreen({ student, onBack, onDone }: { student: RosterStudent; onBack: () => void; onDone: (t: string) => void }) {
  const first = !student.has_pin
  const [pin, setPinState] = useState('')
  const pinRef = useRef('') // hızlı dokunuşlarda (aynı karede iki tuş) rakam kaybolmasın
  const setPin = (v: string) => { pinRef.current = v; setPinState(v) }
  const [firstPin, setFirstPin] = useState<string | null>(null)
  const [err, setErr] = useState('')
  const [shake, setShake] = useState(0)
  const [busy, setBusy] = useState(false)

  const title = first
    ? firstPin === null ? 'Kendine 4 rakamlı bir şifre seç' : 'Şifreni bir daha gir'
    : 'Şifreni gir'

  function fail(m: string) { setErr(m); setPin(''); setShake((n) => n + 1) }
  async function full(p: string) {
    if (first && firstPin === null) { setFirstPin(p); setPin(''); return }
    if (first && firstPin !== p) { setFirstPin(null); fail('İki şifre aynı değil. Baştan seç.'); return }
    setBusy(true)
    try { onDone(await api.login(CLASS_CODE, student.id, p)) } catch (e) { fail(errText(e)) } finally { setBusy(false) }
  }
  function press(d: string) {
    if (busy) return
    setErr('')
    if (pinRef.current.length >= 4) return
    const p = pinRef.current + d
    setPin(p)
    if (p.length === 4) window.setTimeout(() => full(p), 160) // son yıldız görünsün
  }
  // klavyeyle de girilebilsin (bilgisayardan açan olursa)
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key)
      else if (e.key === 'Backspace') setPin(pinRef.current.slice(0, -1))
    }
    addEventListener('keydown', f)
    return () => removeEventListener('keydown', f)
  })

  return (
    <div className="page narrow pin-page">
      <div className="hud">
        <button className="icon-btn" onClick={onBack} aria-label="Ben değilim"><Icon name="back" size={26} /></button>
        <span className="grow" />
      </div>
      <section className={'panel pin-panel' + (shake ? ' shake' : '')} key={shake}>
        <span className="ribbon gold" style={{ left: '50%', transform: 'translateX(-50%)' }}><Icon name="lock" size={22} />Giriş</span>
        <Avatar animal={student.animal} equipped={student.equipped} seed={student.id} size={82} pet={false} bounce />
        <h2>{student.display_name}</h2>
        <p className="say">{title}</p>
        <p className="hint pin-hint">
          {first ? (firstPin === null ? 'Bu şifreyi başka yerde kullanma. Unutursan öğretmenine sor.' : 'Aynı şifreyi tekrar yaz.') : 'Unuttuysan öğretmenine sor.'}
        </p>
        <div className="pin-slots">
          {[0, 1, 2, 3].map((i) => <span key={i} className={i < pin.length ? 'on' : ''}>{i < pin.length && <Icon name="star" size={34} />}</span>)}
        </div>
        <p className={'err pin-err' + (err ? ' has-error' : '')} aria-live="polite">{err}</p>
        <div className="pinpad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((k, i) =>
            k === '' ? <span key={i} /> : k === 'del' ? (
              <button key={i} className="del" onClick={() => setPin(pinRef.current.slice(0, -1))} aria-label="Sil"><Icon name="backspace" size={34} /></button>
            ) : (
              <button key={i} onClick={() => press(k)}>{k}</button>
            ),
          )}
        </div>
      </section>
    </div>
  )
}

// ---------- 3) Ana sayfa ----------
function left(iso: string) {
  const ms = Date.parse(iso) - Date.now()
  if (ms <= 0) return 'Süre bitti'
  const h = Math.floor(ms / 3600e3), d = Math.floor(h / 24)
  if (d >= 1) return `${d} gün ${h % 24} saat kaldı`
  if (h >= 1) return `${h} saat kaldı`
  return `${Math.max(1, Math.floor(ms / 60e3))} dakika kaldı`
}

function HomeScreen({ home, onStart, onShowResult, onShop, onLogout }: {
  home: StudentHome; onStart: () => void; onShowResult: () => void; onShop: () => void; onLogout: () => void
}) {
  const { me, assignment: a, my_result: r } = home
  const draft = a && !r ? loadDraft(me.id, a) : null
  const drafted = draft ? Object.keys(draft.answers).length : 0
  return (
    <div className="page student-home">
      <div className="hud">
        <span className="hud-me"><Avatar animal={me.animal} equipped={me.equipped} seed={me.id} size={40} pet={false} alive={false} /><b>{me.display_name}</b></span>
        <span className="grow" />
        <StarCount n={me.stars} />
        <button className="icon-btn pink" onClick={onShop} aria-label="Dükkan"><Icon name="bag" size={30} /></button>
      </div>

      <div className="student-columns">
        <div className="student-main">
          <section className={'panel quest' + (a && r ? ' done' : '')}>
            {a ? r ? (
              <>
                <span className="ribbon green"><Icon name="check" size={20} />Görev tamam</span>
                <h2>{a.title}</h2>
                <div className="done-row">
                  <MiniStars n={rating(r.correct, r.total)} size={30} />
                  <span>{r.total} sorudan <b>{r.correct}</b> doğru · <b>+{r.stars_earned}</b> yıldız</span>
                </div>
                <button className="btn blue wide" onClick={onShowResult}><Icon name="eye" size={26} />Cevaplarıma bak</button>
              </>
            ) : (
              <>
                <span className="ribbon gold"><Icon name="target" size={22} />Bu haftanın görevi</span>
                <h2>{a.title}</h2>
                <div className="chips">
                  <span className="chip"><Icon name="pencil" size={20} />{drafted ? `${drafted} / ${a.questions.length} cevaplı` : `${a.questions.length} soru`}</span>
                  <span className="chip"><Icon name="clock" size={20} />{left(a.closes_at)}</span>
                  <span className="chip"><Icon name="star" size={20} />+{10 + a.questions.length} yıldıza kadar</span>
                </div>
                {drafted
                  ? <button className="btn big pulse" onClick={onStart}><Icon name="play" size={30} />Kaldığın yerden devam</button>
                  : <button className="btn big pulse" onClick={onStart}><Icon name="play" size={30} />Başla!</button>}
              </>
            ) : (
              <>
                <span className="ribbon blue"><Icon name="clock" size={22} />Bu hafta</span>
                <h2>Şu an açık görev yok</h2>
                <p className="muted">Cuma günü yeni görev gelecek. O zamana kadar avatarını süsleyebilirsin.</p>
                <div className="row"><button className="btn purple" onClick={onShop}><Icon name="bag" size={26} />Dükkana git</button></div>
              </>
            )}
          </section>
          <div className="student-profile">
            <Avatar animal={me.animal} equipped={me.equipped} seed={me.id} size={240} pet interactive />
          </div>
        </div>

        <div className="student-side">
          <Route home={home} onShowResult={onShowResult} />

          {home.classmates.length > 0 && (
            <section className="panel">
              <span className="ribbon blue"><Icon name="users" size={24} />Takım arkadaşların</span>
              <div className="mates">
                {home.classmates.map((m) => (
                  <div key={m.id} className="mate">
                    <Avatar animal={m.animal} equipped={m.equipped} seed={m.id} size={62} />
                    <span>{m.display_name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <button className="btn ghost small leave" onClick={onLogout}><Icon name="door" size={22} />Ben {me.display_name} değilim</button>
    </div>
  )
}

// Rota: haftalar bir harita yolunda seviye düğümleri. Üstte kilitli gelecek hafta, sonra bu hafta, aşağı doğru geçmiş haftalar.
type Node =
  | { kind: 'locked' }
  | { kind: 'play' | 'done' | 'wait'; title: string; sub: string; stars?: number }
  | { kind: 'past'; title: string; sub: string; stars: number }
  | { kind: 'start' }
const XS = [50, 72, 30, 66, 34, 62, 40]
const ROW = 118

function Route({ home, onShowResult }: { home: StudentHome; onShowResult: () => void }) {
  const { assignment: a, my_result: r, goal: g } = home
  const pct = Math.min(100, Math.round((g.current / Math.max(1, g.target)) * 100))
  // canlıda "past" bu haftayı içermez, demoda içerir: bu haftayı bir kez göster
  const past = [...home.past].sort((x, y) => Date.parse(y.created_at) - Date.parse(x.created_at))
  if (a && r) { const k = past.findIndex((p) => p.title === a.title); if (k >= 0) past.splice(k, 1) }
  const nodes: Node[] = [
    { kind: 'locked' },
      a ? r ? { kind: 'done', title: 'Bu hafta', sub: `${r.correct}/${r.total} doğru`, stars: rating(r.correct, r.total) }
      : { kind: 'play', title: 'Bu hafta', sub: 'Görev hazır' }
      : { kind: 'wait', title: 'Bu hafta', sub: 'Cuma açılır' },
    ...past.slice(0, 5).map((p): Node => ({ kind: 'past', title: p.title, sub: `${p.correct}/${p.total} doğru · +${p.stars_earned}`, stars: rating(p.correct, p.total) })),
    { kind: 'start' },
  ]
  const done = past.length + (a && r ? 1 : 0)
  const pts = nodes.map((_, i) => ({ x: XS[i % XS.length], y: ROW / 2 + i * ROW }))
  const H = nodes.length * ROW
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], q = pts[i], my = (p.y + q.y) / 2
    d += ` C ${p.x} ${my}, ${q.x} ${my}, ${q.x} ${q.y}`
  }
  return (
    <section className="panel">
      <span className="ribbon green"><Icon name="map" size={24} />Rotam</span>
      <div className="route" style={{ height: H }}>
        <svg className="path" viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" aria-hidden>
          <path className="road" d={d} /><path className="road-in" d={d} /><path className="dash" d={d} />
        </svg>
        {nodes.map((n, i) => {
          const { x, y } = pts[i]
          const cur = n.kind === 'play' || n.kind === 'done' || n.kind === 'wait'
          const gap = cur ? 60 : 48
          const side = x > 52 ? { right: `calc(${100 - x}% + ${gap}px)` } : { left: `calc(${x}% + ${gap}px)` }
          const cls = 'node' + (n.kind === 'locked' ? ' locked' : '') + (n.kind === 'start' ? ' start' : '') + (cur ? ' current' : '') + (n.kind === 'play' ? ' go' : '') + (n.kind === 'wait' ? ' wait' : '') + (n.kind === 'done' ? ' done-now' : '')
          const click = n.kind === 'done' ? onShowResult : undefined
          const Tag = click ? 'button' : 'div'
          return (
            <div key={i}>
              <Tag className={cls} style={{ left: x + '%', top: y }} onClick={click} aria-label={'title' in n ? n.title : n.kind === 'start' ? 'Başlangıç' : 'Kilitli'}>
                {n.kind === 'locked' ? <Icon name="lock" size={34} />
                  : n.kind === 'start' ? <Icon name="flag" size={32} />
                  : cur ? <Avatar animal={home.me.animal} equipped={home.me.equipped} seed={home.me.id} size={56} pet={false} alive={false} />
                  : <Icon name="check" size={32} />}
                {'stars' in n && n.stars !== undefined && <MiniStars n={n.stars} size={14} />}
              </Tag>
              <span className={'node-label' + (cur ? ' cur' : '') + (n.kind === 'locked' || n.kind === 'start' ? ' dim' : '')} style={{ top: y, ...side }}>
                {n.kind === 'locked' ? <>Gelecek hafta<small>Kilitli</small></> : n.kind === 'start' ? <>Başlangıç<small>{done ? `${done} görev bitti` : 'Rota buradan başlar'}</small></> : <>{n.title}<small>{n.sub}</small></>}
              </span>
            </div>
          )
        })}
      </div>
      <div className={'route-chest' + (pct >= 100 ? ' full' : '')}>
        <Icon name={pct >= 100 ? 'chest-open' : 'chest'} size={42} className="chest-ic" />
        <div className="route-chest-copy">
          <b>{pct >= 100 ? 'Sınıf sandığı açıldı!' : 'Sınıf sandığı'}</b>
          <span className="reward"><strong>{g.reward}</strong></span>
          <div className="meter"><div style={{ width: pct + '%' }} /><span>{g.current} / {g.target}</span></div>
        </div>
      </div>
    </section>
  )
}

// ---------- 5) Sonuç ----------
function ResultScreen({ result, fresh, home, onHome, onShop }: {
  result: SubmitResult; fresh: boolean; home: StudentHome; onHome: () => void; onShop: () => void
}) {
  const assignment = home.assignment!
  const n = rating(result.correct, result.total)
  const msg = n === 3 ? 'Hepsi doğru, süpersin!' : n === 2 ? 'Çok iyi gidiyorsun!' : 'Görevi bitirdin, aferin!'
  const [shown, setShown] = useState(fresh ? 0 : result.stars_earned)
  const [shownAnswers, setShownAnswers] = useState(false)
  useEffect(() => {
    if (!fresh) return
    let v = 0
    const step = Math.max(1, Math.ceil(result.stars_earned / 20))
    let t: number | undefined
    const start = window.setTimeout(() => {
      t = window.setInterval(() => { v = Math.min(result.stars_earned, v + step); setShown(v); if (v >= result.stars_earned) window.clearInterval(t) }, 45)
    }, 1100)
    return () => { window.clearTimeout(start); window.clearInterval(t) }
  }, [fresh, result.stars_earned])
  return (
    <div className="page">
      {fresh && <Confetti n={24} />}
      <div className="hud">
        <button className="icon-btn" onClick={onHome} aria-label="Ana sayfa"><Icon name="home" size={30} /></button>
        <span className="grow" />
        {!fresh && <StarCount n={home.me.stars} />}
      </div>
      <section className="panel result">
        <span className="ribbon gold"><Icon name="trophy" size={28} />Görev tamam!</span>
        <div className="big-stars3">
          {[0, 1, 2].map((i) => <Icon key={i} name="star" size={i === 1 ? 65 : 48} className={i < n ? 'on' : 'off'} />)}
        </div>
        <h1 className="result-score"><b>{result.correct}</b> / {result.total} doğru</h1>
        <p className="result-cheer">{msg}</p>
        <Avatar animal={home.me.animal} equipped={home.me.equipped} seed={home.me.id} size={120} mood="happy" />
        <div className="earned"><StarCount n={shown} big plus /></div>
        <p className="muted">yıldız kazandın</p>
        <div className="row result-actions">
          {result.items.length > 0 && <button className="btn blue" onClick={() => { setShownAnswers(true); document.getElementById('answer-review')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}><Icon name="eye" size={24} />Cevaplarıma bak</button>}
          <button className="btn ghost" onClick={onHome}><Icon name="home" size={24} />Ana sayfa</button>
          <button className="shop-quiet" onClick={onShop}><Icon name="bag" size={22} />Dükkân</button>
        </div>
      </section>
      {result.items.length > 0 && (
        <section id="answer-review" className={'panel answer-review' + (shownAnswers ? ' answer-highlight' : '')}>
          <span className="ribbon blue"><Icon name="eye" size={24} />Cevapların</span>
          <div className="review-list">
            {assignment.questions.map((q, i) => {
              const it = result.items.find((x) => x.id === q.id)
              if (!it) return null
              return (
                <div key={q.id} className={'review ' + (it.ok ? 'ok' : 'no')}>
                  <span className="mark"><Icon name={it.ok ? 'check' : 'x'} size={20} /></span>
                  <div>
                    <p className="q-no">{i + 1}. soru · {it.ok ? 'doğru' : 'yanlış'}</p>
                    <p className="q-text">{q.text}</p>
                    {!it.ok && <p>Senin cevabın: <s>{it.given === null ? 'boş' : q.options[it.given]}</s></p>}
                    {!it.ok && <p>Doğru cevap <strong className="correct-answer">{q.options[it.answer]}</strong></p>}
                    {it.explanation && <p className="explain">{it.explanation}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
