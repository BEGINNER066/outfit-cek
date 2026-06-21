"use client"

import { useState } from "react"
import { Plus, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { WardrobeGrid } from "@/components/wardrobe-grid"
import { UploadDialog } from "@/components/upload-dialog"
import { useAppStore } from "@/lib/store"

export default function WardrobePage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const { activeCategory, setActiveCategory } = useAppStore()

  const categories = [
    { id: "all", label: "Semua" },
    { id: "tops", label: "Atasan" },
    { id: "bottoms", label: "Bawahan" },
    { id: "outerwear", label: "Luaran" },
    { id: "footwear", label: "Sepatu" },
    { id: "accessories", label: "Aksesoris" },
  ] as const

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">Virtual Closet</h1>
          <p className="text-muted-foreground">Kelola dan digitalisasi koleksi pakaian Anda.</p>
        </div>
        
        <Button 
          onClick={() => setIsUploadOpen(true)}
          className="rounded-full shadow-lg bg-foreground text-background h-12 px-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Pakaian
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6 border-b border-border">
        <div className="flex items-center text-muted-foreground mr-2 p-2">
          <Filter className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Filter</span>
        </div>
        
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "bg-foreground text-background shadow-md"
                : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-foreground/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <WardrobeGrid />

      {/* Upload Dialog */}
      <UploadDialog isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  )
}
