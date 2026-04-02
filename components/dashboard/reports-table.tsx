'use client'

import { useState } from 'react'
import { 
  ChevronDown, 
  ChevronUp, 
  Filter,
  Search,
  ArrowUpDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { PollutionReport } from '@/lib/types'

interface ReportsTableProps {
  reports: PollutionReport[]
  onSelectReport: (report: PollutionReport) => void
}

type SortField = 'riskIndex' | 'reportedAt' | 'etaToOcean'
type SortDirection = 'asc' | 'desc'

export function ReportsTable({ reports, onSelectReport }: ReportsTableProps) {
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>('riskIndex')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const filteredReports = reports
    .filter(r => {
      if (search && !r.location.name.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (severityFilter.length > 0 && !severityFilter.includes(r.severity)) {
        return false
      }
      if (statusFilter.length > 0 && !statusFilter.includes(r.status)) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'riskIndex':
          comparison = a.riskIndex - b.riskIndex
          break
        case 'reportedAt':
          comparison = new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime()
          break
        case 'etaToOcean':
          comparison = (a.etaToOcean || 999) - (b.etaToOcean || 999)
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

  const severityStyles = {
    critical: 'bg-destructive/20 text-destructive border-destructive/30',
    high: 'bg-warning/20 text-warning border-warning/30',
    medium: 'bg-primary/20 text-primary border-primary/30',
    low: 'bg-success/20 text-success border-success/30'
  }

  const statusStyles = {
    active: 'bg-destructive text-destructive-foreground',
    monitoring: 'bg-warning text-warning-foreground',
    contained: 'bg-primary text-primary-foreground',
    resolved: 'bg-success text-success-foreground'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-sm font-medium">
            Pollution Reports ({filteredReports.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-[200px] pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  {(severityFilter.length > 0 || statusFilter.length > 0) && (
                    <Badge variant="secondary" className="ml-2">
                      {severityFilter.length + statusFilter.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Severity</DropdownMenuLabel>
                {['critical', 'high', 'medium', 'low'].map(severity => (
                  <DropdownMenuCheckboxItem
                    key={severity}
                    checked={severityFilter.includes(severity)}
                    onCheckedChange={(checked) => {
                      setSeverityFilter(prev =>
                        checked
                          ? [...prev, severity]
                          : prev.filter(s => s !== severity)
                      )
                    }}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                {['active', 'monitoring', 'contained', 'resolved'].map(status => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter.includes(status)}
                    onCheckedChange={(checked) => {
                      setStatusFilter(prev =>
                        checked
                          ? [...prev, status]
                          : prev.filter(s => s !== status)
                      )
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Table Header */}
        <div className="flex items-center gap-4 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
          <div className="w-8" />
          <div className="flex-1">Location</div>
          <button
            className="flex w-20 items-center gap-1 hover:text-foreground"
            onClick={() => handleSort('riskIndex')}
          >
            Risk
            {sortField === 'riskIndex' ? (
              sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-50" />
            )}
          </button>
          <button
            className="flex w-20 items-center gap-1 hover:text-foreground"
            onClick={() => handleSort('etaToOcean')}
          >
            ETA
            {sortField === 'etaToOcean' ? (
              sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-50" />
            )}
          </button>
          <div className="w-24">Status</div>
          <button
            className="flex w-20 items-center gap-1 hover:text-foreground"
            onClick={() => handleSort('reportedAt')}
          >
            Time
            {sortField === 'reportedAt' ? (
              sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-50" />
            )}
          </button>
        </div>

        {/* Table Body */}
        <ScrollArea className="h-[300px]">
          {filteredReports.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              No reports found
            </div>
          ) : (
            filteredReports.map(report => (
              <button
                key={report.id}
                className="flex w-full items-center gap-4 border-b border-border px-4 py-3 text-left transition-colors hover:bg-secondary/50"
                onClick={() => onSelectReport(report)}
              >
                {/* Severity Indicator */}
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    report.severity === 'critical' && "bg-destructive",
                    report.severity === 'high' && "bg-warning",
                    report.severity === 'medium' && "bg-primary",
                    report.severity === 'low' && "bg-success"
                  )}
                />

                {/* Location */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {report.location.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {report.type} • {report.location.zone}
                  </p>
                </div>

                {/* Risk */}
                <div className="w-20">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", severityStyles[report.severity])}
                  >
                    {report.riskIndex}%
                  </Badge>
                </div>

                {/* ETA */}
                <div className="w-20 text-sm text-muted-foreground">
                  {report.etaToOcean ? `${report.etaToOcean}h` : '--'}
                </div>

                {/* Status */}
                <div className="w-24">
                  <Badge className={cn("text-[10px]", statusStyles[report.status])}>
                    {report.status}
                  </Badge>
                </div>

                {/* Time */}
                <div className="w-20 text-xs text-muted-foreground">
                  {formatDate(report.reportedAt)}
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
