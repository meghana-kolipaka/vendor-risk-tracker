import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { Vendor } from '../types'
import RiskBadge from './RiskBadge'

// memo: typing in the search box re-renders the page, but unchanged rows are skipped.
const VendorRow = memo(function VendorRow({ vendor }: { vendor: Vendor }) {
  return (
    <tr>
      <th scope="row">
        <Link to={`/vendors/${vendor.id}`}>{vendor.name}</Link>
        <span className="cell-sub">{vendor.category}</span>
      </th>
      <td><RiskBadge score={vendor.riskScore} /></td>
      <td>{vendor.status}</td>
      <td>{vendor.country}</td>
      <td className="cell-owner">{vendor.owner}</td>
      <td>{vendor.lastAssessed}</td>
    </tr>
  )
})

export default VendorRow
