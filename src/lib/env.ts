export type EnvKey = 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'

const ENV_KEYS: readonly EnvKey[] = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']

const readEnvVar = (key: EnvKey): string => import.meta.env[key] ?? ''

export const missingEnvKeys: readonly EnvKey[] = ENV_KEYS.filter(
  (key) => readEnvVar(key).trim() === '',
)

export const env = {
  supabaseUrl: readEnvVar('VITE_SUPABASE_URL'),
  supabaseAnonKey: readEnvVar('VITE_SUPABASE_ANON_KEY'),
}
