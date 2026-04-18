'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [isSendingEmailLink, setIsSendingEmailLink] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  const loginWithEmail = async () => {
    if (!email) return
    setIsSendingEmailLink(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Check your email for login link')
    }

    setIsSendingEmailLink(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <main className="min-h-screen bg-white px-5 py-8 text-black sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col justify-between">

        {/* NAVBAR */}
        <div className="flex flex-col gap-4 border-b border-black/10 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Datamik" width={26} height={26} />
            <span className="text-lg font-medium tracking-tight">Datamik</span>
          </Link>

          {user ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href="/profile"
                className="rounded-lg border border-black/20 px-4 py-2 text-center text-sm transition hover:border-black hover:bg-black hover:text-white"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="rounded-lg border border-black/20 px-4 py-2 text-sm transition hover:border-black hover:bg-black hover:text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[460px] sm:gap-3">
              <button
                onClick={loginWithGoogle}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/20 px-4 py-2.5 text-sm transition hover:border-black hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M21.8 12.2c0-.8-.1-1.4-.2-2.1H12v3.9h5.5c-.1 1-.8 2.5-2.2 3.5l3.3 2.6c1.9-1.8 3.2-4.5 3.2-7.9Z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.3-2.6c-.9.6-2.1 1-3.6 1-2.8 0-5.1-1.9-6-4.4l-3.4 2.6C4.3 19.6 7.9 22 12 22Z"
                  />
                  <path
                    fill="currentColor"
                    d="M6 13.5c-.2-.6-.3-1.1-.3-1.7s.1-1.2.3-1.7L2.6 7.5A10 10 0 0 0 2 11.8c0 1.5.4 2.9 1.1 4.2L6 13.5Z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.6c1.8 0 3 .8 3.7 1.4l2.7-2.7C16.9 2.8 14.8 2 12 2 7.9 2 4.3 4.4 2.6 7.5L6 10.1c.9-2.5 3.2-4.5 6-4.5Z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-black/20 px-3 py-2.5 text-sm outline-none transition focus:border-black focus-visible:ring-2 focus-visible:ring-black/20 sm:min-w-[220px]"
                />

                <button
                  onClick={loginWithEmail}
                  disabled={!email || isSendingEmailLink}
                  className="rounded-lg border border-black/20 px-4 py-2.5 text-sm transition hover:border-black hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSendingEmailLink ? 'Sending...' : 'Continue with Email'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* HERO */}
        <div className="mt-16 flex flex-col items-center text-center sm:mt-24">
          <div className="w-full max-w-2xl">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Structured company data,
              <br />
              made simple.
            </h2>

            <p className="mt-5 text-sm text-gray-500 sm:mt-6 md:text-base">
              Datamik is a clean, minimal platform to explore and manage
              structured company data — verified, organized, and easy to use.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/companies"
                className="rounded-xl bg-black px-6 py-3 text-center text-sm text-white transition hover:opacity-80"
              >
                Explore Companies
              </Link>

              <Link
                href="/add-company"
                className="rounded-xl border border-black px-6 py-3 text-center text-sm transition hover:bg-black hover:text-white"
              >
                Add Company
              </Link>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-16 text-center text-xs text-gray-400 sm:mt-24">
          © {new Date().getFullYear()} Datamik
        </div>
      </div>
    </main>
  )
}