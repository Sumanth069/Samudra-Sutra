'use client'

import { useState } from 'react'
import { 
  Users, 
  Ship, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  ArrowRight,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface Action {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  priority: 'high' | 'medium' | 'low'
  type: 'deploy' | 'alert' | 'monitor' | 'contain'
  estimatedTime: string
  resources: string
}

const AVAILABLE_ACTIONS: Action[] = [
  {
    id: 'deploy-cleanup',
    title: 'Deploy Cleanup Teams',
    description: 'Dispatch cleanup crews to active pollution zones for immediate intervention.',
    icon: <Users className="h-5 w-5" />,
    priority: 'high',
    type: 'deploy',
    estimatedTime: '30-45 min',
    resources: '2 teams, 8 personnel'
  },
  {
    id: 'alert-fishermen',
    title: 'Alert Fishermen',
    description: 'Send warnings to registered fishermen in affected areas via SMS and app notification.',
    icon: <Ship className="h-5 w-5" />,
    priority: 'medium',
    type: 'alert',
    estimatedTime: 'Immediate',
    resources: 'SMS gateway'
  },
  {
    id: 'increase-monitoring',
    title: 'Increase Monitoring',
    description: 'Activate additional sensors and increase data collection frequency in risk zones.',
    icon: <Eye className="h-5 w-5" />,
    priority: 'medium',
    type: 'monitor',
    estimatedTime: '5 min',
    resources: '6 sensors'
  },
  {
    id: 'deploy-barriers',
    title: 'Deploy Containment',
    description: 'Install floating barriers to prevent pollution spread at river mouths and creek outlets.',
    icon: <AlertTriangle className="h-5 w-5" />,
    priority: 'high',
    type: 'contain',
    estimatedTime: '1-2 hours',
    resources: '500m barriers'
  }
]

interface ActionsPanelProps {
  onAction: (actionId: string) => Promise<boolean>
}

export function ActionsPanel({ onAction }: ActionsPanelProps) {
  const [executingAction, setExecutingAction] = useState<string | null>(null)
  const [completedActions, setCompletedActions] = useState<string[]>([])
  const [confirmAction, setConfirmAction] = useState<Action | null>(null)

  const handleExecuteAction = async (action: Action) => {
    setConfirmAction(null)
    setExecutingAction(action.id)
    
    // Simulate action execution
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const success = await onAction(action.id)
    if (success) {
      setCompletedActions(prev => [...prev, action.id])
    }
    setExecutingAction(null)
  }

  const getPriorityStyles = (priority: Action['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/30'
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/30'
      case 'low':
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              <Zap className="mr-1 h-3 w-3" />
              AI Recommended
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {AVAILABLE_ACTIONS.map(action => {
          const isExecuting = executingAction === action.id
          const isCompleted = completedActions.includes(action.id)

          return (
            <div
              key={action.id}
              className={cn(
                "rounded-lg border p-3 transition-all",
                isCompleted && "border-success/30 bg-success/5",
                !isCompleted && "hover:bg-secondary/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "rounded-lg p-2",
                  isCompleted 
                    ? "bg-success/20 text-success"
                    : action.priority === 'high'
                    ? "bg-destructive/10 text-destructive"
                    : "bg-secondary text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    action.icon
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-foreground">
                      {action.title}
                    </h4>
                    {!isCompleted && (
                      <Badge 
                        variant="outline" 
                        className={cn("text-[10px]", getPriorityStyles(action.priority))}
                      >
                        {action.priority}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {action.description}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>ETA: {action.estimatedTime}</span>
                    <span>•</span>
                    <span>{action.resources}</span>
                  </div>
                </div>
                <Dialog open={confirmAction?.id === action.id} onOpenChange={(open) => !open && setConfirmAction(null)}>
                  <DialogTrigger asChild>
                    <Button
                      variant={isCompleted ? "ghost" : action.priority === 'high' ? "default" : "secondary"}
                      size="sm"
                      disabled={isExecuting || isCompleted}
                      onClick={() => setConfirmAction(action)}
                      className="shrink-0"
                    >
                      {isExecuting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isCompleted ? (
                        'Done'
                      ) : (
                        <>
                          Execute
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Action</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to execute this action?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="rounded-lg bg-secondary p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            {action.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{action.title}</h4>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Estimated Time</p>
                            <p className="font-medium text-foreground">{action.estimatedTime}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Resources</p>
                            <p className="font-medium text-foreground">{action.resources}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setConfirmAction(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => handleExecuteAction(action)}>
                        Confirm & Execute
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
