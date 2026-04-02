'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

interface GlobeProps {
  className?: string
}

export function Globe({ className }: GlobeProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme !== 'light'
  
  // Calculate fixed particle positions for a perfect sphere distribution (Fibonacci lattice)
  const particles = useMemo(() => {
    const points = []
    const numPoints = 300 // Number of dots inside the sphere
    const offset = 2 / numPoints
    const increment = Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < numPoints; i++) {
      const y = i * offset - 1 + offset / 2
      const r = Math.sqrt(1 - y * y)
      const phi = i * increment

      const x = Math.cos(phi) * r
      const z = Math.sin(phi) * r
      
      // Calculate dot scale based on simulated depth/randomness to give it texture
      const scale = Math.random() * 0.5 + 0.5
      points.push({ x, y, z, scale, i })
    }
    return points
  }, [])

  // Highlight some specific indexes to act as "pollution hotspots"
  const hotspotIndexes = new Set([42, 89, 156, 210, 275])

  if (!mounted) {
    return <div className={`w-full aspect-square max-w-[600px] ${className || ''}`} />
  }

  return (
    <div className={`relative flex items-center justify-center w-full aspect-square max-w-[600px] overflow-hidden ${className || ''}`}>
      <motion.div
        className="relative w-full h-full transform-style-3d perspective-[1000px] flex items-center justify-center"
        initial={{ rotateY: 0, rotateX: 20 }}
        animate={{ rotateY: 360, rotateX: 20 }}
        transition={{
          repeat: Infinity,
          duration: 35,
          ease: "linear",
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div style={{ transformStyle: 'preserve-3d', position: 'relative', width: '50%', height: '50%' }}>
            {particles.map((p) => {
              const isHotspot = hotspotIndexes.has(p.i)
              
              // Light/Dark mode specific styling for particles
              const bgColor = isHotspot 
                ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' 
                : isDark 
                  ? 'bg-white/80' 
                  : 'bg-black/60'
                  
              const size = isHotspot ? 'w-2 h-2 sm:w-2.5 sm:h-2.5' : 'w-1 h-1 sm:w-1.5 sm:h-1.5'

              return (
                <div
                  key={p.i}
                  className={`absolute rounded-full ${bgColor} ${size}`}
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate3d(${p.x * 200}px, ${p.y * 200}px, ${p.z * 200}px) scale(${p.scale})`,
                    backfaceVisibility: 'hidden',
                  }}
                />
              )
            })}
        </div>
      </motion.div>
      
      {/* Outer Glow Halo tracking theme changes tightly */}
      <div className={`absolute inset-0 rounded-full blur-[100px] -z-10 bg-primary/10 transition-colors duration-1000`}></div>
    </div>
  )
}
