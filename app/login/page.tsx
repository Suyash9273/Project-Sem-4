import { AuthForm } from '@/components/AuthForm'


export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-950/40 via-zinc-950 to-black">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">NIT Delhi Portal</h1>
          <p className="mt-2 text-zinc-400">Authentication restricted to university domain</p>
        </div>
        
        <AuthForm />
      </div>
    </main>
  )
}