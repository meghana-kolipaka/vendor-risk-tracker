import type { NewVendorInput, Vendor } from '../types'

/** A tiny fake backend: latency, auth, validation errors and failures, all in memory. */
export const apiConfig = { delay: 600, failNext: false }

export class ApiError extends Error {
  status: number
  fieldErrors?: Record<string, string>
  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

const seed = (): Vendor[] => {
  const a = (id: string, title: string, date: string, score: number) => ({
    id,
    title,
    date,
    score,
    outcome: (score >= 70 ? 'Failed' : score >= 40 ? 'Follow-up needed' : 'Passed') as Vendor['assessments'][number]['outcome'],
  })
  const v = (
    id: string, name: string, category: string, country: string, owner: string,
    status: Vendor['status'], riskScore: number, lastAssessed: string,
  ): Vendor => ({
    id, name, category, country, owner, status, riskScore, lastAssessed,
    assessments: [
      a(`${id}-a1`, 'Security questionnaire', lastAssessed, riskScore),
      a(`${id}-a2`, 'Financial health check', '2026-03-12', Math.max(5, riskScore - 18)),
    ],
  })
  return [
    v('v1', 'Northwind Cloud', 'Cloud hosting', 'Ireland', 'priya@acme.test', 'Active', 22, '2026-10-02'),
    v('v2', 'PayBridge', 'Payments', 'Singapore', 'rahul@acme.test', 'Under review', 74, '2026-11-04'),
    v('v3', 'Kestrel Logistics', 'Logistics', 'India', 'sana@acme.test', 'Active', 48, '2026-09-18'),
    v('v4', 'BrightLeaf Media', 'Marketing', 'United Kingdom', 'priya@acme.test', 'Active', 31, '2026-08-27'),
    v('v5', 'Lexora Legal', 'Legal', 'United States', 'dev@acme.test', 'Onboarding', 55, '2026-11-10'),
    v('v6', 'PeopleHub Payroll', 'HR & payroll', 'India', 'sana@acme.test', 'Active', 63, '2026-10-21'),
    v('v7', 'Sentinel Secure', 'Security', 'Germany', 'rahul@acme.test', 'Active', 14, '2026-10-30'),
    v('v8', 'Orbit Freight', 'Logistics', 'UAE', 'dev@acme.test', 'Under review', 82, '2026-11-12'),
    v('v9', 'CloudNimbus', 'Cloud hosting', 'United States', 'priya@acme.test', 'Offboarded', 58, '2026-05-09'),
    v('v10', 'Zenpay Gateway', 'Payments', 'India', 'rahul@acme.test', 'Active', 37, '2026-09-02'),
  ]
}

let vendors: Vendor[] = seed()
export const resetApi = () => {
  vendors = seed()
}

const wait = () => new Promise<void>((r) => setTimeout(r, apiConfig.delay))

async function guard(token: string | null) {
  await wait()
  if (apiConfig.failNext) {
    apiConfig.failNext = false
    throw new ApiError(500, 'The server had a problem. Try again in a moment.')
  }
  if (token !== 'demo-token') throw new ApiError(401, 'Your session has expired. Sign in again.')
}

export async function login(email: string, password: string): Promise<{ token: string; email: string }> {
  await wait()
  if (email.toLowerCase() !== 'analyst@certa.demo' || password !== 'password123') {
    throw new ApiError(401, 'Email or password is incorrect.', { password: 'Email or password is incorrect.' })
  }
  return { token: 'demo-token', email }
}

export async function getVendors(token: string | null): Promise<Vendor[]> {
  await guard(token)
  return vendors.map((v) => ({ ...v }))
}

export async function getVendor(token: string | null, id: string): Promise<Vendor> {
  await guard(token)
  const found = vendors.find((v) => v.id === id)
  if (!found) throw new ApiError(404, 'We couldn’t find that vendor.')
  return { ...found }
}

export async function addVendor(token: string | null, input: NewVendorInput): Promise<Vendor> {
  await guard(token)
  if (vendors.some((v) => v.name.toLowerCase() === input.name.trim().toLowerCase())) {
    throw new ApiError(409, 'A vendor with this name already exists.', {
      name: 'A vendor with this name already exists.',
    })
  }
  const vendor: Vendor = {
    id: `v${vendors.length + 1}`,
    name: input.name.trim(),
    category: input.category,
    country: input.country.trim(),
    owner: input.owner.trim(),
    status: 'Onboarding',
    riskScore: 50,
    lastAssessed: new Date().toISOString().slice(0, 10),
    assessments: [],
  }
  vendors = [vendor, ...vendors]
  return { ...vendor }
}
