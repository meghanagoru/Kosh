'use client'

import React, { useEffect, useRef } from 'react'

interface FootnoteDrawerProps {
  footnote: { id: string; label: string; body: string } | null
  onClose: () => void
}

const FOOTNOTES: Record<string, { label: string; body: string }> = {
  'food-penalty': {
    label: 'Food Rupee Penalty',
    body:
      'This figure represents the additional rupees you spend on the exact same grocery basket compared to 12 months ago. It is calculated as: Grocery Spend × (Food Inflation Rate ÷ 100). This is not a projection — it reflects current market-rate erosion on your specific spend level.',
  },
  'fuel-days': {
    label: 'Fuel Inflation in Working Days',
    body:
      'Instead of an abstract percentage, this converts fuel inflation into labour time. Formula: (Fuel Spend × Fuel Inflation Rate) ÷ Daily Wage. Daily Wage is computed as Monthly Salary ÷ 22 working days. This makes the cost viscerally real: X days of your time are consumed purely to cover the price increase in fuel.',
  },
  'housing-penalty': {
    label: 'Housing Rupee Penalty',
    body:
      'The amount your rent or housing cost has effectively increased due to inflation in the housing segment. Calculated as: Rent × (Housing Inflation Rate ÷ 100). Even if your nominal rent is fixed, market rates around you are rising at this pace — relevant if your lease is due for renewal.',
  },
  'personal-inflation': {
    label: 'Personal Inflation Rate',
    body:
      'Unlike the government\'s headline CPI (which uses a fixed national basket), your personal inflation is computed using Weighted Contribution. Each category contributes proportionally to its share of your spend. Formula: Σ (Normalised Weight × Category Rate). This is mathematically correct and avoids the distortion of simple averages.',
  },
  'delta': {
    label: 'The Delta (pp)',
    body:
      'Delta is the gap between your Personal Inflation Rate and the Government\'s Headline CPI, expressed in percentage points (pp). A positive delta means you are experiencing inflation faster than the national average. A negative delta means you are relatively insulated.',
  },
  'safety-tax': {
    label: 'Safety Tax',
    body:
      'The Safety Tax captures the premium paid for safer commute choices — typically private cabs over public metro. The absolute delta is: Cab Spend − Metro Equivalent Spend. This rupee amount is then expressed as a percentage of your Total Monthly Budget to show its true weight. This avoids the misleading 400% item-to-item ratio.',
  },
  'pink-tax': {
    label: 'Pink Tax',
    body:
      'The Pink Tax is the price premium paid for gendered versions of identical products (e.g., razors, skincare, hygiene items). Delta = Gendered Spend − Generic Equivalent Spend. Impact % = Delta ÷ Total Monthly Spend × 100. Source: documented across FMCG categories by international consumer research.',
  },
  'adjusted-rupee': {
    label: 'The Adjusted Rupee',
    body:
      'Starting with ₹100, this metric shows the real purchasing power after accounting for both your personal inflation rate AND hidden cost impact. Formula: ₹100 × (1 − (Personal Inflation % + Hidden Cost %) ÷ 100). The orange portion is the value that has evaporated from your sovereign rupee.',
  },
}

export function FootnoteDrawer({ footnote, onClose }: FootnoteDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (footnote) {
      document.body.style.overflow = ''
    }
  }, [footnote])

  const data = footnote ? FOOTNOTES[footnote.id] ?? { label: footnote.label, body: footnote.body } : null

  return (
    <>
      {/* Invisible click-outside trap */}
      {footnote && (
        <div
          className="fixed inset-0 z-[99]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        ref={drawerRef}
        className={`footnote-drawer ${footnote ? 'open' : ''}`}
        role="complementary"
        aria-label="Footnote explanation"
        aria-hidden={!footnote}
      >
        {data && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <span className="type-label text-muted">Footnote</span>
              <button
                onClick={onClose}
                className="type-label text-muted hover:text-ink transition-colors"
                aria-label="Close footnote"
              >
                ✕
              </button>
            </div>

            {/* Footnote number + title */}
            <div className="mb-6">
              <p className="type-label text-muted mb-2">
                {footnote?.id.toUpperCase().replace(/-/g, ' ')}
              </p>
              <h2 className="type-subheading text-ink">{data.label}</h2>
            </div>

            <div className="k-rule mb-6" />

            {/* Body */}
            <p className="type-body text-ink leading-relaxed">{data.body}</p>

            {/* Footer rule */}
            <div className="k-rule mt-8" />
            <p className="type-label text-dim mt-4">
              Press <kbd className="border border-rule px-1 py-0.5 font-mono text-xs">ESC</kbd> to close
            </p>
          </>
        )}
      </aside>
    </>
  )
}

// Convenience hook for managing footnote state
export function useFootnote() {
  const [activeFootnote, setActiveFootnote] = React.useState<{
    id: string
    label: string
    body: string
  } | null>(null)

  const openFootnote = (id: string, label = '', body = '') =>
    setActiveFootnote({ id, label, body })

  const closeFootnote = () => setActiveFootnote(null)

  return { activeFootnote, openFootnote, closeFootnote }
}

// Inline info button — replaces numbered footnote refs
export function Fn({ id, num }: { id: string; num?: number }) {
  const ctx = React.useContext(FootnoteContext)
  return (
    <button
      className="info-btn"
      onClick={() => ctx?.open(id)}
      aria-label={`More info`}
      title="Click for explanation"
    >
      i
    </button>
  )
}

// Context so child components can open drawer without prop drilling
export const FootnoteContext = React.createContext<{
  open: (id: string) => void
} | null>(null)
