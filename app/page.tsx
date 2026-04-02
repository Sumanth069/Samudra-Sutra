'use client'

import { motion, Variants } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Waves, ShieldAlert, Navigation, Activity } from 'lucide-react'
import { Globe } from '@/components/ui/globe'
import { ThemeToggle } from '@/components/ui/theme-toggle'

// Animation variants
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 lg:px-12 backdrop-blur-md bg-background/50 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="bg-foreground text-background p-1.5 rounded-full">
            <Waves className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-lg">Samudra Sutra</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-16 px-4">
        <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center opacity-30 mt-32 pointer-events-none">
          <Globe className="w-[800px] h-[800px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        <div className="z-10 text-center max-w-5xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "circOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/30 backdrop-blur-sm text-sm font-medium text-muted-foreground"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            Live Global Marine Intelligence
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-[0.9] text-foreground"
          >
            Stop Pollution. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
              Before the Ocean.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium"
          >
            A devastating prevention-first telemetry system. We rely on localized crowdsourcing and Gemini-powered forensics to intercept terrestrial waste at the source.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Link href="/citizen/login" className="w-full sm:w-auto">
              <button className="group relative w-full flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 rounded-full font-semibold text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95">
                <span className="relative z-10">Citizen Portal</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-blue-500 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              </button>
            </Link>
            
            <Link href="/login" className="w-full sm:w-auto">
              <button className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg border border-border bg-muted/20 hover:bg-muted/50 backdrop-blur-sm transition-all hover:border-foreground/30">
                Authority Access
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Fact Parallax Section */}
      <section className="relative py-32 px-6 border-y border-border/40 bg-muted/10">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
        >
          <div className="space-y-12">
            <motion.div variants={fadeUp}>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                "We cannot clean the ocean <br className="hidden md:block"/>if the rivers <br className="hidden md:block"/>never stop bleeding."
              </h2>
              <div className="h-1 w-24 bg-foreground mt-8"></div>
            </motion.div>
            
            <motion.p variants={fadeUp} className="text-xl text-muted-foreground font-medium max-w-lg leading-relaxed">
              Every single hour, enough plastic to fill 11 Olympic-sized swimming pools enters the ocean. 
              If we don't intercept it on land, it is gone forever.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={fadeUp} className="bg-card border border-border p-8 rounded-3xl col-span-1 sm:col-span-2 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-7xl font-black mb-2 tracking-tighter">8M+</h3>
              <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">Tons Annually</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-5xl font-black mb-2 tracking-tighter text-blue-500">80%</h3>
              <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Originates from Land</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-5xl font-black mb-2 tracking-tighter text-red-500">1.5X</h3>
              <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Multiplier per decade</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* The Solution Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 md:text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">The Operating System for Oceans.</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">A brutalist, high-efficiency stack designed to locate and eliminate pollution signatures globally.</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Feature 1 */}
            <motion.div variants={fadeUp} className="group p-8 rounded-3xl bg-muted/20 border border-border hover:bg-card hover:border-foreground/20 transition-all duration-300">
              <div className="w-12 h-12 bg-foreground text-background rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Hyperlocal Telemetry</h3>
              <p className="text-muted-foreground">Citizens act as thousands of distributed sensor nodes, mapping exact GPS coordinates of shoreline anomalies.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeUp} className="group p-8 rounded-3xl bg-muted/20 border border-border hover:bg-card hover:border-foreground/20 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Gemini 2.5 Forensics</h3>
              <p className="text-muted-foreground">Every uploaded image is instantly processed by multimodal AI to determine material composition and ecological severity without human intervention.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeUp} className="group p-8 rounded-3xl bg-muted/20 border border-border hover:bg-card hover:border-foreground/20 transition-all duration-300">
              <div className="w-12 h-12 bg-cyan-400 text-background rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Tactical Operations</h3>
              <p className="text-muted-foreground">The Authority Command Center routes interception tasks instantly, turning generalized raw data into actionable physical clearance missions.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 text-center text-muted-foreground px-4">
        <p className="font-semibold text-lg text-foreground mb-2 flex items-center justify-center gap-2">
          Samudra Sutra <span className="w-1.5 h-1.5 rounded-full bg-blue-500 block"></span> Intelligence
        </p>
        <p className="text-sm">Built for extreme-scale environmental preservation.</p>
      </footer>
    </div>
  )
}
