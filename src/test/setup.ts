import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
    canvas: 'canvas',
    h1: 'h1',
    p: 'p',
    a: 'a',
    nav: 'nav',
  },
  AnimatePresence: ({ children }: any) => children,
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useTransform: () => 0,
  useReducedMotion: () => true, // Always prefer reduced motion in tests
  useSpring: () => ({ set: vi.fn() }),
  useMotionValue: () => ({ set: vi.fn(), get: () => 0 }),
}))
