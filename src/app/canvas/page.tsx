"use client"

import { LayerSlider } from "@/components/layer-slider"

export default function CanvasPage() {
  return (
    <div className="h-[calc(100vh-5rem)] overflow-hidden">
      <LayerSlider />
    </div>
  )
}
