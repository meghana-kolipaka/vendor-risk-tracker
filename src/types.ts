export type VendorStatus = 'Onboarding' | 'Active' | 'Under review' | 'Offboarded'
export type RiskLevel = 'Low' | 'Medium' | 'High'

export interface Assessment {
  id: string
  title: string
  date: string // ISO date
  score: number // 0-100, higher = riskier
  outcome: 'Passed' | 'Follow-up needed' | 'Failed'
}

export interface Vendor {
  id: string
  name: string
  category: string
  country: string
  owner: string
  status: VendorStatus
  riskScore: number // 0-100, higher = riskier
  lastAssessed: string // ISO date
  assessments: Assessment[]
}

export interface NewVendorInput {
  name: string
  category: string
  country: string
  owner: string
}

export const CATEGORIES = ['Cloud hosting', 'Payments', 'Logistics', 'Marketing', 'Legal', 'HR & payroll', 'Security'] as const
export const STATUSES: VendorStatus[] = ['Onboarding', 'Active', 'Under review', 'Offboarded']
export const RISK_LEVELS: RiskLevel[] = ['Low', 'Medium', 'High']

export function riskLevel(score: number): RiskLevel {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}
