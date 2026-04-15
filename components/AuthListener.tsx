"use client"
import { useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useUserStore } from "@/store/useUserStore"

export default function AuthListener() {
    const setUser = useUserStore((state) => state.setUser)
    const clearUser = useUserStore((state) => state.clearUser)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    useEffect(() => {
        //1. Check active session on mount
        const checkUser = async () => {
            const {data: {user}} = await supabase.auth.getUser()
            if(user) {
                setUser(user)
            }
        }
        checkUser()

        //2. Listen for Login/Logout events
        const {data: {subscription}} = supabase.auth.onAuthStateChange((event, session) => {
            if(session?.user) {
                setUser(session.user)
            } else {
                clearUser()
            }
        })

        return () => subscription.unsubscribe()
    }, [setUser, clearUser])

    return null
}