import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { login as loginRequest } from '../services/api'

export interface AuthUser {
  id?: number
  shop_id?: number
  shop_name?: string
  email?: string
  role?: string
}

interface AuthContextValue {
  token: string | null
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function decodeUser(token: string): AuthUser {
  const payload = token.split('.')[1]
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as AuthUser
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'))
  const user = useMemo(() => {
    if (!token) return null
    try { return decodeUser(token) } catch { return null }
  }, [token])

  async function login(email: string, password: string) {
    const { data } = await loginRequest({ email, password })
    localStorage.setItem('access_token', data.access_token)
    setToken(data.access_token)
  }

  function logout() {
    localStorage.removeItem('access_token')
    setToken(null)
  }

  return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}