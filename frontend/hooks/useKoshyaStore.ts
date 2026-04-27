'use client'

import { useState, useEffect, useCallback } from 'react'

export interface AuditFormData {
  monthly_salary: number
  total_monthly_spend: number
  grocery_spend: number
  rent: number
  commute_type: 'metro' | 'cab' | 'own_vehicle' | 'wfh'
  cab_spend: number
  metro_spend: number
  purchasing_habit: 'generic' | 'branded' | 'mix'
  gendered_products: 'yes' | 'no' | 'mixed'
  gendered_product_spend: number
  generic_equivalent_spend: number
  late_night_transit_frequency: 'never' | '1-5' | '5-15' | '15+'
}

export interface InflationResult {
  govt_avg_pct: number
  personal_inflation_pct: number
  delta_pp: number
  contributions: { food_pp: number; housing_pp: number; fuel_pp: number }
  bucket_metrics: {
    food_penalty_rupees: number
    housing_penalty_rupees: number
    fuel_penalty_rupees: number
    fuel_days_worked: number
  }
  rates: { food: number; housing: number; fuel: number }
}

export interface ShadowTaxResult {
  safety_tax: { delta_rupees: number; budget_impact_pct: number }
  pink_tax: { delta_rupees: number; budget_impact_pct: number }
  total_hidden_cost_pct: number
}

export interface Insight {
  title: string
  body: string
  recovery_rupees: number
}

export interface KoshyaStore {
  audit: AuditFormData
  inflationResult: InflationResult | null
  shadowTax: ShadowTaxResult | null
  insights: Insight[]
  hasSubmittedAudit: boolean
}

const DEFAULT_AUDIT: AuditFormData = {
  monthly_salary: 75000,
  total_monthly_spend: 55000,
  grocery_spend: 9000,
  rent: 18000,
  commute_type: 'cab',
  cab_spend: 4500,
  metro_spend: 800,
  purchasing_habit: 'mix',
  gendered_products: 'mixed',
  gendered_product_spend: 1200,
  generic_equivalent_spend: 400,
  late_night_transit_frequency: '1-5',
}

const STORAGE_KEY = 'koshya_store_v1'

function loadFromStorage(): KoshyaStore {
  if (typeof window === 'undefined') {
    return {
      audit: DEFAULT_AUDIT,
      inflationResult: null,
      shadowTax: null,
      insights: [],
      hasSubmittedAudit: false,
    }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...parsed, audit: { ...DEFAULT_AUDIT, ...parsed.audit } }
    }
  } catch (_) {}
  return {
    audit: DEFAULT_AUDIT,
    inflationResult: null,
    shadowTax: null,
    insights: [],
    hasSubmittedAudit: false,
  }
}

export function useKoshyaStore() {
  const [store, setStore] = useState<KoshyaStore>(loadFromStorage)

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    } catch (_) {}
  }, [store])

  const setAudit = useCallback((audit: AuditFormData) =>
    setStore(s => ({ ...s, audit })), [])

  const setInflationResult = useCallback((inflationResult: InflationResult | null) =>
    setStore(s => ({ ...s, inflationResult })), [])

  const setShadowTax = useCallback((shadowTax: ShadowTaxResult | null) =>
    setStore(s => ({ ...s, shadowTax })), [])

  const setInsights = useCallback((insights: Insight[]) =>
    setStore(s => ({ ...s, insights })), [])

  const setHasSubmittedAudit = useCallback((hasSubmittedAudit: boolean) =>
    setStore(s => ({ ...s, hasSubmittedAudit })), [])

  return {
    ...store,
    setAudit,
    setInflationResult,
    setShadowTax,
    setInsights,
    setHasSubmittedAudit,
  }
}
