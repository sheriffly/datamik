'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

type Company = {
  id: string
  name: string
  domain: string
  industry: string | null
  description: string | null
  claim_status?: 'unclaimed' | 'pending' | 'claimed' | null
  claimed_by?: string | null
}

const normalizeDomain = (domain: string) =>
  domain
    .trim()
    .toLowerCase()
    .replace('https://', '')
    .replace('http://', '')
    .replace('www.', '')

const getEmailDomain = (email: string) => {
  return email.split('@')[1]?.toLowerCase()
}

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>()

  const [company, setCompany] = useState<Company | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch company
  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true)
      setError('')

      if (!params?.id) {
        setError('Invalid company id.')
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('companies')
        .select('id, name, domain, industry, description, claim_status, claimed_by')
        .eq('id', params.id)
        .maybeSingle()

      if (fetchError) {
        setError(fetchError.message || 'Failed to load company.')
        setLoading(false)
        return
      }

      setCompany((data as Company | null) || null)
      setLoading(false)
    }

    fetchCompany()
  }, [params?.id])

  // Fetch user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  const normalizedDomain = company ? normalizeDomain(company.domain) : ''
  const websiteUrl = normalizedDomain ? `https://${normalizedDomain}` : ''

  const userDomain = user?.email ? getEmailDomain(user.email) : ''

  const domainMatches =
    Boolean(normalizedDomain) &&
    Boolean(userDomain) &&
    (userDomain === normalizedDomain || userDomain.endsWith(`.${normalizedDomain}`))

  const isAlreadyClaimed = !!company?.claimed_by
  const isClaimed =
    company?.claim_status === 'claimed' || Boolean(company?.claimed_by)
  const isOwner = Boolean(user && company?.claimed_by === user.id)
  const canClaim = Boolean(user && !isAlreadyClaimed && domainMatches)

  const handleClaim = async () => {
    if (!user || !company) return

    const { error } = await supabase
      .from('companies')
      .update({
        claimed_by: user.id,
        claim_status: 'claimed',
      })
      .eq('id', company.id)
      .is('claimed_by', null)

    if (error) {
      alert(error.message)
    } else {
      alert('Company claimed successfully!')
      setCompany({
        ...company,
        claimed_by: user.id,
        claim_status: 'claimed',
      })
    }
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-black">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/companies"
          className="mb-6 inline-block rounded-lg border border-black px-4 py-2 text-sm transition hover:bg-black hover:text-white"
        >
          Back to Companies
        </Link>

        {loading && (
          <div className="rounded-xl border border-black/10 p-6 text-sm text-gray-500">
            Loading company...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && !company && (
          <div className="rounded-xl border border-black/10 p-6 text-sm text-gray-500">
            Company not found.
          </div>
        )}

        {!loading && !error && company && (
          <section className="rounded-xl border border-black/10 p-6 space-y-6">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {company.name}
              </h1>
              {isClaimed && (
                <span className="rounded-full border border-black px-3 py-1 text-xs uppercase tracking-wide">
                  Claimed
                </span>
              )}
            </div>

            {isOwner && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-black/10 p-4">
                <p className="text-sm text-gray-700">You own this company</p>
                <Link
                  href={`/companies/${company.id}/edit`}
                  className="rounded-lg border border-black px-4 py-2 text-sm transition hover:bg-black hover:text-white"
                >
                  Edit Company
                </Link>
              </div>
            )}

            {/* CLAIM UI */}
            <div className="mt-2">
              {!user && (
                <p className="text-sm text-gray-500">
                  Log in to claim this company.
                </p>
              )}

              {user && isAlreadyClaimed && !isOwner && (
                <p className="text-sm text-gray-500">
                  This company has already been claimed.
                </p>
              )}

              {user && !isAlreadyClaimed && !canClaim && (
                <p className="text-sm text-gray-500">
                  You are not eligible to claim this company.
                </p>
              )}

              {canClaim && (
                <button
                  onClick={handleClaim}
                  className="mt-2 rounded-lg border border-black px-4 py-2 text-sm transition hover:bg-black hover:text-white"
                >
                  Claim this company
                </button>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Domain
                </p>
                {normalizedDomain ? (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm underline underline-offset-4 hover:text-black"
                  >
                    {normalizedDomain}
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">
                    No domain available
                  </p>
                )}
              </div>

              <div className="border-t border-black/5 pt-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Industry
                </p>
                <p className="mt-1 text-sm">
                  {company.industry || 'Industry not specified'}
                </p>
              </div>

              <div className="border-t border-black/5 pt-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Description
                </p>
                {company.description ? (
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
                    {company.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    No description available.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}