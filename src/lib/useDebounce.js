import { useEffect, useState } from 'react'

// Generic debounce hook
export function useDebounce(value, delay = 500) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}
