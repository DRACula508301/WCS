import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App smoke test', () => {
  it('renders the selection wizard container', () => {
    render(<App />)

    expect(screen.getByText('Interest Variable')).toBeInTheDocument()
  })
})
