'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')

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

    const { error } = await supabase.auth.signInWithOtp({
      email,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Check your email for login link')
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <main className="min-h-screen bg-white text-black flex flex-col items-center justify-between px-6 py-10">

      {/* NAVBAR */}
      <div className="w-full max-w-5xl flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Datamik" width={26} height={26} />
          <span className="text-lg font-medium tracking-tight">Datamik</span>
        </Link>

        {user ? (
          <button
            onClick={logout}
            className="text-sm border px-4 py-2 rounded-lg hover:bg-black hover:text-white transition"
          >
            Logout
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={loginWithGoogle}
              className="text-sm border px-4 py-2 rounded-lg hover:bg-black hover:text-white transition"
            >
              Google
            </button>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm w-40 outline-none"
            />

            <button
              onClick={loginWithEmail}
              className="text-sm border px-4 py-2 rounded-lg hover:bg-black hover:text-white transition"
            >
              Email
            </button>
          </div>
        )}
      </div>

      {/* HERO */}
      <div className="flex flex-col items-center text-center max-w-2xl mt-24">
        <h2 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
          Structured company data,
          <br />
          made simple.
        </h2>

        <p className="mt-6 text-gray-500 text-sm md:text-base">
          Datamik is a clean, minimal platform to explore and manage
          structured company data — verified, organized, and easy to use.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            href="/companies"
            className="px-6 py-3 bg-black text-white rounded-xl text-sm hover:opacity-80 transition"
          >
            Explore Companies
          </Link>

          <Link
            href="/add-company"
            className="px-6 py-3 border rounded-xl text-sm hover:bg-black hover:text-white transition"
          >
            Add Company
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-xs text-gray-400 mt-24">
        © {new Date().getFullYear()} Datamik
      </div>
    </main>
  )
}