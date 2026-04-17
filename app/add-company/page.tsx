'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type FormState = {
  name: string
  domain: string
  industry: string
  website_url: string
}

const initialFormState: FormState = {
  name: '',
  domain: '',
  industry: '',
  website_url: '',
}

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
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState('')

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

    setIsSubmitting(true)

    try {
      const normalizedDomain = normalizeDomain(form.domain)

      const payload = {
        name: form.name.trim(),
        domain: normalizedDomain,
        industry: form.industry.trim() || null,
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
            <label htmlFor="industry" className="mb-2 block text-sm">
              Industry
            </label>
            <input
              id="industry"
              name="industry"
              type="text"
              value={form.industry}
              disabled={isSubmitting}
              onChange={(e) => setForm((prev) => ({ ...prev, industry: e.target.value }))}
              className="w-full rounded-lg border border-black/20 px-4 py-2 text-sm outline-none transition focus:border-black"
              placeholder="Software"
            />
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
