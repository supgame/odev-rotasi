import type { Question } from '../data/types'

/*
Öğretmenin hızlı soru yazma biçimi. Sorular arasında boş satır.
  345 + 128 kaçtır?
  - 463
  * 473        ← doğru şık yıldızla
  - 483
  ! Birlerden 5+8=13...   ← açıklama (isteğe bağlı)

Şıklar yalnız "Doğru" ve "Yanlış" ise doğru/yanlış sorusu olur.
*/
export function parseQuestions(src: string): { questions: Question[]; errors: string[] } {
  const blocks = src.replace(/\r/g, '').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  const questions: Question[] = []
  const errors: string[] = []
  blocks.forEach((b, bi) => {
    const text: string[] = []
    const options: string[] = []
    let answer = -1
    let explanation = ''
    for (const raw of b.split('\n')) {
      const line = raw.trim()
      if (!line) continue
      if (line.startsWith('*')) { answer = options.length; options.push(line.slice(1).trim()) }
      else if (line.startsWith('-')) options.push(line.slice(1).trim())
      else if (line.startsWith('!')) explanation = line.slice(1).trim()
      else text.push(line)
    }
    const n = bi + 1
    if (!text.length) errors.push(`${n}. soruda soru metni yok.`)
    if (options.length < 2) errors.push(`${n}. soruda en az 2 şık olmalı.`)
    if (options.length > 4) errors.push(`${n}. soruda en çok 4 şık olabilir.`)
    if (answer < 0) errors.push(`${n}. soruda doğru şık (*) işaretlenmemiş.`)
    const low = options.map((o) => o.toLocaleLowerCase('tr'))
    const tf = options.length === 2 && low[0] === 'doğru' && low[1] === 'yanlış'
    questions.push({
      id: 'q' + n, type: tf ? 'tf' : 'mc', text: text.join(' '),
      options: tf ? ['Doğru', 'Yanlış'] : options, answer, explanation: explanation || undefined,
    })
  })
  return { questions, errors }
}

export function questionsToText(qs: Question[]): string {
  return qs.map((q) => [
    q.text,
    ...q.options.map((o, k) => (k === q.answer ? '* ' : '- ') + o),
    ...(q.explanation ? ['! ' + q.explanation] : []),
  ].join('\n')).join('\n\n')
}
