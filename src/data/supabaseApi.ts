// Canlı mod: SOZLESME.md'deki RPC'ler ve öğretmen için RLS'li tablolar.
import { createClient } from '@supabase/supabase-js'
import type { Api, Gender, RosterStudent, ShopItem, StudentHome, SubmitResult, TAssignment, TClass, TStudent, TSubmission } from './types'

export function makeSupabaseApi(url: string, anonKey: string, classCode: string): Api {
  const sb = createClient(url, anonKey) // öğretmen (oturumlu)
  // Öğrenci istekleri hep anonim gider: aynı tarayıcıda öğretmen girişi varken de öğrenci RPC'leri (yalnız anon'a açık) çalışsın.
  const pub = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'odev-rotasi-ogrenci' } })

  async function rpc<T>(fn: string, args: Record<string, unknown>, client = sb): Promise<T> {
    const { data, error } = await client.rpc(fn, args)
    if (error) throw new Error(error.message)
    return data as T
  }
  const srpc = <T,>(fn: string, args: Record<string, unknown>) => rpc<T>(fn, args, pub)
  async function classId(): Promise<string> {
    const { data, error } = await sb.from('classes').select('id').eq('code', classCode).single()
    if (error) throw new Error(error.message)
    return data.id
  }
  function must<T>(r: { data: T | null; error: { message: string } | null }): T {
    if (r.error) throw new Error(r.error.message)
    return r.data as T
  }

  return {
    mode: 'canli',
    async roster(code) {
      const r = await srpc<{ class: { name: string }; students: RosterStudent[] }>('roster', { p_class_code: code })
      return { className: r.class.name, students: r.students }
    },
    async login(code, studentId, pin) {
      const r = await srpc<{ token: string }>('student_login', { p_class_code: code, p_student_id: studentId, p_pin: pin })
      return r.token
    },
    home: (token) => srpc<StudentHome>('student_home', { p_token: token }),
    submit: (token, assignmentId, answers) => srpc<SubmitResult>('submit_assignment', { p_token: token, p_assignment_id: assignmentId, p_answers: answers }),
    async buy(token, itemId) { await srpc('buy_item', { p_token: token, p_item_id: itemId }) },
    async equip(token, slot, itemId) { await srpc('equip_item', { p_token: token, p_slot: slot, p_item_id: itemId }) },
    async setGender(token, gender) { await srpc('set_my_gender', { p_token: token, p_gender: gender }) },
    async shop() { return must(await pub.from('shop_items').select('id,slot,name,price').order('price')) as ShopItem[] },

    async teacherLogin(email, password) {
      const { error } = await sb.auth.signInWithPassword({ email, password })
      if (error) throw new Error(error.message)
    },
    async teacherLogout() { await sb.auth.signOut() },
    async teacherIsIn() { return !!(await sb.auth.getSession()).data.session },
    async tClass() { return must(await sb.from('classes').select('name,code,goal_target,goal_reward').eq('code', classCode).single()) as TClass },
    async tSaveClass(c) { must(await sb.from('classes').update(c).eq('code', classCode)) },
    async tStudents() {
      const cid = await classId()
      const rows = must(await sb.from('students').select('id,display_name,animal,grade,pin,gender').eq('class_id', cid).order('grade').order('display_name')) as Omit<TStudent, 'stars'>[]
      const { data: bal } = await sb.rpc('teacher_star_balances', { p_class_id: cid })
      const map = new Map<string, number>((bal ?? []).map((b: { student_id: string; stars: number }) => [b.student_id, b.stars]))
      return rows.map((r) => ({ ...r, stars: map.get(r.id) ?? 0 }))
    },
    async tAddStudent(s) { must(await sb.from('students').insert({ ...s, class_id: await classId() })) },
    async tSetGender(id, gender: Gender | null) { must(await sb.from('students').update({ gender }).eq('id', id)) },
    async tDeleteStudent(id) { must(await sb.from('students').delete().eq('id', id)) },
    async tResetPin(id) { await rpc('teacher_reset_pin', { p_student_id: id }) },
    async tAssignments() {
      return must(await sb.from('assignments').select('id,grade,title,opens_at,closes_at,questions').eq('class_id', await classId()).order('opens_at', { ascending: false })) as TAssignment[]
    },
    async tSaveAssignment(a) {
      const row = { ...a, class_id: await classId() }
      if (a.id) must(await sb.from('assignments').update(row).eq('id', a.id))
      else must(await sb.from('assignments').insert(row))
    },
    async tDeleteAssignment(id) { must(await sb.from('assignments').delete().eq('id', id)) },
    async tSubmissions(assignmentId) {
      return must(await sb.from('submissions').select('student_id,correct,total,stars_earned,source,answers,created_at').eq('assignment_id', assignmentId)) as TSubmission[]
    },
    async tAddPaper(assignmentId, studentId, correct) { await rpc('teacher_add_paper', { p_assignment_id: assignmentId, p_student_id: studentId, p_correct: correct }) },
  }
}
