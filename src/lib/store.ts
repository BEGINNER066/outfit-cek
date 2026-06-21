import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ClothesCategory = 'tops' | 'bottoms' | 'outerwear' | 'footwear' | 'accessories'

export interface ClothesItem {
  id: string
  user_id: string
  image_url: string
  category: ClothesCategory
  color?: string
  tags?: string[]
}

export interface CanvasState {
  tops: ClothesItem | null
  bottoms: ClothesItem | null
  outerwear: ClothesItem | null
  footwear: ClothesItem | null
  accessories: ClothesItem[]
}

export interface OutfitCombination {
  id: string;
  name: string;
  images: string[];
  author?: string;
  likes?: number;
}

export interface PlannerOutfit {
  id: string;
  name: string;
  images: string[];
}

export interface PlannerDay {
  id: string;
  name: string;
  date: string;
  outfits: PlannerOutfit[];
}

interface AppStore {
  // Canvas State
  canvas: CanvasState
  setCanvasItem: (category: ClothesCategory, item: ClothesItem | null) => void
  addAccessory: (item: ClothesItem) => void
  removeAccessory: (id: string) => void
  clearCanvas: () => void

  // Wardrobe State
  activeCategory: ClothesCategory | 'all'
  setActiveCategory: (category: ClothesCategory | 'all') => void
  clothesList: ClothesItem[]
  setClothesList: (items: ClothesItem[]) => void
  removeClothes: (id: string) => void

  // Saved Outfits
  savedOutfits: OutfitCombination[]
  setSavedOutfits: (outfits: OutfitCombination[]) => void
  saveOutfit: (outfit: OutfitCombination) => void
  removeSavedOutfit: (id: string) => void

  // Planner
  plannerDays: PlannerDay[]
  setPlannerDays: (updater: PlannerDay[] | ((prev: PlannerDay[]) => PlannerDay[])) => void
  nextWeekPlannerDays: PlannerDay[]
  setNextWeekPlannerDays: (updater: PlannerDay[] | ((prev: PlannerDay[]) => PlannerDay[])) => void
}

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
const DAY_IDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

export function generateWeekDays(offsetWeeks: number = 0): PlannerDay[] {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun
  // Start from Monday of the target week
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + offsetWeeks * 7)

  const days: PlannerDay[] = []
  // Mon..Sun
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const jsDay = d.getDay() // 0=Sun
    days.push({
      id: DAY_IDS[jsDay],
      name: DAY_NAMES[jsDay],
      date: `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`,
      outfits: [],
    })
  }
  return days
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      canvas: {
        tops: null,
        bottoms: null,
        outerwear: null,
        footwear: null,
        accessories: [],
      },
      setCanvasItem: (category, item) => set((state) => {
        if (category === 'accessories') return state // Handled via addAccessory
        return {
          canvas: {
            ...state.canvas,
            [category]: item
          }
        }
      }),
      addAccessory: (item) => set((state) => ({
        canvas: {
          ...state.canvas,
          accessories: [...state.canvas.accessories, item]
        }
      })),
      removeAccessory: (id) => set((state) => ({
        canvas: {
          ...state.canvas,
          accessories: state.canvas.accessories.filter(a => a.id !== id)
        }
      })),
      clearCanvas: () => set({
        canvas: {
          tops: null,
          bottoms: null,
          outerwear: null,
          footwear: null,
          accessories: [],
        }
      }),

      activeCategory: 'all',
      setActiveCategory: (category) => set({ activeCategory: category }),
      clothesList: [],
      setClothesList: (items) => set({ clothesList: items }),
      removeClothes: (id) => set((state) => ({
        clothesList: state.clothesList.filter(c => c.id !== id)
      })),

      savedOutfits: [],
      setSavedOutfits: (outfits) => set({ savedOutfits: outfits }),
      saveOutfit: (outfit) => set((state) => ({
        savedOutfits: [...state.savedOutfits, outfit]
      })),
      removeSavedOutfit: (id) => set((state) => ({
        savedOutfits: state.savedOutfits.filter(o => o.id !== id)
      })),

      plannerDays: generateWeekDays(0),
      setPlannerDays: (updater) => set((state) => ({
        plannerDays: typeof updater === 'function' ? updater(state.plannerDays) : updater
      })),
      nextWeekPlannerDays: generateWeekDays(1),
      setNextWeekPlannerDays: (updater) => set((state) => ({
        nextWeekPlannerDays: typeof updater === 'function' ? updater(state.nextWeekPlannerDays) : updater
      })),
    }),
    {
      name: 'outfit-cek-storage',
      partialize: (state) => ({
        plannerDays: state.plannerDays,
        nextWeekPlannerDays: state.nextWeekPlannerDays,
        savedOutfits: state.savedOutfits,
        canvas: state.canvas
      }),
      // Re-sync dates from real calendar on rehydration, preserving saved outfits
      merge: (persisted: any, current) => {
        const syncDays = (stored: PlannerDay[], fresh: PlannerDay[]): PlannerDay[] => {
          return fresh.map((freshDay) => {
            const storedDay = stored?.find((s) => s.id === freshDay.id)
            return {
              ...freshDay,
              outfits: storedDay?.outfits ?? [],
            }
          })
        }

        return {
          ...current,
          ...(persisted as any),
          plannerDays: syncDays(persisted?.plannerDays, generateWeekDays(0)),
          nextWeekPlannerDays: syncDays(persisted?.nextWeekPlannerDays, generateWeekDays(1)),
        }
      },
    }
  )
)
