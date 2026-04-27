'use client'

import React, { useState } from 'react'

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

interface Props {
  formData: AuditFormData
  onChange: (data: AuditFormData) => void
  onSubmit: () => void
  isSubmitting: boolean
}

export default function View2Audit({
  formData,
  onChange,
  onSubmit,
  isSubmitting,
}: Props) {
  const set = <K extends keyof AuditFormData>(key: K, value: AuditFormData[K]) =>
    onChange({ ...formData, [key]: value })

  const numSet = (key: keyof AuditFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(key, Number(e.target.value) as AuditFormData[typeof key])

  return (
    <section className="k-section" id="view-audit">
      <div className="k-container">
        {/* Section identifier */}
        <div className="flex items-center gap-4 mb-16">
          <span className="section-num">02</span>
          <div className="k-rule flex-1" />
          <span className="type-label text-muted">The Audit</span>
        </div>

        <div className="grid grid-cols-12 gap-0">
          {/* Left: title column */}
          <div className="col-span-12 md:col-span-4 md:border-r border-rule md:pr-12 mb-12 md:mb-0">
            <h2 className="type-heading text-ink mb-6">
              The<br />Questionnaire
            </h2>
            <p className="type-body text-muted mb-8">
              Complete the audit to unlock your Hidden Cost analysis and AI Sovereign Insights.
              All data stays in your browser.
            </p>
            <p className="type-label text-dim">
              Fields marked with * are required for Hidden Cost calculation.
            </p>
          </div>

          {/* Right: form */}
          <div className="col-span-12 md:col-span-8 md:pl-12">
            <form onSubmit={e => { e.preventDefault(); onSubmit() }} noValidate>

              {/* === SECTION A: Budget === */}
              <FieldSection label="A. Monthly Budget" num="01">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  <FormField label="Take-Home Salary *" hint="₹ per month">
                    <input
                      type="number"
                      id="salary"
                      className="k-input"
                      value={formData.monthly_salary || ''}
                      onChange={numSet('monthly_salary')}
                      placeholder="e.g. 75000"
                      min={0}
                    />
                  </FormField>
                  <FormField label="Total Monthly Spend *" hint="₹ all categories" borderLeft>
                    <input
                      type="number"
                      id="spend"
                      className="k-input"
                      value={formData.total_monthly_spend || ''}
                      onChange={numSet('total_monthly_spend')}
                      placeholder="e.g. 55000"
                      min={0}
                    />
                  </FormField>
                  <FormField label="Grocery Spend *" hint="₹ food & beverages" borderTop>
                    <input
                      type="number"
                      id="grocery"
                      className="k-input"
                      value={formData.grocery_spend || ''}
                      onChange={numSet('grocery_spend')}
                      placeholder="e.g. 8000"
                      min={0}
                    />
                  </FormField>
                  <FormField label="Monthly Rent *" hint="₹ housing cost" borderLeft borderTop>
                    <input
                      type="number"
                      id="rent"
                      className="k-input"
                      value={formData.rent || ''}
                      onChange={numSet('rent')}
                      placeholder="e.g. 18000"
                      min={0}
                    />
                  </FormField>
                </div>
              </FieldSection>

              {/* === SECTION B: Commute === */}
              <FieldSection label="B. Commute & Transit" num="02">
                <FormField label="Primary Commute Type *" hint="Most days of the week">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
                    {(['metro', 'cab', 'own_vehicle', 'wfh'] as const).map(opt => (
                      <RadioOption
                        key={opt}
                        label={{ metro: 'Metro', cab: 'Private Cab', own_vehicle: 'Own Vehicle', wfh: 'WFH' }[opt]}
                        checked={formData.commute_type === opt}
                        onChange={() => set('commute_type', opt)}
                        name="commute"
                        id={`commute-${opt}`}
                      />
                    ))}
                  </div>
                </FormField>

                {(formData.commute_type === 'cab' || formData.commute_type === 'own_vehicle') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-rule">
                    <FormField label="Monthly Cab / Fuel Spend *" hint="₹ total">
                      <input
                        type="number"
                        id="cab-spend"
                        className="k-input"
                        value={formData.cab_spend || ''}
                        onChange={numSet('cab_spend')}
                        placeholder="e.g. 4500"
                        min={0}
                      />
                    </FormField>
                    <FormField label="Metro Equivalent *" hint="₹ if you used metro" borderLeft>
                      <input
                        type="number"
                        id="metro-spend"
                        className="k-input"
                        value={formData.metro_spend || ''}
                        onChange={numSet('metro_spend')}
                        placeholder="e.g. 800"
                        min={0}
                      />
                    </FormField>
                  </div>
                )}

                <FormField label="Late-Night Transit Frequency *" hint="Per month, post 10 PM" borderTop>
                  <select
                    id="late-night"
                    className="k-select"
                    value={formData.late_night_transit_frequency}
                    onChange={e => set('late_night_transit_frequency', e.target.value as AuditFormData['late_night_transit_frequency'])}
                  >
                    <option value="never">Never</option>
                    <option value="1-5">1–5 times</option>
                    <option value="5-15">5–15 times</option>
                    <option value="15+">15+ times</option>
                  </select>
                </FormField>
              </FieldSection>

              {/* === SECTION C: Purchasing === */}
              <FieldSection label="C. Purchasing Habits" num="03">
                <FormField label="General Purchasing Style" hint="Across categories">
                  <div className="grid grid-cols-3 gap-0">
                    {(['generic', 'branded', 'mix'] as const).map(opt => (
                      <RadioOption
                        key={opt}
                        label={{ generic: 'Generic / Store Brand', branded: 'Branded', mix: 'Mix of Both' }[opt]}
                        checked={formData.purchasing_habit === opt}
                        onChange={() => set('purchasing_habit', opt)}
                        name="habit"
                        id={`habit-${opt}`}
                      />
                    ))}
                  </div>
                </FormField>

                <FormField label="Use Gendered / Premium Products?" hint="e.g. women's razors, skincare, hygiene" borderTop>
                  <div className="grid grid-cols-3 gap-0">
                    {(['yes', 'no', 'mixed'] as const).map(opt => (
                      <RadioOption
                        key={opt}
                        label={{ yes: 'Yes', no: 'No', mixed: 'Mixed' }[opt]}
                        checked={formData.gendered_products === opt}
                        onChange={() => set('gendered_products', opt)}
                        name="gendered"
                        id={`gendered-${opt}`}
                      />
                    ))}
                  </div>
                </FormField>

                {formData.gendered_products !== 'no' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-rule">
                    <FormField label="Gendered Product Spend *" hint="₹ per month">
                      <input
                        type="number"
                        id="gendered-spend"
                        className="k-input"
                        value={formData.gendered_product_spend || ''}
                        onChange={numSet('gendered_product_spend')}
                        placeholder="e.g. 1200"
                        min={0}
                      />
                    </FormField>
                    <FormField label="Generic Alternative Estimate *" hint="₹ if switched to generic" borderLeft>
                      <input
                        type="number"
                        id="generic-spend"
                        className="k-input"
                        value={formData.generic_equivalent_spend || ''}
                        onChange={numSet('generic_equivalent_spend')}
                        placeholder="e.g. 400"
                        min={0}
                      />
                    </FormField>
                  </div>
                )}
              </FieldSection>

              {/* Submit */}
              <div className="pt-8 border-t border-rule">
                <button
                  type="submit"
                  className="k-btn k-btn-primary"
                  disabled={isSubmitting}
                  id="audit-submit"
                >
                  {isSubmitting ? 'Calculating···' : 'Generate Sovereign Insights →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FieldSection({
  label,
  num,
  children,
}: {
  label: string
  num: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <span className="section-num">{num}</span>
        <p className="type-label text-muted">{label}</p>
        <div className="k-rule flex-1" />
      </div>
      <div className="border border-rule">{children}</div>
    </div>
  )
}

function FormField({
  label,
  hint,
  children,
  borderLeft = false,
  borderTop = false,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  borderLeft?: boolean
  borderTop?: boolean
}) {
  return (
    <div
      className={`p-6 ${borderLeft ? 'border-l border-rule' : ''} ${borderTop ? 'border-t border-rule' : ''}`}
    >
      <label className="type-label text-muted block mb-1">{label}</label>
      {hint && <p className="type-label text-dim mb-3">{hint}</p>}
      {children}
    </div>
  )
}

function RadioOption({
  label,
  checked,
  onChange,
  name,
  id,
}: {
  label: string
  checked: boolean
  onChange: () => void
  name: string
  id: string
}) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 p-4 cursor-pointer border-r border-rule last:border-r-0 transition-colors ${
        checked ? 'bg-ink' : 'hover:bg-surface'
      }`}
      style={{
        backgroundColor: checked ? 'var(--color-ink)' : undefined,
        color: checked ? 'var(--color-paper)' : 'var(--color-ink)',
      }}
    >
      <input
        type="radio"
        id={id}
        name={name}
        className="k-radio"
        checked={checked}
        onChange={onChange}
        style={{ display: 'none' }}
      />
      <div
        className="w-3 h-3 border flex-shrink-0"
        style={{
          borderColor: checked ? 'var(--color-paper)' : 'var(--color-rule)',
          backgroundColor: checked ? 'var(--color-paper)' : 'transparent',
        }}
      />
      <span className="type-label" style={{ letterSpacing: '0.04em', textTransform: 'none', fontSize: '0.8rem' }}>
        {label}
      </span>
    </label>
  )
}
