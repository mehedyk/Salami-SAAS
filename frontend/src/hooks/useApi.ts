import { useState, useCallback } from 'react'

interface ApiState<T> {
  data:    T | null
  loading: boolean
  error:   string | null
}

interface UseApiReturn<T> extends ApiState<T> {
  execute:  (...args: unknown[]) => Promise<T | null>
  setData:  React.Dispatch<React.SetStateAction<T | null>>
  reset:    () => void
}

export function useApi<T>(
  fn: (...args: unknown[]) => Promise<{ data?: T; success: boolean; message?: string }>
): UseApiReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null, loading: false, error: null,
  })

  const execute = useCallback(async (...args: unknown[]): Promise<T | null> => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await fn(...args)
      if (res.success && res.data !== undefined) {
        setState({ data: res.data, loading: false, error: null })
        return res.data
      }
      setState((s) => ({ ...s, loading: false, error: res.message ?? 'Something went wrong.' }))
      return null
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setState((s) => ({ ...s, loading: false, error: msg }))
      return null
    }
  }, [fn])

  const setData = useCallback((v: React.SetStateAction<T | null>) => {
    setState((s) => ({
      ...s,
      data: typeof v === 'function' ? (v as (prev: T | null) => T | null)(s.data) : v,
    }))
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return { ...state, execute, setData, reset }
}

// Simpler mutation hook (no stored data)
export function useMutation<TArgs extends unknown[] = unknown[]>(
  fn: (...args: TArgs) => Promise<{ success: boolean; message?: string }>
) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const mutate = useCallback(async (...args: TArgs): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fn(...args)
      setLoading(false)
      if (!res.success) setError(res.message ?? 'Something went wrong.')
      return res.success
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setError(msg)
      setLoading(false)
      return false
    }
  }, [fn])

  return { mutate, loading, error, clearError: () => setError(null) }
}
