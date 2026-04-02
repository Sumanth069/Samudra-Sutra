import { FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuditLogPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="flex max-w-md flex-col items-center space-y-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">System Audit Log</h1>
          <p className="text-muted-foreground">
            Historical incident logs, drone flights, and clearance reports are migrating to the new highly-available storage cluster. Check back later.
          </p>
        </div>
        <Button asChild className="mt-8">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}
