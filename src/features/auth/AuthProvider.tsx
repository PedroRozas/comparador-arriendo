import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { supabase } from '../../lib/supabase'
import { AuthContext, type AuthContextValue } from './AuthContext'

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    void supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session)
        setIsLoading(false)
      }
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(`No se pudo cerrar la sesión: ${error.message}`)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ session, isLoading, signOut }),
    [session, isLoading, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
