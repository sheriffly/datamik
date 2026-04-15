'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [user, setUser] = useState<any>(null)

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

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <main className="min-h-screen bg-white text-black flex flex-col items-center justify-between px-6 py-10">

      {/* NAVBAR */}
      <div className="w-full max-w-5xl flex justify-between items-center">
        <h1 className="text-lg font-medium tracking-tight">Datamik</h1>

        {user ? (
          <button
            onClick={logout}
            className="text-sm border px-4 py-2 rounded-lg hover:bg-black hover:text-white transition"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="text-sm border px-4 py-2 rounded-lg hover:bg-black hover:text-white transition"
          >
            Login
          </button>
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
          <button className="px-6 py-3 bg-black text-white rounded-xl text-sm hover:opacity-80 transition">
            Explore Companies
          </button>

          <button className="px-6 py-3 border rounded-xl text-sm hover:bg-black hover:text-white transition">
            Add Company
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-xs text-gray-400 mt-24">
        © {new Date().getFullYear()} Datamik
      </div>
    </main>
  )
}