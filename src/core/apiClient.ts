import axios from 'axios'
import { apiClientConfig } from './config'

const apiClient = axios.create(apiClientConfig)

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(
    error instanceof Error ? error : new Error('Request failed'),
  ),
)

export default apiClient
