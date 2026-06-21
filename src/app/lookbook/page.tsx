"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Search, BookmarkPlus, Sparkles, Trash2, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useAppStore, OutfitCombination } from "@/lib/store"
import { toast } from "sonner"

const DUMMY_LOOKBOOK = [
  { id: "c1", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600", likes: 124, author: "Ayu Style" },
  { id: "c2", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600", likes: 89, author: "Satya X" },
  { id: "c3", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600", likes: 230, author: "Budi" },
  { id: "c4", image: "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=600", likes: 56, author: "Vina" },
  { id: "c5", image: "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=600", likes: 412, author: "Dina Fashion" },
  { id: "c6", image: "https://images.unsplash.com/photo-1520975954732-57dd22299614?w=600", likes: 18, author: "Ervan" },
]

export default function LookbookPage() {
  const { setSavedOutfits, removeSavedOutfit, saveOutfit } = useAppStore()
  const [dbOutfits, setDbOutfits] = useState<(OutfitCombination & { created_at?: string })[]>([])
  const [communityPosts, setCommunityPosts] = useState(DUMMY_LOOKBOOK)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchSavedOutfits() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data, error } = await supabase
            .from("saved_outfits")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
          if (error) throw error
          if (data) {
            const formatted: OutfitCombination[] = data.map((row: any) => ({
              id: row.id,
              name: row.name,
              images: row.images,
              author: "Anda",
              likes: 0,
            }))
            setDbOutfits(data.map((row: any) => ({
              id: row.id,
              name: row.name,
              images: row.images,
              author: "Anda",
              likes: 0,
              created_at: row.created_at,
            })))
            setSavedOutfits(formatted)
          }
        }
      } catch (err) {
        console.error("Gagal mengambil saved outfits:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSavedOutfits()
  }, [setSavedOutfits])

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("saved_outfits").delete().eq("id", id)
      if (error) throw error
      setDbOutfits(prev => prev.filter(o => o.id !== id))
      removeSavedOutfit(id)
      toast.success("Outfit dihapus dari koleksi Anda.")
    } catch (err) {
      toast.error("Gagal menghapus outfit.")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      
      const newPost = {
        id: "user-post-" + Date.now(),
        image: imageUrl,
        likes: 0,
        author: "Anda"
      }
      
      setCommunityPosts(prev => [newPost, ...prev])
      setIsUploading(false)
      toast.success("Foto berhasil dibagikan ke komunitas!")
    }
    reader.readAsDataURL(file)
  }

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev)
      const isLiked = newSet.has(postId)
      
      if (isLiked) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      
      // Update communityPosts state for like count
      setCommunityPosts(posts => posts.map(p => {
        if (p.id === postId) {
          return { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 }
        }
        return p
      }))
      
      return newSet
    })
  }

  const handleSaveCommunity = async (post: any) => {
    // Prevent duplicate saves if we want, but letting them save is fine.
    const outfitToSave = {
      id: "saved-" + post.id,
      name: "Inspirasi dari " + post.author,
      images: [post.image],
      author: post.author,
      likes: post.likes
    }

    saveOutfit(outfitToSave)
    // Update local dbOutfits so it shows up immediately in Koleksi Tersimpan
    setDbOutfits(prev => [outfitToSave, ...prev])

    toast.info("Menyimpan inspirasi...")

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
      toast.success("Outfit berhasil ditambahkan ke koleksi!")
    } catch (err: any) {
      console.error(err)
      toast.error("Disimpan secara lokal, namun gagal sync ke database.")
    }
  }

  const filteredCommunity = communityPosts.filter(p =>
    p.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredSaved = dbOutfits.filter(outfit => 
    outfit.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">Lookbook</h1>
          <p className="text-muted-foreground text-lg">Koleksi gaya Anda dan inspirasi dari komunitas.</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau gaya..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-full bg-neutral-100 dark:bg-neutral-900 border-none"
          />
        </div>
      </div>

      <Tabs defaultValue="saved">
        <TabsList className="mb-8 h-12 rounded-full bg-neutral-100 dark:bg-neutral-900 p-1">
          <TabsTrigger value="saved" className="rounded-full h-10 px-6 gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background">
            <Sparkles className="w-4 h-4" />
            Koleksi Tersimpan
            {dbOutfits.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/20">{dbOutfits.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="community" className="rounded-full h-10 px-6 gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background">
            <Users className="w-4 h-4" />
            Inspirasi Komunitas
          </TabsTrigger>
        </TabsList>
        
        {/* Hidden file input for uploading to community */}
        <input 
          type="file" 
          id="community-upload" 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileUpload} 
        />

        {/* ── TAB 1: KOLEKSI TERSIMPAN ── */}
        <TabsContent value="saved">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-10 h-10 border-4 border-neutral-200 dark:border-neutral-800 border-t-foreground rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground font-medium">Memuat koleksi Anda...</p>
            </div>
          ) : dbOutfits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-border rounded-3xl text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Belum ada outfit tersimpan</h3>
              <p className="text-muted-foreground max-w-sm">
                Buka fitur <strong>AI Fashion Stylist</strong>, pilih tema favorit Anda, dan klik tombol <strong>"Simpan Outfit"</strong> untuk menyimpan kombinasi ke sini.
              </p>
            </motion.div>
          ) : filteredSaved.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <Search className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Tidak ada hasil</h3>
              <p className="text-muted-foreground">Tidak ditemukan outfit dengan kata kunci "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start w-full">
              <AnimatePresence>
                {filteredSaved.map((outfit, i) => (
                  <motion.div
                    key={outfit.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.04 }}
                    className="relative group rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 cursor-pointer w-full"
                  >
                    {/* Stacked Images Preview */}
                    <div className="relative w-full bg-neutral-100 dark:bg-neutral-900 flex flex-col gap-0.5 p-3">
                      {outfit.images.slice(0, 3).map((img, idx) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          key={idx}
                          src={img}
                          alt={`Item ${idx + 1}`}
                          className={`w-full object-cover rounded-xl shadow-sm ${
                            idx === 0 ? "aspect-square" : idx === 1 ? "aspect-[4/3]" : "aspect-[2/1]"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDelete(outfit.id)}
                          className="w-9 h-9 rounded-full bg-red-500/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg"
                          title="Hapus dari koleksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full mb-2">
                          <Sparkles className="w-3 h-3 text-white" />
                          <span className="text-white text-xs font-medium">AI Saved</span>
                        </div>
                        <p className="text-white font-semibold text-sm leading-tight">{outfit.name}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* ── TAB 2: KOMUNITAS ── */}
        <TabsContent value="community">
          <div className="flex justify-end mb-6">
            <label 
              htmlFor="community-upload" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-semibold rounded-full hover:opacity-90 transition-opacity shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {isUploading ? "Mengunggah..." : "Bagikan OOTD Anda"}
            </label>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start w-full">
            {filteredCommunity.map(post => (
              <div
                key={post.id}
                className="relative group rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 cursor-pointer w-full h-full flex flex-col"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image}
                  alt="Outfit"
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-5">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleSaveCommunity(post); }}
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                      title="Simpan ke koleksi"
                    >
                      <BookmarkPlus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-white font-medium text-sm">@{post.author}</p>
                      <p className="text-white/80 text-xs">Ketuk untuk copy AI Match</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium hover:bg-white/30 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? "fill-red-500 text-red-500" : "fill-white text-white"}`} />
                      {post.likes}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

