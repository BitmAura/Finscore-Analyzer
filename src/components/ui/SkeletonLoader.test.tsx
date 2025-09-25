import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SkeletonLoader from '@/components/ui/SkeletonLoader'

describe('SkeletonLoader', () => {
  it('renders with default props', () => {
    const { container } = render(<SkeletonLoader />)
    
    const skeleton = container.querySelector('.bg-gradient-to-r')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('bg-gradient-to-r', 'from-gray-200', 'rounded-lg')
  })

  it('applies custom dimensions', () => {
    const { container } = render(<SkeletonLoader width="200px" height="50px" />)
    
    const skeleton = container.querySelector('.bg-gradient-to-r')
    expect(skeleton).toHaveStyle({
      width: '200px',
      height: '50px'
    })
  })

  it('renders children when provided', () => {
    render(
      <SkeletonLoader>
        <span>Loading content</span>
      </SkeletonLoader>
    )
    
    expect(screen.getByText('Loading content')).toBeInTheDocument()
  })
})