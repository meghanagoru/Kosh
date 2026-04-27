'use client'

import React, { useState, useEffect, useCallback, useContext } from 'react'
import { Fn, FootnoteContext } from './FootnoteDrawer'
import AdjustedRupee from './AdjustedRupee'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface InflationData {
  govt_avg_pct: number
  personal_inflation_pct: number
  delta_pp: number
  contributions: {
    food_pp: number
    housing_pp: number
    fuel_pp: number
  }
  bucket_metrics: {
    food_penalty_rupees: number
    housing_penalty_rupees: number
    fuel_penalty_rupees: number
    fuel_days_worked: number
  }
  rates: {
    food: number
    housing: number
    fuel: number
  }
}

interface Props {
  salary: number
  spend: number
  grocerySpend: number
  rent: number
  onInflationResult: (result: InflationData | null) => void
  hiddenCostImpact: number
}

export default function View1Ledger({
  salary,
  spend,
  grocerySpend,
  rent,
  onInflationResult,
  hiddenCostImpact,
}: Props) {
  const [foodWeight, setFoodWeight] = useState(40)
  const [housingWeight, setHousingWeight] = useState(30)
  const [fuelWeight, setFuelWeight] = useState(30)
  const [data, setData] = useState<InflationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [mospiSource, setMospiSource] = useState('')
  const fn = useContext(FootnoteContext)

  const fetchInflation = useCallback(async () => {
    if (salary <= 0 || spend <= 0) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/calculate/inflation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_weight: foodWeight,
          housing_weight: housingWeight,
          fuel_weight: fuelWeight,
          monthly_salary: salary,
          total_monthly_spend: spend,
          grocery_spend: grocerySpend,
          rent,
        }),
      })
      const json: InflationData = await res.json()
      setData(json)
      onInflationResult(json)
    } catch (e) {
      console.error('Inflation API error:', e)
    } finally {
      setLoading(false)
    }
  }, [foodWeight, housingWeight, fuelWeight, salary, spend, grocerySpend, rent, onInflationResult])

  // Fetch MOSPI source
  useEffect(() => {
    fetch(`${API}/api/mospi/latest`)
      .then(r => r.json())
      .then(d => setMospiSource(d.source || ''))
      .catch(() => {})
  }, [])

  // Debounce fetch
  useEffect(() => {
    const t = setTimeout(fetchInflation, 400)
    return () => clearTimeout(t)
  }, [fetchInflation])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n)

  const deltaPositive = (data?.delta_pp ?? 0) >= 0

  return (
    <section className="k-section" id="view-ledger">
      <div className="k-container">
        {/* Section identifier */}
        <div className="flex items-center gap-4 mb-16">
          <span className="section-num">01</span>
          <div className="k-rule flex-1" />
          <span className="type-label text-muted">The Core Ledger</span>
        </div>

        {/* Hero header */}
        <div className="mb-16">
          <h2 className="type-heading text-ink mb-4">
            Your Sovereign<br />Inflation Report
          </h2>
          <div className="flex items-center gap-3">
            <span className="type-label text-muted">
              Data source: {mospiSource || 'MOSPI CPI 2024 (seeded)'}
            </span>
          </div>
        </div>

        {/* 3-Column Macro Stats */}
        <div className="k-grid-3 border border-rule mb-16">
          {/* Govt Avg */}
          <div className="p-8">
            <p className="type-label text-muted mb-4">Govt. Average CPI</p>
            <p className="type-data-lg text-ink">
              {data ? `${fmt(data.govt_avg_pct)}%` : '—'}
            </p>
            <p className="type-label text-dim mt-2">Headline CPI, All India</p>
          </div>

          {/* Your Inflation */}
          <div className="p-8">
            <div className="flex items-start gap-1">
              <p className="type-label text-muted mb-4">Your Inflation</p>
              <Fn id="personal-inflation" num={1} />
            </div>
            <p
              className="type-data-lg"
              style={{
                fontFamily: 'var(--font-data)',
                color: loading ? 'var(--color-dim)' : 'var(--color-ink)',
                transition: 'color 200ms',
              }}
            >
              {loading ? '···' : data ? `${fmt(data.personal_inflation_pct)}%` : '—'}
            </p>
            <p className="type-label text-dim mt-2">Weighted by your spend</p>
          </div>

          {/* Delta */}
          <div className="p-8">
            <div className="flex items-start gap-1">
              <p className="type-label text-muted mb-4">The Delta</p>
              <Fn id="delta" num={2} />
            </div>
            <p
              className="type-data-lg"
              style={{
                fontFamily: 'var(--font-data)',
                color: loading
                  ? 'var(--color-dim)'
                  : deltaPositive
                  ? 'var(--color-leak)'
                  : 'var(--color-ink)',
                transition: 'color 200ms',
              }}
            >
              {loading
                ? '···'
                : data
                ? `${deltaPositive ? '+' : ''}${fmt(data.delta_pp)}pp`
                : '—'}
            </p>
            <p className="type-label text-dim mt-2">
              {deltaPositive ? 'You are above the average' : 'You are below the average'}
            </p>
          </div>
        </div>

        {/* Sliders */}
        <div className="mb-16">
          <p className="type-label text-muted mb-8">Adjust Your Spending Weights</p>

          <div className="grid grid-cols-1 gap-8">
            <SliderRow
              label="Food & Groceries"
              value={foodWeight}
              onChange={setFoodWeight}
              rate={data?.rates.food}
            />
            <SliderRow
              label="Housing & Rent"
              value={housingWeight}
              onChange={setHousingWeight}
              rate={data?.rates.housing}
            />
            <SliderRow
              label="Fuel & Commute"
              value={fuelWeight}
              onChange={setFuelWeight}
              rate={data?.rates.fuel}
            />
          </div>
        </div>

        {/* Intuitive Bucket Metrics */}
        <div className="mb-16">
          <p className="type-label text-muted mb-8">What Inflation Actually Costs You</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">

            {/* Food */}
            <div className="metric-card md:border-r-0">
              <div className="flex items-start justify-between mb-6">
                <p className="type-label text-muted">Food Inflation</p>
                <Fn id="food-penalty" num={3} />
              </div>
              <p
                className="type-data mb-2"
                style={{ fontFamily: 'var(--font-data)', color: 'var(--color-leak)' }}
              >
                {data
                  ? `₹${fmt(data.bucket_metrics.food_penalty_rupees)}`
                  : '—'}
              </p>
              <p className="type-body text-muted">
                grocery penalty this month
              </p>
              <div className="leak-bar mt-4">
                <div
                  className="leak-bar-fill"
                  style={{
                    width: `${Math.min((data?.contributions.food_pp ?? 0) * 10, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Fuel */}
            <div className="metric-card border-t md:border-t-0 md:border-l">
              <div className="flex items-start justify-between mb-6">
                <p className="type-label text-muted">Fuel & Commute</p>
                <Fn id="fuel-days" num={4} />
              </div>
              <p
                className="type-data mb-2"
                style={{ fontFamily: 'var(--font-data)', color: 'var(--color-leak)' }}
              >
                {data
                  ? `${fmt(data.bucket_metrics.fuel_days_worked)} days`
                  : '—'}
              </p>
              <p className="type-body text-muted">
                of your work covers fuel inflation
              </p>
              <div className="leak-bar mt-4">
                <div
                  className="leak-bar-fill"
                  style={{
                    width: `${Math.min((data?.contributions.fuel_pp ?? 0) * 10, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Housing */}
            <div className="metric-card border-t md:border-t-0 md:border-l">
              <div className="flex items-start justify-between mb-6">
                <p className="type-label text-muted">Housing</p>
                <Fn id="housing-penalty" num={5} />
              </div>
              <p
                className="type-data mb-2"
                style={{ fontFamily: 'var(--font-data)', color: 'var(--color-leak)' }}
              >
                {data
                  ? `₹${fmt(data.bucket_metrics.housing_penalty_rupees)}`
                  : '—'}
              </p>
              <p className="type-body text-muted">
                housing premium this month
              </p>
              <div className="leak-bar mt-4">
                <div
                  className="leak-bar-fill"
                  style={{
                    width: `${Math.min((data?.contributions.housing_pp ?? 0) * 10, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Adjusted Rupee Hero */}
        <div className="border border-rule">
          <div className="p-8 border-b border-rule flex items-start gap-2">
            <h3 className="type-subheading text-ink">The Adjusted Rupee</h3>
            <Fn id="adjusted-rupee" num={6} />
          </div>
          <AdjustedRupee
            realValue={
              data
                ? Math.max(
                    0,
                    100 *
                      (1 -
                        (data.personal_inflation_pct + hiddenCostImpact) /
                          100)
                  )
                : 100
            }
            evaporated={
              data
                ? Math.min(
                    100,
                    (data.personal_inflation_pct + hiddenCostImpact)
                  )
                : 0
            }
            personalInflation={data?.personal_inflation_pct ?? 0}
            hiddenCostImpact={hiddenCostImpact}
            isLoading={loading}
          />
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Slider Row
// ---------------------------------------------------------------------------

function SliderRow({
  label,
  value,
  onChange,
  rate,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  rate?: number
}) {
  return (
    <div className="grid grid-cols-12 gap-4 items-center border-b border-rule pb-6">
      <div className="col-span-3">
        <p className="type-body text-ink">{label}</p>
        {rate !== undefined && (
          <p className="type-label text-muted mt-1">
            CPI:{' '}
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '0.75rem' }}>
              {rate}%
            </span>
          </p>
        )}
      </div>
      <div className="col-span-7">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="k-slider"
          aria-label={`${label} weight`}
        />
      </div>
      <div className="col-span-2 text-right">
        <span
          className="type-data-sm"
          style={{ fontFamily: 'var(--font-data)', fontSize: '1.25rem', fontWeight: 700 }}
        >
          {value}%
        </span>
      </div>
    </div>
  )
}
