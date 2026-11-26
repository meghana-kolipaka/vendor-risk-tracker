import { Suspense, lazy } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import Layout from './components/Layout'
import { LoadingState } from './components/StateMessage'
import LoginPage from './pages/LoginPage'
import VendorsPage from './pages/VendorsPage'

// Route-level code splitting keeps the first load small.
const VendorDetailPage = lazy(() => import('./pages/VendorDetailPage'))
const Overview = lazy(() => import('./pages/VendorDetailPage').then((m) => ({ default: m.Overview })))
const Assessments = lazy(() => import('./pages/VendorDetailPage').then((m) => ({ default: m.Assessments })))
const NewVendorPage = lazy(() => import('./pages/NewVendorPage'))

export default function App() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/vendors" replace />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/vendors/new" element={<NewVendorPage />} />
            <Route path="/vendors/:id" element={<VendorDetailPage />}>
              <Route index element={<Overview />} />
              <Route path="assessments" element={<Assessments />} />
            </Route>
            <Route path="*" element={<p>Page not found. <Link to="/vendors">Go to vendors</Link></p>} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
