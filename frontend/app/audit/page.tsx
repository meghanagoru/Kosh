'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import KoshyaNav from '@/components/KoshyaNav'
import { useKoshyaStore, AuditFormData } from '@/hooks/useKoshyaStore'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function AuditPage() {
  const router = useRouter()
  const { audit, setAudit, inflationResult, setShadowTax, setInsights, setHasSubmittedAudit } = useKoshyaStore()
  const [dark, setDark] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof AuditFormData>(key: K, value: AuditFormData[K]) =>
    setAudit({ ...audit, [key]: value })
  const numUpdate = (key: keyof AuditFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    update(key, Number(e.target.value) as any)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const [stRes, insRes] = await Promise.all([
        fetch(`${API}/api/calculate/shadow-tax`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            total_monthly_spend: audit.total_monthly_spend,
            commute_type: audit.commute_type,
            cab_spend: audit.cab_spend,
            metro_spend: audit.metro_spend,
            gendered_product_spend: audit.gendered_product_spend,
            generic_equivalent_spend: audit.generic_equivalent_spend,
          }),
        }),
        fetch(`${API}/api/insights/generate`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            monthly_salary: audit.monthly_salary,
            total_monthly_spend: audit.total_monthly_spend,
            rent: audit.rent,
            grocery_spend: audit.grocery_spend,
            food_inflation: (inflationResult as any)?.rates?.food ?? 6.2,
            personal_inflation_pct: inflationResult?.personal_inflation_pct ?? 0,
            food_penalty_rupees: (inflationResult as any)?.bucket_metrics?.food_penalty_rupees ?? 0,
            safety_delta_rupees: 0,
            pink_delta_rupees: 0,
            commute_type: audit.commute_type,
            purchasing_habit: audit.purchasing_habit,
            late_night_transit_frequency: audit.late_night_transit_frequency,
          }),
        }),
      ])
      const stData = await stRes.json()
      const insData = await insRes.json()
      if (!stRes.ok || !insRes.ok) {
        setError('Calculation failed. Please check your inputs and try again.')
        return
      }
      setShadowTax(stData)
      setInsights(insData.insights ?? [])
      setHasSubmittedAudit(true)
      router.push('/insights')
    } catch (err) {
      setError('Could not reach the backend. Make sure the API server is running.')
    } finally {
      setSubmitting(false)
    }
  }

  const showCabFields = audit.commute_type === 'cab' || audit.commute_type === 'own_vehicle'
  const showGenderedFields = audit.gendered_products !== 'no'

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="bg-paper text-ink min-h-screen">
        <KoshyaNav dark={dark} onDarkToggle={() => setDark(v => !v)} />

        {/* Page header */}
        <div
          className="k-container"
          style={{
            paddingTop: 'clamp(3rem, 6vw, 5rem)',
            paddingBottom: 'clamp(2.5rem, 4vw, 4rem)',
            borderBottom: '1px solid var(--color-rule)',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              marginBottom: '1.5rem',
            }}
          >
            The Audit
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '1rem',
              lineHeight: 1.85,
              color: 'var(--color-muted)',
              maxWidth: '60ch',
            }}
          >
            Three short sections covering your budget, commute, and purchasing habits.
            This unlocks your Hidden Cost analysis and personalised Insights.
            All data stays in your browser — nothing is sent anywhere.
          </p>
        </div>

        <main className="k-container" style={{ paddingTop: '4rem', paddingBottom: 'var(--section-pad)' }}>
          {error && (
            <div
              className="mb-8 px-5 py-4"
              style={{ border: '1px solid var(--color-leak)', color: 'var(--color-leak)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem', lineHeight: 1.6 }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* ══════════════════════════════
                Section A — Monthly Budget
            ══════════════════════════════ */}
            <AuditSection
              letter="A"
              title="Monthly Budget"
              desc="Your base financial context. These figures are used to weight your personal inflation and calculate budget impact percentages."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <AuditField
                  id="f-salary"
                  label="Take-Home Salary"
                  hint="Your net monthly salary after taxes and deductions."
                  required
                >
                  <input
                    id="f-salary" type="number" className="k-input"
                    value={audit.monthly_salary || ''}
                    onChange={numUpdate('monthly_salary')}
                    placeholder="75000"
                    min={0}
                  />
                </AuditField>

                <AuditField
                  id="f-spend"
                  label="Total Monthly Spend"
                  hint="Everything you spend in a month — rent, food, transport, subscriptions, etc."
                  required
                  borderLeft
                >
                  <input
                    id="f-spend" type="number" className="k-input"
                    value={audit.total_monthly_spend || ''}
                    onChange={numUpdate('total_monthly_spend')}
                    placeholder="55000"
                    min={0}
                  />
                </AuditField>

                <AuditField
                  id="f-grocery"
                  label="Monthly Grocery Spend"
                  hint="Food and beverages only — this directly weights your food inflation contribution."
                  required
                  borderTop
                >
                  <input
                    id="f-grocery" type="number" className="k-input"
                    value={audit.grocery_spend || ''}
                    onChange={numUpdate('grocery_spend')}
                    placeholder="9000"
                    min={0}
                  />
                </AuditField>

                <AuditField
                  id="f-rent"
                  label="Monthly Rent / Housing Cost"
                  hint="Total housing expense including maintenance, if any."
                  required
                  borderLeft
                  borderTop
                >
                  <input
                    id="f-rent" type="number" className="k-input"
                    value={audit.rent || ''}
                    onChange={numUpdate('rent')}
                    placeholder="18000"
                    min={0}
                  />
                </AuditField>
              </div>
            </AuditSection>

            {/* ══════════════════════════════
                Section B — Commute & Transit
            ══════════════════════════════ */}
            <AuditSection
              letter="B"
              title="Commute & Transit"
              desc="How you get around determines the Safety Tax — the premium you pay over the public transit equivalent, often driven by convenience or safety needs."
            >
              <AuditField
                id="f-commute"
                label="Primary Commute Mode"
                hint="How do you typically travel to work or move around the city on most days?"
                required
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mt-1" style={{ border: '1px solid var(--color-rule)' }}>
                  {(
                    [
                      { v: 'metro',       l: 'Metro / Bus' },
                      { v: 'cab',         l: 'Private Cab (Ola/Uber)' },
                      { v: 'own_vehicle', l: 'Own Vehicle' },
                      { v: 'wfh',         l: 'Work From Home' },
                    ] as const
                  ).map(({ v, l }, i) => (
                    <ChoiceCard
                      key={v}
                      id={`commute-${v}`}
                      name="commute"
                      label={l}
                      checked={audit.commute_type === v}
                      onChange={() => update('commute_type', v)}
                      borderLeft={i > 0}
                    />
                  ))}
                </div>
              </AuditField>

              {showCabFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0" style={{ borderTop: '1px solid var(--color-rule)' }}>
                  <AuditField
                    id="f-cab"
                    label="Monthly Cab / Fuel Spend"
                    hint="Total spent on cabs, petrol, or fuel in a typical month."
                    required
                  >
                    <input
                      id="f-cab" type="number" className="k-input"
                      value={audit.cab_spend || ''}
                      onChange={numUpdate('cab_spend')}
                      placeholder="4500"
                      min={0}
                    />
                  </AuditField>

                  <AuditField
                    id="f-metro"
                    label="Metro Equivalent Cost"
                    hint="What the same journeys would cost using Metro / BEST bus. Used to compute your Safety Tax premium."
                    required
                    borderLeft
                  >
                    <input
                      id="f-metro" type="number" className="k-input"
                      value={audit.metro_spend || ''}
                      onChange={numUpdate('metro_spend')}
                      placeholder="800"
                      min={0}
                    />
                  </AuditField>
                </div>
              )}

              <AuditField
                id="f-latenight"
                label="Late-Night Transit Frequency"
                hint="How often do you travel after 10 PM? Late-night trips skew cab spend and amplify the Safety Tax."
                borderTop
              >
                <select
                  id="f-latenight"
                  className="k-select mt-1"
                  value={audit.late_night_transit_frequency}
                  onChange={e => update('late_night_transit_frequency', e.target.value as any)}
                >
                  <option value="never">Never</option>
                  <option value="1-5">1–5 times per month</option>
                  <option value="5-15">5–15 times per month</option>
                  <option value="15+">More than 15 times</option>
                </select>
              </AuditField>
            </AuditSection>

            {/* ══════════════════════════════
                Section C — Purchasing Habits
            ══════════════════════════════ */}
            <AuditSection
              letter="C"
              title="Purchasing Habits"
              desc="Your product choices determine the Pink Tax — the premium paid for gendered versions of identical products. This section identifies that gap."
            >
              <AuditField
                id="f-habit"
                label="General Purchasing Style"
                hint="Across most categories — groceries, household, personal care — which best describes you?"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-1" style={{ border: '1px solid var(--color-rule)' }}>
                  {(
                    [
                      { v: 'generic',  l: 'Generic / Store Brand',  sub: 'Kirana, D-Mart own label, etc.' },
                      { v: 'branded',  l: 'Branded',                sub: 'HUL, P&G, ITC, etc.' },
                      { v: 'mix',      l: 'Mix of Both',            sub: 'Context-dependent' },
                    ] as const
                  ).map(({ v, l, sub }, i) => (
                    <ChoiceCard
                      key={v}
                      id={`habit-${v}`}
                      name="habit"
                      label={l}
                      sub={sub}
                      checked={audit.purchasing_habit === v}
                      onChange={() => update('purchasing_habit', v)}
                      borderLeft={i > 0}
                    />
                  ))}
                </div>
              </AuditField>

              <AuditField
                id="f-gendered"
                label="Do you use gendered / premium-marketed products?"
                hint="This includes women's razors, gender-specific skincare, hygiene items, or any product marketed with a pink premium over a gender-neutral equivalent."
                borderTop
              >
                <div className="grid grid-cols-3 gap-0 mt-1" style={{ border: '1px solid var(--color-rule)' }}>
                  {(
                    [
                      { v: 'yes',    l: 'Yes',    sub: 'Primarily gendered products' },
                      { v: 'no',     l: 'No',     sub: 'Generic equivalents only' },
                      { v: 'mixed',  l: 'Mixed',  sub: 'Some of both' },
                    ] as const
                  ).map(({ v, l, sub }, i) => (
                    <ChoiceCard
                      key={v}
                      id={`gendered-${v}`}
                      name="gendered"
                      label={l}
                      sub={sub}
                      checked={audit.gendered_products === v}
                      onChange={() => update('gendered_products', v)}
                      borderLeft={i > 0}
                    />
                  ))}
                </div>
              </AuditField>

              {showGenderedFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0" style={{ borderTop: '1px solid var(--color-rule)' }}>
                  <AuditField
                    id="f-gendered-spend"
                    label="Monthly Gendered Product Spend"
                    hint="Estimate of what you currently spend on gender-marketed products."
                    required
                  >
                    <input
                      id="f-gendered-spend" type="number" className="k-input"
                      value={audit.gendered_product_spend || ''}
                      onChange={numUpdate('gendered_product_spend')}
                      placeholder="1200"
                      min={0}
                    />
                  </AuditField>

                  <AuditField
                    id="f-generic-est"
                    label="Generic Equivalent Estimate"
                    hint="What the same products would cost as unbranded / gender-neutral alternatives. The difference is your Pink Tax."
                    required
                    borderLeft
                  >
                    <input
                      id="f-generic-est" type="number" className="k-input"
                      value={audit.generic_equivalent_spend || ''}
                      onChange={numUpdate('generic_equivalent_spend')}
                      placeholder="400"
                      min={0}
                    />
                  </AuditField>
                </div>
              )}
            </AuditSection>

            {/* ── Submit ── */}
            <div
              className="flex items-center gap-4 flex-wrap"
              style={{ paddingTop: '2.5rem', borderTop: '1px solid var(--color-rule)' }}
            >
              <button
                type="submit"
                id="audit-submit"
                className="k-btn k-btn-primary"
                disabled={submitting}
                style={{ padding: '1rem 2.5rem', fontSize: '0.75rem' }}
              >
                {submitting ? 'Calculating···' : 'Generate Insights →'}
              </button>

              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', lineHeight: 1.7, color: 'var(--color-dim)', flexGrow: 1 }}>
                Fields marked * are required for hidden cost calculation.
              </p>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}

// ── Section wrapper ──────────────────────────────────────────────────────────

function AuditSection({
  letter,
  title,
  desc,
  children,
}: {
  letter: string
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <section className="audit-section">
      <div className="audit-section-header">
        <span
          style={{
            fontFamily: 'var(--font-data)',
            fontSize: '0.8125rem',
            color: 'var(--color-dim)',
            letterSpacing: '0.06em',
            flexShrink: 0,
          }}
        >
          {letter}
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 900,
            fontSize: '1.125rem',
            letterSpacing: '-0.01em',
            color: 'var(--color-ink)',
          }}
        >
          {title}
        </h2>
      </div>

      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.9375rem',
          lineHeight: 1.85,
          color: 'var(--color-muted)',
          padding: '1.25rem 0',
          borderBottom: '1px solid var(--color-rule)',
          marginBottom: 0,
        }}
      >
        {desc}
      </p>

      <div style={{ border: '1px solid var(--color-rule)', borderTop: 'none' }}>
        {children}
      </div>
    </section>
  )
}

// ── Individual field ─────────────────────────────────────────────────────────

function AuditField({
  id,
  label,
  hint,
  required,
  children,
  borderLeft,
  borderTop,
}: {
  id: string
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  borderLeft?: boolean
  borderTop?: boolean
}) {
  return (
    <div
      className="audit-field"
      style={{
        borderLeft: borderLeft ? '1px solid var(--color-rule)' : undefined,
        borderTop: borderTop ? '1px solid var(--color-rule)' : undefined,
      }}
    >
      <label htmlFor={id} className="field-label">
        {label}{required && <span style={{ color: 'var(--color-leak)', marginLeft: 2 }}>*</span>}
      </label>
      {hint && <p className="field-hint">{hint}</p>}
      {children}
    </div>
  )
}

// ── Choice card (radio-style) ────────────────────────────────────────────────

function ChoiceCard({
  id,
  name,
  label,
  sub,
  checked,
  onChange,
  borderLeft,
}: {
  id: string
  name: string
  label: string
  sub?: string
  checked: boolean
  onChange: () => void
  borderLeft?: boolean
}) {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        padding: '1.25rem 1.5rem',
        cursor: 'pointer',
        background: checked ? 'var(--color-ink)' : 'transparent',
        color: checked ? 'var(--color-paper)' : 'var(--color-ink)',
        borderLeft: borderLeft ? '1px solid var(--color-rule)' : undefined,
        transition: 'background 150ms ease, color 150ms ease',
        userSelect: 'none',
      }}
    >
      <input type="radio" id={id} name={name} checked={checked} onChange={onChange} style={{ display: 'none' }} />
      <span
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.875rem',
          fontWeight: checked ? 700 : 500,
          lineHeight: 1.4,
        }}
      >
        {label}
      </span>
      {sub && (
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            lineHeight: 1.5,
            opacity: checked ? 0.65 : 1,
            color: checked ? 'var(--color-paper)' : 'var(--color-muted)',
          }}
        >
          {sub}
        </span>
      )}
    </label>
  )
}
