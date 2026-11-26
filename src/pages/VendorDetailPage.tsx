import { Link, NavLink, Outlet, useOutletContext, useParams } from 'react-router-dom'
import * as api from '../api/mockApi'
import { useAuth } from '../auth/AuthContext'
import RiskBadge from '../components/RiskBadge'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessage'
import { useAsync } from '../hooks/useAsync'
import type { Vendor } from '../types'

export default function VendorDetailPage() {
  const { id = '' } = useParams()
  const { session } = useAuth()
  const token = session?.token ?? null
  const { data, error, loading, reload } = useAsync(() => api.getVendor(token, id), [token, id])

  if (loading) return <LoadingState label="Loading vendor…" />
  if (error) {
    return (
      <>
        <ErrorState message={error.message} onRetry={(error as api.ApiError).status === 404 ? undefined : reload} />
        <p><Link to="/vendors">Back to vendors</Link></p>
      </>
    )
  }
  if (!data) return null

  return (
    <>
      <p><Link to="/vendors">← All vendors</Link></p>
      <div className="page-head">
        <h1>{data.name}</h1>
        <RiskBadge score={data.riskScore} />
      </div>
      <nav className="tabs" aria-label="Vendor sections">
        <NavLink to="." end>Overview</NavLink>
        <NavLink to="assessments">Assessments</NavLink>
      </nav>
      <Outlet context={data satisfies Vendor} />
    </>
  )
}

export function Overview() {
  const v = useOutletContext<Vendor>()
  return (
    <dl className="facts">
      <div><dt>Category</dt><dd>{v.category}</dd></div>
      <div><dt>Status</dt><dd>{v.status}</dd></div>
      <div><dt>Country</dt><dd>{v.country}</dd></div>
      <div><dt>Relationship owner</dt><dd>{v.owner}</dd></div>
      <div><dt>Last assessed</dt><dd>{v.lastAssessed}</dd></div>
    </dl>
  )
}

export function Assessments() {
  const v = useOutletContext<Vendor>()
  if (v.assessments.length === 0) {
    return <EmptyState title="No assessments yet.">Start one once onboarding is complete.</EmptyState>
  }
  return (
    <ul className="assessments">
      {v.assessments.map((a) => (
        <li key={a.id}>
          <div>
            <strong>{a.title}</strong>
            <span className="cell-sub">{a.date}</span>
          </div>
          <RiskBadge score={a.score} />
          <span>{a.outcome}</span>
        </li>
      ))}
    </ul>
  )
}
