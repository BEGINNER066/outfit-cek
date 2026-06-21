"use client"

import { useAppStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles, Trash2, RotateCcw, CalendarPlus, ShoppingBag,
  ChevronRight, BadgeCheck, Lightbulb, Tag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { calculateStyleScore } from "@/lib/style-scorer"

// ─── Recommendation Data ───────────────────────────────────────────────────
interface Rec {
  id: string
  name: string
  category: "tops" | "bottoms" | "outerwear" | "footwear"
  image: string
  reason: string
  tag: string
}

const RECS_BY_CATEGORY: Record<string, Rec[]> = {
  tops: [
    { id: "r1", name: "Slim Chinos", category: "bottoms", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400", reason: "Celana slim fit mineral-washed cocok dipadukan dengan tops apapun.", tag: "Perfect Match" },
    { id: "r2", name: "Black Jeans", category: "bottoms", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400", reason: "Jeans hitam klasik — pilihan aman yang selalu stylish.", tag: "Safe Pick" },
    { id: "r3", name: "White Sneakers", category: "footwear", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400", reason: "Sneakers putih bersih melengkapi look casual modern.", tag: "Trending" },
    { id: "r4", name: "Brown Loafers", category: "footwear", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400", reason: "Loafers coklat mengangkat ensemble ke smart-casual.", tag: "Smart Casual" },
  ],
  bottoms: [
    { id: "r5", name: "Plain White Tee", category: "tops", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400", reason: "Kaos putih polos adalah kanvas sempurna untuk bottoms statement.", tag: "Classic" },
    { id: "r6", name: "Linen Shirt", category: "tops", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400", reason: "Kemeja linen memberikan nuansa relaxed-chic yang sempurna.", tag: "Relaxed Chic" },
    { id: "r7", name: "White Sneakers", category: "footwear", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400", reason: "Sneakers putih adalah pasangan universal untuk semua bottoms.", tag: "Universal" },
    { id: "r8", name: "Chelsea Boots", category: "footwear", image: "https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=400", reason: "Chelsea boots menambahkan karakter pada look berbasis bottoms.", tag: "Character" },
  ],
  outerwear: [
    { id: "r9", name: "Black Jeans", category: "bottoms", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400", reason: "Jeans hitam adalah pasangan terbaik untuk outerwear apapun.", tag: "Best Pair" },
    { id: "r10", name: "Plain Tee", category: "tops", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400", reason: "Inner minimalis menonjolkan outerwear sebagai statement piece.", tag: "Statement" },
    { id: "r11", name: "White Sneakers", category: "footwear", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400", reason: "Sneakers putih menyeimbangkan kepadatan visual outerwear.", tag: "Balanced" },
  ],
  footwear: [
    { id: "r12", name: "Slim Chinos", category: "bottoms", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400", reason: "Slim chinos yang tidak terlalu panjang memperlihatkan sepatu dengan baik.", tag: "Show it Off" },
    { id: "r13", name: "Plain White Tee", category: "tops", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400", reason: "Look minimalis dari atas memberi panggung pada pilihan alas kaki.", tag: "Spotlight" },
    { id: "r14", name: "Bomber Jacket", category: "outerwear", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400", reason: "Bomber jacket melengkapi look dengan aksen yang kuat.", tag: "Power Move" },
  ],
}

function getRecommendations(canvas: any): Rec[] {
  const filled: string[] = []
  if (canvas.tops) filled.push("tops")
  if (canvas.bottoms) filled.push("bottoms")
  if (canvas.outerwear) filled.push("outerwear")
  if (canvas.footwear) filled.push("footwear")

  if (filled.length === 0) return []

  // Collect recommendations from all filled slots, avoiding duplicates & already-filled cats
  const seen = new Set<string>()
  const result: Rec[] = []
  for (const cat of filled) {
    const recs = RECS_BY_CATEGORY[cat] || []
    for (const r of recs) {
      if (!seen.has(r.id) && !(canvas as any)[r.category]) {
        seen.add(r.id)
        result.push(r)
      }
    }
  }
  return result.slice(0, 4)
}

// ─── Score Calculator ──────────────────────────────────────────────────────
// Using src/lib/style-scorer.ts

// ─── Mannequin Slot ─────────────────────────────────────────────────────────
function Slot({
  label, children, isEmpty, height, zIndex, overlap = 0
}: {
  label: string; children: React.ReactNode; isEmpty: boolean;
  height: string; zIndex: number; overlap?: number;
}) {
  return (
    <div
      className="relative w-full flex justify-center shrink-0"
      style={{ height, zIndex, marginTop: overlap ? `-${overlap}px` : undefined }}
    >
      {isEmpty ? (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: 0.12 }}
        >
          <div className="w-32 h-full rounded-3xl border-2 border-dashed border-foreground flex items-center justify-center">
            <span className="text-foreground text-[9px] uppercase tracking-widest font-bold rotate-0">{label}</span>
          </div>
        </div>
      ) : children}
    </div>
  )
}

// ─── Draggable Item Card ─────────────────────────────────────────────────────
function CanvasItem({
  src, alt, onRemove, width, extraClass = ""
}: {
  src: string; alt: string; onRemove: () => void; width: string; extraClass?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: -16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={`absolute group cursor-grab active:cursor-grabbing ${extraClass}`}
      style={{ width }}
      drag
      dragConstraints={{ left: -60, right: 60, top: -40, bottom: 40 }}
      dragElastic={0.08}
      dragMomentum={false}
    >
      <img src={src} alt={alt} className="w-full drop-shadow-2xl mix-blend-multiply dark:mix-blend-normal select-none" draggable={false} />
      <button
        onClick={(e) => { e.stopPropagation(); onRemove() }}
        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg z-50"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function FittingRoom() {
  const { canvas, setCanvasItem, clearCanvas, saveOutfit } = useAppStore()
  const [showRecs, setShowRecs] = useState(false)
  const router = useRouter()

  const hasItems = canvas.tops || canvas.bottoms || canvas.outerwear || canvas.footwear
  const { score } = calculateStyleScore([canvas.outerwear, canvas.tops, canvas.bottoms, canvas.footwear])
  const recs = getRecommendations(canvas)

  const saveLook = async () => {
    const items = [canvas.outerwear, canvas.tops, canvas.bottoms, canvas.footwear].filter(Boolean)
    if (items.length === 0) {
      toast.error("Tambahkan minimal 1 pakaian untuk disimpan!")
      return
    }

    const outfitId = "fitting-" + Date.now().toString()
    const outfitToSave = {
      id: outfitId,
      name: "OOTD Fitting Room " + new Date().toLocaleDateString('id-ID'),
      images: items.map(item => item!.image_url),
      author: "Anda",
      likes: 0
    }

    saveOutfit(outfitToSave)
    toast.info("Menyimpan ke Lookbook...")

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
      toast.success("Look berhasil disimpan ke Lookbook!")
    } catch (err: any) {
      console.error(err)
      toast.error("Disimpan lokal, namun gagal sync ke database.")
    }
  }

  const schedulePlanner = () => {
    const items = [canvas.outerwear, canvas.tops, canvas.bottoms, canvas.footwear].filter(Boolean)
    if (items.length === 0) {
      toast.error("Tambahkan minimal 1 pakaian untuk dijadwalkan!")
      return
    }

    const outfitId = "fitting-" + Date.now().toString()
    const outfitToSave = {
      id: outfitId,
      name: "OOTD Fitting Room",
      images: items.map(item => item!.image_url),
      author: "Anda",
      likes: 0
    }

    saveOutfit(outfitToSave)
    toast.success("Mengarahkan ke Planner...")
    router.push("/calendar?schedule=" + outfitId)
  }

  useEffect(() => {
    if (hasItems) {
      const t = setTimeout(() => setShowRecs(true), 400)
      return () => clearTimeout(t)
    } else {
      setShowRecs(false)
    }
  }, [hasItems])

  const applyRec = (rec: Rec) => {
    setCanvasItem(rec.category, {
      id: `rec-${rec.id}`,
      user_id: "demo",
      image_url: rec.image,
      category: rec.category,
    })
    toast.success(`${rec.name} ditambahkan ke fitting room!`)
  }

  return (
    <div className="flex h-full">
      {/* ── Center: Fitting Room Canvas ── */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-neutral-100 to-neutral-200/60 dark:from-neutral-900 dark:to-neutral-950 border-r border-border">

        {/* Label */}
        <div className="absolute top-5 left-5 flex items-center gap-2 z-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur border border-border shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold tracking-wide">Virtual Fitting Room</span>
          </div>
        </div>

        {/* Score Badge */}
        <AnimatePresence>
          {hasItems && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-5 right-5 z-10"
            >
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-sm font-bold border
                ${score >= 85 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                  : score >= 70 ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
                  : "bg-neutral-50 text-neutral-700 border-border dark:bg-neutral-800 dark:text-neutral-300"}`}
              >
                <BadgeCheck className="w-4 h-4" />
                Style Score: {score}/100
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mannequin + Clothes Stack */}
        <div className="relative flex flex-col items-center w-[280px]" style={{ height: "520px" }}>

          {/* Mannequin SVG backdrop */}
          <svg
            viewBox="0 0 200 520"
            className="absolute inset-0 w-full h-full opacity-[0.06] dark:opacity-[0.08] pointer-events-none"
            fill="currentColor"
          >
            {/* Head */}
            <ellipse cx="100" cy="38" rx="28" ry="34" />
            {/* Neck */}
            <rect x="90" y="68" width="20" height="18" rx="6" />
            {/* Torso / shoulders */}
            <path d="M55 86 Q70 78 100 82 Q130 78 145 86 L155 185 Q130 195 100 196 Q70 195 45 185 Z" />
            {/* Left arm */}
            <path d="M55 86 L22 175 Q20 185 28 186 L60 195 L70 110 Z" />
            {/* Right arm */}
            <path d="M145 86 L178 175 Q180 185 172 186 L140 195 L130 110 Z" />
            {/* Left leg */}
            <path d="M60 195 L50 390 Q50 400 62 400 L90 400 L98 240 Z" />
            {/* Right leg */}
            <path d="M140 195 L150 390 Q150 400 138 400 L110 400 L102 240 Z" />
            {/* Left foot */}
            <ellipse cx="68" cy="415" rx="24" ry="12" />
            {/* Right foot */}
            <ellipse cx="132" cy="415" rx="24" ry="12" />
          </svg>

          {/* Clothes layers — stacked in body zone */}

          {/* Outerwear — widest, behind tops */}
          <AnimatePresence>
            {canvas.outerwear && (
              <CanvasItem
                key={canvas.outerwear.id}
                src={canvas.outerwear.image_url}
                alt="Outerwear"
                width="185px"
                extraClass="top-[62px]"
                onRemove={() => setCanvasItem("outerwear", null)}
              />
            )}
          </AnimatePresence>

          {/* Tops */}
          <AnimatePresence>
            {canvas.tops && (
              <CanvasItem
                key={canvas.tops.id}
                src={canvas.tops.image_url}
                alt="Tops"
                width="155px"
                extraClass="top-[72px] z-10"
                onRemove={() => setCanvasItem("tops", null)}
              />
            )}
          </AnimatePresence>

          {/* Bottoms */}
          <AnimatePresence>
            {canvas.bottoms && (
              <CanvasItem
                key={canvas.bottoms.id}
                src={canvas.bottoms.image_url}
                alt="Bottoms"
                width="158px"
                extraClass="top-[240px] z-10"
                onRemove={() => setCanvasItem("bottoms", null)}
              />
            )}
          </AnimatePresence>

          {/* Footwear */}
          <AnimatePresence>
            {canvas.footwear && (
              <CanvasItem
                key={canvas.footwear.id}
                src={canvas.footwear.image_url}
                alt="Footwear"
                width="138px"
                extraClass="top-[420px] z-10"
                onRemove={() => setCanvasItem("footwear", null)}
              />
            )}
          </AnimatePresence>

          {/* Empty state hint — only show when truly empty */}
          {!hasItems && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-48"
              >
                <p className="text-sm text-muted-foreground font-medium">Pilih pakaian dari panel kiri</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Coba 1–2 item untuk mendapat rekomendasi</p>
              </motion.div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <AnimatePresence>
          {hasItems && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="absolute bottom-6 flex items-center gap-3"
            >
              <button
                onClick={() => { clearCanvas(); toast.info("Canvas dikosongkan.") }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-neutral-800/80 border border-border backdrop-blur text-sm font-medium rounded-full hover:bg-white dark:hover:bg-neutral-700 transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                onClick={saveLook}
                className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-semibold rounded-full hover:opacity-90 transition-opacity shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                Simpan Look
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right: Recommendation Panel ── */}
      <div className="w-80 flex-shrink-0 h-full overflow-y-auto bg-background flex flex-col">
        <div className="p-5 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-base font-bold tracking-tight">Rekomendasi AI</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {hasItems ? `${recs.length} item cocok ditemukan` : "Pilih pakaian untuk mulai"}
          </p>
        </div>

        <div className="flex-1 p-4 flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {!hasItems && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center px-4 py-16"
              >
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                  <Lightbulb className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Belum ada item dipilih</p>
                <p className="text-xs text-muted-foreground/60 mt-1 leading-relaxed">
                  Pilih 1–2 pakaian dari panel kiri, AI akan merekomendasikan item pelengkap yang cocok.
                </p>
              </motion.div>
            )}

            {showRecs && recs.map((rec, i) => (
              <motion.div
                key={rec.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.07 }}
                className="relative group flex items-start gap-3 p-3 rounded-2xl border border-border bg-card hover:border-foreground/30 hover:shadow-md transition-all cursor-pointer"
                onClick={() => applyRec(rec)}
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex-shrink-0 border border-border/50">
                  <img src={rec.image} alt={rec.name} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{rec.category}</span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold">
                      <Tag className="w-2.5 h-2.5" />
                      {rec.tag}
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-tight truncate">{rec.name}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{rec.reason}</p>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Add badge overlay */}
                <div className="absolute inset-0 rounded-2xl bg-foreground/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Style Tips */}
          {showRecs && recs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-2 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Style Tip</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                Klik item rekomendasi untuk langsung menambahkannya ke fitting room. Anda bisa menyesuaikan posisi dengan menarik (drag) setiap item.
              </p>
            </motion.div>
          )}

          {/* Action Buttons after full outfit */}
          {showRecs && score >= 70 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-2 mt-2"
            >
              <Button className="w-full rounded-xl h-10 text-sm" onClick={saveLook}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Simpan ke Lookbook
              </Button>
              <Button variant="outline" className="w-full rounded-xl h-10 text-sm" onClick={schedulePlanner}>
                <CalendarPlus className="w-4 h-4 mr-2" />
                Jadwalkan ke Planner
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
