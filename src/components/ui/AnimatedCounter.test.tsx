import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

// Mock framer-motion for this test to always return true for useReducedMotion
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  useReducedMotion: () => true, // Always return true for instant animation
}))

describe('AnimatedCounter', () => {
  it('renders with correct value', async () => {
    render(<AnimatedCounter value={100} />)
    
    // With reduced motion enabled, should show final value immediately
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument()
    })
  })

  it('renders with prefix and suffix', async () => {
    const { container } = render(<AnimatedCounter value={50} prefix="$" suffix="%" />)
    
    // With reduced motion enabled, should show final value with prefix/suffix immediately
    await waitFor(() => {
      expect(container.textContent).toContain('$50%')
    })
  })

  it('applies custom className', () => {
    const { container } = render(
      <AnimatedCounter value={25} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })
})