"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CalendarPlus, ShoppingBag, Info } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"

const FALLBACK_RECS = [
  {
    id: "r1",
    tops: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500",
    bottoms: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500",
    footwear: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500",
    score: 95,
    desc: "Perpaduan klasik formal yang cocok untuk ",
    isUserWardrobe: false
  },
  {
    id: "r2",
    tops: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500",
    bottoms: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500",
    footwear: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500",
    score: 88,
    desc: "Smart casual dengan kontras warna elegan yang pas untuk tema ",
    isUserWardrobe: false
  }
]

import { createClient } from "@/lib/supabase/client"

// Inside the component...
export function ThemeRecommendations({ theme }: { theme: string }) {
  const { clothesList, saveOutfit, savedOutfits } = useAppStore()
  const router = useRouter()

  const handleSave = async (rec: any) => {
    if (savedOutfits.find(o => o.id === rec.id)) {
      toast.info("Outfit ini sudah disimpan!")
      return
    }

    const outfitToSave = {
      id: rec.id,
      name: `Rekomendasi Tema ${theme}`,
      images: [rec.tops, rec.bottoms, rec.footwear].filter(Boolean),
      author: "Anda",
      likes: 0
    }
    
    saveOutfit(outfitToSave)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase.from('saved_outfits').insert({
          user_id: user.id,
          name: outfitToSave.name,
          images: outfitToSave.images
        })
        if (error) throw error
      }
      toast.success("Outfit berhasil disimpan ke database Anda!")
    } catch (err: any) {
      console.error(err)
      toast.error("Berhasil menyimpan lokal, namun gagal ke database.")
    }
  }

  const handleSchedule = (rec: any) => {
    handleSave(rec)
    router.push("/calendar")
  }

  const recommendations = useMemo(() => {
    const tops = clothesList.filter(c => c.category === 'tops')
    const bottoms = clothesList.filter(c => c.category === 'bottoms')
    const footwears = clothesList.filter(c => c.category === 'footwear')

    if (tops.length > 0 && bottoms.length > 0) {
      // Generate 2 random outfits from user wardrobe
      const recs = []
      for (let i = 0; i < 2; i++) {
        // Simple random matching for the "AI" mockup
        const top = tops[Math.floor(Math.random() * tops.length)]
        const bottom = bottoms[Math.floor(Math.random() * bottoms.length)]
        const footwear = footwears.length > 0 
          ? footwears[Math.floor(Math.random() * footwears.length)]
          : { image_url: FALLBACK_RECS[i].footwear } // fallback footwear

        recs.push({
          id: `user-rec-${i}-${top.id}-${bottom.id}`,
          tops: top.image_url,
          bottoms: bottom.image_url,
          footwear: footwear.image_url,
          score: Math.floor(Math.random() * 15) + 85, // 85-99
          desc: `Rekomendasi dari koleksi lemari Anda untuk tema ${theme}. Kombinasi yang pas dan unik!`,
          isUserWardrobe: true
        })
      }
      return recs
    }

    // Fallback if not enough clothes
    return FALLBACK_RECS.map((rec, idx) => ({
      ...rec,
      desc: rec.desc + theme + "."
    }))
  }, [theme, clothesList])

  return (
    <div className="space-y-12">
      {/* Jika menggunakan fallback, beri tahu user untuk upload baju */}
      {!recommendations[0]?.isUserWardrobe && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-2xl border border-blue-200 dark:border-blue-800">
          <Info className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">
            Tampilkan pakaian Anda sendiri di sini dengan menambahkan Tops dan Bottoms di halaman Virtual Closet! Saat ini kami menampilkan contoh pakaian.
          </p>
        </div>
      )}

      {recommendations.map((rec, i) => (
        <div key={rec.id} className="p-8 rounded-[2rem] border border-border bg-card flex flex-col lg:flex-row gap-8 relative overflow-hidden group">
          {rec.isUserWardrobe && (
             <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full z-10 shadow-lg">
               FROM YOUR CLOSET
             </div>
          )}

          {/* Visual Outfit Preview */}
          <div className="flex-1 flex justify-center items-center h-80 bg-neutral-100 dark:bg-neutral-900 rounded-3xl p-6 relative">
             <div className="flex flex-col items-center gap-1 w-full max-w-xs relative h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rec.tops} alt="Top" className="w-1/2 h-[45%] object-cover rounded-xl shadow-md z-20 transition-transform group-hover:scale-105 duration-500" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rec.bottoms} alt="Bottoms" className="w-5/12 h-[35%] object-cover rounded-xl shadow-md z-10 transition-transform group-hover:scale-105 duration-500 delay-75" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rec.footwear} alt="Shoes" className="w-1/3 h-[15%] object-cover rounded-xl shadow-md z-0 transition-transform group-hover:scale-105 duration-500 delay-150" />
             </div>
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold mb-4 w-fit">
              AI MATCH SCORE: {rec.score}%
            </div>
            
            <h3 className="text-3xl font-bold tracking-tight mb-3">Option {i + 1}</h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 capitalize">
              {rec.desc}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="rounded-xl h-12 text-base px-6" onClick={() => handleSchedule(rec)}>
                <CalendarPlus className="w-4 h-4 mr-2" />
                Jadwalkan OOTD
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl h-12 text-base px-6" onClick={() => handleSave(rec)}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Simpan Outfit
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
