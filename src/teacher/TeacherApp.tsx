import { useCallback, useEffect, useState } from 'react'
import { Avatar } from '../avatar/Avatar'
import { SPECIES, fx } from '../avatar/catalog'
import { api } from '../data/api'
import { resetDemo } from '../data/mock'
import { errText, type TAssignment, type TClass, type TStudent, type TSubmission } from '../data/types'
import { parseQuestions, questionsToText } from './questionText'

type Tab = 'odev' | 'sonuc' | 'ogrenci' | 'sinif'
// Öğretmenin verdiği hayvan arkadaş (öğrenci dükkandan başkasını da alabilir; görünüşünü kendi seçer).
const ANIMALS = SPECIES

export function TeacherApp() {
  const [inn, setIn] = useState<boolean | null>(null)
  useEffect(() => { api.teacherIsIn().then(setIn) }, [])
  if (inn === null) return <div className="center muted">Yükleniyor…</div>
  if (!inn) return <TeacherLogin onIn={() => setIn(true)} />
  return <Panel onOut={async () => { await api.teacherLogout(); setIn(false) }} />
}

function TeacherLogin({ onIn }: { onIn: () => void }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  return (
    <div className="page narrow t">
      <h1>👩‍🏫 Öğretmen girişi</h1>
      {api.mode === 'demo' && <p className="hint">Demo modu: veriler yalnız bu tarayıcıda. Şifresiz girebilirsin.</p>}
      <form onSubmit={async (e) => { e.preventDefault(); try { await api.teacherLogin(email, pw); onIn() } catch (x) { setErr(errText(x)) } }}>
        {api.mode === 'canli' && (
          <>
            <label>E-posta<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <label>Şifre<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required /></label>
          </>
        )}
        <button className="btn">Giriş</button>
        {err && <p className="err">{err}</p>}
      </form>
      <p><a href="#/">← Öğrenci sayfası</a></p>
    </div>
  )
}

function Panel({ onOut }: { onOut: () => void }) {
  const [tab, setTab] = useState<Tab>('odev')
  return (
    <div className="page wide t">
      <div className="topbar">
        <span className="logo small">🧭 Ödev Rotası · Öğretmen</span>
        <span>
          {api.mode === 'demo' && <span className="badge">DEMO</span>}
          <a href="#/" className="link">Öğrenci görünümü</a>
          <button className="link" onClick={onOut}>Çıkış</button>
        </span>
      </div>
      <div className="tabs">
        {([['odev', '📝 Ödevler'], ['sonuc', '📊 Sonuçlar'], ['ogrenci', '👧 Öğrenciler'], ['sinif', '🎯 Sınıf hedefi']] as [Tab, string][]).map(([k, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === 'odev' && <Assignments />}
      {tab === 'sonuc' && <Results />}
      {tab === 'ogrenci' && <Students />}
      {tab === 'sinif' && <ClassGoal />}
    </div>
  )
}

// ---------- Ödevler ----------
function toLocalInput(iso: string) {
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
function nextFriday15() {
  const d = new Date()
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7))
  d.setHours(15, 0, 0, 0)
  return d
}
function status(a: TAssignment) {
  const n = Date.now()
  if (n < Date.parse(a.opens_at)) return '⏳ Bekliyor'
  if (n >= Date.parse(a.closes_at)) return '🔒 Kapandı'
  return '🟢 Açık'
}

function Assignments() {
  const [list, setList] = useState<TAssignment[]>([])
  const [edit, setEdit] = useState<(Partial<TAssignment> & { text: string }) | null>(null)
  const load = useCallback(() => { api.tAssignments().then(setList) }, [])
  useEffect(load, [load])

  function newOne(grade: 3 | 4) {
    const o = nextFriday15()
    const c = new Date(o); c.setDate(c.getDate() + 3); c.setHours(9, 0, 0, 0)
    const sat = new Date(o); sat.setDate(sat.getDate() + 1)
    const sun = new Date(o); sun.setDate(sun.getDate() + 2)
    const m = (d: Date) => d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
    const title = `${sat.getDate()}-${m(sun)} Tekrar Ödevi`
    setEdit({ grade, title, opens_at: o.toISOString(), closes_at: c.toISOString(), text: '' })
  }

  if (edit) return <AssignmentForm init={edit} onDone={() => { setEdit(null); load() }} />
  return (
    <section>
      <div className="row">
        <button className="btn" onClick={() => newOne(3)}>+ 3. sınıf ödevi</button>
        <button className="btn" onClick={() => newOne(4)}>+ 4. sınıf ödevi</button>
      </div>
      <table className="tbl">
        <thead><tr><th>Sınıf</th><th>Başlık</th><th>Açılış</th><th>Kapanış</th><th>Soru</th><th>Durum</th><th /></tr></thead>
        <tbody>
          {list.map((a) => (
            <tr key={a.id}>
              <td>{a.grade}</td><td>{a.title}</td>
              <td>{new Date(a.opens_at).toLocaleString('tr-TR')}</td>
              <td>{new Date(a.closes_at).toLocaleString('tr-TR')}</td>
              <td>{a.questions.length}</td><td>{status(a)}</td>
              <td className="nowrap">
                <button className="link" onClick={() => setEdit({ ...a, text: questionsToText(a.questions) })}>Düzenle</button>
                <button className="link danger" onClick={async () => { if (confirm('Bu ödev ve sonuçları silinsin mi?')) { await api.tDeleteAssignment(a.id); load() } }}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function AssignmentForm({ init, onDone }: { init: Partial<TAssignment> & { text: string }; onDone: () => void }) {
  const [f, setF] = useState(init)
  const [err, setErr] = useState('')
  const parsed = parseQuestions(f.text)
  async function save() {
    if (parsed.errors.length || !parsed.questions.length) { setErr('Soruları düzelt.'); return }
    try {
      await api.tSaveAssignment({
        id: f.id, grade: f.grade as 3 | 4, title: f.title!, opens_at: f.opens_at!, closes_at: f.closes_at!, questions: parsed.questions,
      })
      onDone()
    } catch (e) { setErr(errText(e)) }
  }
  return (
    <section className="form">
      <h2>{f.id ? 'Ödevi düzenle' : 'Yeni ödev'} · {f.grade}. sınıf</h2>
      <label>Başlık<input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
      <div className="row">
        <label>Açılış<input type="datetime-local" value={toLocalInput(f.opens_at!)} onChange={(e) => setF({ ...f, opens_at: new Date(e.target.value).toISOString() })} /></label>
        <label>Kapanış<input type="datetime-local" value={toLocalInput(f.closes_at!)} onChange={(e) => setF({ ...f, closes_at: new Date(e.target.value).toISOString() })} /></label>
      </div>
      <div className="two">
        <label>Sorular
          <textarea rows={18} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })}
            placeholder={'345 + 128 kaçtır?\n- 463\n* 473\n- 483\n! Birlerden 5+8=13, 3 yaz 1 elde.\n\nMıknatıs tahtayı çeker.\n- Doğru\n* Yanlış'} />
          <span className="hint">Sorular arasında boş satır. Doğru şıkkın başına *, diğerlerine -, açıklamaya ! koy.</span>
        </label>
        <div>
          <p><b>Önizleme:</b> {parsed.questions.length} soru</p>
          {parsed.errors.map((e) => <p key={e} className="err">{e}</p>)}
          <ol className="preview">
            {parsed.questions.map((q) => (
              <li key={q.id}>{q.text}<ul>{q.options.map((o, k) => <li key={k} className={k === q.answer ? 'right' : ''}>{o}</li>)}</ul></li>
            ))}
          </ol>
        </div>
      </div>
      {err && <p className="err">{err}</p>}
      <div className="row">
        <button className="btn" onClick={save}>Kaydet</button>
        <button className="btn ghost" onClick={onDone}>Vazgeç</button>
      </div>
    </section>
  )
}

// ---------- Sonuçlar ----------
function Results() {
  const [list, setList] = useState<TAssignment[]>([])
  const [sel, setSel] = useState('')
  const [students, setStudents] = useState<TStudent[]>([])
  const [subs, setSubs] = useState<TSubmission[]>([])
  const [paper, setPaper] = useState<Record<string, string>>({})
  const [err, setErr] = useState('')
  useEffect(() => {
    api.tAssignments().then((l) => { setList(l); if (l[0]) setSel(l[0].id) })
    api.tStudents().then(setStudents)
  }, [])
  const loadSubs = useCallback(() => { if (sel) api.tSubmissions(sel).then(setSubs) }, [sel])
  useEffect(loadSubs, [loadSubs])
  const a = list.find((x) => x.id === sel)
  if (!list.length) return <p className="muted">Henüz ödev yok.</p>
  const rows = students.filter((s) => s.grade === a?.grade)
  const done = rows.filter((s) => subs.some((x) => x.student_id === s.id)).length

  // soru bazında doğru oranı (yalnız online)
  const online = subs.filter((s) => s.source === 'online')
  return (
    <section>
      <label>Ödev
        <select value={sel} onChange={(e) => setSel(e.target.value)}>
          {list.map((x) => <option key={x.id} value={x.id}>{x.grade}. sınıf · {x.title}</option>)}
        </select>
      </label>
      {a && (
        <>
          <p><b>{done} / {rows.length}</b> öğrenci yaptı.</p>
          <table className="tbl">
            <thead><tr><th>Öğrenci</th><th>Durum</th><th>Doğru</th><th>Yıldız</th><th /></tr></thead>
            <tbody>
              {rows.map((s) => {
                const sub = subs.find((x) => x.student_id === s.id)
                return (
                  <tr key={s.id}>
                    <td><span className="t-who"><Avatar animal={s.animal} seed={s.id} size={34} /> {s.display_name}</span></td>
                    <td>{sub ? (sub.source === 'kagit' ? '📄 Kâğıttan' : '📱 Online') : '— yapmadı'}</td>
                    <td>{sub ? `${sub.correct}/${sub.total}` : ''}</td>
                    <td>{sub ? `+${sub.stars_earned}` : ''}</td>
                    <td className="nowrap">
                      {!sub && (
                        <>
                          <input className="mini" type="number" min={0} max={a.questions.length} placeholder="doğru" value={paper[s.id] ?? ''} onChange={(e) => setPaper({ ...paper, [s.id]: e.target.value })} />
                          <button className="link" onClick={async () => {
                            setErr('')
                            try { await api.tAddPaper(a.id, s.id, Number(paper[s.id] || 0)); loadSubs() } catch (e) { setErr(errText(e)) }
                          }}>Kâğıttan ekle</button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {err && <p className="err">{err}</p>}
          {online.length > 0 && (
            <>
              <h3>Soru soru doğru oranı (online)</h3>
              <ol className="qstats">
                {a.questions.map((q) => {
                  const ok = online.filter((s) => s.answers[q.id] === q.answer).length
                  const pct = Math.round((ok / online.length) * 100)
                  return <li key={q.id} className={pct < 50 ? 'low' : ''}>{q.text} <b>%{pct}</b>{pct < 50 && ' ← tekrar et'}</li>
                })}
              </ol>
            </>
          )}
        </>
      )}
    </section>
  )
}

// ---------- Öğrenciler ----------
function Students() {
  const [list, setList] = useState<TStudent[]>([])
  const [show, setShow] = useState(false)
  const [n, setN] = useState({ display_name: '', animal: ANIMALS[0].id, grade: 3 as 3 | 4 })
  const load = useCallback(() => { api.tStudents().then(setList) }, [])
  useEffect(load, [load])
  return (
    <section>
      <p className="hint">Gerçek soyadı ve fotoğraf yazma. Ad ya da takma ad yeter.</p>
      <label className="check"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Şifreleri göster</label>
      <table className="tbl">
        <thead><tr><th>Öğrenci</th><th>Sınıf</th><th>Şifre</th><th>Yıldız</th><th /></tr></thead>
        <tbody>
          {list.map((s) => (
            <tr key={s.id}>
              <td><span className="t-who"><Avatar animal={s.animal} seed={s.id} size={34} /> {s.display_name}</span></td>
              <td>{s.grade}</td>
              <td className="mono">{s.pin === null ? <i className="muted">henüz yok</i> : show ? s.pin : '••••'}</td>
              <td>{s.stars}</td>
              <td className="nowrap">
                <button className="link" onClick={async () => { if (confirm(`${s.display_name} şifresi sıfırlansın mı? Bir sonraki girişte yenisini seçer.`)) { await api.tResetPin(s.id); load() } }}>Şifre sıfırla</button>
                <button className="link danger" onClick={async () => { if (confirm(`${s.display_name} ve bütün kayıtları silinsin mi?`)) { await api.tDeleteStudent(s.id); load() } }}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Öğrenci ekle</h3>
      <div className="row">
        <input placeholder="Ad" value={n.display_name} onChange={(e) => setN({ ...n, display_name: e.target.value })} />
        <select value={n.grade} onChange={(e) => setN({ ...n, grade: Number(e.target.value) as 3 | 4 })}><option value={3}>3. sınıf</option><option value={4}>4. sınıf</option></select>
        <select title="Hayvan arkadaşı" value={n.animal} onChange={(e) => setN({ ...n, animal: e.target.value })}>{ANIMALS.map((a) => <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>)}</select>
        <img src={fx(n.animal)} alt="" width={40} height={40} />
        <button className="btn" disabled={!n.display_name.trim()} onClick={async () => { await api.tAddStudent({ ...n, display_name: n.display_name.trim() }); setN({ ...n, display_name: '' }); load() }}>Ekle</button>
      </div>
    </section>
  )
}

// ---------- Sınıf hedefi ----------
function ClassGoal() {
  const [c, setC] = useState<TClass | null>(null)
  const [msg, setMsg] = useState('')
  useEffect(() => { api.tClass().then(setC) }, [])
  if (!c) return null
  return (
    <section className="form">
      <label>Hedef yıldız<input type="number" value={c.goal_target} onChange={(e) => setC({ ...c, goal_target: Number(e.target.value) })} /></label>
      <label>Ödül<input value={c.goal_reward} onChange={(e) => setC({ ...c, goal_reward: e.target.value })} /></label>
      <div className="row">
        <button className="btn" onClick={async () => { await api.tSaveClass({ goal_target: c.goal_target, goal_reward: c.goal_reward }); setMsg('Kaydedildi.') }}>Kaydet</button>
        {msg && <span className="muted">{msg}</span>}
      </div>
      {api.mode === 'demo' && (
        <p><button className="link danger" onClick={() => { if (confirm('Demo verisi sıfırlansın mı?')) { resetDemo(); location.reload() } }}>Demo verisini sıfırla</button></p>
      )}
    </section>
  )
}
