"use client"

import { useAppStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Trash2 } from "lucide-react"

export function CanvasWorkspace() {
  const { canvas, setCanvasItem } = useAppStore()

  const hasItems = canvas.tops || canvas.bottoms || canvas.outerwear || canvas.footwear

  return (
    <div className="relative w-full max-w-sm h-full max-h-[700px] flex flex-col items-center justify-center gap-2 p-4">
      {/* Background Mannequin / Silhouette Hint */}
      {!hasItems && (
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none">
          <div className="w-48 h-56 border-2 border-dashed border-foreground/50 rounded-[4rem] mb-4 flex items-center justify-center">
            <span className="text-foreground/50 text-xs uppercase tracking-widest font-semibold">Tops / Outer</span>
          </div>
          <div className="w-56 h-64 border-2 border-dashed border-foreground/50 rounded-t-3xl rounded-b-[4rem] mb-4 flex items-center justify-center">
            <span className="text-foreground/50 text-xs uppercase tracking-widest font-semibold">Bottoms</span>
          </div>
          <div className="flex gap-4">
            <div className="w-20 h-24 border-2 border-dashed border-foreground/50 rounded-xl" />
            <div className="w-20 h-24 border-2 border-dashed border-foreground/50 rounded-xl" />
          </div>
        </div>
      )}

      <AnimatePresence>
        {/* UPPER BODY (Outerwear & Tops) */}
        <div className="relative w-full flex justify-center h-[35%] z-20 shrink-0">
          {canvas.tops && (
            <motion.div
              layoutId={`canvas-tops-${canvas.tops.id}`}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute w-44 hover:z-30 cursor-pointer group"
              drag
              dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
              dragElastic={0.1}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={canvas.tops.image_url} alt="Tops" className="w-full drop-shadow-2xl mix-blend-multiply dark:mix-blend-normal" />
              <button 
                onClick={() => setCanvasItem("tops", null)}
                className="absolute top-0 right-0 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {canvas.outerwear && (
            <motion.div
              layoutId={`canvas-outer-${canvas.outerwear.id}`}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1.1 }} // Slightly larger to wrap tops
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute w-52 z-20 opacity-90 cursor-pointer group hover:z-40"
              drag
              dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={canvas.outerwear.image_url} alt="Outerwear" className="w-full drop-shadow-2xl mix-blend-multiply dark:mix-blend-normal" />
              <button 
                onClick={() => setCanvasItem("outerwear", null)}
                className="absolute top-0 right-0 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>

        {/* LOWER BODY (Bottoms) */}
        <div className="relative w-full flex justify-center h-[40%] z-10 shrink-0 -mt-8">
          {canvas.bottoms && (
            <motion.div
              layoutId={`canvas-bot-${canvas.bottoms.id}`}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute w-44 hover:z-30 cursor-pointer group"
              drag
              dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={canvas.bottoms.image_url} alt="Bottoms" className="w-full drop-shadow-2xl mix-blend-multiply dark:mix-blend-normal" />
              <button 
                onClick={() => setCanvasItem("bottoms", null)}
                className="absolute top-0 right-0 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>

        {/* FOOTWEAR */}
        <div className="relative w-full flex justify-center h-[15%] z-0 shrink-0 -mt-6">
          {canvas.footwear && (
            <motion.div
              layoutId={`canvas-shoes-${canvas.footwear.id}`}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute w-32 hover:z-30 cursor-pointer group"
              drag
              dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={canvas.footwear.image_url} alt="Shoes" className="w-full drop-shadow-2xl mix-blend-multiply dark:mix-blend-normal" />
              <button 
                onClick={() => setCanvasItem("footwear", null)}
                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </div>
      </AnimatePresence>

      
      {hasItems && (
        <div className="absolute bottom-6 right-6">
           <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-full shadow-lg hover:scale-105 transition-transform text-sm font-medium pr-5">
             <div className="w-6 h-6 bg-background rounded-full flex items-center justify-center text-foreground">
                <Sparkles className="w-3 h-3" />
             </div>
             Simpan Look
           </button>
        </div>
      )}
    </div>
  )
}
