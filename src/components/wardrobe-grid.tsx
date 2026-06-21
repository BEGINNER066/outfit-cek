"use client"

import { motion } from "framer-motion"
import { useAppStore, ClothesItem } from "@/lib/store"
import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"


export function WardrobeGrid() {
  const { activeCategory, clothesList, setClothesList, removeClothes } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isFetched, setIsFetched] = useState(false)

  const handleDelete = async (item: ClothesItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm("Apakah Anda yakin ingin menghapus pakaian ini?")) {
      try {
        const supabase = createClient()
        
        // Coba hapus file gambar dulu di storage jika berasal dari bucket closet
        if (item.image_url.includes('closet/')) {
           const parts = item.image_url.split('/')
           const fileName = parts.pop()
           if (fileName) {
             await supabase.storage.from('closet').remove([fileName])
           }
        }

        // Hapus dr database
        const { error } = await supabase.from('clothes').delete().eq('id', item.id)
        if (error) throw error

        removeClothes(item.id)
        toast.success("Pakaian dihapus.")
      } catch (err: any) {
        console.error(err)
        toast.error("Gagal menghapus: " + (err.message || "Unknown error"))
      }
    }
  }

  useEffect(() => {
    async function fetchClothes() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data, error } = await supabase
            .from('clothes')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (error) throw error
          if (data) {
             setClothesList(data as ClothesItem[])
          }
        }
      } catch (error) {
        console.error('Error fetching clothes:', error)
      } finally {
        setIsLoading(false)
        setIsFetched(true)
      }
    }
    
    if (!isFetched) {
      fetchClothes()
    }
  }, [setClothesList, isFetched])

  const filteredClothes = activeCategory === 'all' 
    ? clothesList 
    : clothesList.filter(c => c.category === activeCategory)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
         <div className="w-8 h-8 rounded-full border-4 border-foreground border-t-transparent animate-spin mb-4" />
         <p className="text-muted-foreground">Memuat Virtual Closet...</p>
      </div>
    )
  }

  if (filteredClothes.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed rounded-3xl border-border bg-neutral-50/50 dark:bg-neutral-900/20">
        <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mb-4">
          <span className="text-2xl">👕</span>
        </div>
        <h3 className="text-lg font-medium">Belum ada pakaian</h3>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Klik tombol "Tambah Pakaian" di atas untuk mulai memasukkan koleksi baju Anda.
        </p>
      </div>
    )
  }

  return (
    <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {filteredClothes.map((item, i) => (
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2, delay: i * 0.05 }}
          key={item.id}
          className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 cursor-pointer"
        >
          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={item.image_url} 
            alt={`Baju ${item.id}`} 
            className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
            <div className="flex justify-end">
              <button 
                onClick={(e) => handleDelete(item, e)}
                title="Hapus pakaian"
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div>
              <span className="px-3 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-xs font-medium uppercase tracking-wider">
                {item.category}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
