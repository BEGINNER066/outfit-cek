"use client"

import { useState } from "react"
import { UploadCloud, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppStore, ClothesCategory } from "@/lib/store"

import { useEffect } from "react"

export function UploadDialog({ 
  isOpen, 
  onClose, 
  defaultCategory 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  defaultCategory?: ClothesCategory 
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [category, setCategory] = useState<ClothesCategory | "">(defaultCategory || "")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setCategory(defaultCategory || "")
      setFile(null)
      setPreview(null)
    }
  }, [isOpen, defaultCategory])

  const { clothesList, setClothesList } = useAppStore()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  const handleUpload = async () => {
    if (!file || !category) return

    setLoading(true)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Sesi tidak valid, silakan login kembali.")
        setLoading(false)
        return
      }

      // 1. Upload ke Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.floor(Math.random() * 1000000)}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('closet')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })
      
      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('closet')
        .getPublicUrl(fileName)

      // 2. Insert ke Database
      const { data: dbData, error: dbError } = await supabase
        .from('clothes')
        .insert({
          user_id: user.id,
          image_url: publicUrlData.publicUrl,
          category: category
        })
        .select()
        .single()
        
      if (dbError) throw dbError

      // Update state aplikasi lokal
      setClothesList([dbData as unknown as any, ...clothesList])
      
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setFile(null)
        setPreview(null)
        setCategory("")
        onClose()
      }, 1500)

    } catch (err: any) {
      console.error(err)
      toast.error("Gagal mengupload pakaian: " + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Upload Pakaian</DialogTitle>
          <DialogDescription>
            Masukkan foto pakaian Anda ke dalam Virtual Closet.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 animate-in zoom-in" />
            <h3 className="text-xl font-medium">Berhasil Diupload!</h3>
            <p className="text-muted-foreground mt-2">Pakaian telah masuk ke Virtual Closet.</p>
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            <div className="flex flex-col gap-3">
              <Label>Foto Pakaian</Label>
              <label 
                className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors ${preview ? 'border-primary' : 'border-border'}`}
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-contain rounded-2xl p-2" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Klik untuk upload</span> atau drag and drop</p>
                    <p className="text-xs text-muted-foreground/70">PNG, JPG or WEBP (MAX. 5MB)</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
              </label>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="category">Kategori</Label>
              <Select value={category} onValueChange={(v: any) => setCategory(v as ClothesCategory)}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Pilih Kategori Pakaian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tops">Atasan (Tops)</SelectItem>
                  <SelectItem value="bottoms">Bawahan (Bottoms)</SelectItem>
                  <SelectItem value="outerwear">Luaran (Outerwear)</SelectItem>
                  <SelectItem value="footwear">Sepatu (Footwear)</SelectItem>
                  <SelectItem value="accessories">Aksesoris</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={!file || !category || loading}
              className="w-full rounded-xl h-12 text-base font-medium mt-2 bg-foreground text-background"
            >
              {loading ? "Menyimpan..." : "Simpan ke Closet"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
