'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import KoshyaNav from '@/components/KoshyaNav'
import MospiUpload from '@/components/MospiUpload'
import { Fn, FootnoteDrawer, FootnoteContext, useFootnote } from '@/components/FootnoteDrawer'
import AdjustedRupee from '@/components/AdjustedRupee'
import { useKoshyaStore } from '@/hooks/useKoshyaStore'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function LedgerPage() {
  const { audit, setAudit, inflationResult, setInflationResult, shadowTax } = useKoshyaStore()
  const { activeFootnote, openFootnote, closeFootnote } = useFootnote()
  const [dark, setDark] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mospiSource, setMospiSource] = useState('MOSPI CPI 2024 (seeded)')
  const [foodWeight, setFoodWeight] = useState(40)
  const [housingWeight, setHousingWeight] = useState(30)
  const [fuelWeight, setFuelWeight] = useState(30)
  const hiddenCostImpact = shadowTax?.total_hidden_cost_pct ?? 0

  const fetchInflation = useCallback(async (fw: number, hw: number, flw: number) => {
    if (!audit.monthly_salary || !audit.total_monthly_spend) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/calculate/inflation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_weight: fw, housing_weight: hw, fuel_weight: flw,
          monthly_salary: audit.monthly_salary,
          total_monthly_spend: audit.total_monthly_spend,
          grocery_spend: audit.grocery_spend,
          rent: audit.rent,
        }),
      })
      setInflationResult(await res.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [audit, setInflationResult])

  useEffect(() => {
    fetchInflation(foodWeight, housingWeight, fuelWeight)
    fetch(`${API}/api/mospi/latest`).then(r => r.json()).then(d => setMospiSource(d.source || 'MOSPI CPI 2024 (seeded)')).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n)
  const deltaPos = (inflationResult?.delta_pp ?? 0) >= 0

  return (
    <FootnoteContext.Provider value={{ open: openFootnote }}>
      <div className={dark ? 'dark' : ''}>
        <div className="bg-paper text-ink min-h-screen">
          <KoshyaNav
            dark={dark} onDarkToggle={() => setDark(v => !v)}
            showUpload={showUpload} onUploadToggle={() => setShowUpload(v => !v)}
            uploadPanel={
              <div className="k-container py-6">
                <div className="grid grid-cols-12 gap-0 items-start">
                  <div className="col-span-12 md:col-span-3 md:border-r border-rule md:pr-8 mb-4 md:mb-0">
                    <p className="type-label text-muted mb-2">MOSPI Data Upload</p>
                    <p style={{ fontSize: '0.8rem', lineHeight: 1.7, color: 'var(--color-muted)' }}>
                      Upload any MOSPI CPI CSV to update the inflation rates.
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-9 md:pl-8"><MospiUpload /></div>
                </div>
              </div>
            }
          />

          {/* Page header */}
          <div className="k-container border-b" style={{ borderColor: 'var(--color-rule)', paddingTop: 'clamp(3rem, 6vw, 5rem)', paddingBottom: 'clamp(2rem, 4vw, 3.5rem)' }}>
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <h1 style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 'clamp(2.25rem, 5vw, 4.5rem)', lineHeight: 0.97, letterSpacing: '-0.035em' }}>
                Your Inflation Report
              </h1>
              <p className="type-label text-dim" style={{ lineHeight: 1.6 }}>Data: {mospiSource}</p>
            </div>
          </div>

          {/* Quick inputs */}
          <div className="border-b bg-surface" style={{ borderColor: 'var(--color-rule)' }}>
            <div className="k-container grid grid-cols-2 md:grid-cols-4 gap-0">
              {([
                { id: 'q-salary',  label: 'Monthly Salary (₹)', key: 'monthly_salary' },
                { id: 'q-spend',   label: 'Total Spend (₹)',    key: 'total_monthly_spend' },
                { id: 'q-grocery', label: 'Groceries (₹)',      key: 'grocery_spend' },
                { id: 'q-rent',    label: 'Rent (₹)',           key: 'rent' },
              ] as const).map((f, i) => (
                <div key={f.id} className={`px-4 py-5 ${i > 0 ? 'border-l' : ''}`} style={{ borderColor: 'var(--color-rule)' }}>
                  <label htmlFor={f.id} className="type-label text-muted block mb-1">{f.label}</label>
                  <input
                    id={f.id} type="number" className="k-input"
                    value={(audit as any)[f.key] || ''}
                    onChange={e => {
                      setAudit({ ...audit, [f.key]: Number(e.target.value) })
                      setTimeout(() => fetchInflation(foodWeight, housingWeight, fuelWeight), 500)
                    }}
                    style={{ border: 'none', padding: '0.25rem 0', background: 'transparent', fontFamily: 'var(--font-data)', fontSize: '1.0625rem' }}
                  />
                </div>
              ))}
            </div>
          </div>

          <main className="k-container" style={{ paddingTop: 'var(--section-pad)', paddingBottom: 'var(--section-pad)' }}>

            {/* Macro Stats */}
            <div className="k-grid-3 border border-rule mb-20">
              {[
                { label: 'Govt. Average CPI', sub: 'Headline CPI, All India', value: inflationResult ? `${fmt(inflationResult.govt_avg_pct)}%` : '—', accent: false },
                { label: 'Your Inflation', sub: 'Weighted by your spend', value: loading ? '···' : inflationResult ? `${fmt(inflationResult.personal_inflation_pct)}%` : '—', accent: false, fnId: 'personal-inflation', fnNum: 1 },
                { label: 'The Delta', sub: deltaPos ? 'Above the average' : 'Below the average', value: loading ? '···' : inflationResult ? `${deltaPos ? '+' : ''}${fmt(inflationResult.delta_pp)}pp` : '—', accent: deltaPos, fnId: 'delta', fnNum: 2 },
              ].map((s, i) => (
                <div key={i} className="p-8 md:p-10">
                  <div className="flex items-start gap-1 mb-5">
                    <p className="type-label text-muted">{s.label}</p>
                    {s.fnId && <Fn id={s.fnId} num={s.fnNum!} />}
                  </div>
                  <p style={{ fontFamily: 'var(--font-data)', fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1, color: s.accent ? 'var(--color-leak)' : loading ? 'var(--color-dim)' : 'var(--color-ink)', marginBottom: '0.75rem', transition: 'color 200ms' }}>
                    {s.value}
                  </p>
                  <p className="type-label text-dim">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Sliders */}
            <div className="mb-20">
              <p className="type-label text-muted mb-10">Adjust Your Spending Weights</p>
              <div className="flex flex-col gap-10">
                {[
                  { label: 'Food & Groceries', v: foodWeight, set: setFoodWeight, rk: 'food' },
                  { label: 'Housing & Rent',   v: housingWeight, set: setHousingWeight, rk: 'housing' },
                  { label: 'Fuel & Commute',   v: fuelWeight, set: setFuelWeight, rk: 'fuel' },
                ].map(({ label, v, set, rk }) => (
                  <div key={rk} className="grid grid-cols-12 gap-4 items-center border-b border-rule pb-8">
                    <div className="col-span-3">
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', lineHeight: 1.5 }}>{label}</p>
                      {inflationResult && (
                        <p className="type-label text-muted mt-1">CPI: <span style={{ fontFamily: 'var(--font-data)', fontSize: '0.75rem' }}>{(inflationResult.rates as any)[rk]}%</span></p>
                      )}
                    </div>
                    <div className="col-span-7">
                      <input type="range" min={0} max={100} value={v}
                        onChange={e => {
                          const val = Number(e.target.value); set(val)
                          const fw = rk === 'food' ? val : foodWeight
                          const hw = rk === 'housing' ? val : housingWeight
                          const flw = rk === 'fuel' ? val : fuelWeight
                          setTimeout(() => fetchInflation(fw, hw, flw), 400)
                        }}
                        className="k-slider" aria-label={`${label} weight`}
                      />
                    </div>
                    <div className="col-span-2 text-right">
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: '1.375rem', fontWeight: 700 }}>{v}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bucket Metrics */}
            <div className="mb-20">
              <p className="type-label text-muted mb-10">What Inflation Actually Costs You</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                {[
                  { label: 'Food Inflation', fnId: 'food-penalty', fnNum: 3, value: inflationResult ? `₹${fmt(inflationResult.bucket_metrics.food_penalty_rupees)}` : '—', body: 'grocery penalty this month', pct: inflationResult?.contributions.food_pp ?? 0 },
                  { label: 'Fuel & Commute', fnId: 'fuel-days', fnNum: 4, value: inflationResult ? `${fmt(inflationResult.bucket_metrics.fuel_days_worked)} days` : '—', body: 'of your work covers fuel inflation', pct: inflationResult?.contributions.fuel_pp ?? 0 },
                  { label: 'Housing', fnId: 'housing-penalty', fnNum: 5, value: inflationResult ? `₹${fmt(inflationResult.bucket_metrics.housing_penalty_rupees)}` : '—', body: 'housing premium this month', pct: inflationResult?.contributions.housing_pp ?? 0 },
                ].map((m, i) => (
                  <div key={i} className={`metric-card ${i > 0 ? 'border-t md:border-t-0 md:border-l' : ''}`} style={{ borderColor: 'var(--color-rule)' }}>
                    <div className="flex items-start justify-between mb-6"><p className="type-label text-muted">{m.label}</p><Fn id={m.fnId} num={m.fnNum} /></div>
                    <p style={{ fontFamily: 'var(--font-data)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: 'var(--color-leak)', marginBottom: '0.75rem', lineHeight: 1 }}>{m.value}</p>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--color-muted)', marginBottom: '1.5rem' }}>{m.body}</p>
                    <div className="leak-bar"><div className="leak-bar-fill" style={{ width: `${Math.min(m.pct * 10, 100)}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Adjusted Rupee */}
            <div className="border border-rule mb-20">
              <div className="p-8 border-b flex items-start gap-2" style={{ borderColor: 'var(--color-rule)' }}>
                <h2 style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>The Adjusted Rupee</h2>
                <Fn id="adjusted-rupee" num={6} />
              </div>
              <AdjustedRupee
                realValue={inflationResult ? Math.max(0, 100 * (1 - (inflationResult.personal_inflation_pct + hiddenCostImpact) / 100)) : 100}
                evaporated={inflationResult ? Math.min(100, inflationResult.personal_inflation_pct + hiddenCostImpact) : 0}
                personalInflation={inflationResult?.personal_inflation_pct ?? 0}
                hiddenCostImpact={hiddenCostImpact}
                isLoading={loading}
              />
            </div>

            {/* CTA */}
            <div className="pt-10 border-t flex items-center justify-between gap-6 flex-wrap" style={{ borderColor: 'var(--color-rule)' }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--color-muted)' }}>
                Complete the Audit to unlock your Hidden Cost analysis and personalised Insights.
              </p>
              <Link href="/audit" className="k-btn k-btn-primary no-underline" style={{ fontSize: '0.6875rem', flexShrink: 0 }}>
                Continue to Audit →
              </Link>
            </div>
          </main>

          <FootnoteDrawer footnote={activeFootnote} onClose={closeFootnote} />
        </div>
      </div>
    </FootnoteContext.Provider>
  )
}
