import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Layout() {
  const { session, signOut } = useAuth()
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="topbar">
        <div className="topbar-inner">
          <span className="brand">Vendor Risk Tracker</span>
          <nav aria-label="Main">
            <NavLink to="/vendors" end>Vendors</NavLink>
            <NavLink to="/vendors/new">Add vendor</NavLink>
          </nav>
          <div className="topbar-user">
            <span>{session?.email}</span>
            <button type="button" className="btn btn-quiet" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </header>
      <main id="main" className="page" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  )
}
