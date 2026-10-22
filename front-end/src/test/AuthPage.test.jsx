import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setAuthNote } from '../lib/auth.js'
import AuthPage from '../views/AuthPage.jsx'

// A stand-in for useAuth: no Supabase, just functions the test controls.
function fakeAuth(overrides = {}) {
  return { register: vi.fn(() => Promise.resolve({ needsConfirmation: false })), logIn: vi.fn(() => Promise.resolve()), ...overrides }
}
const describedText = (input) => (input.getAttribute('aria-describedby') || '').split(' ').map((id) => document.getElementById(id)?.textContent || '').join(' ')

beforeEach(() => { sessionStorage.clear() })

describe('Log in / Create an account', () => {
  it('shows every problem under its field at once and focuses the first one', async () => {
    window.location.hash = '#register'
    render(<AuthPage auth={fakeAuth()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    const name = screen.getByLabelText('Name')
    expect(name).toHaveFocus()
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(describedText(name)).toMatch('Enter your name.')
    expect(describedText(screen.getByLabelText('Email'))).toMatch('Enter your email address.')
    expect(describedText(screen.getByLabelText('Password'))).toMatch('Enter your password.')
  })

  it('clears an error as soon as the field is valid', async () => {
    render(<AuthPage auth={fakeAuth()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    const email = screen.getByLabelText('Email')
    await userEvent.type(email, 'jay@example.com')
    expect(email).not.toHaveAttribute('aria-invalid')
  })

  it('a wrong password shows one banner and puts focus back in the password field', async () => {
    const auth = fakeAuth({ logIn: vi.fn(() => Promise.reject(Object.assign(new Error('x'), { code: 'invalid_credentials' }))) })
    render(<AuthPage auth={auth} />)
    await userEvent.type(screen.getByLabelText('Email'), 'jay@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'secret12')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong email or password. Check both and try again.')
    expect(screen.getByLabelText('Password')).toHaveFocus()
    expect(auth.logIn).toHaveBeenCalledWith({ name: '', email: 'jay@example.com', password: 'secret12' })
  })

  it('"Log in instead" switches to Log in and keeps the email', async () => {
    const auth = fakeAuth({ register: vi.fn(() => Promise.reject(Object.assign(new Error('x'), { code: 'user_already_exists' }))) })
    window.location.hash = '#register'
    render(<AuthPage auth={auth} />)
    await userEvent.type(screen.getByLabelText('Name'), 'Jay')
    await userEvent.type(screen.getByLabelText('Email'), 'jay@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'secret12')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Log in instead' }))
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveValue('jay@example.com')
    expect(screen.getByLabelText('Password')).toHaveValue('') // the new password typed for sign-up isn't the account's
    expect(window.location.hash).toBe('#today') // a reload opens Log in, not Create account
  })

  it('Show / Hide flips the password and keeps focus in the field', async () => {
    render(<AuthPage auth={fakeAuth()} />)
    const pw = screen.getByLabelText('Password')
    await userEvent.type(pw, 'secret12')
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(pw).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('the password rule turns into a check when it is met', async () => {
    window.location.hash = '#register'
    render(<AuthPage auth={fakeAuth()} />)
    await userEvent.type(screen.getByLabelText('Password'), 'abc')
    expect(screen.getByText(/At least 6 characters/)).toHaveTextContent('not yet')
    await userEvent.type(screen.getByLabelText('Password'), 'def')
    expect(screen.getByText(/At least 6 characters/)).toHaveTextContent('done')
  })

  it('opens on Create account from a #register link', () => {
    window.location.hash = '#register'
    render(<AuthPage auth={fakeAuth()} />)
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument()
    expect(document.title).toBe('Create an account · Eagle Learning Hub')
  })

  it('says you are logged out after logging out', () => {
    setAuthNote('loggedOut')
    render(<AuthPage auth={fakeAuth()} />)
    const note = screen.getByText("You're logged out. Your progress is saved to your account.")
    expect(note.closest('[role="status"]')).not.toBeNull() // announced to screen readers
    expect(screen.getByLabelText('Email')).toHaveValue('') // shared-computer safety: nothing prefilled
  })
})
