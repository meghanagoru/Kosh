'use client'

import React, { useState, useCallback } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function MospiUpload() {
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [rates, setRates] = useState<Record<string, number> | null>(null)

  const upload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setStatus('error')
      setMessage('Only CSV files are accepted.')
      return
    }
    setStatus('uploading')
    setMessage('')
    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch(`${API}/api/mospi/upload`, {
        method: 'POST',
        body: form,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || 'Upload failed')
      setStatus('success')
      setMessage(json.message)
      setRates(json.rates)
    } catch (e: unknown) {
      setStatus('error')
      setMessage(e instanceof Error ? e.message : 'Upload failed.')
    }
  }, [])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
  }

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className="border border-rule p-8 text-center transition-colors"
        style={{
          borderColor: dragging ? 'var(--color-ink)' : undefined,
          background: dragging ? 'var(--color-surface)' : undefined,
        }}
      >
        <p className="type-label text-muted mb-4">
          Drop a MOSPI CPI CSV here, or
        </p>
        <label htmlFor="mospi-csv" className="k-btn cursor-pointer">
          Browse CSV
          <input
            id="mospi-csv"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={onFileChange}
          />
        </label>
        <p className="type-label text-dim mt-4">
          Standard MOSPI CPI release format (wide or long)
        </p>
      </div>

      {/* Status */}
      {status !== 'idle' && (
        <div
          className="mt-4 p-4 border"
          style={{
            borderColor: status === 'error' ? 'var(--color-leak)' : 'var(--color-rule)',
          }}
        >
          {status === 'uploading' && (
            <p className="type-label text-muted">Uploading and parsing···</p>
          )}
          {status === 'success' && (
            <>
              <p className="type-label mb-3" style={{ color: 'var(--color-ink)' }}>
                ✓ {message}
              </p>
              {rates && (
                <div className="grid grid-cols-4 gap-0 border border-rule">
                  {Object.entries(rates)
                    .filter(([k]) => ['food', 'housing', 'fuel', 'govt_avg'].includes(k))
                    .map(([key, val]) => (
                      <div key={key} className="p-3 border-r border-rule last:border-r-0">
                        <p className="type-label text-muted">{key.replace('_', ' ')}</p>
                        <p
                          className="type-data-sm mt-1"
                          style={{ fontFamily: 'var(--font-data)', fontWeight: 700 }}
                        >
                          {typeof val === 'number' ? `${val}%` : val}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
          {status === 'error' && (
            <p className="type-label" style={{ color: 'var(--color-leak)' }}>
              ✕ {message}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
