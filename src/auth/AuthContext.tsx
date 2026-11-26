import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import * as api from '../api/mockApi'

interface Session {
  token: string
  email: string
}

interface AuthValue {
  session: Session | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const KEY = 'vrt.session'
const AuthContext = createContext<AuthValue | null>(null)

// Browser storage can throw (private mode, blocked), so every access is guarded.
function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readSession)

  const signIn = useCallback(async (email: string, password: string) => {
    const next = await api.login(email, password)
    setSession(next)
    try {
      sessionStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* session still works in memory */
    }
  }, [])

  const signOut = useCallback(() => {
    setSession(null)
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      /* nothing to clear */
    }
  }, [])

  const value = useMemo(() => ({ session, signIn, signOut }), [session, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
