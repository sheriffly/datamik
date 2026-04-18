'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

type FormState = {
  name: string
  domain: string
  website_url: string
}

const initialFormState: FormState = {
  name: '',
  domain: '',
  website_url: '',
}

const INDUSTRY_OPTIONS = [
  'SaaS',
  'Fintech',
  'E-commerce',
  'AI',
  'Healthcare',
  'Edtech',
  'Marketplace',
]

const normalizeIndustry = (value: string) => value.trim().toLowerCase()

const formatIndustryLabel = (value: string) =>
  value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const normalizeDomain = (domain: string) =>
  domain
    .trim()
    .toLowerCase()
    .replace('https://', '')
    .replace('http://', '')
    .replace('www.', '')

const normalizeWebsiteUrl = (url: string) => {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  return `https://${trimmed}`
}

export default function AddCompanyPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [industryQuery, setIndustryQuery] = useState('')
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false)
  const [showCustomIndustryInput, setShowCustomIndustryInput] = useState(false)
  const [customIndustry, setCustomIndustry] = useState('')

  const normalizedOptionSet = new Set(
    INDUSTRY_OPTIONS.map((option) => normalizeIndustry(option))
  )
  const normalizedIndustryQuery = normalizeIndustry(industryQuery)
  const filteredIndustries = INDUSTRY_OPTIONS.filter((option) =>
    normalizeIndustry(option).includes(normalizedIndustryQuery)
  )

  const addIndustry = (value: string) => {
    const normalized = normalizeIndustry(value)
    if (!normalized) return
    if (selectedIndustries.includes(normalized)) return
    if (selectedIndustries.length >= 3) {
      setError('You can select up to 3 industries.')
      return
    }

    setSelectedIndustries((prev) => [...prev, normalized])
    setIndustryQuery('')
    setShowIndustryDropdown(false)
    setShowCustomIndustryInput(false)
    setCustomIndustry('')
    setError('')
  }

  const removeIndustry = (value: string) => {
    setSelectedIndustries((prev) => prev.filter((item) => item !== value))
  }

 useEffect(() => {
  const loadUser = async () => {
    const { data, error: authError } = await supabase.auth.getUser()

    if (authError || !data.user) {
      setIsLoggedIn(false)
      setUser(null)
    } else {
      setIsLoggedIn(true)
      setUser(data.user)
    }

    setIsCheckingAuth(false)
  }

  loadUser()
}, [])

useEffect(() => {
  const handleClickOutside = () => {
    setShowIndustryDropdown(false)
    setShowCustomIndustryInput(false)
  }

  document.addEventListener('click', handleClickOutside)

  return () => {
    document.removeEventListener('click', handleClickOutside)
  }
}, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError('')

    if (!form.name.trim() || !form.domain.trim()) {
      setError('Name and domain are required.')
      return
    }

    if (form.domain.includes(' ')) {
      setError('Domain cannot contain spaces.')
      return
    }

    const normalizedWebsiteUrl = normalizeWebsiteUrl(form.website_url)

    if (normalizedWebsiteUrl) {
      try {
        new URL(normalizedWebsiteUrl)
      } catch {
        setError('Invalid website URL')
        return
      }
    }

    if (!isLoggedIn) {
      setError('You must be logged in to add a company.')
      return
    }

    if (!user) {
      setError('You must be logged in to add a company.')
      return
    }

    if (selectedIndustries.length > 3) {
      setError('You can select up to 3 industries.')
      return
    }

    setIsSubmitting(true)

    try {
      const normalizedDomain = normalizeDomain(form.domain)

      const payload = {
        name: form.name.trim(),
        domain: normalizedDomain,
        industries: selectedIndustries.length > 0 ? selectedIndustries : null,
        website_url: normalizedWebsiteUrl || null,
        created_by: user.id,
      }

      const { error: insertError } = await supabase.from('companies').insert(payload)

      if (insertError) {
        if (insertError?.message?.toLowerCase().includes('duplicate')) {
          setError('A company with this domain already exists.')
          return
        }
        setError(insertError.message || 'Failed to add company.')
        return
      }

      setForm(initialFormState)
      setSelectedIndustries([])
      setIndustryQuery('')
      setShowIndustryDropdown(false)
      setShowCustomIndustryInput(false)
      setCustomIndustry('')
      router.push('/companies')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">Add Company</h1>
        <p className="mt-2 text-sm text-gray-500">
          Add a new company profile to Datamik.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-xl border border-black/10 p-6 space-y-5"
        >
          <div>
            <label htmlFor="name" className="mb-2 block text-sm">
              Name <span className="text-gray-500">(required)</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              disabled={isSubmitting}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-black/20 px-4 py-2 text-sm outline-none transition focus:border-black"
              placeholder="Acme Inc."
            />
          </div>

          <div>
            <label htmlFor="domain" className="mb-2 block text-sm">
              Domain <span className="text-gray-500">(required)</span>
            </label>
            <input
              id="domain"
              name="domain"
              type="text"
              required
              value={form.domain}
              disabled={isSubmitting}
              onChange={(e) => {
                const nextDomain = e.target.value
                const normalized = normalizeDomain(nextDomain)

                setForm((prev) => ({
                  ...prev,
                  domain: nextDomain,
                  website_url:
                    prev.website_url.trim() === '' && normalized
                      ? `https://${normalized}`
                      : prev.website_url,
                }))
              }}
              className="w-full rounded-lg border border-black/20 px-4 py-2 text-sm outline-none transition focus:border-black"
              placeholder="acme.com"
            />
          </div>

          <div>
            <label htmlFor="industry-search" className="mb-2 block text-sm">
              Industries <span className="text-gray-500">(up to 3)</span>
            </label>

            {selectedIndustries.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {selectedIndustries.map((industry) => (
                  <span
                    key={industry}
                    className="inline-flex items-center gap-2 rounded-full border border-black/20 px-3 py-1 text-xs"
                  >
                    {formatIndustryLabel(industry)}
                    <button
                      type="button"
                      onClick={() => removeIndustry(industry)}
                      className="text-gray-500 transition hover:text-black"
                      aria-label={`Remove ${industry}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative">
              <input
                id="industry-search"
                type="text"
                value={industryQuery}
                disabled={isSubmitting || selectedIndustries.length >= 3}
                onFocus={() => setShowIndustryDropdown(true)}
                onChange={(e) => {
                  setIndustryQuery(e.target.value)
                  setShowIndustryDropdown(true)
                  setShowCustomIndustryInput(false)
                  setError('')
                }}
                className="w-full rounded-lg border border-black/20 px-4 py-2 text-sm outline-none transition focus:border-black disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={
                  selectedIndustries.length >= 3
                    ? 'Maximum 3 selected'
                    : 'Search industries'
                }
              />

              {showIndustryDropdown && selectedIndustries.length < 3 && (
                <div className="absolute z-10 mt-2 w-full rounded-lg border border-black/10 bg-white p-1 shadow-sm">
                  {filteredIndustries.length > 0 ? (
                    filteredIndustries.map((option) => {
                      const normalized = normalizeIndustry(option)
                      const isSelected = selectedIndustries.includes(normalized)

                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={isSelected}
                          onClick={() => addIndustry(option)}
                          className="block w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {option}
                        </button>
                      )
                    })
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCustomIndustryInput(true)}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-black/5"
                    >
                      Add custom industry
                    </button>
                  )}
                </div>
              )}
            </div>

            {showCustomIndustryInput && selectedIndustries.length < 3 && (
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  placeholder="Custom industry"
                  className="w-full rounded-lg border border-black/20 px-4 py-2 text-sm outline-none transition focus:border-black"
                />
                <button
                  type="button"
                  onClick={() => {
                    const normalized = normalizeIndustry(customIndustry)
                    if (!normalized) return

                    if (normalizedOptionSet.has(normalized)) {
                      setError('This industry already exists in suggestions.')
                      return
                    }

                    if (selectedIndustries.includes(normalized)) {
                      setError('This industry is already selected.')
                      return
                    }

                    addIndustry(customIndustry)
                  }}
                  className="rounded-lg border border-black px-4 py-2 text-sm transition hover:bg-black hover:text-white"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="website_url" className="mb-2 block text-sm">
              Website URL
            </label>
            <input
              id="website_url"
              name="website_url"
              type="url"
              value={form.website_url}
              disabled={isSubmitting}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, website_url: e.target.value }))
              }
              onBlur={(e) => {
                const normalized = normalizeWebsiteUrl(e.target.value)
                setForm((prev) => ({ ...prev, website_url: normalized }))
              }}
              className="w-full rounded-lg border border-black/20 px-4 py-2 text-sm outline-none transition focus:border-black"
              placeholder="https://acme.com"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {!isCheckingAuth && !isLoggedIn && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              Please log in to submit this form.
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isCheckingAuth || !isLoggedIn}
            className="rounded-lg border border-black px-5 py-2 text-sm transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? 'Saving...'
              : isCheckingAuth
                ? 'Checking login...'
                : 'Add Company'}
          </button>
        </form>
      </div>
    </main>
  )
}
