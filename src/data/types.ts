export type Slot = 'skin' | 'hair' | 'hcolor' | 'hat' | 'glasses' | 'clothes' | 'ccolor' | 'face' | 'pet' | 'bg'
export type Equipped = Partial<Record<Slot, string>>

export interface Question {
  id: string
  type: 'mc' | 'tf'
  text: string
  options: string[]
  answer?: number // yalnız öğretmen tarafında
  explanation?: string
}

export interface RosterStudent {
  id: string
  display_name: string
  animal: string
  grade: 3 | 4
  has_pin: boolean
}

export interface ResultItem {
  id: string
  given: number | null
  answer: number
  ok: boolean
  explanation?: string
}

export interface SubmitResult {
  correct: number
  total: number
  stars_earned: number
  items: ResultItem[]
}

export interface StudentHome {
  me: { id: string; display_name: string; animal: string; grade: 3 | 4; stars: number; equipped: Equipped }
  owned: string[]
  assignment: null | { id: string; title: string; closes_at: string; questions: Question[] }
  my_result: SubmitResult | null
  past: { title: string; correct: number; total: number; stars_earned: number; created_at: string }[]
  classmates: { id: string; display_name: string; animal: string; equipped: Equipped }[]
  goal: { target: number; reward: string; current: number }
}

export interface ShopItem {
  id: string
  slot: Slot
  name: string
  price: number
}

// Öğretmen
export interface TStudent {
  id: string
  display_name: string
  animal: string
  grade: 3 | 4
  pin: string | null
  stars: number
}
export interface TAssignment {
  id: string
  grade: 3 | 4
  title: string
  opens_at: string
  closes_at: string
  questions: Question[]
}
export interface TSubmission {
  student_id: string
  correct: number
  total: number
  stars_earned: number
  source: 'online' | 'kagit'
  answers: Record<string, number>
  created_at: string
}
export interface TClass {
  name: string
  code: string
  goal_target: number
  goal_reward: string
}

export interface Api {
  mode: 'demo' | 'canli'
  roster(classCode: string): Promise<{ className: string; students: RosterStudent[] }>
  login(classCode: string, studentId: string, pin: string): Promise<string>
  home(token: string): Promise<StudentHome>
  submit(token: string, assignmentId: string, answers: Record<string, number>): Promise<SubmitResult>
  buy(token: string, itemId: string): Promise<void>
  equip(token: string, slot: Slot, itemId: string | null): Promise<void>
  shop(): Promise<ShopItem[]>

  teacherLogin(email: string, password: string): Promise<void>
  teacherLogout(): Promise<void>
  teacherIsIn(): Promise<boolean>
  tClass(): Promise<TClass>
  tSaveClass(c: Partial<TClass>): Promise<void>
  tStudents(): Promise<TStudent[]>
  tAddStudent(s: { display_name: string; animal: string; grade: 3 | 4 }): Promise<void>
  tDeleteStudent(id: string): Promise<void>
  tResetPin(id: string): Promise<void>
  tAssignments(): Promise<TAssignment[]>
  tSaveAssignment(a: Omit<TAssignment, 'id'> & { id?: string }): Promise<void>
  tDeleteAssignment(id: string): Promise<void>
  tSubmissions(assignmentId: string): Promise<TSubmission[]>
  tAddPaper(assignmentId: string, studentId: string, correct: number): Promise<void>
}

export const ERR: Record<string, string> = {
  PIN_HATALI: 'Şifre yanlış, bir daha dene.',
  KILITLI: 'Çok deneme yapıldı. 10 dakika sonra tekrar dene ya da öğretmenine sor.',
  OTURUM_YOK: 'Tekrar giriş yapman gerekiyor.',
  YETERSIZ_YILDIZ: 'Yıldızın yetmiyor. Biraz daha ödev çöz!',
  ZATEN_GONDERILDI: 'Bu ödevi zaten gönderdin.',
  SET_KAPALI: 'Bu ödevin süresi bitti.',
}

export function errText(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e)
  for (const k of Object.keys(ERR)) if (m.includes(k)) return ERR[k]
  return 'Bir sorun çıktı: ' + m
}
