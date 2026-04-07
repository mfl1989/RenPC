import axios, { isAxiosError } from 'axios'

export const ADMIN_JWT_STORAGE_KEY = 'adminJwt'

function clearAuthAndRedirectToLogin(): void {
  localStorage.removeItem(ADMIN_JWT_STORAGE_KEY)
  if (window.location.pathname !== '/admin/login') {
    window.location.replace('/admin/login')
  }
}

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_JWT_STORAGE_KEY)
  if (!token) return config

  const headers = config.headers ?? {}
  ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  config.headers = headers
  return config
})

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error)) {
      const status = error.response?.status
      if (status === 401 || status === 403) {
        clearAuthAndRedirectToLogin()
      }
    }
    return Promise.reject(error)
  },
)

export default axios

