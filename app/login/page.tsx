'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'admin123') {
      document.cookie = "dummy-admin=true; path=/;"
      router.push('/admin/dashboard')
    } else {
      setError('Invalid password. Try admin123')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center flex flex-col items-center">
          <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Authority Login</CardTitle>
          <CardDescription>Enter the default admin password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="Password (admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Sign In</Button>
            
             <p className="text-xs text-muted-foreground text-center mt-4">
                This is a mock authority portal bypassing DB auth. <br/>
                Password is <b>admin123</b>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
