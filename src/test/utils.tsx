import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { AuthProvider } from '../auth/AuthContext'

export function renderApp(route = '/vendors', signedIn = true) {
  if (signedIn) sessionStorage.setItem('vrt.session', JSON.stringify({ token: 'demo-token', email: 'analyst@certa.demo' }))
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}
