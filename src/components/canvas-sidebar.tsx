"use client"

import { useAppStore } from "@/lib/store"
import { useState } from "react"
import { motion } from "framer-motion"

export function CanvasSidebar() {
  const { clothesList, setCanvasItem } = useAppStore()
  const [activeTab, setActiveTab] = useState<"tops"|"bottoms"|"outerwear"|"footwear">("tops")

  const tabs = [
    { id: "tops", label: "Tops" },
    { id: "bottoms", label: "Bottoms" },
    { id: "outerwear", label: "Outer" },
    { id: "footwear", label: "Shoes" },
  ] as const

  const items = clothesList.filter(c => c.category === activeTab)

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold mb-3">Pilih Item</h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-foreground text-background"
                  : "bg-neutral-200/50 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm mt-10">
            Tidak ada item. Upload dulu di Wardrobe.
          </p>
        ) : (
          items.map(item => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCanvasItem(activeTab, item)}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-border group bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image_url} alt="Item" className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md">
                  Pakai ke Canvas
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
