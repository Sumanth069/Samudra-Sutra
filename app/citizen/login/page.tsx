'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Waves, Loader2 } from 'lucide-react'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { auth, googleProvider } from '@/lib/firebase/client'
import { signInWithPopup } from 'firebase/auth'

export default function CitizenLogin() {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      if (result.user.email) {
          localStorage.setItem('citizen_email', result.user.email)
          router.push('/citizen/dashboard')
      }
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/popup-closed-by-user') {
         setErrorMsg('Sign-in popup was closed before finishing.')
      } else if (err.code === 'auth/unauthorized-domain') {
         setErrorMsg('This domain is not authorized for OAuth. (Please add it in Firebase Console)')
      } else {
         setErrorMsg(err.message || 'Firebase Authentication failed.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 transition-all duration-500 ease-out transform translate-y-0 opacity-100">
        <div className="flex justify-center mb-6">
          <div className="bg-primary p-3 rounded-2xl shadow-lg ring-4 ring-primary/20">
            <Waves className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-foreground mb-2 tracking-tight">Citizen Portal</h2>
        <p className="text-center text-sm text-primary mb-8 font-medium">Earn credits by reporting marine pollution.</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="border shadow-xl relative bg-card/60 backdrop-blur-xl rounded-2xl overflow-hidden ring-1 ring-border">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-500"></div>
          <CardHeader className="space-y-1 pb-6 pt-8 px-8">
            <CardTitle className="text-xl font-bold text-center text-card-foreground">Join the network</CardTitle>
            <CardDescription className="text-center text-base">Sign in securely with your Google Account.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {errorMsg && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center font-medium">
                  {errorMsg}
                </div>
            )}
            <Button 
                type="button" 
                variant="outline" 
                className="w-full font-semibold relative h-14 bg-card border-2 border-border hover:bg-muted text-foreground shadow-sm transition-all"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                    <>
                        <svg className="h-6 w-6 absolute left-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          <path d="M1 1h22v22H1z" fill="none"/>
                        </svg>
                        <span className="text-md">Continue with Google</span>
                    </>
                )}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 px-8 pb-8 pt-0 bg-muted/30 mt-4 rounded-b-xl border-t border-border/50">
            <div className="pt-4 text-center text-sm text-muted-foreground">
              Authority Administrator?{' '}
              <Link href="/login" className="text-primary hover:text-primary/80 font-semibold hover:underline">
                Login here
              </Link>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground/70 justify-center">
              <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
              <span>&bull;</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
