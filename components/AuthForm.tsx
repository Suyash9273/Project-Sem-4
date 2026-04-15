'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner" // <--- NEW IMPORT

export function AuthForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Form States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const COLLEGE_DOMAIN = '@nitdelhi.ac.in'

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 1. FRONTEND CHECK
    // if (!email.endsWith(COLLEGE_DOMAIN)) {
    //   toast.error("Restricted Access", {
    //     description: `Only emails ending in ${COLLEGE_DOMAIN} are allowed.`,
    //   })
    //   setLoading(false)
    //   return
    // }

    // 2. BACKEND CALL
    const { error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (supabaseError) {
      toast.error("Sign Up Failed", {
        description: supabaseError.message,
      })
    } else {
      toast.success("Verification Sent", {
        description: "Check your college email for the confirmation link!",
        duration: 5000,
      })
    }
    setLoading(false)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error("Login Failed", {
        description: error.message,
      })
    } else {
      toast.success("Welcome back!", {
        description: "Redirecting to dashboard...",
      })
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-md mx-auto relative z-10">
      <Tabs defaultValue="login" className="w-full">
        {/* --- TABS LIST: Blocky & Solid --- */}
        <TabsList className="grid w-full grid-cols-2 bg-black p-1 rounded-none h-12">
          <TabsTrigger
            value="login"
            className="rounded-none font-black uppercase tracking-widest data-[state=active]:bg-[#22d3ee] data-[state=active]:text-black text-white transition-all"
          >
            Entry
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            className="rounded-none font-black uppercase tracking-widest data-[state=active]:bg-[#facc15] data-[state=active]:text-black text-white transition-all"
          >
            Register
          </TabsTrigger>
        </TabsList>

        {/* --- LOGIN TAB --- */}
        <TabsContent value="login" className="mt-0">
          <Card className="border-[3px] border-t-0 border-black bg-white dark:bg-zinc-900 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="space-y-1 bg-zinc-50 dark:bg-zinc-800 border-b-2 border-black">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Welcome Back</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase text-black/60 dark:text-white/50">
                Authorized Personnel Only
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="email-login" className="text-[10px] font-black uppercase tracking-widest">College Email</Label>
                  <Input
                    id="email-login"
                    type="email"
                    placeholder="ROLLNUMBER@NITDELHI.AC.IN"
                    className="rounded-none border-2 border-black bg-white dark:bg-zinc-950 focus-visible:ring-0 focus-visible:border-[#22d3ee] font-bold placeholder:text-zinc-300"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login" className="text-[10px] font-black uppercase tracking-widest">Access Key</Label>
                  <Input
                    id="password-login"
                    type="password"
                    className="rounded-none border-2 border-black bg-white dark:bg-zinc-950 focus-visible:ring-0 focus-visible:border-[#22d3ee]"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="pb-6">
                <Button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-black uppercase tracking-widest rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                >
                  {loading ? "INITIALIZING..." : "START SESSION"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* --- SIGN UP TAB --- */}
        <TabsContent value="signup" className="mt-0">
          <Card className="border-[3px] border-t-0 border-black bg-white dark:bg-zinc-900 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="space-y-1 bg-zinc-50 dark:bg-zinc-800 border-b-2 border-black">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">New Registration</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase text-black/60 dark:text-white/50">
                Official NIT Delhi domain required
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="email-signup" className="text-[10px] font-black uppercase tracking-widest">College Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="ROLLNUMBER@NITDELHI.AC.IN"
                    className="rounded-none border-2 border-black bg-white dark:bg-zinc-950 focus-visible:ring-0 focus-visible:border-[#facc15] font-bold placeholder:text-zinc-300"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-[9px] font-black uppercase text-red-600 bg-red-50 p-1 border border-red-100 mt-1">
                    * Restricted to @nitdelhi.ac.in
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup" className="text-[10px] font-black uppercase tracking-widest">Set Access Key</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    className="rounded-none border-2 border-black bg-white dark:bg-zinc-950 focus-visible:ring-0 focus-visible:border-[#facc15]"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="pb-6">
                <Button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-[#facc15] hover:bg-[#eab308] text-black font-black uppercase tracking-widest rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                >
                  {loading ? "PROCESSING..." : "REGISTER ACCOUNT"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}