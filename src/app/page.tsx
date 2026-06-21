"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles, LayoutGrid, Palette, Layers, CalendarCheck, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center pt-20 pb-32 px-4 text-center overflow-hidden">
        {/* Background Decorative Rings/Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neutral-200/50 dark:bg-neutral-800/30 rounded-full blur-[100px] opacity-60 -z-10 pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background/50 backdrop-blur-sm mb-8 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-foreground/70" />   
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter mb-8 leading-[1.1]">
            Elevate Your <span className="text-muted-foreground italic font-medium">Style</span>.
            <br />
            Digitize Your Wardrobe.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
            Upload pakaian Anda dan gunakan Split-Screen Slider kami untuk merancang kombinasi OOTD terbaik. Temukan palet warna indah, susun rencana mingguan, dan bagikan look terbaik Anda.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full h-14 text-base px-8 group bg-foreground text-background hover:bg-neutral-800 dark:hover:bg-neutral-200">
                Buka Lemari Virtual
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/canvas" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full h-14 text-base px-8 bg-background/50 backdrop-blur-md">
                Coba Mix and Match
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-neutral-50 dark:bg-neutral-950 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Fitur Lengkap Outfit-Cek</h2>
            <p className="text-muted-foreground text-lg">Semua yang Anda butuhkan untuk tampil maksimal setiap hari.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<LayoutGrid />}
              title="Virtual Closet"
              desc="Simpan katalog pakaian Anda berdasarkan kategori: Tops, Bottoms, Outerwear, dll."
            />
            <FeatureCard 
              icon={<Layers />}
              title="Carousel Mix and Match"
              desc="Geser baris horizontal secara independen untuk merancang visual OOTD yang selaras dari atas ke bawah secara elegan."
            />
            <FeatureCard 
              icon={<Palette />}
              title="Color Palette Guide"
              desc="Sistem Color Scoring otomatis memastikan perpaduan warna baju Anda selaras secara estetik."
            />
            <FeatureCard 
              icon={<Sparkles />}
              title="Lookmatch & Themes"
              desc="Rekomendasi outfit pintar berdasarkan 1-2 item pilihan atau tema seperti Work, Date, Sport."
            />
            <FeatureCard 
              icon={<CalendarCheck />}
              title="Weekly Planner"
              desc="Jadwalkan Outfit Of The Day (OOTD) Anda ke kalender khusus dan bersiap lebih awal."
            />
            <FeatureCard 
              icon={<Share2 />}
              title="Community Lookbook"
              desc="Temukan inspirasi dari pengguna lain, berikan like, save, dan copy gaya mereka (ala Pinterest)."
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group p-8 rounded-[2rem] bg-background border border-border hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6 text-foreground group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  )
}
