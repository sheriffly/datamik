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
    <main className="flex min-h-screen items-center justify-center flex-col gap-4">
      {user ? (
        <>
          <p>Welcome {user.email}</p>
          <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded">
            Logout
          </button>
        </>
      ) : (
        <button 
          onClick={loginWithGoogle}
          className="px-6 py-3 bg-black text-white rounded-xl"
        >
          Login with Google
        </button>
      )}
    </main>
  )
}