import { apiGet } from './client'
import type { PricingTier } from './types'

export async function listPricingTiers() {
  return apiGet<PricingTier[]>('/pricing')
}
