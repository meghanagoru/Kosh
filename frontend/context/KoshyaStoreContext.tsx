'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

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

const DEFAULT_STORE: KoshyaStore = {
  audit: DEFAULT_AUDIT,
  inflationResult: null,
  shadowTax: null,
  insights: [],
  hasSubmittedAudit: false,
}

const CLIENT_ID_KEY = 'koshya_client_id'
const LEGACY_STORAGE_KEY = 'koshya_store_v1'
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const PERSIST_DEBOUNCE_MS = 420

function getOrCreateClientId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(CLIENT_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(CLIENT_ID_KEY, id)
  }
  return id
}

function mergeLegacyStore(parsed: Partial<KoshyaStore> & Record<string, unknown>): KoshyaStore {
  return {
    audit: { ...DEFAULT_AUDIT, ...(parsed.audit as Partial<AuditFormData>) },
    inflationResult: (parsed.inflationResult as InflationResult | null) ?? null,
    shadowTax: (parsed.shadowTax as ShadowTaxResult | null) ?? null,
    insights: Array.isArray(parsed.insights) ? (parsed.insights as Insight[]) : [],
    hasSubmittedAudit: Boolean(parsed.hasSubmittedAudit),
  }
}

export type KoshyaStoreContextValue = KoshyaStore & {
  setAudit: (audit: AuditFormData) => void
  setInflationResult: (inflationResult: InflationResult | null) => void
  setShadowTax: (shadowTax: ShadowTaxResult | null) => void
  setInsights: (insights: Insight[]) => void
  setHasSubmittedAudit: (hasSubmittedAudit: boolean) => void
  hydrated: boolean
}

const KoshyaStoreContext = createContext<KoshyaStoreContextValue | null>(null)

export function KoshyaStoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<KoshyaStore | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const setAudit = useCallback((audit: AuditFormData) => {
    setStore(s => (s ? { ...s, audit } : s))
  }, [])
  const setInflationResult = useCallback((inflationResult: InflationResult | null) => {
    setStore(s => (s ? { ...s, inflationResult } : s))
  }, [])
  const setShadowTax = useCallback((shadowTax: ShadowTaxResult | null) => {
    setStore(s => (s ? { ...s, shadowTax } : s))
  }, [])
  const setInsights = useCallback((insights: Insight[]) => {
    setStore(s => (s ? { ...s, insights } : s))
  }, [])
  const setHasSubmittedAudit = useCallback((hasSubmittedAudit: boolean) => {
    setStore(s => (s ? { ...s, hasSubmittedAudit } : s))
  }, [])

  // Initial load + optional localStorage migration
  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const clientId = getOrCreateClientId()
      if (!clientId) {
        setStore(DEFAULT_STORE)
        setHydrated(true)
        return
      }

      try {
        const res = await fetch(`${API}/api/koshya/state`, {
          headers: { 'X-Koshya-Client-Id': clientId },
        })
        if (cancelled) return

        if (res.ok) {
          const data = (await res.json()) as KoshyaStore
          setStore({
            audit: { ...DEFAULT_AUDIT, ...data.audit },
            inflationResult: data.inflationResult ?? null,
            shadowTax: data.shadowTax ?? null,
            insights: Array.isArray(data.insights) ? data.insights : [],
            hasSubmittedAudit: Boolean(data.hasSubmittedAudit),
          })
          setHydrated(true)
          return
        }

        if (res.status === 404) {
          const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
          if (raw) {
            try {
              const parsed = JSON.parse(raw) as Record<string, unknown>
              const merged = mergeLegacyStore(parsed as Partial<KoshyaStore>)
              const put = await fetch(`${API}/api/koshya/state`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Koshya-Client-Id': clientId,
                },
                body: JSON.stringify(merged),
              })
              if (cancelled) return
              if (put.ok) {
                localStorage.removeItem(LEGACY_STORAGE_KEY)
                setStore(merged)
                setHydrated(true)
                return
              }
            } catch {
              /* fall through */
            }
          }
          setStore(DEFAULT_STORE)
          setHydrated(true)
          return
        }

        throw new Error(`Unexpected status ${res.status}`)
      } catch {
        if (cancelled) return
        const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
        if (raw) {
          try {
            setStore(mergeLegacyStore(JSON.parse(raw) as Partial<KoshyaStore>))
          } catch {
            setStore(DEFAULT_STORE)
          }
        } else {
          setStore(DEFAULT_STORE)
        }
        setHydrated(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  // Debounced persist to MongoDB
  useEffect(() => {
    if (!hydrated || !store) return
    const clientId = localStorage.getItem(CLIENT_ID_KEY)
    if (!clientId) return

    const t = setTimeout(() => {
      fetch(`${API}/api/koshya/state`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Koshya-Client-Id': clientId,
        },
        body: JSON.stringify(store),
      }).catch(() => {})
    }, PERSIST_DEBOUNCE_MS)

    return () => clearTimeout(t)
  }, [store, hydrated])

  if (!store) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-paper text-ink"
        style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem' }}
      >
        <p>Loading…</p>
      </div>
    )
  }

  const ctxValue: KoshyaStoreContextValue = {
    ...store,
    setAudit,
    setInflationResult,
    setShadowTax,
    setInsights,
    setHasSubmittedAudit,
    hydrated,
  }

  return (
    <KoshyaStoreContext.Provider value={ctxValue}>{children}</KoshyaStoreContext.Provider>
  )
}

export function useKoshyaStore(): KoshyaStoreContextValue {
  const ctx = useContext(KoshyaStoreContext)
  if (!ctx) {
    throw new Error('useKoshyaStore must be used within KoshyaStoreProvider')
  }
  return ctx
}
