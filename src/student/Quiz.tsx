import { useEffect, useRef, useState } from 'react'
import { errText, type Equipped, type StudentHome } from '../data/types'
import { Avatar, peekMetrics, skinColor, type Look, type Mood } from '../avatar/Avatar'
import { Icon } from '../ui/Icon'
import { Modal } from '../ui/Modal'

type A = NonNullable<StudentHome['assignment']>

// Avatar kartın üst kenarından soruya bakar. Seçilen şıkkın doğru olup olmadığını BİLMEZ ve belli etmez:
// her seçimde aynı tepkiyi verir (o yöne bakar, başını sallar).
const PEEK = 180

// Taslak: sayfa yenilenir ya da çocuk çıkarsa işaretlediği cevaplar telefonda kalır.
type Draft = { answers: Record<string, number>; i: number }
const draftKey = (studentId: string, assignmentId: string) => `odev-rotasi:taslak:${studentId}:${assignmentId}`
export function loadDraft(studentId: string, a: A): Draft | null {
  try {
    const raw = localStorage.getItem(draftKey(studentId, a.id))
    if (!raw) return null
    const d = JSON.parse(raw) as Draft
    // Öğretmen soruyu değiştirdiyse artık var olmayan soru/şık cevaplarını at.
    const answers: Record<string, number> = {}
    for (const q of a.questions) {
      const k = d.answers?.[q.id]
      if (Number.isInteger(k) && k >= 0 && k < q.options.length) answers[q.id] = k
    }
    if (!Object.keys(answers).length) return null
    return { answers, i: Math.min(Math.max(0, d.i | 0), a.questions.length - 1) }
  } catch { return null }
}
function saveDraft(studentId: string, assignmentId: string, d: Draft) {
  try { localStorage.setItem(draftKey(studentId, assignmentId), JSON.stringify(d)) } catch { /* boş */ }
}
export function clearDraft(studentId: string, assignmentId: string) {
  try { localStorage.removeItem(draftKey(studentId, assignmentId)) } catch { /* boş */ }
}

export function Quiz({ assignment, onSubmit, onCancel, animal, equipped, seed }: {
  assignment: A; onSubmit: (answers: Record<string, number>) => Promise<void>; onCancel: () => void
  animal: string; equipped: Equipped; seed: string
}) {
  const qs = assignment.questions
  const [draft] = useState(() => loadDraft(seed, assignment))
  const [i, setI] = useState(draft?.i ?? 0)
  const [answers, setAnswers] = useState<Record<string, number>>(draft?.answers ?? {})
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [ask, setAsk] = useState<'send' | null>(null)
  const q = qs[i]
  const last = i === qs.length - 1
  const blanks = qs.filter((x) => answers[x.id] === undefined).length
  const [look, setLook] = useState<Look>({ x: 0, y: 0.9 })
  const [mood, setMood] = useState<Mood>('idle')
  const [nod, setNod] = useState(0)
  const lastAct = useRef(Date.now())

  useEffect(() => {
    if (Object.keys(answers).length) saveDraft(seed, assignment.id, { answers, i })
  }, [answers, i, seed, assignment.id])

  // Yeni soruda: soruya bak.
  useEffect(() => { setLook({ x: 0, y: 0.9 }); setMood('idle'); lastAct.current = Date.now() }, [i])
  // Boşta kalınca ara sıra etrafa / çocuğa bakar.
  useEffect(() => {
    const t = setInterval(() => {
      if (Date.now() - lastAct.current < 3500) return
      const r = Math.random()
      setLook(r < 0.35 ? { x: 0, y: -0.5 } : r < 0.6 ? { x: -0.7, y: 0.6 } : r < 0.8 ? { x: 0.7, y: 0.6 } : { x: 0, y: 0.9 })
    }, 2200)
    return () => clearInterval(t)
  }, [])

  function pick(k: number) {
    setAnswers({ ...answers, [q.id]: k })
    setErr('')
    lastAct.current = Date.now()
    const n = q.options.length
    setLook(q.type === 'tf' ? { x: k === 0 ? -0.9 : 0.9, y: 0.9 } : { x: 0.25, y: 0.5 + (k / Math.max(1, n - 1)) * 0.5 })
    setNod((v) => v + 1)
  }
  const pk = peekMetrics(PEEK)
  const hand = skinColor(equipped, seed)

  function trySend() {
    if (blanks > 0) {
      setErr(`${blanks} ${blanks === 1 ? 'soru boş kaldı. Önce onu cevapla.' : 'soru boş kaldı. Önce onları cevapla.'}`)
      setI(qs.findIndex((x) => answers[x.id] === undefined))
      return
    }
    setAsk('send')
  }
  async function send() {
    setAsk(null); setBusy(true); setErr(''); setMood('happy')
    try { await onSubmit(answers); clearDraft(seed, assignment.id) } catch (e) { setErr(errText(e)); setBusy(false) }
  }

  return (
    <div className="page narrow q-page">
      <div className="q-hud">
        <button className="icon-btn" onClick={onCancel} aria-label="Çık"><Icon name="x" size={24} /></button>
        <div className="q-steps">
          {qs.map((x, k) => (
            <button key={x.id} className={(k === i ? 'cur ' : '') + (answers[x.id] !== undefined ? 'done' : '')} onClick={() => setI(k)} aria-label={`${k + 1}. soru`} />
          ))}
        </div>
      </div>
      <p className="q-count display pop">Soru {i + 1} / {qs.length}</p>

      <div className="peek-wrap" style={{ marginTop: pk.room + 26 }}>
        <div className={'peeker' + (busy ? ' hop' : '')} key={'p' + i} style={{ top: -pk.offset }}>
          <div className={'peek-nod' + (nod ? ' n' + (nod % 2) : '')}>
            <Avatar animal={animal} equipped={{ ...equipped, bg: undefined }} size={PEEK} seed={seed} frame={false} look={look} mood={busy ? 'happy' : mood} />
          </div>
        </div>
        <span className="paw l" style={{ background: hand }} />
        <span className="paw r" style={{ background: hand }} />
        <section className="panel question" key={q.id}>
          <p className="q-text big">{q.text}</p>
          <div className={'options ' + (q.type === 'tf' ? 'tf' : '')}>
            {q.options.map((o, k) => (
              <button key={k} className={'option' + (answers[q.id] === k ? ' picked' : '')} aria-pressed={answers[q.id] === k} onClick={() => pick(k)}>
                {q.type === 'mc'
                  ? <span className="opt-letter">{'ABCD'[k]}</span>
                  : <span className="tf-ic"><Icon name={k === 0 ? 'check' : 'x'} size={28} /></span>}
                <span>{o}</span>
                <span className="selection-dot" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      </div>

      {err && <p className="q-inline-error" role="status">{err}</p>}
      <div className="q-nav">
        <button className="btn ghost" disabled={i === 0} onClick={() => setI(i - 1)} aria-label="Geri"><Icon name="back" size={24} /></button>
        {last
          ? <button className="btn big" disabled={busy} onClick={trySend}>{busy ? 'Gönderiliyor…' : <><Icon name="flag" size={28} />Bitir</>}</button>
          : <button className="btn purple big" onClick={() => setI(i + 1)}>İleri<Icon name="next" size={26} /></button>}
      </div>

      {ask === 'send' && (
        <Modal ribbon="Son adım" title="Gönderelim mi?" onClose={() => setAsk(null)}>
          <p className="muted">Gönderince cevaplarını değiştiremezsin.</p>
          <div className="row">
            <button className="btn" onClick={send}><Icon name="flag" size={24} />Gönder!</button>
            <button className="btn ghost" onClick={() => setAsk(null)}>Bir bakayım</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
