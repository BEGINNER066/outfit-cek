import { ClothesItem } from "./store"

// Definisi aturan kecocokan warna (Color Harmony)
const COLOR_FAMILIES: Record<string, string[]> = {
  "merah": ["hitam", "putih", "abu-abu", "navy", "merah"],
  "biru": ["putih", "abu-abu", "coklat", "hitam", "biru", "navy"],
  "hijau": ["coklat", "hitam", "putih", "krem", "hijau"],
  "kuning": ["hitam", "putih", "abu-abu", "biru", "kuning"],
  "coklat": ["krem", "hijau", "biru", "hitam", "putih", "coklat"],
  "hitam": ["putih", "abu-abu", "merah", "biru", "hijau", "kuning", "coklat", "hitam", "navy", "krem"],
  "putih": ["hitam", "abu-abu", "merah", "biru", "hijau", "kuning", "coklat", "putih", "navy", "krem"],
  "abu-abu": ["hitam", "putih", "merah", "biru", "hijau", "abu-abu", "navy"],
  "navy": ["putih", "abu-abu", "coklat", "merah", "hitam", "biru", "navy"],
  "krem": ["coklat", "hijau", "putih", "hitam", "krem"],
}

export function calculateStyleScore(items: (ClothesItem | null)[]): { score: number, feedback: string[] } {
  const selected = items.filter(Boolean) as ClothesItem[]
  if (selected.length === 0) {
    return { 
      score: 0, 
      feedback: ["Pilih pakaian untuk melihat skor kecocokan gaya dan warna."] 
    }
  }

  // Base score diturunkan agar ada ruang untuk fluktuasi
  let score = 50
  const feedback: string[] = []

  // 1. Completeness Score (Maks 20)
  score += selected.length * 5 
  
  if (selected.length >= 3) {
    feedback.push("Kombinasi layer pakaian sudah cukup lengkap.")
  } else {
    feedback.push("Tambahkan lebih banyak item untuk hasil lebih baik.")
  }

  // 2. Category Compatibility (Maks 10)
  const categories = selected.map(s => s.category)
  if (categories.includes("outerwear") && categories.includes("tops")) {
    score += 5
  }
  if (categories.includes("tops") && categories.includes("bottoms")) {
    score += 5
  }

  // 3. Color Harmony Calculation (Maks 20)
  const getColor = (item: ClothesItem) => {
    if (item.color) return item.color.toLowerCase()
    
    const knownColors = Object.keys(COLOR_FAMILIES)
    if (item.tags) {
      for (const tag of item.tags) {
        if (knownColors.includes(tag.toLowerCase())) {
          return tag.toLowerCase()
        }
      }
    }
    
    // Fallback warna berdasarkan ID item agar konsisten namun bervariasi antar pakaian
    const fallbackColors = ['hitam', 'putih', 'abu-abu', 'navy', 'coklat', 'krem', 'merah', 'biru', 'hijau', 'kuning']
    const hash = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return fallbackColors[hash % fallbackColors.length]
  }

  const colors = selected.map(getColor)
  const uniqueColors = Array.from(new Set(colors))
  
  let colorScore = 0
  
  if (uniqueColors.length === 1 && selected.length > 1) {
    colorScore += 20
    feedback.push(`Gaya Monochrome (${colors[0]}) terlihat elegan dan minimalis.`)
  } else if (uniqueColors.length > 3) {
    colorScore -= 10
    feedback.push("Terlalu banyak warna. Coba batasi maksimal 3 warna agar lebih rapi.")
  } else {
    // Mengecek apakah warna-warna unik saling cocok berdasarkan COLOR_FAMILIES
    let harmonyMatches = 0
    let totalPairs = 0
    let isClashing = false
    
    for (let i = 0; i < uniqueColors.length; i++) {
      for (let j = i + 1; j < uniqueColors.length; j++) {
        totalPairs++
        const c1 = uniqueColors[i]
        const c2 = uniqueColors[j]
        
        const c1Matches = COLOR_FAMILIES[c1]?.includes(c2)
        const c2Matches = COLOR_FAMILIES[c2]?.includes(c1)
        
        if (c1Matches || c2Matches) {
          harmonyMatches++
        } else {
          isClashing = true
        }
      }
    }
    
    if (totalPairs > 0) {
      const harmonyRatio = harmonyMatches / totalPairs
      colorScore += Math.floor(harmonyRatio * 20)
      
      if (harmonyRatio === 1) {
        feedback.push("Perpaduan warna sangat harmonis dan cocok.")
      } else if (harmonyRatio >= 0.5) {
        feedback.push("Beberapa warna cocok dipadukan, namun ada sedikit kontras.")
      } else {
        feedback.push("Warna pakaian terlihat saling bertabrakan (clashing).")
      }
    }
  }

  score += colorScore

  // 4. Style Nuance (Fluktuasi Dinamis -5 s/d +5)
  // Ini memastikan bahwa meskipun warnanya sama, mengganti jenis baju akan sedikit merubah skor kecocokan gaya (fit)
  const styleHash = selected.reduce((acc, item) => acc + item.id.charCodeAt(0) + item.id.charCodeAt(item.id.length - 1), 0)
  const styleNuance = (styleHash % 11) - 5 
  
  score += styleNuance

  // Memastikan skor selalu di rentang 0-100
  score = Math.min(Math.max(Math.floor(score), 0), 100)

  return {
    score,
    feedback
  }
}
