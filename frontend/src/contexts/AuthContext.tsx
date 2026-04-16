import axios, { isAxiosError } from 'axios'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ADMIN_JWT_STORAGE_KEY } from '../lib/axios'
import { AuthContext } from './auth-context'

interface ApiEnvelope<T> {
  code: number
  message: string
  data: T | null
}

interface AdminLoginResponseDTO {
  token: string
}

type AuthProviderProps = {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(ADMIN_JWT_STORAGE_KEY),
  )

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_JWT_STORAGE_KEY)
    setToken(null)
    navigate('/admin/login', { replace: true })
  }, [navigate])

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        const { data } = await axios.post<ApiEnvelope<AdminLoginResponseDTO>>(
          '/api/admin/login',
          { username, password },
        )

        if (data.code !== 200 || !data.data?.token) {
          throw new Error(data.message || 'ログインに失敗しました')
        }

        localStorage.setItem(ADMIN_JWT_STORAGE_KEY, data.data.token)
        setToken(data.data.token)
      } catch (e) {
        if (isAxiosError(e)) {
          const status = e.response?.status
          if (status === 401 || status === 403) {
            throw new Error('メールアドレスまたはパスワードが間違っています')
          }
          const body = e.response?.data
          if (body && typeof body === 'object' && 'message' in body) {
            const message = (body as { message?: unknown }).message
            if (typeof message === 'string' && message.trim() !== '') {
              throw new Error(message)
            }
          }
          if (e.code === 'ERR_NETWORK') {
            throw new Error('サーバーに接続できませんでした')
          }
        }
        if (e instanceof Error) throw e
        throw new Error('ログインに失敗しました')
      }
    },
    [],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: !!token,
      login,
      logout,
    }),
    [token, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

