import axios, { type AxiosError } from 'axios'
import { apiClientConfig } from './config'
import router from '../router'

/**
 * Check if an API response indicates success.
 * Auth endpoints return code === 200, data endpoints return code === 1.
 */
export function isApiSuccess(response: { code: number }): boolean {
  return response.code === 1 || response.code === 200
}

const apiClient = axios.create(apiClientConfig)

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Cookie is HttpOnly; backend will clear it via /user/logout.
      void router.push({ name: '/auth' })
    }
    return Promise.reject(
      error instanceof Error ? error : new Error('Request failed'),
    )
  },
)

export default apiClient
