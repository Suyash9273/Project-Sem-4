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
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')

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
    const { data, error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          username: username
        }
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
      router.push('/protected/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900/50">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        {/* --- LOGIN TAB --- */}
        <TabsContent value="login">
          <Card className="border-violet-900/50 bg-zinc-950/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>Enter your college credentials to access the portal.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">College Email</Label>
                  <Input
                    id="email-login"
                    type="email"
                    placeholder="rollnumber@nitdelhi.ac.in"
                    className="bg-zinc-900 border-zinc-800 focus:border-violet-500"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Password</Label>
                  <Input
                    id="password-login"
                    type="password"
                    className="bg-zinc-900 border-zinc-800 focus:border-violet-500"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className='mt-6'>
                <Button disabled={loading} type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* --- SIGN UP TAB --- */}
        <TabsContent value="signup">
          <Card className="border-violet-900/50 bg-zinc-950/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>
                Join the NIT Delhi portal. Official email required.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="e.g. Suyash Kumar"
                    className="bg-zinc-900 border-zinc-800 focus:border-violet-500"
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                {/* NEW FIELD: Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="e.g. suyash_dev"
                    className="bg-zinc-900 border-zinc-800 focus:border-violet-500"
                    onChange={(e) => setUsername(e.target.value.toLowerCase())} // Good practice to force lowercase
                    pattern="^[a-zA-Z0-9_]+$" // Enforces the rule on the frontend too
                    title="Only letters, numbers, and underscores allowed."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-signup">College Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="rollnumber@nitdelhi.ac.in"
                    className="bg-zinc-900 border-zinc-800 focus:border-violet-500"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-zinc-500">Must be an @nitdelhi.ac.in address.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Create Password</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    className="bg-zinc-900 border-zinc-800 focus:border-violet-500"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className='mt-6'>
                <Button disabled={loading} type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}