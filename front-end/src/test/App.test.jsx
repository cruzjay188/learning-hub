import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import data from '../../public/hub-data.json'
import App from '../App.jsx'

// The app fetches hub-data.json; tests hand it the real file without a server.
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(data) })))
})

// Changes the URL hash like clicking a link does, and lets the app redraw.
async function go(hash) {
  await act(async () => {
    window.location.hash = hash
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
}

describe('the hub', () => {
  it("opens on Today with the date and today's next step", async () => {
    render(<App />)
    expect(await screen.findByRole('heading', { level: 1, name: 'Monday, October 19' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Do Part I: peer quiz, then FreeCodeCamp' })).toBeInTheDocument()
  })

  it('ticks a step on a lecture page and counts it', async () => {
    window.location.hash = '#lecture-ai-8'
    render(<App />)
    const steps = await screen.findByRole('list', { name: 'Steps' })
    const first = within(steps).getByRole('checkbox', { name: /^Step 1:/ })
    expect(first).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(first)
    expect(first).toHaveAttribute('aria-checked', 'true')
    // the ticker's digit columns (0–9) are text too; the readable number comes right before " of 10"
    expect(document.getElementById('steps-count')).toHaveTextContent(/1 of 10 done$/)
  })

  it('rates a lecture and remembers it after a reload', async () => {
    window.location.hash = '#lecture-ai-7'
    const { unmount } = render(<App />)
    await userEvent.click(await screen.findByRole('radio', { name: '3 of 5, Getting it' }))
    expect(screen.getByRole('radio', { name: '3 of 5, Getting it' })).toHaveAttribute('aria-checked', 'true')
    unmount()
    render(<App />)
    expect(await screen.findByRole('radio', { name: '3 of 5, Getting it' })).toHaveAttribute('aria-checked', 'true')
  })

  it('filters the Course page to this week', async () => {
    window.location.hash = '#course'
    render(<App />)
    await userEvent.click(await screen.findByRole('button', { name: 'This week' }))
    expect(screen.getByRole('button', { name: /^Week 3/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Week 4/ })).not.toBeInTheDocument()
  })

  it('moves between pages through the URL', async () => {
    render(<App />)
    await screen.findByRole('heading', { level: 1, name: 'Monday, October 19' })
    await go('#review')
    expect(screen.getByRole('heading', { level: 1, name: 'Review' })).toBeInTheDocument()
    await go('#work')
    expect(screen.getByRole('heading', { level: 1, name: 'Work' })).toBeInTheDocument()
  })

  it('shows an error with a Reload button when the data cannot load', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))))
    render(<App />)
    expect(await screen.findByRole('button', { name: 'Reload' })).toBeInTheDocument()
  })
})
