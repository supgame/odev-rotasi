import { useCallback, useEffect, useState } from 'react'
import { api, CLASS_CODE } from '../data/api'
import { errText, type RosterStudent, type StudentHome, type SubmitResult } from '../data/types'
import { Avatar } from '../avatar/Avatar'
import { Quiz } from './Quiz'
import { Shop } from './Shop'
import { Confetti } from './Confetti'

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

  if (screen === 'pick') return <PickName onPick={(s) => { setChosen(s); setScreen('pin') }} />
  if (screen === 'pin' && chosen)
    return (
      <PinScreen
        student={chosen}
        onBack={() => setScreen('pick')}
        onDone={(t) => { setToken(t); setTok(t); setScreen('home') }}
      />
    )
  if (!home) return <div className="center muted">{err || 'Yükleniyor…'}</div>

  if (screen === 'quiz' && home.assignment)
    return (
      <Quiz
        assignment={home.assignment}
        animal={home.me.animal}
        equipped={home.me.equipped}
        onCancel={() => setScreen('home')}
        onSubmit={async (answers) => {
          const r = await api.submit(token!, home.assignment!.id, answers)
          setResult(r)
          setScreen('result')
          refresh()
        }}
      />
    )
  if (screen === 'result' && result && home.assignment)
    return <ResultScreen result={result} assignment={home.assignment} onHome={() => setScreen('home')} onShop={() => setScreen('shop')} />
  if (screen === 'shop')
    return <Shop home={home} token={token!} onBack={() => { refresh(); setScreen('home') }} onChange={refresh} />

  return (
    <HomeScreen
      home={home}
      onStart={() => setScreen('quiz')}
      onShowResult={() => { setResult(home.my_result); setScreen('result') }}
      onShop={() => setScreen('shop')}
      onLogout={logout}
    />
  )
}

function PickName({ onPick }: { onPick: (s: RosterStudent) => void }) {
  const [list, setList] = useState<RosterStudent[] | null>(null)
  const [cls, setCls] = useState('')
  const [err, setErr] = useState('')
  useEffect(() => {
    api.roster(CLASS_CODE).then((r) => { setList(r.students); setCls(r.className) }).catch((e) => setErr(errText(e)))
  }, [])
  if (err) return <div className="center err">{err}</div>
  if (!list) return <div className="center muted">Yükleniyor…</div>
  return (
    <div className="page">
      <header className="hero">
        <div className="logo">🧭 Ödev Rotası</div>
        <p>{cls} · Merhaba! Kendi adını bul ve dokun.</p>
      </header>
      {[3, 4].map((g) => (
        <section key={g}>
          <h2 className="grade-title">{g}. sınıf</h2>
          <div className="name-grid">
            {list.filter((s) => s.grade === g).map((s) => (
              <button key={s.id} className="name-card" onClick={() => onPick(s)}>
                <Avatar animal={s.animal} size={64} />
                <span>{s.display_name}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function PinScreen({ student, onBack, onDone }: { student: RosterStudent; onBack: () => void; onDone: (t: string) => void }) {
  const first = !student.has_pin
  const [pin, setPin] = useState('')
  const [firstPin, setFirstPin] = useState<string | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const title = first
    ? firstPin === null ? 'Kendine 4 rakamlı bir şifre seç' : 'Şifreni bir daha gir'
    : 'Şifreni gir'

  async function full(p: string) {
    if (first && firstPin === null) { setFirstPin(p); setPin(''); return }
    if (first && firstPin !== p) { setErr('İki şifre aynı değil. Baştan seç.'); setFirstPin(null); setPin(''); return }
    setBusy(true)
    try { onDone(await api.login(CLASS_CODE, student.id, p)) } catch (e) { setErr(errText(e)); setPin('') } finally { setBusy(false) }
  }
  function press(d: string) {
    if (busy) return
    setErr('')
    const p = (pin + d).slice(0, 4)
    setPin(p)
    if (p.length === 4) full(p)
  }

  return (
    <div className="page narrow">
      <button className="link" onClick={onBack}>← Ben değilim</button>
      <div className="pin-head">
        <Avatar animal={student.animal} size={110} bounce />
        <h2>{student.display_name}</h2>
        <p>{title}</p>
        <p className="hint pin-hint">
          {first ? (firstPin === null ? 'Bu şifreyi başka yerde kullanma. Unutursan öğretmenine sor.' : 'Aynı şifreyi tekrar yaz.') : 'Unuttuysan öğretmenine sor.'}
        </p>
      </div>
      <div className="pin-dots">{[0, 1, 2, 3].map((i) => <span key={i} className={i < pin.length ? 'on' : ''} />)}</div>
      <p className="err center-text pin-err">{err}</p>
      <div className="pinpad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) =>
          k === '' ? <span key={i} /> : (
            <button key={i} onClick={() => (k === '⌫' ? setPin(pin.slice(0, -1)) : press(k))}>{k}</button>
          ),
        )}
      </div>
    </div>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

function HomeScreen({ home, onStart, onShowResult, onShop, onLogout }: {
  home: StudentHome; onStart: () => void; onShowResult: () => void; onShop: () => void; onLogout: () => void
}) {
  const g = home.goal
  const pct = Math.min(100, Math.round((g.current / Math.max(1, g.target)) * 100))
  return (
    <div className="page">
      <div className="topbar">
        <span className="logo small">🧭 Ödev Rotası</span>
        <button className="link" onClick={onLogout}>Ben değilim</button>
      </div>

      <section className="me-card">
        <Avatar animal={home.me.animal} equipped={home.me.equipped} size={120} bounce />
        <div>
          <h1>Selam {home.me.display_name}!</h1>
          <div className="stars-pill">⭐ {home.me.stars} yıldız</div>
          <button className="btn ghost" onClick={onShop}>🛍️ Dükkana git</button>
        </div>
      </section>

      <section className="card task">
        {home.assignment ? (
          home.my_result ? (
            <>
              <h2>✅ {home.assignment.title}</h2>
              <p>Bitirdin! {home.my_result.total} sorudan {home.my_result.correct} doğru, +{home.my_result.stars_earned} ⭐</p>
              <button className="btn" onClick={onShowResult}>Cevaplarıma bak</button>
            </>
          ) : (
            <>
              <h2>📝 {home.assignment.title}</h2>
              <p>{home.assignment.questions.length} soru · Son gün: {fmtDate(home.assignment.closes_at)}</p>
              <button className="btn big" onClick={onStart}>Başla!</button>
            </>
          )
        ) : (
          <>
            <h2>😴 Şu an açık ödev yok</h2>
            <p>Cuma günü yeni ödev gelecek. O zamana kadar avatarını süsleyebilirsin.</p>
          </>
        )}
      </section>

      <section className="card">
        <h2>🎯 Sınıf hedefi</h2>
        <p>Hep birlikte {g.target} yıldız toplarsak: <b>{g.reward}</b></p>
        <div className="bar"><div style={{ width: pct + '%' }} /></div>
        <p className="muted">{g.current} / {g.target} yıldız</p>
      </section>

      <section className="card">
        <h2>👫 Sınıf arkadaşların</h2>
        <div className="mates">
          {home.classmates.map((m) => (
            <div key={m.id} className="mate">
              <Avatar animal={m.animal} equipped={m.equipped} size={64} />
              <span>{m.display_name}</span>
            </div>
          ))}
        </div>
      </section>

      {home.past.length > 0 && (
        <section className="card">
          <h2>📚 Geçmiş ödevlerim</h2>
          <ul className="past">
            {home.past.map((p, i) => (
              <li key={i}><span>{p.title}</span><span>{p.correct}/{p.total} · +{p.stars_earned} ⭐</span></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function ResultScreen({ result, assignment, onHome, onShop }: {
  result: SubmitResult; assignment: NonNullable<StudentHome['assignment']>; onHome: () => void; onShop: () => void
}) {
  const msg = result.correct === result.total ? 'Hepsi doğru, süpersin! 🏆' : result.correct >= result.total / 2 ? 'Çok iyi gidiyorsun! 💪' : 'Ödevi bitirdin, aferin! Yanlışlara birlikte bakalım. 🌱'
  return (
    <div className="page">
      <Confetti />
      <section className="card result-head">
        <div className="big-stars">+{result.stars_earned} ⭐</div>
        <h1>{msg}</h1>
        <p>{result.total} sorudan {result.correct} doğru</p>
        <div className="row">
          <button className="btn" onClick={onShop}>🛍️ Yıldızlarımı harca</button>
          <button className="btn ghost" onClick={onHome}>Ana sayfa</button>
        </div>
      </section>
      {result.items.length > 0 && assignment.questions.map((q, i) => {
        const it = result.items.find((x) => x.id === q.id)
        if (!it) return null
        return (
          <section key={q.id} className={'card review ' + (it.ok ? 'ok' : 'no')}>
            <p className="q-no">{i + 1}. soru {it.ok ? '✅' : '❌'}</p>
            <p className="q-text">{q.text}</p>
            {!it.ok && (
              <p>Senin cevabın: <s>{it.given === null ? 'boş' : q.options[it.given]}</s> · Doğrusu: <b>{q.options[it.answer]}</b></p>
            )}
            {it.explanation && <p className="explain">💡 {it.explanation}</p>}
          </section>
        )
      })}
    </div>
  )
}
