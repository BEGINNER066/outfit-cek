'use client'

import { login } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [isPending, setIsPending] = useState(false)

  async function handleLogin(formData: FormData) {
    setIsPending(true)
    try {
      const result = await login(formData)
      if (result?.error) {
        toast.error(result.error)
      }
    } catch (err: any) {
      // In Next.js, redirect() throws an error. We want to let it propagate so the redirect happens.
      if (err?.message === 'NEXT_REDIRECT') {
        throw err
      }
      toast.error('Terjadi kesalahan yang tidak terduga')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-5rem)]">
      <div className="w-full max-w-sm flex flex-col items-center">
        
        <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center mb-8">
          <Sparkles className="w-6 h-6" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2">Selamat Datang Kembali</h1>
        <p className="text-muted-foreground text-center mb-8">Login untuk mengakses Virtual Closet Anda.</p>
        
        <form action={handleLogin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="nama@email.com" required className="h-12 rounded-xl" />
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-xs text-muted-foreground font-medium hover:text-foreground">Lupa Password?</Link>
            </div>
            <Input id="password" name="password" type="password" placeholder="••••••••" required className="h-12 rounded-xl" />
          </div>

          <Button type="submit" disabled={isPending} className="w-full h-12 rounded-xl text-base mt-4 bg-foreground text-background font-medium">
            {isPending ? 'Memproses...' : 'Masuk Sekarang'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground mt-8">
          Belum punya akun? <Link href="/register" className="text-foreground font-medium underline underline-offset-4 hover:opacity-80">Daftar Gratis</Link>
        </p>
      </div>
    </div>
  )
}
