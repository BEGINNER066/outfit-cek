"use client"

import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useAppStore, generateWeekDays, PlannerDay } from "@/lib/store"

// Helper: format header label for a week
function getWeekHeader(days: PlannerDay[]): string {
  if (!days.length) return ""
  const first = days[0]
  const last = days[days.length - 1]
  // Extract month from date string (e.g. "2 Jun")
  const firstParts = first.date.split(" ")
  const lastParts = last.date.split(" ")
  if (firstParts[1] === lastParts[1]) {
    return `${firstParts[1]} ${getYearForWeek(0)}`
  }
  return `${firstParts[1]} – ${lastParts[1]} ${getYearForWeek(0)}`
}

function getYearForWeek(offsetWeeks: number): number {
  const today = new Date()
  today.setDate(today.getDate() + offsetWeeks * 7)
  return today.getFullYear()
}

function getNextWeekHeader(days: PlannerDay[]): string {
  if (!days.length) return ""
  const first = days[0]
  const last = days[days.length - 1]
  const firstParts = first.date.split(" ")
  const lastParts = last.date.split(" ")
  if (firstParts[1] === lastParts[1]) {
    return `${firstParts[1]} ${getYearForWeek(1)}`
  }
  return `${firstParts[1]} – ${lastParts[1]} ${getYearForWeek(1)}`
}

export function WeeklyPlanner() {
  const {
    savedOutfits,
    plannerDays,
    setPlannerDays,
    nextWeekPlannerDays,
    setNextWeekPlannerDays,
  } = useAppStore()

  // Which week is active: 0 = this week, 1 = next week
  const [activeWeek, setActiveWeek] = useState<0 | 1>(0)

  const days = activeWeek === 0 ? plannerDays : nextWeekPlannerDays
  const setDays = activeWeek === 0 ? setPlannerDays : setNextWeekPlannerDays

  // Dialog state
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null)
  const [editOutfitId, setEditOutfitId] = useState<string | null>(null)
  const [newOutfitName, setNewOutfitName] = useState("")
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const scheduleOutfitId = searchParams.get('schedule')

  useEffect(() => {
    if (scheduleOutfitId) {
      setSelectedOutfitId(scheduleOutfitId)
      // Open dialog in "new schedule" mode
      setSelectedDayId(null) // force user to choose a day
      setEditOutfitId(null)
      setNewOutfitName("")
      setIsDialogOpen(true)
      
      // Clean up the URL so it doesn't reopen on refresh
      router.replace('/calendar')
    }
  }, [scheduleOutfitId, router])

  // Sync dates from real calendar every render (in case user leaves the page open across midnight)
  const thisWeekDates = useMemo(() => generateWeekDays(0), [])
  const nextWeekDates = useMemo(() => generateWeekDays(1), [])

  const headerLabel = activeWeek === 0
    ? getWeekHeader(thisWeekDates)
    : getNextWeekHeader(nextWeekDates)

  const handleSaveOutfit = () => {
    if (!newOutfitName.trim()) {
      toast.error("Nama acara tidak boleh kosong")
      return
    }

    setDays((prev) =>
      prev.map((day) => {
        if (day.id === selectedDayId) {
          if (editOutfitId) {
            return {
              ...day,
              outfits: day.outfits.map((o) =>
                o.id === editOutfitId ? { ...o, name: newOutfitName } : o
              ),
            }
          } else {
            let newImages = ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300"]
            let finalName = newOutfitName

            if (selectedOutfitId) {
              const savedOut = savedOutfits.find((o) => o.id === selectedOutfitId)
              if (savedOut) {
                newImages = savedOut.images
                if (!finalName.trim()) finalName = savedOut.name
              }
            }
            
            // If they are scheduling from external source, they might have selected a day in the dropdown.
            // We need selectedDayId to be valid.
            if (!selectedDayId) {
               toast.error("Pilih hari terlebih dahulu")
               return day
            }

            return {
              ...day,
              outfits: [
                ...day.outfits,
                {
                  id: Date.now().toString(),
                  name: finalName,
                  images: newImages,
                },
              ],
            }
          }
        }
        return day
      })
    )

    toast.success(
      editOutfitId
        ? `Outfit "${newOutfitName}" berhasil diubah!`
        : `Outfit untuk "${newOutfitName}" berhasil ditambahkan!`
    )
    closeDialog()
  }

  const handleDeleteOutfit = () => {
    if (!editOutfitId || !selectedDayId) return

    setDays((prev) =>
      prev.map((day) => {
        if (day.id === selectedDayId) {
          return {
            ...day,
            outfits: day.outfits.filter((o) => o.id !== editOutfitId),
          }
        }
        return day
      })
    )

    toast.success("Outfit berhasil dihapus.")
    closeDialog()
  }

  const openAddDialog = (dayId: string) => {
    setSelectedDayId(dayId)
    setEditOutfitId(null)
    setNewOutfitName("")
    setSelectedOutfitId(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (dayId: string, outfitId: string, outfitName: string) => {
    setSelectedDayId(dayId)
    setEditOutfitId(outfitId)
    setNewOutfitName(outfitName)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setSelectedDayId(null)
    setEditOutfitId(null)
    setNewOutfitName("")
    setSelectedOutfitId(null)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Dialog for Adding/Editing Outfit */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editOutfitId ? "Ubah Outfit" : "Jadwalkan Outfit"}</DialogTitle>
            <DialogDescription>
              {editOutfitId
                ? "Ubah nama acara atau hapus outfit ini dari jadwal Anda."
                : "Tambahkan outfit baru ke planner. (Versi demo menggunakan gambar acak)."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            {/* If no day is selected initially (meaning it came from "Jadwalkan OOTD" globally), show Day selector */}
            {selectedDayId === null || isDialogOpen ? ( // wait, we shouldn't show it if they opened from a specific day, but actually if we just always show it when !editOutfitId or when selectedDayId is what we are setting, it's fine.
              // Let's explicitly check if we opened globally. We know it's global if selectedDayId is null when opening, but we modify it.
              // We can just ALWAYS show the day selector if we are creating a NEW event.
              !editOutfitId && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Hari</Label>
                  <Select onValueChange={setSelectedDayId} value={selectedDayId || ""}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih Hari" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} ({d.date.split(" ")[0]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )
            ) : null}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Acara / Gaya
              </Label>
              <Input
                id="name"
                value={newOutfitName}
                onChange={(e) => setNewOutfitName(e.target.value)}
                placeholder="cth: Meeting Kantor"
                className="col-span-3"
                onKeyDown={(e) => e.key === "Enter" && handleSaveOutfit()}
              />
            </div>

            {!editOutfitId && (
              <div className="grid grid-cols-4 items-start gap-4 mt-2 border-t pt-4">
                <Label className="text-right mt-2 text-sm leading-tight">
                  Pilih Outfit <br />
                  <span className="text-xs text-muted-foreground">(Lookmatch)</span>
                </Label>
                <div className="col-span-3 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto stylish-scroll p-1">
                  {savedOutfits.length === 0 ? (
                    <p className="text-xs text-muted-foreground col-span-2">
                      Belum ada outfit tersimpan. Gunakan Lookmatch untuk menyimpan kombinasi.
                    </p>
                  ) : (
                    savedOutfits.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => setSelectedOutfitId(o.id)}
                        className={`cursor-pointer rounded-lg border p-2 flex flex-col gap-1.5 transition-all ${
                          selectedOutfitId === o.id
                            ? "border-primary ring-1 ring-primary bg-primary/5"
                            : "border-border hover:bg-neutral-50 dark:hover:bg-neutral-900"
                        }`}
                      >
                        <p className="text-xs font-medium truncate">{o.name}</p>
                        <div className="flex gap-1 overflow-x-auto pb-1">
                          {o.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              className="w-8 h-8 rounded object-cover shadow-sm"
                              alt="item"
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter
            className={`flex ${
              editOutfitId ? "justify-between sm:justify-between" : "justify-end sm:justify-end"
            }`}
          >
            {editOutfitId && (
              <Button type="button" variant="destructive" onClick={handleDeleteOutfit}>
                Hapus
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Batal
              </Button>
              <Button type="button" onClick={handleSaveOutfit}>
                Simpan
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Week Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">{headerLabel}</h2>
        <div className="flex items-center gap-2">
          {/* Week toggle tabs */}
          <div className="flex bg-neutral-100 dark:bg-neutral-900 rounded-lg p-1">
            <button
              onClick={() => setActiveWeek(0)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeWeek === 0
                  ? "bg-white dark:bg-neutral-800 shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Minggu ini
            </button>
            <button
              onClick={() => setActiveWeek(1)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeWeek === 1
                  ? "bg-white dark:bg-neutral-800 shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Minggu depan
            </button>
          </div>
        </div>
      </div>

      {/* Week indicator badge */}
      {activeWeek === 1 && (
        <div className="flex items-center gap-2 -mt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Merencanakan minggu depan
          </span>
        </div>
      )}

      {/* Grid Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {days.map((day) => (
          <div
            key={day.id}
            className="flex flex-col min-h-[350px] border border-border bg-card rounded-3xl p-4"
          >
            <div className="text-center mb-6 border-b border-border/50 pb-4">
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">
                {day.name}
              </div>
              <div className="text-2xl font-bold">{day.date.split(" ")[0]}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{day.date.split(" ")[1]}</div>
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 stylish-scroll">
              {day.outfits.length > 0 ? (
                <>
                  {day.outfits.map((outfit) => (
                    <div
                      key={outfit.id}
                      onClick={() => openEditDialog(day.id, outfit.id, outfit.name)}
                      className="w-full flex flex-col gap-2 relative group cursor-pointer bg-neutral-50 dark:bg-neutral-900/50 p-2 rounded-2xl border border-border/50"
                    >
                      <div className="flex flex-col">
                        {outfit.images.map((img: string, idx: number) => (
                          <img
                            key={idx}
                            src={img}
                            className={`w-full aspect-[4/3] object-cover rounded-xl shadow-sm border border-border ${
                              idx > 0 ? "-mt-4 translate-x-2" : ""
                            }`}
                            alt={`Outfit item ${idx + 1}`}
                          />
                        ))}
                      </div>

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium px-3 py-1.5 bg-black/50 rounded-full backdrop-blur-sm">
                          Ubah / Hapus
                        </span>
                      </div>

                      <div className="text-center text-xs text-muted-foreground font-medium mt-1">
                        {outfit.name}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => openAddDialog(day.id)}
                    className="w-full py-3 mt-2 flex items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground hover:bg-neutral-100 hover:text-foreground dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    <span className="text-xs font-medium">Acara Lain</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <button
                    onClick={() => openAddDialog(day.id)}
                    className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-neutral-100 hover:text-foreground dark:hover:bg-neutral-800 transition-colors flex items-center justify-center group"
                  >
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
