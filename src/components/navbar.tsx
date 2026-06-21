"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Sparkles, User, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { logout } from "@/app/auth/actions"

const routes = [
  { href: "/wardrobe", label: "Wardrobe" },
  { href: "/canvas", label: "Mix and Match" },
  { href: "/recommend", label: "Lookmatch" },
  { href: "/calendar", label: "Planner" },
  { href: "/lookbook", label: "Lookbook" },
]

export function Navbar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "glass !border-t-0 !border-x-0"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 z-50 group">
            <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tighter">Outfit-Cek</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-full backdrop-blur-md">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors z-10 ${
                  pathname?.startsWith(route.href)
                    ? "text-background"
                    : "text-foreground hover:text-foreground/80"
                }`}
              >
                {pathname?.startsWith(route.href) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-foreground rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {route.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            {!userEmail ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="rounded-full font-medium text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900">Masuk</Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-full px-6 font-medium bg-foreground text-background hover:bg-neutral-800 dark:hover:bg-neutral-200">
                    Mulai Gratis
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-neutral-100 dark:bg-neutral-900 rounded-full text-muted-foreground mr-1">
                  <User className="w-4 h-4" />
                  <span className="truncate max-w-[120px]">{userEmail}</span>
                </div>
                <form action={logout}>
                  <Button type="submit" variant="outline" className="rounded-full border-neutral-200 dark:border-neutral-800 text-destructive hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950">
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden z-50 p-2 -mr-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full bg-background/95 backdrop-blur-xl flex flex-col pt-24 px-6 overflow-hidden -z-10 border-b border-border"
          >
            <nav className="flex flex-col gap-6">
              {routes.map((route, i) => (
                <motion.div
                  key={route.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.1 }}
                >
                  <Link
                    href={route.href}
                    onClick={() => setIsOpen(false)}
                    className={`block text-3xl font-medium tracking-tight ${
                      pathname?.startsWith(route.href) ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {route.label}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-4 mt-8 pt-8 border-t border-border"
              >
                {!userEmail ? (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-center rounded-full py-6 text-lg">Masuk</Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full justify-center rounded-full py-6 text-lg">Mulai Gratis</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
                       <User className="w-4 h-4" /> <span>{userEmail}</span>
                    </div>
                    <form action={logout} className="w-full">
                      <Button type="submit" variant="outline" className="w-full justify-center rounded-full py-6 text-lg text-red-500 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
                        Keluar Akun
                      </Button>
                    </form>
                  </>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
