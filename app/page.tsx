'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Droplets, Shield, MapPin, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      <main className="flex-1">
        
        {/* HERO SECTION */}
        <section className="w-full py-16 md:py-24 lg:py-32 xl:py-48 bg-muted/40 relative overflow-hidden flex items-center justify-center min-h-[85vh]">
          <div className="container px-4 md:px-6 relative z-10">
            <motion.div 
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.9, ease: "easeOut" }}
               className="flex flex-col items-center space-y-6 text-center"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="inline-flex items-center gap-2 rounded-full bg-blue-100/50 dark:bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 mb-4"
              >
                <Activity className="h-4 w-4 animate-pulse" /> Latest Data Sync Complete
              </motion.div>

              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-600 drop-shadow-sm pb-2">
                  Samudra Sutra
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl font-medium leading-relaxed">
                  BlueTrace Intelligence System. A prevention-first, event-driven marine intelligence platform tracking pollution from land to ocean.
                </p>
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 pt-8"
              >
                <Link href="/citizen/login">
                  <Button size="lg" className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/25 transition-all text-md px-8 py-6 h-auto">
                    <MapPin className="h-5 w-5" />
                    Citizen Report Portal
                  </Button>
                </Link>
                <Link href="/admin/dashboard">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 shadow-sm border-2 text-md px-8 py-6 h-auto hover:bg-muted transition-all">
                    <Shield className="h-5 w-5" />
                    Authority Login
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Decorative background elements */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" 
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" 
          />
        </section>

        {/* FEATURES SECTION */}
        <section className="w-full py-20 md:py-32 bg-background border-t border-muted/50">
          <div className="container px-4 md:px-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Active Telemetry Mechanics</h2>
              <p className="text-muted-foreground w-full max-w-2xl mx-auto text-lg">
                Harnessing real-time models and civic feedback to safeguard marine ecosystems.
              </p>
            </motion.div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="flex flex-col items-center space-y-4 text-center p-8 rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800"
              >
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl shadow-inner mb-2">
                  <Droplets className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold">Flow Simulation</h3>
                <p className="text-muted-foreground leading-relaxed">Models drainage systems to predict exactly when and where pollution will reach marine ecosystems.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="flex flex-col items-center space-y-4 text-center p-8 rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800"
              >
                <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 rounded-2xl shadow-inner mb-2">
                  <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">Citizen Verified Hub</h3>
                <p className="text-muted-foreground leading-relaxed">Snap a photo and earn credits. Our AI verification ensures data authenticity while giving back to the community.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="flex flex-col items-center space-y-4 text-center p-8 rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-xl sm:col-span-2 lg:col-span-1 hover:border-purple-200 dark:hover:border-purple-800"
              >
                <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-2xl shadow-inner mb-2">
                  <MapPin className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold">Action-Driven Intel</h3>
                <p className="text-muted-foreground leading-relaxed">Convert data patterns into automated deployment tasks for clearance teams before the pollution hits the ocean.</p>
              </motion.div>

            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 md:py-6 bg-muted/20">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 text-sm text-muted-foreground font-medium">
          <p>Built for the future of our oceans.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-foreground transition-colors hover:underline">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground transition-colors hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
