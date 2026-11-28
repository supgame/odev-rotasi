// Demo modu: Supabase bağlanana kadar her şey bu tarayıcının localStorage'ında.
// Kurallar SOZLESME.md ile aynı (puanlama, yıldız, kilit), böylece canlıya geçince davranış değişmez.
import { SHOP_ITEMS } from './shopItems'
import { RABBIT_CRADLE } from '../avatar/catalog'
import type { Api, Equipped, Question, StudentHome, SubmitResult, TAssignment, TClass, TStudent, TSubmission } from './types'

interface DB {
  cls: TClass
  students: (Omit<TStudent, 'stars'> & { stars_bonus: number; equipped: Equipped })[]
  assignments: TAssignment[]
  submissions: (TSubmission & { assignment_id: string })[]
  purchases: { student_id: string; item_id: string }[]
  sessions: Record<string, string>
  fails: Record<string, number[]>
  teacher: boolean
}

const KEY = 'odevrotasi_demo_v1'
const CATALOG = new Map(SHOP_ITEMS.map((item) => [item.id, item]))
const uid = () => Math.random().toString(36).slice(2, 10)

function seed(): DB {
  const now = Date.now()
  const opens = new Date(now - 3600e3).toISOString()
  const closes = new Date(now + 5 * 86400e3).toISOString()
  const s = (display_name: string, animal: string, grade: 3 | 4, equipped: Equipped = {}) => ({
    id: uid(), display_name, animal, grade, pin: null, stars_bonus: 0, equipped,
  })
  const q3: Question[] = [
    { id: 'q1', type: 'mc', text: '345 + 128 işleminin sonucu kaçtır?', options: ['463', '473', '483', '373'], answer: 1, explanation: 'Birler: 5+8=13, 3 yaz 1 elde. Onlar: 4+2+1=7. Yüzler: 3+1=4. Sonuç 473.' },
    { id: 'q2', type: 'tf', text: '500 sayısı 499 sayısından büyüktür.', options: ['Doğru', 'Yanlış'], answer: 0, explanation: '500, 499’dan 1 fazladır.' },
    { id: 'q3', type: 'mc', text: '“Kitap” kelimesinin eş anlamlısı hangisidir?', options: ['Defter', 'Betik', 'Kalem', 'Sayfa'], answer: 1, explanation: 'Kitap ile betik aynı anlamdadır.' },
    { id: 'q4', type: 'mc', text: 'Hangisi bir duyu organımızdır?', options: ['Kalp', 'Mide', 'Burun', 'Akciğer'], answer: 2, explanation: 'Burnumuzla koku alırız, burun bir duyu organıdır.' },
    { id: 'q5', type: 'tf', text: 'Trafik ışığında kırmızı yanınca karşıdan karşıya geçeriz.', options: ['Doğru', 'Yanlış'], answer: 1, explanation: 'Kırmızıda durur, yeşilde geçeriz.' },
  ]
  const q4: Question[] = [
    { id: 'q1', type: 'mc', text: '3 254 sayısında 2 rakamının basamak değeri kaçtır?', options: ['2', '20', '200', '2000'], answer: 2, explanation: '2 yüzler basamağında, değeri 200.' },
    { id: 'q2', type: 'tf', text: 'Mıknatıs tahta parçasını çeker.', options: ['Doğru', 'Yanlış'], answer: 1, explanation: 'Mıknatıs demir, nikel, kobalt gibi maddeleri çeker; tahtayı çekmez.' },
    { id: 'q3', type: 'mc', text: '“Gözden düşmek” deyiminin anlamı nedir?', options: ['Yere düşmek', 'Değerini kaybetmek', 'Gözü ağrımak', 'Uyumak'], answer: 1, explanation: 'Gözden düşmek: eski değerini, sevgisini yitirmek.' },
    { id: 'q4', type: 'mc', text: '48 ÷ 6 işleminin sonucu kaçtır?', options: ['6', '7', '8', '9'], answer: 2, explanation: '6 × 8 = 48.' },
    { id: 'q5', type: 'tf', text: 'Kültürel mirasımız geçmişten bugüne gelen değerlerimizdir.', options: ['Doğru', 'Yanlış'], answer: 0, explanation: 'Atasözleri, el sanatları, tarihi yapılar kültürel mirasımızdır.' },
  ]
  return {
    cls: { name: '3-4. Sınıf', code: 'DOGANLI', goal_target: 300, goal_reward: 'Pazartesi 15 dakika oyun!' },
    students: [
      s('Ali', '🦁', 3), s('Elif', '🐱', 3), s('Mert', '🐶', 3), s('Zeynep', '🦊', 3), s('Yusuf', '🐼', 3),
      s('Ayşe', '🐰', 4, RABBIT_CRADLE), s('Emir', '🐯', 4), s('Defne', '🐨', 4), s('Ömer', '🐸', 4), s('Nehir', '🐵', 4),
    ],
    assignments: [
      { id: uid(), grade: 3, title: 'Örnek: 28-29 Kasım Tekrar Ödevi', opens_at: opens, closes_at: closes, questions: q3 },
      { id: uid(), grade: 4, title: 'Örnek: 28-29 Kasım Tekrar Ödevi', opens_at: opens, closes_at: closes, questions: q4 },
    ],
    submissions: [],
    purchases: [],
    sessions: {},
    fails: {},
    teacher: false,
  }
}

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* boş */ }
  const db = seed()
  save(db)
  return db
}
function save(db: DB) {
  try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* boş */ }
}

const wait = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 120))

function stars(db: DB, sid: string) {
  const st = db.students.find((x) => x.id === sid)!
  const earned = db.submissions.filter((x) => x.student_id === sid).reduce((a, b) => a + b.stars_earned, 0)
  const spent = db.purchases.filter((p) => p.student_id === sid)
    .reduce((a, p) => a + (CATALOG.get(p.item_id)?.price ?? 0), 0)
  return earned + st.stars_bonus - spent
}

function bySession(db: DB, token: string) {
  const sid = db.sessions[token]
  const st = db.students.find((x) => x.id === sid)
  if (!st) throw new Error('OTURUM_YOK')
  return st
}

function grade(a: TAssignment, answers: Record<string, number>): SubmitResult {
  const items = a.questions.map((q) => {
    const given = answers[q.id] ?? null
    return { id: q.id, given, answer: q.answer!, ok: given === q.answer, explanation: q.explanation }
  })
  const correct = items.filter((i) => i.ok).length
  return { correct, total: items.length, stars_earned: 10 + correct, items }
}

function activeFor(db: DB, g: number) {
  const now = Date.now()
  return db.assignments
    .filter((a) => a.grade === g && Date.parse(a.opens_at) <= now && now < Date.parse(a.closes_at))
    .sort((a, b) => Date.parse(b.opens_at) - Date.parse(a.opens_at))[0]
}

export function resetDemo() {
  localStorage.removeItem(KEY)
}

export const mockApi: Api = {
  mode: 'demo',
  async roster() {
    const db = load()
    return wait({
      className: db.cls.name,
      students: db.students.map((s) => ({ id: s.id, display_name: s.display_name, animal: s.animal, grade: s.grade, equipped: s.equipped ?? {}, has_pin: !!s.pin })),
    })
  },
  async login(_code, studentId, pin) {
    const db = load()
    const st = db.students.find((s) => s.id === studentId)
    if (!st) throw new Error('OTURUM_YOK')
    const recent = (db.fails[st.id] ?? []).filter((t) => Date.now() - t < 600e3)
    if (recent.length >= 5) throw new Error('KILITLI')
    if (!/^\d{4}$/.test(pin)) throw new Error('PIN_HATALI')
    if (st.pin === null) st.pin = pin
    else if (st.pin !== pin) {
      db.fails[st.id] = [...recent, Date.now()]
      save(db)
      throw new Error('PIN_HATALI')
    }
    db.fails[st.id] = []
    const token = uid() + uid()
    db.sessions[token] = st.id
    save(db)
    return wait(token)
  },
  async home(token) {
    const db = load()
    const st = bySession(db, token)
    const a = activeFor(db, st.grade)
    const sub = a && db.submissions.find((x) => x.assignment_id === a.id && x.student_id === st.id)
    const home: StudentHome = {
      me: { id: st.id, display_name: st.display_name, animal: st.animal, grade: st.grade, stars: stars(db, st.id), equipped: st.equipped },
      owned: db.purchases.filter((p) => p.student_id === st.id).map((p) => p.item_id),
      assignment: a ? { id: a.id, title: a.title, closes_at: a.closes_at, questions: a.questions.map(({ answer: _a, explanation: _e, ...q }) => q) } : null,
      my_result: sub && a
        ? sub.source === 'kagit'
          ? { correct: sub.correct, total: sub.total, stars_earned: sub.stars_earned, items: [] }
          : grade(a, sub.answers)
        : null,
      past: db.submissions.filter((x) => x.student_id === st.id).map((x) => ({
        title: db.assignments.find((a2) => a2.id === x.assignment_id)?.title ?? '?',
        correct: x.correct, total: x.total, stars_earned: x.stars_earned, created_at: x.created_at,
      })),
      classmates: db.students.filter((s) => s.id !== st.id).map((s) => ({ id: s.id, display_name: s.display_name, animal: s.animal, equipped: s.equipped })),
      goal: {
        target: db.cls.goal_target,
        reward: db.cls.goal_reward,
        current: db.submissions.reduce((acc, x) => acc + x.stars_earned, 0) + db.students.reduce((acc, s) => acc + s.stars_bonus, 0),
      },
    }
    if (sub && home.my_result) home.my_result.stars_earned = sub.stars_earned
    return wait(home)
  },
  async submit(token, assignmentId, answers) {
    const db = load()
    const st = bySession(db, token)
    const a = db.assignments.find((x) => x.id === assignmentId)
    if (!a || a.grade !== st.grade) throw new Error('SET_KAPALI')
    const now = Date.now()
    if (now < Date.parse(a.opens_at) || now >= Date.parse(a.closes_at)) throw new Error('SET_KAPALI')
    if (db.submissions.some((x) => x.assignment_id === a.id && x.student_id === st.id)) throw new Error('ZATEN_GONDERILDI')
    const r = grade(a, answers)
    db.submissions.push({ assignment_id: a.id, student_id: st.id, answers, correct: r.correct, total: r.total, stars_earned: r.stars_earned, source: 'online', created_at: new Date().toISOString() })
    save(db)
    return wait(r)
  },
  async buy(token, itemId) {
    const db = load()
    const st = bySession(db, token)
    const item = CATALOG.get(itemId)
    if (!item) throw new Error('YOK')
    if (db.purchases.some((p) => p.student_id === st.id && p.item_id === itemId)) return wait(undefined)
    if (stars(db, st.id) < item.price) throw new Error('YETERSIZ_YILDIZ')
    db.purchases.push({ student_id: st.id, item_id: itemId })
    save(db)
    return wait(undefined)
  },
  async equip(token, slot, itemId) {
    const db = load()
    const st = bySession(db, token)
    if (!SHOP_ITEMS.some((item) => item.slot === slot)) throw new Error('YUVA_GECERSIZ')
    if (itemId) {
      const item = CATALOG.get(itemId)
      if (!item || item.slot !== slot || !db.purchases.some((p) => p.student_id === st.id && p.item_id === itemId)) {
        throw new Error('ESYA_TAKILAMAZ')
      }
      st.equipped = { ...st.equipped, [slot]: itemId }
    } else {
      const { [slot]: _removed, ...equipped } = st.equipped
      st.equipped = equipped
    }
    save(db)
    return wait(undefined)
  },
  async shop() {
    return wait(SHOP_ITEMS)
  },

  async teacherLogin() {
    const db = load(); db.teacher = true; save(db)
  },
  async teacherLogout() {
    const db = load(); db.teacher = false; save(db)
  },
  async teacherIsIn() {
    return load().teacher
  },
  async tClass() {
    return wait(load().cls)
  },
  async tSaveClass(c) {
    const db = load(); db.cls = { ...db.cls, ...c }; save(db)
  },
  async tStudents() {
    const db = load()
    return wait(db.students.map((s) => ({ id: s.id, display_name: s.display_name, animal: s.animal, grade: s.grade, pin: s.pin, stars: stars(db, s.id) })))
  },
  async tAddStudent(s) {
    const db = load(); db.students.push({ ...s, id: uid(), pin: null, stars_bonus: 0, equipped: {} }); save(db)
  },
  async tDeleteStudent(id) {
    const db = load()
    db.students = db.students.filter((s) => s.id !== id)
    db.submissions = db.submissions.filter((s) => s.student_id !== id)
    db.purchases = db.purchases.filter((p) => p.student_id !== id)
    save(db)
  },
  async tResetPin(id) {
    const db = load()
    const st = db.students.find((s) => s.id === id)
    if (st) { st.pin = null; db.fails[id] = [] }
    for (const [t, sid] of Object.entries(db.sessions)) if (sid === id) delete db.sessions[t]
    save(db)
  },
  async tAssignments() {
    return wait([...load().assignments].sort((a, b) => Date.parse(b.opens_at) - Date.parse(a.opens_at)))
  },
  async tSaveAssignment(a) {
    const db = load()
    if (a.id) db.assignments = db.assignments.map((x) => (x.id === a.id ? { ...(a as TAssignment) } : x))
    else db.assignments.push({ ...a, id: uid() })
    save(db)
  },
  async tDeleteAssignment(id) {
    const db = load()
    db.assignments = db.assignments.filter((a) => a.id !== id)
    db.submissions = db.submissions.filter((s) => s.assignment_id !== id)
    save(db)
  },
  async tSubmissions(assignmentId) {
    return wait(load().submissions.filter((s) => s.assignment_id === assignmentId))
  },
  async tAddPaper(assignmentId, studentId, correct) {
    const db = load()
    const a = db.assignments.find((x) => x.id === assignmentId)
    if (!a) return
    if (db.submissions.some((x) => x.assignment_id === assignmentId && x.student_id === studentId)) throw new Error('ZATEN_GONDERILDI')
    const c = Math.max(0, Math.min(correct, a.questions.length))
    db.submissions.push({ assignment_id: assignmentId, student_id: studentId, answers: {}, correct: c, total: a.questions.length, stars_earned: 10 + c, source: 'kagit', created_at: new Date().toISOString() })
    save(db)
  },
}
