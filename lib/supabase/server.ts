import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = cookies()

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // safe to ignore
            }
          },
        },
      }
    )

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      // eslint-disable-next-line no-console
      console.warn("Supabase session error:", error.message)
    }

    if (!session) {
      // eslint-disable-next-line no-console
      console.warn("⚠️ No Supabase session found. Continuing unauthenticated.")
    }

    return supabase
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error creating Supabase client:", err)

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      }
    )
  }
}
