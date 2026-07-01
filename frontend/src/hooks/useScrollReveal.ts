import { useEffect, useRef } from 'react'

interface Options {
  threshold?: number
  rootMargin?: string
  once?:      boolean   // default true — animate once then disconnect
}

/**
 * Returns a ref to attach to a container.
 * Any child with class "scroll-reveal" gets "scroll-reveal--visible"
 * added when it enters the viewport.
 */
export function useScrollReveal<T extends HTMLElement>(options: Options = {}) {
  const ref = useRef<T>(null)
  const { threshold = 0.1, rootMargin = '0px 0px -60px 0px', once = true } = options

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const targets = Array.from(container.querySelectorAll<HTMLElement>('.scroll-reveal'))
    if (!targets.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-reveal--visible')
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            entry.target.classList.remove('scroll-reveal--visible')
          }
        })
      },
      { threshold, rootMargin }
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return ref
}
