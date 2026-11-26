import { useEffect, useRef, useState } from 'react'
import { errText, type Equipped, type StudentHome } from '../data/types'
import { Avatar, pawColor, peekMetrics, speciesOf, type Look, type Mood } from '../avatar/Avatar'

type A = NonNullable<StudentHome['assignment']>

// Avatar kartın üst kenarından soruya bakar. Seçilen şıkkın doğru olup olmadığını BİLMEZ ve belli etmez:
// her seçimde aynı tepkiyi verir (o yöne bakar, başını sallar).
const PEEK = 136

export function Quiz({ assignment, onSubmit, onCancel, animal, equipped }: {
  assignment: A; onSubmit: (answers: Record<string, number>) => Promise<void>; onCancel: () => void
  animal: string; equipped: Equipped
}) {
  const qs = assignment.questions
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const q = qs[i]
  const last = i === qs.length - 1
  const blanks = qs.filter((x) => answers[x.id] === undefined).length
  const [look, setLook] = useState<Look>({ x: 0, y: 0.9 })
  const [mood, setMood] = useState<Mood>('idle')
  const [nod, setNod] = useState(0)
  const lastAct = useRef(Date.now())

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
    lastAct.current = Date.now()
    const n = q.options.length
    setLook(q.type === 'tf' ? { x: k === 0 ? -0.9 : 0.9, y: 0.9 } : { x: 0.25, y: 0.5 + (k / Math.max(1, n - 1)) * 0.5 })
    setNod((v) => v + 1)
  }
  const sp = speciesOf(animal, equipped)
  const pk = peekMetrics(sp, PEEK, !!equipped.hat)

  async function send() {
    if (blanks > 0) {
      setErr(`${blanks} soru boş kaldı. Önce onları cevapla.`)
      setI(qs.findIndex((x) => answers[x.id] === undefined))
      return
    }
    if (!confirm('Gönderince değiştiremezsin. Gönderelim mi?')) return
    setBusy(true); setErr(''); setMood('happy')
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

      <div className="peek-wrap" style={{ marginTop: pk.room }}>
        <div className={'peeker' + (busy ? ' hop' : '')} key={'p' + i} style={{ top: -pk.offset }}>
          <div className={'peek-nod' + (nod ? ' n' + (nod % 2) : '')}>
            <Avatar animal={animal} equipped={{ ...equipped, bg: undefined }} size={PEEK} frame={false} look={look} mood={busy ? 'happy' : mood} />
          </div>
        </div>
        <span className="paw l" style={{ background: pawColor(sp) }} />
        <span className="paw r" style={{ background: pawColor(sp) }} />
      <section className="card question" key={q.id}>
        <p className="q-text big">{q.text}</p>
        <div className={'options ' + (q.type === 'tf' ? 'tf' : '')}>
          {q.options.map((o, k) => (
            <button
              key={k}
              className={'option' + (answers[q.id] === k ? ' picked' : '')}
              onClick={() => pick(k)}
            >
              {q.type === 'mc' && <span className="opt-letter">{'ABCD'[k]}</span>}
              {q.type === 'tf' ? (k === 0 ? '👍 ' : '👎 ') + o : o}
            </button>
          ))}
        </div>
      </section>
      </div>

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
