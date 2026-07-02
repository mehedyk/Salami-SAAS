import axios, { AxiosError } from 'axios'
import { sanitizeObject } from './sanitize'
import type {
  ApiResponse, User, SalamiPage, LedgerEntry,
  Subscription, SubscriptionTier,
} from '../types'

const api = axios.create({
  baseURL:         (import.meta.env.VITE_API_BASE_URL as string) ?? '/api',
  timeout:         15_000,
  withCredentials: false,
  headers: {
    'Content-Type':    'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// ─── Token management ────────────────────────────────────────────────────────
let _clerkToken: string | null = null

export function setAuthToken(token: string | null) {
  _clerkToken = token
}

api.interceptors.request.use((config) => {
  if (_clerkToken) config.headers.Authorization = `Bearer ${_clerkToken}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiResponse>) => {
    const message =
      err.response?.data?.message ??
      (err.code === 'ECONNABORTED' ? 'Request timed out.' : 'Network error. Try again.')
    return Promise.reject(new Error(message))
  }
)

// ─── Safe mutating helpers ───────────────────────────────────────────────────
async function post<T>(url: string, body: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
  const res = await api.post<ApiResponse<T>>(url, sanitizeObject(body))
  return res.data
}

async function patch<T>(url: string, body: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
  const res = await api.patch<ApiResponse<T>>(url, sanitizeObject(body))
  return res.data
}

async function get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
  const res = await api.get<ApiResponse<T>>(url, { params })
  return res.data
}

async function del<T>(url: string): Promise<ApiResponse<T>> {
  const res = await api.delete<ApiResponse<T>>(url)
  return res.data
}

async function postForm<T>(url: string, form: FormData): Promise<ApiResponse<T>> {
  const res = await api.post<ApiResponse<T>>(url, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

// ════════════════════════════════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════════════════════════════════
export const usersApi = {
  sync: (displayName?: string, avatarUrl?: string) =>
    post<User>('/users/sync', { display_name: displayName ?? '', avatar_url: avatarUrl ?? '' }),

  me: () =>
    get<User>('/users/me'),

  updateMe: (displayName: string, username: string) =>
    patch<User>('/users/me', { display_name: displayName, username }),

  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    return postForm<{ avatar_url: string }>('/users/me/avatar', form)
  },

  checkUsername: (username: string) =>
    get<{ username: string; available: boolean }>(`/users/check/${username}`),
}

// ════════════════════════════════════════════════════════════════════════
// PAGES
// ════════════════════════════════════════════════════════════════════════
export const pagesApi = {
  create: (data: {
    title: string; bio?: string; theme: string
    payment_methods?: Array<{ provider: string; number: string; account_name: string }>
  }) => post<SalamiPage>('/pages/', data as Record<string, unknown>),

  mine: () =>
    get<SalamiPage>('/pages/mine'),

  update: (pageId: string, data: Record<string, unknown>) =>
    patch<SalamiPage>(`/pages/${pageId}`, data),

  delete: (pageId: string) =>
    del<null>(`/pages/${pageId}`),

  publish: (pageId: string) =>
    post<null>(`/pages/${pageId}/publish`),

  unpublish: (pageId: string) =>
    post<null>(`/pages/${pageId}/unpublish`),

  uploadAvatar: (pageId: string, file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    return postForm<{ avatar_url: string }>(`/pages/${pageId}/avatar`, form)
  },

  uploadCover: (pageId: string, file: File) => {
    const form = new FormData()
    form.append('cover', file)
    return postForm<{ cover_url: string }>(`/pages/${pageId}/cover`, form)
  },

  getPublic: (username: string) =>
    get<SalamiPage>(`/pages/public/${username}`),
}

// ════════════════════════════════════════════════════════════════════════
// LEDGER
// ════════════════════════════════════════════════════════════════════════
export const ledgerApi = {
  list: (pageId: string, params?: { page?: number; per_page?: number; verified?: boolean }) =>
    get<{ items: LedgerEntry[]; total: number; page: number; pages: number }>(
      `/ledger/${pageId}`,
      params as Record<string, unknown>
    ),

  submit: (pageId: string, data: {
    sender_name: string; sender_note?: string
    amount: number; provider: string; transaction_id?: string
  }) => post<LedgerEntry>(`/ledger/${pageId}`, data as Record<string, unknown>),

  summary: (pageId: string) =>
    get<{ total_amount: number; total_entries: number; verified_count: number; pending_count: number }>(
      `/ledger/${pageId}/summary`
    ),

  verify: (entryId: string) =>
    patch<null>(`/ledger/entries/${entryId}/verify`),

  unverify: (entryId: string) =>
    patch<null>(`/ledger/entries/${entryId}/unverify`),

  uploadReceipt: (entryId: string, file: File) => {
    const form = new FormData()
    form.append('receipt', file)
    return postForm<{ receipt_url: string }>(`/ledger/entries/${entryId}/receipt`, form)
  },

  delete: (entryId: string) =>
    del<null>(`/ledger/entries/${entryId}`),
}

// ════════════════════════════════════════════════════════════════════════
// SUBSCRIPTIONS
// ════════════════════════════════════════════════════════════════════════
export const subscriptionsApi = {
  create: (data: {
    tier: string; payment_method: string; payment_number: string; transaction_id: string
  }) => post<Subscription>('/subscriptions/', data as Record<string, unknown>),

  mine: () =>
    get<Subscription[]>('/subscriptions/mine'),

  active: () =>
    get<{ tier: SubscriptionTier; is_premium: boolean; subscription: Subscription | null }>(
      '/subscriptions/mine/active'
    ),

  uploadScreenshot: (subId: string, file: File) => {
    const form = new FormData()
    form.append('screenshot', file)
    return postForm<{ screenshot_url: string }>(`/subscriptions/${subId}/screenshot`, form)
  },
}

// ════════════════════════════════════════════════════════════════════════
// ADMIN
// ════════════════════════════════════════════════════════════════════════
export const adminApi = {
  pendingSubs: (params?: { page?: number; per_page?: number }) =>
    get<{ items: Subscription[]; total: number }>('/admin/subscriptions', params as Record<string, unknown>),

  allSubs: (params?: { page?: number; per_page?: number }) =>
    get<{ items: Subscription[]; total: number }>('/admin/subscriptions/all', params as Record<string, unknown>),

  approve: (subId: string) =>
    post<null>(`/admin/subscriptions/${subId}/approve`),

  reject: (subId: string, note?: string) =>
    post<null>(`/admin/subscriptions/${subId}/reject`, { note: note ?? '' }),

  users: (params?: { page?: number; per_page?: number }) =>
    get<{ items: User[]; total: number }>('/admin/users', params as Record<string, unknown>),

  stats: () =>
    get<{ users: number; subscriptions: Record<string, number> }>('/admin/stats'),
}

export default api
