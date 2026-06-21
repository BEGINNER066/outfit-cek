"use client"

import { useAppStore } from "@/lib/store"
import { motion } from "framer-motion"
import { CheckCircle2, AlertCircle, Info } from "lucide-react"

export function ColorPaletteGuide() {
  const { canvas } = useAppStore()

  // Analisa warna sederhana berdasarkan warna yang terdeteksi. 
  // (Pada produksi aslinya, ini memanggil AI / mengekstrak warna dominan dari gambar url)
  const colors = []
  if (canvas.tops) colors.push({ hex: "#1c1c1c", name: "Black (Top)" })
  if (canvas.bottoms) colors.push({ hex: "#2b4b7c", name: "Navy Blue (Bottom)" })
  if (canvas.outerwear) colors.push({ hex: "#8b7355", name: "Brown (Outer)" })
  if (canvas.footwear) colors.push({ hex: "#ffffff", name: "White (Shoes)" })

  const hasItems = colors.length > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold tracking-tight mb-1">Style Insights</h2>
        <p className="text-sm text-muted-foreground">Analisa kecocokan warna & gaya.</p>
      </div>

      {!hasItems ? (
        <div className="p-6 border border-dashed border-border rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col items-center text-center">
          <Info className="w-8 h-8 mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Pilih pakaian ke canvas untuk melihat analisa palet warna.</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-5"
        >
          {/* Color Extraction */}
          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="text-sm font-semibold mb-4 text-foreground/80">Palet Warna Terdeteksi</h3>
            <div className="flex gap-2 mb-4">
              {colors.map((c, i) => (
                <div 
                  key={i} 
                  className="w-10 h-10 rounded-full shadow-sm border border-black/10 dark:border-white/10" 
                  style={{ backgroundColor: c.hex }} 
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* AI Scoring Analysis */}
          <div className="p-5 rounded-2xl border border-border bg-card overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full -z-10" />
            <h3 className="text-sm font-semibold mb-1 text-foreground/80">Penilaian Lookmatch</h3>
            
            <div className="flex items-end gap-2 mb-4 mt-2">
              <span className="text-4xl font-bold font-mono tracking-tighter text-green-600 dark:text-green-400">92</span>
              <span className="text-muted-foreground mb-1 font-medium">/ 100</span>
            </div>

            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span className="text-muted-foreground"><strong>Kontras Baik:</strong> Gelap pada jaket dan cerah pada sepatu membentuk keseimbangan visual.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span className="text-muted-foreground"><strong>Tema Casual:</strong> Pilihan sneakers dengan jaket earthy tone cocok untuk hangout santai.</span>
              </li>
              <li className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Pertimbangkan untuk menambahkan aksesoris jam tangan perak untuk aksen.</span>
              </li>
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  )
}
