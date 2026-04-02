'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, MapPin, UploadCloud, AlertCircle, CheckCircle2, RefreshCw, Trophy, LayoutDashboard, History, LogOut } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'

import { db } from '@/lib/firebase/client'
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore'

export default function CitizenDashboard() {
  const [loadingGeo, setLoadingGeo] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [geoError, setGeoError] = useState<string>('')
  
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  
  const [credits, setCredits] = useState(0)
  const [earned, setEarned] = useState(0)
  const [history, setHistory] = useState<any[]>([])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')
  
  // Fetch Global DB on Mount and Poll mapped to specific user
  useEffect(() => {
    const emailStr = localStorage.getItem('citizen_email') || ''
    setUserEmail(emailStr)
    const fetchDB = async () => {
      if (!emailStr) return
      try {
        const qCredits = query(collection(db, 'credit_transactions'), where('user_id', '==', emailStr))
        const creditSnap = await getDocs(qCredits)
        let totalCredits = 0
        creditSnap.forEach(d => totalCredits += (d.data().amount || 0))
        setCredits(totalCredits)

        const qReports = query(collection(db, 'pollution_reports'), where('source_email', '==', emailStr), limit(10))
        const repSnap = await getDocs(qReports)
        
        // Mapping raw generic DB structure into strictly formatted UI reports
        const parsedHist = repSnap.docs.map(doc => {
           const r = doc.data()
           return {
             ...r,
             id: doc.id,
             type: r.type || 'waste',
             estimatedVolume: r.estimatedVolume || 0,
             timestamp: r.reportedAt
           }
        })
        setHistory(parsedHist)
      } catch (err) {
         console.warn("Firestore Pull block - DB rules might not be updated to 'true' in console yet.")
      }
    }
    fetchDB()
    const interval = setInterval(fetchDB, 5000)
    return () => clearInterval(interval)
  }, [])

  const startCamera = async () => {
    try {
      setGeoError('')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setIsCameraOpen(true)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 100)
    } catch (err) {
      setGeoError("Unable to access camera or permissions denied.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraOpen(false)
  }

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setPhotoPreview(dataUrl)
        canvas.toBlob((blob) => {
           if (blob) setPhoto(new File([blob], 'capture.jpg', { type: 'image/jpeg' }))
        }, 'image/jpeg', 0.8)
        
        setLoadingGeo(true)
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
              setLoadingGeo(false)
            },
            (err) => {
              setGeoError("Photo captured, but GPS metadata failed: " + err.message)
              setLoadingGeo(false)
            }
          )
        }
      }
      stopCamera()
    }
  }

  const handleUpload = async () => {
    if (!photo || !location) return

    setIsUploading(true)
    setGeoError('')
    const formData = new FormData()
    formData.append('image', photo)
    formData.append('lat', location.lat.toString())
    formData.append('lng', location.lng.toString())
    formData.append('email', userEmail)

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      
      if (res.ok && data.success) {
        setEarned(data.credits)
        setUploadSuccess(true)

        // Native Firebase Push Process executed on Client strictly avoiding SSR complexities
        const { reportData } = data
        try {
            await addDoc(collection(db, "pollution_reports"), {
                ...reportData,
                source_email: userEmail,
                imageUrl: photoPreview || null
            })
            
            if (reportData.severity === 'critical' || reportData.severity === 'high') {
                await addDoc(collection(db, "system_alerts"), {
                    type: 'HIGH_RISK',
                    severity: reportData.severity,
                    title: `CITIZEN REPORT: ${reportData.severity.toUpperCase()} ${reportData.type.toUpperCase()}`,
                    message: `Live camera verified waste near GPS [${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}] with volume ${reportData.estimatedVolume}.`,
                    location: { lat: location.lat, lon: location.lng },
                    metadata: { zone: 'Urban', source_email: userEmail },
                    created_at: new Date().toISOString()
                })
            }
            if (data.credits > 0) {
                await addDoc(collection(db, "credit_transactions"), {
                    user_id: userEmail,
                    amount: data.credits,
                    type: 'report_genuine',
                    created_at: new Date().toISOString()
                })
            }
        } catch(fbErr: any) {
            console.error("Firebase sync failed (Are Security Rules True?):", fbErr.message)
        }
      } else {
        setGeoError(data.error || 'Upload failed')
      }
    } catch (err) {
      setGeoError('Network error connecting to the Gemini Verification Engine.')
    } finally {
      setIsUploading(false)
    }
  }

  if (uploadSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
        <Card className="w-full max-w-md text-center py-8">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/30">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold">Report AI-Verified!</h2>
            <p className="text-muted-foreground pt-2">
              Google Gemini has successfully analyzed your evidence. The pollution parameters have been confirmed and pinged to the authority dashboard!
            </p>
            <div className="flex items-center gap-2 mt-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full font-bold">
               <Trophy className="h-5 w-5 text-yellow-500" /> 
               Earned +{earned} BlueTrace Credits
            </div>
            
            <div className="flex gap-4 w-full mt-6">
               <Button className="flex-1" onClick={() => {
                 setUploadSuccess(false)
                 setPhoto(null)
                 setPhotoPreview(null)
               }} variant="default">
                 Submit New Evidence
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20 pb-8">
      {/* Navigation Shell */}
      <header className="bg-background border-b sticky top-0 z-10 px-4 py-3 sm:px-6 sm:py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
             <LayoutDashboard className="h-5 w-5 text-blue-600" />
             <h1 className="text-xl font-bold tracking-tight">Citizen Dashboard</h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="hidden sm:flex items-center gap-2">
               <span className="text-muted-foreground mr-2">{userEmail}</span>
               <div className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full">
                 <Trophy className="h-4 w-4" /> 
                 {credits} Credits
               </div>
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex hover:bg-destructive/10 hover:text-destructive" onClick={() => localStorage.removeItem('citizen_email')}>
               <Link href="/"><LogOut className="h-4 w-4 mr-2" /> Sign Out</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 mt-6 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Input Core */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="w-full">
            <CardHeader className="bg-card">
              <CardTitle>Submit Marine Pollution Evidence</CardTitle>
              <CardDescription>
                Snap a descriptive photo of the waste structure. Our Gemini AI model will automatically scan for the material severity.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> 
                  Live Anti-Spoof Camera
                </h3>
                
                {isCameraOpen ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-black">
                    <video ref={videoRef} className="object-cover w-full h-full" playsInline autoPlay muted />
                    <Button 
                      size="lg" 
                      variant="default" 
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full w-16 h-16 p-0 border-4 border-white shadow-xl bg-red-500 hover:bg-red-600"
                      onClick={handleCapture}
                    />
                  </div>
                ) : photoPreview ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoPreview} alt="Preview" className="object-contain w-full h-full" />
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="absolute bottom-2 right-2 backdrop-blur-md bg-background/50"
                      onClick={() => {
                         setPhotoPreview(null)
                         setPhoto(null)
                         setLocation(null)
                         startCamera()
                      }}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Discard & Retake
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="w-full aspect-video bg-muted/40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={startCamera}
                  >
                    <div className="bg-primary/10 p-4 rounded-full mb-3">
                       <Camera className="w-10 h-10 text-primary" />
                    </div>
                    <span className="text-base font-bold text-foreground">Launch Live Scanner</span>
                    <span className="text-xs text-muted-foreground mt-1 max-w-[250px] text-center">
                       Uploaded gallery photos are deactivated to ensure verifiable evidence. AI scans metadata continuously.
                    </span>
                  </div>
                )}
                
                <canvas ref={canvasRef} className="hidden" />

                {loadingGeo && (
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-600 animate-pulse pt-2">
                     <RefreshCw className="h-4 w-4 animate-spin" /> Verifying GPS Coordinate Stamp...
                  </div>
                )}

                {location && !loadingGeo && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 mt-4">
                    <MapPin className="text-emerald-600 w-5 h-5" />
                    <div className="text-sm">
                      <p className="font-bold text-emerald-800 dark:text-emerald-300">Geo-Coordinates Embedded</p>
                      <p className="text-emerald-600/80 tracking-widest">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>
                    </div>
                  </div>
                )}

                {geoError && (
                  <div className="p-3 bg-red-50 text-red-600 dark:bg-red-950/30 rounded-lg text-sm flex items-center gap-2 border border-red-200">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" /> {geoError}
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="bg-muted/10 border-t pt-6">
              <Button 
                className="w-full h-12 text-base font-bold" 
                size="lg"
                disabled={!location || !photo || isUploading}
                onClick={handleUpload}
              >
                {isUploading ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
                {isUploading ? 'Gemini Verification in progress...' : 'Upload & Scan'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Gamification & History */}
        <div className="space-y-6">
           <Card>
             <CardHeader className="pb-3">
               <CardTitle className="text-lg flex items-center gap-2">
                 <History className="h-5 w-5 text-muted-foreground" />
                 Recent Approvals
               </CardTitle>
             </CardHeader>
             <CardContent>
               {history.length === 0 ? (
                 <div className="text-center py-6 text-sm text-muted-foreground">
                   No verified reports yet. Contribute to earn credits!
                 </div>
               ) : (
                 <div className="space-y-4">
                   {history.map((rep, i) => (
                     <div key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="font-semibold capitalize text-foreground">{rep.type} Waste</p>
                          <p className="text-xs text-muted-foreground">Location ID: {Math.floor(rep.location?.lat * 1000)}...</p>
                        </div>
                        <div className="text-right">
                           <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                             Verified
                           </span>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
             </CardContent>
           </Card>
        </div>

      </main>
    </div>
  )
}
