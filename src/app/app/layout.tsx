'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      createClient().auth.getUser().then(({ data }) => {
        if (!data.user) {
          router.replace('/login')
        } else {
          setReady(true)
        }
      })
    })
  }, [router])

  if (!ready) return null

  return <>{children}</>
}
