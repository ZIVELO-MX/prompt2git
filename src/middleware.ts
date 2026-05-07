import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    },
  )

  // Refresh session — imprescindible para que las cookies no expiren
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // /app/* requiere sesión activa
  if (pathname.startsWith('/app') && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.delete('redirect_uri')
    return NextResponse.redirect(loginUrl)
  }

  // Usuario ya autenticado no necesita ir a /login
  if (pathname === '/login' && user) {
    const appUrl = request.nextUrl.clone()
    appUrl.pathname = '/app'
    return NextResponse.redirect(appUrl)
  }

  return response
}

export const config = {
  matcher: ['/app/:path*', '/login'],
}
