'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import {
  isValidUsername,
  normalizeUsername,
  normalizeWebsiteUrl,
} from '../../lib/profile'

type ProfileRow = {
  id: string
  username: string | null
  name: string | null
  bio: string | null
  avatar_url: string | null
  website_url: string | null
  social_links: Record<string, string> | null
}

type FormState = {
  username: string
  name: string
  bio: string
  website_url: string
  twitter_url: string
  linkedin_url: string
}

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [form, setForm] = useState<FormState>({
    username: '',
    name: '',
    bio: '',
    website_url: '',
    twitter_url: '',
    linkedin_url: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')

      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) {
        setError('Please log in to manage your profile.')
        setLoading(false)
        return
      }

      setUserId(authData.user.id)
      setEmail(authData.user.email || '')

      // Ensure profile row exists for the signed-in user.
      await supabase.from('profiles').upsert({ id: authData.user.id }, { onConflict: 'id' })

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, name, bio, avatar_url, website_url, social_links')
        .eq('id', authData.user.id)
        .maybeSingle()

      if (profileError) {
        setError(profileError.message || 'Failed to load profile.')
      } else if (profile) {
        const row = profile as ProfileRow
        setForm({
          username: row.username || '',
          name: row.name || '',
          bio: row.bio || '',
          website_url: row.website_url || '',
          twitter_url: row.social_links?.twitter || '',
          linkedin_url: row.social_links?.linkedin || '',
        })
      }

      setLoading(false)
    }

    load()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId) return

    setError('')
    setSuccess('')

    const username = normalizeUsername(form.username)
    const websiteUrl = normalizeWebsiteUrl(form.website_url)

    if (!username) {
      setError('Username is required.')
      return
    }

    if (!isValidUsername(username)) {
      setError('Username must be 3-30 characters (a-z, 0-9, underscore).')
      return
    }

    if (websiteUrl) {
      try {
        new URL(websiteUrl)
      } catch {
        setError('Website URL is invalid.')
        return
      }
    }

    setSaving(true)

    const { data: existing, error: existingError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .neq('id', userId)
      .maybeSingle()

    if (existingError) {
      setSaving(false)
      setError(existingError.message || 'Failed to validate username.')
      return
    }

    if (existing) {
      setSaving(false)
      setError('Username is already taken.')
      return
    }

    const { error: upsertError } = await supabase.from('profiles').upsert(
      {
        id: userId,
        username,
        name: form.name.trim() || null,
        bio: form.bio.trim() || null,
        website_url: websiteUrl || null,
        social_links: {
          twitter: form.twitter_url.trim() || null,
          linkedin: form.linkedin_url.trim() || null,
        },
      },
      { onConflict: 'id' }
    )

    setSaving(false)

    if (upsertError) {
      if (upsertError?.code === '23505') {
        setError('Username already taken.')
        return
      }
      setError(upsertError.message || 'Failed to save profile.')
      return
    }

    setForm((prev) => ({
      ...prev,
      username,
      website_url: websiteUrl,
      twitter_url: prev.twitter_url.trim(),
      linkedin_url: prev.linkedin_url.trim(),
    }))
    setSuccess('Profile saved.')
  }

  return (
    <main className="min-h-screen bg-white px-5 py-8 text-black sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex flex-col gap-3 border-b border-black/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Your Profile</h1>
            <p className="mt-2 text-sm text-gray-500">
              Public profile for Datamik users.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-black/20 px-4 py-2 text-center text-sm transition hover:border-black hover:bg-black hover:text-white"
          >
            Home
          </Link>
        </div>

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

        {!loading && userId && (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-xl border border-black/10 p-6"
          >
            {email && (
              <p className="text-xs text-gray-500">
                Signed in as <span className="text-black">{email}</span>
              </p>
            )}

            <div>
              <label htmlFor="username" className="mb-2 block text-sm">
                Username <span className="text-gray-500">(required)</span>
              </label>
              <input
                id="username"
                type="text"
                value={form.username}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, username: e.target.value }))
                }
                placeholder="john_doe"
                className="w-full rounded-lg border border-black/20 px-4 py-2 text-sm outline-none transition focus:border-black focus-visible:ring-2 focus-visible:ring-black/20"
                disabled={saving}
                required
              />
            </div>

            <div>
              <label htmlFor="name" className="mb-2 block text-sm">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                className="w-full rounded-lg border border-black/20 px-4 py-2 text-sm outline-none transition focus:border-black focus-visible:ring-2 focus-visible:ring-black/20"
                disabled={saving}
              />
            </div>

            <div>
              <label htmlFor="bio" className="mb-2 block text-sm">
                Bio
              </label>
              <textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Short bio"
                rows={4}
                className="w-full rounded-lg border border-black/20 px-4 py-2 text-sm outline-none transition focus:border-black focus-visible:ring-2 focus-visible:ring-black/20"
                disabled={saving}
              />
            </div>

            <div>
              <label htmlFor="website_url" className="mb-2 block text-sm">
                Website URL
              </label>
              <input
                id="website_url"
                type="url"
                value={form.website_url}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, website_url: e.target.value }))
                }
                onBlur={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    website_url: normalizeWebsiteUrl(e.target.value),
                  }))
                }
                placeholder="https://example.com"
                className="w-full rounded-lg border border-black/20 px-4 py-2 text-sm outline-none transition focus:border-black focus-visible:ring-2 focus-visible:ring-black/20"
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="twitter_url" className="mb-2 block text-sm">
                  Twitter
                </label>
                <input
                  id="twitter_url"
                  type="url"
                  value={form.twitter_url}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, twitter_url: e.target.value }))
                  }
                  placeholder="https://x.com/username"
                  className="w-full rounded-lg border border-black/20 px-4 py-2 text-sm outline-none transition focus:border-black focus-visible:ring-2 focus-visible:ring-black/20"
                  disabled={saving}
                />
              </div>
              <div>
                <label htmlFor="linkedin_url" className="mb-2 block text-sm">
                  LinkedIn
                </label>
                <input
                  id="linkedin_url"
                  type="url"
                  value={form.linkedin_url}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, linkedin_url: e.target.value }))
                  }
                  placeholder="https://linkedin.com/in/username"
                  className="w-full rounded-lg border border-black/20 px-4 py-2 text-sm outline-none transition focus:border-black focus-visible:ring-2 focus-visible:ring-black/20"
                  disabled={saving}
                />
              </div>
            </div>

            {success && (
              <p className="rounded-lg border border-black/20 bg-black px-3 py-2 text-sm text-white">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg border border-black px-5 py-2 text-sm transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
