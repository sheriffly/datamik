'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

type Company = {
  id: string
  name: string
  domain: string
  industry: string | null
  industries?: string[] | null
}

const formatIndustryLabel = (value: string) =>
  value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('companies')
        .select('id, name, domain, industry, industries')
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
        setError(fetchError.message || 'Failed to load companies.')
        setLoading(false)
        return
      }

      setCompanies((data as Company[]) || [])
      setLoading(false)
    }

    fetchCompanies()
  }, [])

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-black">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
            <p className="mt-2 text-sm text-gray-500">
              Browse structured company profiles.
            </p>
          </div>
          <Link
            href="/add-company"
            className="rounded-lg border border-black px-4 py-2 text-center text-sm transition hover:bg-black hover:text-white"
          >
            Add Company
          </Link>
        </div>

        {loading && (
          <div className="rounded-xl border border-black/10 p-6 text-sm text-gray-500">
            Loading companies...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && companies.length === 0 && (
          <div className="rounded-xl border border-black/10 p-6 text-sm text-gray-500">
            No companies yet.
          </div>
        )}

        {!loading && !error && companies.length > 0 && (
          <div className="space-y-3 divide-y divide-black/5">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.id}`}
                className="group block cursor-pointer rounded-xl border border-black/10 p-5 transition-all duration-200 hover:bg-black/90 hover:text-white"
              >
                <h2 className="text-lg font-medium tracking-tight">
                  {company.name}
                </h2>
                <p className="mt-1 truncate text-sm text-gray-500 transition-all duration-200 group-hover:text-white">
                  {company.domain.replace('www.', '')}
                </p>
                <p className="mt-2 text-sm opacity-70">
                  {company.industries && company.industries.length > 0
                    ? company.industries
                        .slice(0, 2)
                        .map((industry) => formatIndustryLabel(industry))
                        .join(' · ')
                    : company.industry
                      ? formatIndustryLabel(company.industry)
                      : 'Industry not specified'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}