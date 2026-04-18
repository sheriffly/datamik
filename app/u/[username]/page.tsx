'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { normalizeUsername } from '../../../lib/profile'

type PublicProfile = {
  username: string
  name: string | null
  bio: string | null
  avatar_url: string | null
  website_url: string | null
  social_links: Record<string, string> | null
}

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<PublicProfile | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      setError('')

      const username = normalizeUsername(params?.username || '')
      if (!username) {
        setError('Invalid profile username.')
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('username, name, bio, avatar_url, website_url, social_links')
        .eq('username', username)
        .maybeSingle()

      if (fetchError) {
        setError(fetchError.message || 'Failed to load profile.')
      } else {
        setProfile((data as PublicProfile | null) || null)
      }

      setLoading(false)
    }

    loadProfile()
  }, [params?.username])

  return (
    <main className="min-h-screen bg-white px-5 py-8 text-black sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/"
          className="mb-6 inline-block rounded-lg border border-black/20 px-4 py-2 text-sm transition hover:border-black hover:bg-black hover:text-white"
        >
          Back Home
        </Link>

        {loading && (
          <div className="rounded-xl border border-black/10 p-6 text-sm text-gray-500">
            Loading profile...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && !profile && (
          <div className="rounded-xl border border-black/10 p-6 text-sm text-gray-500">
            Profile not found.
          </div>
        )}

        {!loading && !error && profile && (
          <section className="space-y-6 rounded-xl border border-black/10 p-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Image
                src={profile.avatar_url || '/avatar-default.svg'}
                alt={profile.username}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border border-black/10 object-cover"
              />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {profile.name || profile.username}
                </h1>
                <p className="mt-1 text-sm text-gray-500">@{profile.username}</p>
              </div>
            </div>

            {profile.bio && (
              <p className="text-sm leading-6 text-gray-700">{profile.bio}</p>
            )}

            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-block text-sm underline underline-offset-4"
              >
                {profile.website_url}
              </a>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
