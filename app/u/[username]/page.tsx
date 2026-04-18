import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { normalizeUsername } from '../../../lib/profile'

type PublicProfile = {
  id: string
  username: string
  name: string | null
  bio: string | null
  avatar_url: string | null
  website_url: string | null
  created_at: string | null
}

type ClaimedCompany = {
  id: string
  name: string
  domain: string
  industry: string | null
}

type PageProps = {
  params: { username: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username: rawUsername } = params
  const username = normalizeUsername(rawUsername || '')
  return {
    title: `${username} | Datamik`,
    description: `View ${username}'s profile on Datamik`,
    openGraph: {
      title: `${username} | Datamik`,
      description: `View ${username}'s profile on Datamik`,
    },
    alternates: {
      canonical: `https://datamik.com/u/${username}`,
    },
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username: rawUsername } = params
  const username = normalizeUsername(rawUsername || '')
  const cookieStore = await cookies()
  const cookieAdapter = {
    getAll: () => cookieStore.getAll(),
    get: (name: string) => cookieStore.get(name)?.value,
  }
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieAdapter as never,
    }
  )

  if (!username) {
    return (
      <main className="min-h-screen bg-white px-5 py-8 text-black sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded-xl border border-black/10 p-6 text-sm text-gray-600">
            Profile not found
          </div>
        </div>
      </main>
    )
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, name, bio, avatar_url, website_url, created_at')
    .eq('username', username)
    .maybeSingle()

  if (profileError || !profileData) {
    return (
      <main className="min-h-screen bg-white px-5 py-8 text-black sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded-xl border border-black/10 p-6 text-sm text-gray-600">
            Profile not found
          </div>
        </div>
      </main>
    )
  }

  const profile = profileData as PublicProfile
  const { data: authData } = await supabase.auth.getUser()
  const isOwnProfile = authData.user?.id === profile.id

  const { data: claimedCompaniesData } = await supabase
    .from('companies')
    .select('id, name, domain, industry')
    .eq('claimed_by', profile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const claimedCompanies = (claimedCompaniesData as ClaimedCompany[] | null) || []
  const displayName = profile.name?.trim() || profile.username
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
  const joinedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
      })
    : null

  return (
    <main className="min-h-screen bg-white px-5 py-8 text-black sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="text-sm text-gray-500">Profile</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/"
              className="inline-block rounded-lg border border-black/20 px-4 py-2 text-center text-sm transition hover:border-black hover:bg-black hover:text-white"
            >
              Back Home
            </Link>
            {isOwnProfile && (
              <Link
                href="/profile"
                className="inline-block rounded-lg border border-black/20 px-4 py-2 text-center text-sm transition hover:border-black hover:bg-black hover:text-white"
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>
        <section className="space-y-6 rounded-xl border border-black/10 p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.username}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border border-black/10 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-black text-sm font-medium text-white">
                {initials || profile.username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {profile.name || profile.username}
              </h1>
              <p className="mt-1 text-sm text-gray-500">@{profile.username}</p>
              <Link
                href={`/u/${profile.username}`}
                className="mt-1 inline-block text-xs text-gray-400 hover:underline"
              >
                datamik.com/u/{profile.username}
              </Link>
              {joinedDate && (
                <p className="mt-1 text-xs text-gray-400">Joined {joinedDate}</p>
              )}
            </div>
          </div>

          {profile.bio && <p className="text-sm leading-6 text-gray-700">{profile.bio}</p>}

          {profile.website_url && (
            <a
              href={profile.website_url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-block text-sm underline underline-offset-4"
            >
              {profile.website_url
                .replace(/^https?:\/\//, '')
                .replace(/^www\./, '')}
            </a>
          )}

          <div className="border-t border-black/10 pt-5">
            <h2 className="text-base font-medium tracking-tight">Claimed Companies</h2>
            {claimedCompanies.length === 0 ? (
              <div className="mt-3 rounded-lg border border-black/10 p-4">
                <p className="text-sm text-gray-500">No claimed companies yet.</p>
                <p className="mt-1 text-sm text-gray-500">
                  Start by claiming a company.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {claimedCompanies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/companies/${company.id}`}
                    className="block rounded-lg border border-black/10 px-4 py-3 transition hover:border-black hover:bg-black hover:text-white"
                  >
                    <p className="text-sm font-medium">{company.name}</p>
                    <p className="mt-1 text-xs text-gray-500 hover:text-inherit">
                      {company.domain
                        .replace(/^https?:\/\//, '')
                        .replace(/^www\./, '')}
                      {company.industry ? ` · ${company.industry}` : ''}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
