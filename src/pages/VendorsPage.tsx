import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as api from '../api/mockApi'
import { useAuth } from '../auth/AuthContext'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessage'
import VendorRow from '../components/VendorRow'
import { useAsync } from '../hooks/useAsync'
import { RISK_LEVELS, STATUSES, riskLevel, type Vendor } from '../types'

type Sort = 'risk-desc' | 'name' | 'recent'

export function filterVendors(vendors: Vendor[], q: string, risk: string, status: string, sort: Sort): Vendor[] {
  const needle = q.trim().toLowerCase()
  const out = vendors.filter(
    (v) =>
      (!needle || v.name.toLowerCase().includes(needle) || v.owner.toLowerCase().includes(needle)) &&
      (!risk || riskLevel(v.riskScore) === risk) &&
      (!status || v.status === status),
  )
  const sorters: Record<Sort, (a: Vendor, b: Vendor) => number> = {
    'risk-desc': (a, b) => b.riskScore - a.riskScore,
    name: (a, b) => a.name.localeCompare(b.name),
    recent: (a, b) => b.lastAssessed.localeCompare(a.lastAssessed),
  }
  return out.sort(sorters[sort])
}

export default function VendorsPage() {
  const { session } = useAuth()
  const token = session?.token ?? null
  const { data, error, loading, reload } = useAsync(() => api.getVendors(token), [token])

  // Filters live in the URL, so a filtered view can be bookmarked, shared and survives refresh.
  const [params, setParams] = useSearchParams()
  const risk = params.get('risk') ?? ''
  const status = params.get('status') ?? ''
  const sort = (params.get('sort') as Sort) || 'risk-desc'
  const [search, setSearch] = useState(params.get('q') ?? '')
  const deferredSearch = useDeferredValue(search)

  const setParam = useCallback(
    (key: string, value: string) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value) next.set(key, value)
          else next.delete(key)
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const visible = useMemo(
    () => (data ? filterVendors(data, deferredSearch, risk, status, sort) : []),
    [data, deferredSearch, risk, status, sort],
  )

  const clear = () => {
    setSearch('')
    setParams({}, { replace: true })
  }

  return (
    <>
      <div className="page-head">
        <h1>Vendors</h1>
        {data && <p className="muted" aria-live="polite">{visible.length} of {data.length} vendors</p>}
      </div>

      <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="field">
          <label htmlFor="q">Search by name or owner</label>
          <input
            id="q" type="search" value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setParam('q', e.target.value)
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="risk">Risk level</label>
          <select id="risk" value={risk} onChange={(e) => setParam('risk', e.target.value)}>
            <option value="">All</option>
            {RISK_LEVELS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setParam('status', e.target.value)}>
            <option value="">All</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="sort">Sort by</label>
          <select id="sort" value={sort} onChange={(e) => setParam('sort', e.target.value)}>
            <option value="risk-desc">Highest risk</option>
            <option value="name">Name</option>
            <option value="recent">Recently assessed</option>
          </select>
        </div>
      </form>

      {loading && <LoadingState label="Loading vendors…" />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {data && visible.length === 0 && (
        <EmptyState title="No vendors match these filters.">
          <button type="button" className="btn" onClick={clear}>Clear filters</button>
        </EmptyState>
      )}
      {data && visible.length > 0 && (
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Vendors and their risk</caption>
            <thead>
              <tr>
                <th scope="col">Vendor</th>
                <th scope="col">Risk</th>
                <th scope="col">Status</th>
                <th scope="col">Country</th>
                <th scope="col">Owner</th>
                <th scope="col">Last assessed</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((v) => <VendorRow key={v.id} vendor={v} />)}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
