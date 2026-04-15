import { AuthForm } from '@/components/AuthForm'


export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f0f9ff] dark:bg-zinc-950 p-6">
      {/* The Main Auth Container */}
      <div className="w-full max-w-md relative">

        {/* Decorative Background Block - Off-center shadow effect */}
        <div className="absolute inset-0 bg-black dark:bg-white translate-x-3 translate-y-3 z-0"></div>

        <div className="relative z-10 bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white p-8 md:p-10 space-y-8">

          {/* Header Section - Styled like a system notification */}
          <div className="text-center space-y-4">
            <div className="inline-block bg-[#facc15] border-2 border-black px-4 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1 mb-2">
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-black">
                NIT Delhi
              </h1>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black uppercase tracking-widest text-black dark:text-white">
                Marketplace Portal
              </h2>
              <div className="flex items-center justify-center gap-2">
                <div className="h-1 flex-grow bg-black dark:bg-white/20"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50 dark:text-white/40 whitespace-nowrap">
                  Identity Verification
                </p>
                <div className="h-1 flex-grow bg-black dark:bg-white/20"></div>
              </div>
            </div>
          </div>

          {/* The Auth Form Container */}
          <div className="bg-zinc-50 dark:bg-zinc-800 border-[3px] border-black p-2 shadow-inner">
            <AuthForm />
          </div>

          {/* Footer Disclaimer - "System" style */}
          <div className="pt-4 border-t-2 border-black border-dashed">
            <p className="text-[9px] font-bold text-center uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 py-2 border border-red-200 dark:border-red-800">
              Access Restricted: @nitdelhi.ac.in domain only
            </p>
          </div>

        </div>

        {/* Small Decorative "System Status" tag */}
        <div className="absolute -bottom-10 left-0 text-[10px] font-black uppercase text-black/30 dark:text-white/20 tracking-widest">
          Auth-Node: 01 // Secure-Session: Active
        </div>
      </div>
    </main>
  )
}