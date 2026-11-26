import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { apiConfig } from './api/mockApi'
import { renderApp } from './test/utils'

describe('protected routes', () => {
  it('sends signed-out visitors to the login page', async () => {
    renderApp('/vendors', false)
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('returns to the page they wanted after signing in', async () => {
    const user = userEvent.setup()
    renderApp('/vendors?risk=High', false)
    await user.type(await screen.findByLabelText('Work email'), 'analyst@certa.demo')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('heading', { name: 'Vendors' })).toBeInTheDocument()
    expect(screen.getByLabelText('Risk level')).toHaveValue('High')
  })
})

describe('login form', () => {
  it('shows client-side errors without calling the server', async () => {
    const user = userEvent.setup()
    renderApp('/login', false)
    await user.click(await screen.findByRole('button', { name: 'Sign in' }))
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByLabelText('Work email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows the server’s error next to the password field', async () => {
    const user = userEvent.setup()
    renderApp('/login', false)
    await user.type(await screen.findByLabelText('Work email'), 'analyst@certa.demo')
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Email or password is incorrect.')).toBeInTheDocument()
  })
})

describe('vendor list', () => {
  it('loads vendors, then filters them by risk from the URL', async () => {
    renderApp('/vendors?risk=High')
    expect(screen.getByRole('status')).toHaveTextContent('Loading vendors')
    const table = await screen.findByRole('table')
    expect(within(table).getByText('PayBridge')).toBeInTheDocument()
    expect(within(table).queryByText('Sentinel Secure')).not.toBeInTheDocument()
    expect(screen.getByText('2 of 10 vendors')).toBeInTheDocument()
  })

  it('narrows results as you type and offers a way out of an empty result', async () => {
    const user = userEvent.setup()
    renderApp('/vendors')
    await screen.findByRole('table')
    await user.type(screen.getByLabelText('Search by name or owner'), 'zzz')
    expect(await screen.findByText('No vendors match these filters.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(await screen.findByRole('table')).toBeInTheDocument()
  })

  it('shows an error and recovers when you retry', async () => {
    const user = userEvent.setup()
    apiConfig.failNext = true
    renderApp('/vendors')
    expect(await screen.findByRole('alert')).toHaveTextContent('The server had a problem')
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('table')).toBeInTheDocument()
  })
})

describe('vendor detail', () => {
  it('opens a vendor and switches between nested tabs', async () => {
    const user = userEvent.setup()
    renderApp('/vendors/v2')
    expect(await screen.findByRole('heading', { name: 'PayBridge' })).toBeInTheDocument()
    expect(screen.getByText('Singapore')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Assessments' }))
    expect(await screen.findByText('Security questionnaire')).toBeInTheDocument()
  })

  it('explains when a vendor does not exist', async () => {
    renderApp('/vendors/nope')
    expect(await screen.findByRole('alert')).toHaveTextContent('couldn’t find that vendor')
  })
})

describe('add vendor form', () => {
  it('moves focus to the first invalid field', async () => {
    const user = userEvent.setup()
    renderApp('/vendors/new')
    await user.click(await screen.findByRole('button', { name: 'Add vendor' }))
    await waitFor(() => expect(screen.getByLabelText('Vendor name')).toHaveFocus())
    expect(screen.getByLabelText('Vendor name')).toHaveAccessibleDescription(/at least 2 characters/)
  })

  it('shows the server’s duplicate-name error on the name field', async () => {
    const user = userEvent.setup()
    renderApp('/vendors/new')
    await user.type(await screen.findByLabelText('Vendor name'), 'paybridge')
    await user.selectOptions(screen.getByLabelText('Category'), 'Payments')
    await user.type(screen.getByLabelText('Country'), 'India')
    await user.type(screen.getByLabelText('Relationship owner email'), 'me@acme.test')
    await user.click(screen.getByRole('button', { name: 'Add vendor' }))
    expect(await screen.findByText('A vendor with this name already exists.')).toBeInTheDocument()
  })

  it('creates a vendor and lands on its page', async () => {
    const user = userEvent.setup()
    renderApp('/vendors/new')
    await user.type(await screen.findByLabelText('Vendor name'), 'Helio Analytics')
    await user.selectOptions(screen.getByLabelText('Category'), 'Security')
    await user.type(screen.getByLabelText('Country'), 'India')
    await user.type(screen.getByLabelText('Relationship owner email'), 'me@acme.test')
    await user.click(screen.getByRole('button', { name: 'Add vendor' }))
    expect(await screen.findByRole('heading', { name: 'Helio Analytics' })).toBeInTheDocument()
  })
})
