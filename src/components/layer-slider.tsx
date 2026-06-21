"use client"

import { useAppStore, ClothesItem, ClothesCategory } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles, RotateCcw, CalendarPlus, ShoppingBag, Dices,
  ChevronLeft, ChevronRight, BadgeCheck, Lightbulb, CheckCircle2, Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { UploadDialog } from "@/components/upload-dialog"
import { createClient } from "@/lib/supabase/client"
import { calculateStyleScore } from "@/lib/style-scorer"

// ─── STYLE HARMONY SCORE CALCULATOR ──────────────────────────────────────────
// Moved to src/lib/style-scorer.ts

// ─── FRAMER MOTION SLIDE VARIANTS ───────────────────────────────────────────
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring" as const, stiffness: 350, damping: 30 },
      opacity: { duration: 0.15 }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
    scale: 0.95,
    transition: {
      x: { type: "spring" as const, stiffness: 350, damping: 30 },
      opacity: { duration: 0.15 }
    }
  })
}

// ─── COMPACT SLIDER ROW (DYNAMICAL Y-SPACE DIVISIONS FOR 100% VIEWPORT SYNC) ──
interface RowProps {
  indexLabel: string
  label: string
  category: ClothesCategory
  items: ClothesItem[]
  selectedIndex: number
  direction: number
  onChange: (newIndex: number, newDirection: number) => void
  onAddClick: (cat: ClothesCategory) => void
}

function SliderRow({ 
  indexLabel, 
  label, 
  category, 
  items, 
  selectedIndex, 
  direction,
  onChange,
  onAddClick
}: RowProps) {
  
  const handlePrev = () => {
    if (items.length === 0) return
    const prevIndex = (selectedIndex - 1 + items.length) % items.length
    onChange(prevIndex, -1)
  }

  const handleNext = () => {
    if (items.length === 0) return
    const nextIndex = (selectedIndex + 1) % items.length
    onChange(nextIndex, 1)
  }

  const activeItem = items[selectedIndex]

  return (
    <div className="relative w-full border-b border-neutral-100 dark:border-neutral-900/40 flex-1 flex items-center justify-between last:border-b-0 py-2">
      
      {/* Category specs label - responsive positioning */}
      <div className="absolute top-1 left-1.5 sm:left-2 z-10 pointer-events-none">
        <span className="text-[8px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          {indexLabel} // <span className="text-neutral-550 dark:text-neutral-400">{label}</span>
        </span>
      </div>

      {/* Row Inner Container */}
      <div className="flex items-center justify-center w-full mt-2.5">
        {items.length === 0 ? (
          /* Empty category upload placeholder - sized perfectly to avoid stretching */
          <div className="flex items-center justify-center py-0.5">
            <button 
              onClick={() => onAddClick(category)}
              className="w-[180px] h-[82px] rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors flex flex-col items-center justify-center bg-white/40 dark:bg-neutral-900/10 hover:bg-white/60 dark:hover:bg-neutral-900/20 group/btn"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover/btn:scale-110 transition-transform mb-1" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-neutral-400/80 group-hover/btn:text-foreground transition-colors">
                Tambah {label}
              </span>
            </button>
          </div>
        ) : (
          /* Clean Slider Controls flanking the Active Card (Responsive spacing) */
          <div className="flex items-center gap-2 sm:gap-3 relative">
            
            {/* Left Chevron */}
            <button
              onClick={handlePrev}
              className="w-7 h-7 rounded-full border border-neutral-100 dark:border-neutral-900 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center justify-center transition-all active:scale-90 shadow-sm"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Centered Active Card Slot - Compact layout optimization */}
            <div className="w-[116px] h-[92px] flex items-center justify-center rounded-2xl overflow-hidden border border-neutral-200/50 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 relative shadow-sm">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                {activeItem && (
                  <motion.div
                    key={activeItem.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full h-full p-1.5 flex items-center justify-center absolute"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeItem.image_url}
                      alt={activeItem.id}
                      className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal pointer-events-none"
                      draggable={false}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Chevron */}
            <button
              onClick={handleNext}
              className="w-7 h-7 rounded-full border border-neutral-100 dark:border-neutral-900 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center justify-center transition-all active:scale-90 shadow-sm"
              title="Berikutnya"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Quick item count mini pill - responsive offset */}
            {items.length > 1 && (
              <div className="absolute right-[-32px] sm:right-[-40px] top-1/2 -translate-y-1/2 text-[8px] font-bold text-neutral-400 font-mono">
                {selectedIndex + 1}/{items.length}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MAIN LAYER SLIDER COMPONENT ────────────────────────────────────────────
export function LayerSlider() {
  const { clothesList, setCanvasItem, saveOutfit } = useAppStore()
  const router = useRouter()
  const [isShuffling, setIsShuffling] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedUploadCategory, setSelectedUploadCategory] = useState<ClothesCategory>("tops")

  // Indexes and active scroll directions for row transitions
  const [idxOuter, setIdxOuter] = useState(0)
  const [dirOuter, setDirOuter] = useState(1)

  const [idxTops, setIdxTops] = useState(0)
  const [dirTops, setDirTops] = useState(1)

  const [idxBottoms, setIdxBottoms] = useState(0)
  const [dirBottoms, setDirBottoms] = useState(1)

  const [idxFoot, setIdxFoot] = useState(0)
  const [dirFoot, setDirFoot] = useState(1)

  // Filter clothes List strictly from wardrobe database
  const listOuter = clothesList.filter(c => c.category === "outerwear")
  const listTops = clothesList.filter(c => c.category === "tops")
  const listBottoms = clothesList.filter(c => c.category === "bottoms")
  const listFootwear = clothesList.filter(c => c.category === "footwear")

  // Sync canvas store values dynamically as sliders change
  useEffect(() => {
    if (listOuter[idxOuter]) setCanvasItem("outerwear", listOuter[idxOuter])
    else setCanvasItem("outerwear", null)
  }, [clothesList, idxOuter])

  useEffect(() => {
    if (listTops[idxTops]) setCanvasItem("tops", listTops[idxTops])
    else setCanvasItem("tops", null)
  }, [clothesList, idxTops])

  useEffect(() => {
    if (listBottoms[idxBottoms]) setCanvasItem("bottoms", listBottoms[idxBottoms])
    else setCanvasItem("bottoms", null)
  }, [clothesList, idxBottoms])

  useEffect(() => {
    if (listFootwear[idxFoot]) setCanvasItem("footwear", listFootwear[idxFoot])
    else setCanvasItem("footwear", null)
  }, [clothesList, idxFoot])

  const handleAddClothes = (cat: ClothesCategory) => {
    setSelectedUploadCategory(cat)
    setIsUploadOpen(true)
  }

  const handleReset = () => {
    setIdxOuter(0); setDirOuter(-1)
    setIdxTops(0); setDirTops(-1)
    setIdxBottoms(0); setDirBottoms(-1)
    setIdxFoot(0); setDirFoot(-1)
    toast.info("Posisi slider disetel kembali ke awal.")
  }

  // Shuffle generator spinning lookup
  const handleShuffle = () => {
    if (isShuffling) return

    const hasSpinableItems = 
      listOuter.length > 1 || 
      listTops.length > 1 || 
      listBottoms.length > 1 || 
      listFootwear.length > 1

    if (!hasSpinableItems) {
      toast.error("Tambahkan minimal 2 pakaian di beberapa kategori wardrobe untuk melakukan shuffle!")
      return
    }

    setIsShuffling(true)

    toast.promise(
      new Promise<void>((resolve) => {
        let count = 0
        const interval = setInterval(() => {
          if (listOuter.length > 0) {
            setIdxOuter(Math.floor(Math.random() * listOuter.length))
            setDirOuter(Math.random() > 0.5 ? 1 : -1)
          }
          if (listTops.length > 0) {
            setIdxTops(Math.floor(Math.random() * listTops.length))
            setDirTops(Math.random() > 0.5 ? 1 : -1)
          }
          if (listBottoms.length > 0) {
            setIdxBottoms(Math.floor(Math.random() * listBottoms.length))
            setDirBottoms(Math.random() > 0.5 ? 1 : -1)
          }
          if (listFootwear.length > 0) {
            setIdxFoot(Math.floor(Math.random() * listFootwear.length))
            setDirFoot(Math.random() > 0.5 ? 1 : -1)
          }
          count++
          
          if (count > 8) {
            clearInterval(interval)
            
            // Set final random selects
            if (listOuter.length > 0) setIdxOuter(Math.floor(Math.random() * listOuter.length))
            if (listTops.length > 0) setIdxTops(Math.floor(Math.random() * listTops.length))
            if (listBottoms.length > 0) setIdxBottoms(Math.floor(Math.random() * listBottoms.length))
            if (listFootwear.length > 0) setIdxFoot(Math.floor(Math.random() * listFootwear.length))

            setIsShuffling(false)
            resolve()
          }
        }, 120)
      }),
      {
        loading: "Mengkombinasikan pakaian...",
        success: "Kombinasi OOTD berhasil diacak!",
        error: "Gagal mengacak."
      }
    )
  }

  const activeItems = [
    listOuter[idxOuter] || null,
    listTops[idxTops] || null,
    listBottoms[idxBottoms] || null,
    listFootwear[idxFoot] || null
  ]

  const { score, feedback } = calculateStyleScore(activeItems)

  const saveLook = async () => {
    const selectedItems = activeItems.filter(Boolean) as ClothesItem[]
    if (selectedItems.length === 0) {
      toast.error("Tambahkan minimal 1 pakaian untuk disimpan!")
      return
    }

    const outfitId = "slider-" + Date.now().toString()
    const outfitToSave = {
      id: outfitId,
      name: "OOTD Kustom " + new Date().toLocaleDateString('id-ID'),
      images: selectedItems.map((item) => item.image_url),
      author: "Anda",
      likes: 0,
    }

    // Save to local store
    saveOutfit(outfitToSave)
    toast.info("Menyimpan ke Lookbook...")

    // Save to Supabase
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
      toast.success("Setelan berhasil disimpan ke Lookbook!")
    } catch (err: any) {
      console.error(err)
      toast.error("Disimpan lokal, namun gagal sync ke database.")
    }
  }

  const schedulePlanner = () => {
    const selectedItems = activeItems.filter(Boolean) as ClothesItem[]
    if (selectedItems.length === 0) {
      toast.error("Tambahkan minimal 1 pakaian untuk dijadwalkan!")
      return
    }

    const outfitId = "slider-" + Date.now().toString()
    saveOutfit({
      id: outfitId,
      name: "OOTD Mix and Match",
      images: selectedItems.map((item) => item.image_url),
      author: "Anda",
      likes: 0,
    })

    toast.success("Mengarahkan ke Planner...")
    router.push("/calendar?schedule=" + outfitId)
  }

  const isClosetEmpty = clothesList.length === 0

  return (
    <div className="flex h-full flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-[#fafafa] dark:bg-[#0c0c0e]">
      
      {/* ── Left Column: Compact Console Generator Stack (100% Viewport Contained on mobile) ── */}
      <div className="w-full h-[calc(100vh-5rem)] lg:h-full lg:flex-1 flex flex-col relative border-b lg:border-b-0 lg:border-r border-neutral-100 dark:border-neutral-900/60 overflow-hidden flex-shrink-0 lg:flex-shrink">
        
        {/* Sleek Top Header */}
        <div className="px-8 py-4 border-b border-neutral-100 dark:border-neutral-900/60 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
          <div>
            <h1 className="text-sm font-extrabold uppercase tracking-widest text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Mix and Match</span>
              <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded-full lowercase tracking-normal font-sans">
                {clothesList.length} items
              </span>
            </h1>
            <p className="text-[9px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mt-0.5">
              Digital closet combination workspace
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShuffle}
              disabled={isShuffling || isClosetEmpty}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850 active:scale-95 shrink-0 ${
                isShuffling || isClosetEmpty ? "opacity-45 cursor-not-allowed" : ""
              }`}
            >
              <Dices className={`w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400 ${isShuffling ? "animate-spin" : ""}`} />
              Acak Setelan
            </button>
            <button
              onClick={handleReset}
              disabled={isClosetEmpty}
              className="p-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Reset Slider"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Console Workspace Box - Responsive p-4 to fit narrow devices perfectly */}
        <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 relative bg-neutral-50/20 dark:bg-neutral-950/20 overflow-hidden h-full">
          {isClosetEmpty ? (
            /* EMPTY CLOSURE INVITATION */
            <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 flex items-center justify-center mb-6 shadow-sm">
                <ShoppingBag className="w-6 h-6 text-neutral-400" />
              </div>
              <h3 className="text-base font-extrabold tracking-tight text-neutral-800 dark:text-neutral-200">
                Lemari Virtual Kosong
              </h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed mt-2 mb-6">
                Unggah foto atasan, bawahan, luaran, dan sepatu Anda di wardrobe untuk mencoba kombinasi slider visual.
              </p>
              <Button
                onClick={() => handleAddClothes("tops")}
                className="rounded-full px-5 h-10 bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90 font-bold text-[10px] uppercase tracking-widest shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Unggah Pakaian
              </Button>
            </div>
          ) : (
            /* COMPACT STACK CONSOLE CARD - responsive p-4 to prevent horizontal clipping on narrow mobile screen widths */
            <div className="w-full max-w-[360px] h-full max-h-[490px] bg-white/90 dark:bg-neutral-950/60 border border-neutral-200/60 dark:border-neutral-900/60 rounded-3xl p-4 sm:p-5 shadow-sm backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
              
              {/* Ultra-elegant Alignment Frames */}
              <div className="absolute inset-0 flex justify-center pointer-events-none z-10">
                {/* Vertical dotted axis guidelines */}
                <div className="w-[1px] h-full border-l border-dashed border-neutral-200/60 dark:border-neutral-800/30" />
                {/* Center glass frame block highlight */}
                <div className="absolute top-1/2 -translate-y-1/2 w-[142px] h-[calc(100%-10px)] border-x border-neutral-200/60 dark:border-neutral-800/50 bg-neutral-100/[0.02]" />
              </div>

              {/* ROW 1: LUARAN */}
              <SliderRow
                indexLabel="01"
                label="Luaran"
                category="outerwear"
                items={listOuter}
                selectedIndex={idxOuter}
                direction={dirOuter}
                onChange={(index, dir) => { setIdxOuter(index); setDirOuter(dir) }}
                onAddClick={handleAddClothes}
              />

              {/* ROW 2: ATASAN */}
              <SliderRow
                indexLabel="02"
                label="Atasan"
                category="tops"
                items={listTops}
                selectedIndex={idxTops}
                direction={dirTops}
                onChange={(index, dir) => { setIdxTops(index); setDirTops(dir) }}
                onAddClick={handleAddClothes}
              />

              {/* ROW 3: BAWAHAN */}
              <SliderRow
                indexLabel="03"
                label="Bawahan"
                category="bottoms"
                items={listBottoms}
                selectedIndex={idxBottoms}
                direction={dirBottoms}
                onChange={(index, dir) => { setIdxBottoms(index); setDirBottoms(dir) }}
                onAddClick={handleAddClothes}
              />

              {/* ROW 4: ALAS KAKI */}
              <SliderRow
                indexLabel="04"
                label="Alas Kaki"
                category="footwear"
                items={listFootwear}
                selectedIndex={idxFoot}
                direction={dirFoot}
                onChange={(index, dir) => { setIdxFoot(index); setDirFoot(dir) }}
                onAddClick={handleAddClothes}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Right Column: AI Analysis Design Studio Workspace (h-auto on mobile for natural flow) ── */}
      <div className="w-full lg:w-80 flex-shrink-0 h-auto lg:h-full bg-white dark:bg-neutral-950 flex flex-col border-t lg:border-t-0 border-neutral-100 dark:border-neutral-900/60 z-20 shadow-md overflow-visible lg:overflow-y-auto">
        
        {/* Sidebar Title */}
        <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-900/60 bg-neutral-50/30 dark:bg-neutral-950/30 shrink-0">
          <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
            Style Insights
          </h2>
          <p className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">Analisis Padu Padan Outfit</p>
        </div>

        {/* Insights body content */}
        <div className="flex-1 p-6 flex flex-col gap-6">
          
          {/* Style Score Plate */}
          <div className="p-5 rounded-2xl border border-neutral-100 dark:border-neutral-900/60 bg-[#fafafa] dark:bg-[#0c0c0e] relative font-sans">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block">
              Style Score
            </span>
            <div className="flex items-baseline gap-1 mt-2 mb-3">
              <span className="text-4xl font-extrabold tracking-tighter text-neutral-950 dark:text-white font-mono">
                {score}
              </span>
              <span className="text-xs font-semibold text-neutral-400">/100</span>
            </div>
            
            {/* Sleek Progress Bar */}
            <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-neutral-900 dark:bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Aligned details list */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[9px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
              Detail Kombinasi
            </h3>

            <div className="flex flex-col gap-2">
              {[
                { label: "Luaran", item: listOuter[idxOuter] },
                { label: "Atasan", item: listTops[idxTops] },
                { label: "Bawahan", item: listBottoms[idxBottoms] },
                { label: "Alas Kaki", item: listFootwear[idxFoot] }
              ].map((layer, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 border border-neutral-100 dark:border-neutral-900/40 rounded-xl bg-white dark:bg-neutral-950/80 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-neutral-50 dark:bg-neutral-900 overflow-hidden flex-shrink-0 border border-neutral-200/50 dark:border-neutral-800/40">
                    {layer.item ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={layer.item.image_url} alt="Spec" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-350 dark:text-neutral-700 font-bold bg-neutral-50 dark:bg-neutral-900/30">
                        —
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[8px] font-extrabold uppercase tracking-widest text-neutral-400/80 block">
                      {layer.label}
                    </span>
                    <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 truncate block leading-tight">
                      {layer.item ? `Baju #${layer.item.id.slice(-4)}` : "Belum ada item"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Advice list */}
          {feedback.length > 0 && (
            <div className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-900/80 bg-neutral-50/20 dark:bg-neutral-950/10 flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                <span className="text-[9px] font-extrabold text-neutral-500 uppercase tracking-widest">
                  Style Advice
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {feedback.map((f, i) => (
                  <div key={i} className="flex gap-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                    <span dangerouslySetInnerHTML={{ __html: f }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-900/60 shrink-0">
            <Button
              className="w-full rounded-full h-11 text-xs uppercase tracking-widest font-extrabold bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              onClick={saveLook}
              disabled={isClosetEmpty}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Simpan Setelan
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full h-11 text-xs uppercase tracking-widest font-extrabold border-neutral-200 dark:border-neutral-800 bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900 flex items-center justify-center gap-2 transition-all active:scale-95"
              onClick={schedulePlanner}
              disabled={isClosetEmpty}
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              Jadwalkan OOTD
            </Button>
          </div>
        </div>
      </div>

      {/* FULLY INTEGRATED DIRECT CATEGORY-AWARE UPLOAD DIALOG */}
      <UploadDialog 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        defaultCategory={selectedUploadCategory}
      />
    </div>
  )
}
