'use client'

import React, { useEffect, useRef } from 'react'

interface AdjustedRupeeProps {
  realValue: number
  evaporated: number
  personalInflation: number
  hiddenCostImpact: number
  isLoading?: boolean
}

export default function AdjustedRupee({
  realValue,
  evaporated,
  personalInflation,
  hiddenCostImpact,
  isLoading = false,
}: AdjustedRupeeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 220
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - 14
    const strokeWidth = size * 0.13

    const evaporatedFraction = Math.min(evaporated / 100, 1)
    const realFraction = 1 - evaporatedFraction

    // Track
    ctx.beginPath()
    ctx.arc(cx, cy, radius, -Math.PI / 2, Math.PI * 1.5)
    ctx.strokeStyle = '#E8E8E8'
    ctx.lineWidth = strokeWidth
    ctx.lineCap = 'butt'
    ctx.stroke()

    // Real value arc (black)
    if (realFraction > 0) {
      ctx.beginPath()
      ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * realFraction)
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'butt'
      ctx.stroke()
    }

    // Evaporated arc (orange)
    if (evaporatedFraction > 0) {
      ctx.beginPath()
      ctx.arc(cx, cy, radius, -Math.PI / 2 + Math.PI * 2 * realFraction, Math.PI * 1.5)
      ctx.strokeStyle = '#FF4F00'
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'butt'
      ctx.stroke()
    }
  }, [realValue, evaporated])

  return (
    // Two-column grid: ring on left, data on right
    <div className="adjusted-rupee-wrap">
      {/* Left: canvas ring with centred label */}
      <div className="adjusted-rupee-canvas-col">
        <div style={{ position: 'relative', width: 220, height: 220, flexShrink: 0 }}>
          <canvas
            ref={canvasRef}
            aria-label={`₹100 real value: ₹${realValue.toFixed(2)}`}
          />
          {/* Centre label — absolutely centred within the 220×220 square */}
          <div
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <span
              className="type-label text-muted"
              style={{ marginBottom: '0.25rem', textAlign: 'center' }}
            >
              ₹100 is worth
            </span>
            <span
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '1.75rem',
                fontWeight: 700,
                lineHeight: 1,
                color: 'var(--color-ink)',
              }}
            >
              {isLoading ? '—' : `₹${realValue.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Legend dots below canvas */}
        <div className="flex items-center gap-5 mt-5">
          <div className="flex items-center gap-2">
            <div style={{ width: 10, height: 10, background: 'var(--color-ink)', flexShrink: 0 }} />
            <span className="type-label text-muted">Real</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 10, height: 10, background: 'var(--color-leak)', flexShrink: 0 }} />
            <span className="type-label" style={{ color: 'var(--color-leak)' }}>Evaporated</span>
          </div>
        </div>
      </div>

      {/* Right: data breakdown */}
      <div className="adjusted-rupee-data-col">
        {/* Big numbers row */}
        <div className="grid grid-cols-2 gap-0" style={{ border: '1px solid var(--color-rule)' }}>
          <div style={{ padding: '1.5rem 1.75rem', borderRight: '1px solid var(--color-rule)' }}>
            <p className="type-label text-muted" style={{ marginBottom: '0.625rem' }}>Real Value</p>
            <p style={{ fontFamily: 'var(--font-data)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, lineHeight: 1, color: 'var(--color-ink)' }}>
              {isLoading ? '—' : `₹${realValue.toFixed(2)}`}
            </p>
          </div>
          <div style={{ padding: '1.5rem 1.75rem' }}>
            <p className="type-label" style={{ color: 'var(--color-leak)', marginBottom: '0.625rem' }}>Evaporated</p>
            <p style={{ fontFamily: 'var(--font-data)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, lineHeight: 1, color: 'var(--color-leak)' }}>
              {isLoading ? '—' : `₹${evaporated.toFixed(2)}`}
            </p>
          </div>
        </div>

        {/* Breakdown bars */}
        <div>
          <div className="flex justify-between items-baseline mb-3">
            <span className="type-label text-muted">Inflation Erosion</span>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '0.9375rem', color: 'var(--color-leak)' }}>
              {isLoading ? '—' : `${personalInflation.toFixed(2)}pp`}
            </span>
          </div>
          <div className="leak-bar" style={{ marginBottom: '1.75rem' }}>
            <div className="leak-bar-fill" style={{ width: `${Math.min(personalInflation * 6, 100)}%` }} />
          </div>

          <div className="flex justify-between items-baseline mb-3">
            <span className="type-label text-muted">Hidden Cost Drain</span>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '0.9375rem', color: 'var(--color-leak)' }}>
              {isLoading ? '—' : `${hiddenCostImpact.toFixed(2)}%`}
            </span>
          </div>
          <div className="leak-bar" style={{ marginBottom: '2rem' }}>
            <div className="leak-bar-fill" style={{ width: `${Math.min(hiddenCostImpact * 10, 100)}%` }} />
          </div>

          <p className="type-label text-dim" style={{ lineHeight: 1.6 }}>
            Real Value = ₹100 × (1 − (Inflation + Hidden Costs) ÷ 100)
          </p>
        </div>
      </div>
    </div>
  )
}
