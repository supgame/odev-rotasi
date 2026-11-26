import { mockApi } from './mock'
import { makeSupabaseApi } from './supabaseApi'
import type { Api } from './types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const CLASS_CODE = (import.meta.env.VITE_CLASS_CODE as string | undefined) ?? 'DOGANLI'

export const api: Api = url && key ? makeSupabaseApi(url, key, CLASS_CODE) : mockApi
