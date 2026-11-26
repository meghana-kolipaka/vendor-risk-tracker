import { describe, expect, it } from 'vitest'
import { riskLevel } from './types'
import { filterVendors } from './pages/VendorsPage'
import { validateVendor } from './pages/NewVendorPage'
import { validateLogin } from './pages/LoginPage'
import { getVendors } from './api/mockApi'

describe('riskLevel', () => {
  it('uses 40 and 70 as the thresholds', () => {
    expect(riskLevel(39)).toBe('Low')
    expect(riskLevel(40)).toBe('Medium')
    expect(riskLevel(69)).toBe('Medium')
    expect(riskLevel(70)).toBe('High')
  })
})

describe('filterVendors', () => {
  it('filters by risk level and sorts by highest risk first', async () => {
    const all = await getVendors('demo-token')
    const high = filterVendors(all, '', 'High', '', 'risk-desc')
    expect(high.map((v) => v.name)).toEqual(['Orbit Freight', 'PayBridge'])
  })
  it('searches name and owner, ignoring case and spaces', async () => {
    const all = await getVendors('demo-token')
    expect(filterVendors(all, '  KESTREL ', '', '', 'name')).toHaveLength(1)
    expect(filterVendors(all, 'priya@', '', '', 'name')).toHaveLength(3)
  })
})

describe('validation', () => {
  it('flags every empty vendor field', () => {
    expect(Object.keys(validateVendor({ name: '', category: '', country: '', owner: 'nope' }))).toEqual([
      'name', 'category', 'country', 'owner',
    ])
  })
  it('accepts a valid vendor', () => {
    expect(validateVendor({ name: 'Acme', category: 'Legal', country: 'India', owner: 'a@b.co' })).toEqual({})
  })
  it('rejects short passwords before calling the server', () => {
    expect(validateLogin('a@b.co', 'short').password).toBeDefined()
  })
})
