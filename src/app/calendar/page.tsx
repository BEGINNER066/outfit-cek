"use client"
import { Suspense } from "react"

import { WeeklyPlanner } from "@/components/weekly-planner"

export default function CalendarPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tighter mb-2">Weekly OOTD Planner</h1>
        <p className="text-muted-foreground text-lg">Jadwalkan outfit Anda minggu ini dan hemat waktu bersiap setiap pagi.</p>
      </div>

      <Suspense fallback={<div>Loading Planner...</div>}>
        <WeeklyPlanner />
      </Suspense>
    </div>
  )
}
