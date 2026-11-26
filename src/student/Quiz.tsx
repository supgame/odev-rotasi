import { useState } from 'react'
import { errText, type StudentHome } from '../data/types'

type A = NonNullable<StudentHome['assignment']>

export function Quiz({ assignment, onSubmit, onCancel }: {
  assignment: A; onSubmit: (answers: Record<string, number>) => Promise<void>; onCancel: () => void
}) {
  const qs = assignment.questions
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const q = qs[i]
  const last = i === qs.length - 1
  const blanks = qs.filter((x) => answers[x.id] === undefined).length

  async function send() {
    if (blanks > 0) {
      setErr(`${blanks} soru boş kaldı. Önce onları cevapla.`)
      setI(qs.findIndex((x) => answers[x.id] === undefined))
      return
    }
    if (!confirm('Gönderince değiştiremezsin. Gönderelim mi?')) return
    setBusy(true); setErr('')
    try { await onSubmit(answers) } catch (e) { setErr(errText(e)); setBusy(false) }
  }

  return (
    <div className="page narrow">
      <div className="topbar">
        <button className="link" onClick={onCancel}>← Çık</button>
        <span className="muted">{i + 1} / {qs.length}</span>
      </div>
      <div className="bar thin"><div style={{ width: ((i + 1) / qs.length) * 100 + '%' }} /></div>
      <div className="dots">
        {qs.map((x, k) => (
          <button key={x.id} className={(k === i ? 'cur ' : '') + (answers[x.id] !== undefined ? 'done' : '')} onClick={() => setI(k)} aria-label={`${k + 1}. soru`} />
        ))}
      </div>

      <section className="card question" key={q.id}>
        <p className="q-text big">{q.text}</p>
        <div className={'options ' + (q.type === 'tf' ? 'tf' : '')}>
          {q.options.map((o, k) => (
            <button
              key={k}
              className={'option' + (answers[q.id] === k ? ' picked' : '')}
              onClick={() => setAnswers({ ...answers, [q.id]: k })}
            >
              {q.type === 'mc' && <span className="opt-letter">{'ABCD'[k]}</span>}
              {q.type === 'tf' ? (k === 0 ? '👍 ' : '👎 ') + o : o}
            </button>
          ))}
        </div>
      </section>

      {err && <p className="err center-text">{err}</p>}
      <div className="row spread">
        <button className="btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}>← Geri</button>
        {last
          ? <button className="btn big" disabled={busy} onClick={send}>{busy ? 'Gönderiliyor…' : 'Bitir ve gönder ✨'}</button>
          : <button className="btn" onClick={() => setI(i + 1)}>İleri →</button>}
      </div>
    </div>
  )
}
