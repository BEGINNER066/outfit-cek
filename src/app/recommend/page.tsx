"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Briefcase, Coffee, Heart, Music, Plane, Trophy, Shirt, Camera, Flame, PartyPopper, Sun, Glasses } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeRecommendations } from "@/components/theme-recommendations"
import { createClient } from "@/lib/supabase/client"
import { useAppStore, ClothesItem } from "@/lib/store"

const themes = [
  { id: "work", label: "Work", icon: <Briefcase className="w-4 h-4" /> },
  { id: "date", label: "Date Night", icon: <Heart className="w-4 h-4" /> },
  { id: "hangout", label: "Hangout", icon: <Coffee className="w-4 h-4" /> },
  { id: "formal", label: "Formal", icon: <Music className="w-4 h-4" /> },
  { id: "sport", label: "Sporty", icon: <Trophy className="w-4 h-4" /> },
  { id: "traveling", label: "Traveling", icon: <Plane className="w-4 h-4" /> },
  { id: "casual", label: "Casual", icon: <Shirt className="w-4 h-4" /> },
  { id: "vintage", label: "Vintage", icon: <Camera className="w-4 h-4" /> },
  { id: "streetwear", label: "Streetwear", icon: <Flame className="w-4 h-4" /> },
  { id: "party", label: "Party", icon: <PartyPopper className="w-4 h-4" /> },
  { id: "vacation", label: "Vacation", icon: <Sun className="w-4 h-4" /> },
  { id: "smart_casual", label: "Smart Casual", icon: <Glasses className="w-4 h-4" /> },
]

export default function RecommendPage() {
  const [activeTheme, setActiveTheme] = useState<string>("work")
  const [loading, setLoading] = useState(false)
  const { clothesList, setClothesList } = useAppStore()

  useEffect(() => {
    async function fetchClothes() {
      if (clothesList.length > 0) return
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data, error } = await supabase
            .from('clothes')
            .select('*')
            .order('created_at', { ascending: false })
          if (!error && data) {
            setClothesList(data as ClothesItem[])
          }
        }
      } catch (error) {
        console.error('Error fetching clothes:', error)
      }
    }
    fetchClothes()
  }, [clothesList.length, setClothesList])

  const handleSuggest = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1200)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto mb-16 mt-8">
        <div className="w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Lookmatch</h1>
        <p className="text-muted-foreground text-lg">Pilih tema occasion Anda, dan biarkan kami menemukan perpaduan terbaik dari Virtual Closet Anda.</p>
      </div>

      {/* Theme Selector */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => {
              setActiveTheme(theme.id)
              handleSuggest()
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${activeTheme === theme.id
                ? "bg-foreground text-background shadow-lg scale-105"
                : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-foreground"
              }`}
          >
            {theme.icon}
            {theme.label}
          </button>
        ))}
      </div>

      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center pt-10"
            >
              <div className="w-12 h-12 border-4 border-neutral-200 dark:border-neutral-800 border-t-foreground rounded-full animate-spin mb-4" />
              <p className="font-medium animate-pulse">AI sedang menganalisa warna & style...</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ThemeRecommendations theme={activeTheme} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
