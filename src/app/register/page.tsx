'use client'

import { signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [isPending, setIsPending] = useState(false)

  async function handleRegister(formData: FormData) {
    setIsPending(true)
    try {
      const result = await signup(formData)
      if (result?.error) {
        toast.error(result.error)
      }
    } catch (err: any) {
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
        
        <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center mb-8 border border-border">
          <Sparkles className="w-6 h-6" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2 text-center">Bergabung dengan Outfit-Cek</h1>
        <p className="text-muted-foreground text-center mb-8">Buat akun untuk memulai Virtual Closet dan Lookmatch Anda.</p>
        
        <form action={handleRegister} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="nama@email.com" required className="h-12 rounded-xl" />
          </div>
          
          <div className="flex flex-col gap-3">
             <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Min. 6 Karakter" required minLength={6} className="h-12 rounded-xl" />
          </div>

          <Button type="submit" disabled={isPending} className="w-full h-12 rounded-xl text-base mt-4 bg-foreground text-background font-medium">
            {isPending ? 'Memproses...' : 'Klaim Akun Gratis'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground mt-8 text-center px-4">
          Sudah memiliki akun? <Link href="/login" className="text-foreground font-medium underline underline-offset-4 hover:opacity-80">Masuk di sini</Link>
        </p>
      </div>
    </div>
  )
}
