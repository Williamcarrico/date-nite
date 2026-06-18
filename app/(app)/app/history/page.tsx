'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { AddToCalendarButton } from '@/components/calendar/add-to-calendar-button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSuggestionHistory, completeSuggestion, deleteSuggestion } from '@/lib/actions/history'
import { CATEGORIES } from '@/lib/constants/options'
import {
  Clock,
  Calendar,
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  History,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface SuggestionWithDetails {
  id: string
  status: string
  created_at: string
  scheduled_at: string | null
  idea_templates: {
    title: string
    description: string
    category: string
    duration_minutes: number
  }
  completed_dates: Array<{
    rating: number
    notes: string | null
    actual_cost: number | null
  }>
}

export default function HistoryPage() {
  const [history, setHistory] = useState<SuggestionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [notes, setNotes] = useState('')
  const [wouldRepeat, setWouldRepeat] = useState<boolean | null>(null)
  const [actualCost, setActualCost] = useState('')
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestionWithDetails | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 20

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true)
      const offset = (currentPage - 1) * itemsPerPage
      const { data, count } = await getSuggestionHistory(
        filter === 'all' ? undefined : filter,
        itemsPerPage,
        offset
      )
      setHistory(data as SuggestionWithDetails[])
      setTotalCount(count)
      setIsLoading(false)
    }
    loadHistory()
  }, [filter, currentPage])

  async function handleComplete() {
    if (!selectedSuggestion) return

    setCompletingId(selectedSuggestion.id)

    const result = await completeSuggestion(
      selectedSuggestion.id,
      rating,
      notes || undefined,
      actualCost ? Number(actualCost) : undefined,
      wouldRepeat ?? undefined
    )

    setCompletingId(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Date marked as completed!')
      setShowCompleteDialog(false)
      setRating(5)
      setNotes('')
      setWouldRepeat(null)
      setActualCost('')
      // Refresh history
      const offset = (currentPage - 1) * itemsPerPage
      const { data, count } = await getSuggestionHistory(
        filter === 'all' ? undefined : filter,
        itemsPerPage,
        offset
      )
      setHistory(data as SuggestionWithDetails[])
      setTotalCount(count)
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteSuggestion(id)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Suggestion deleted')
      setHistory(history.filter((h) => h.id !== id))
    }
  }

  const getCategoryEmoji = (category: string) => {
    return CATEGORIES.find((c) => c.value === category)?.emoji || '🎯'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success border-0"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>
      case 'scheduled':
        return <Badge className="bg-primary/10 text-primary border-0"><Calendar className="w-3 h-3 mr-1" /> Scheduled</Badge>
      case 'skipped':
        return <Badge className="bg-muted text-muted-foreground border-0"><XCircle className="w-3 h-3 mr-1" /> Skipped</Badge>
      default:
        return <Badge className="bg-accent/10 text-accent border-0"><Clock className="w-3 h-3 mr-1" /> Suggested</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="py-5 flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Date History</h1>
          <p className="text-muted-foreground mt-1">
            Track all your date ideas and experiences
          </p>
        </div>
        <Tabs value={filter} onValueChange={(v) => { setFilter(v); setCurrentPage(1) }}>
          <TabsList className="rounded-xl">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="suggested">Suggested</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="skipped">Skipped</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {history.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <History className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-float" />
            <p className="text-muted-foreground">No history yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Generate some date ideas to see them here!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getCategoryEmoji(item.idea_templates.category)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{item.idea_templates.title}</h3>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {item.idea_templates.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(item.created_at), 'MMM d, yyyy')}
                          </span>
                          {item.scheduled_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Scheduled: {format(new Date(item.scheduled_at), 'MMM d')}
                            </span>
                          )}
                          {item.completed_dates?.[0] && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-accent text-accent" />
                              {item.completed_dates[0].rating}/5
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'scheduled' && (
                      <Dialog open={showCompleteDialog && selectedSuggestion?.id === item.id} onOpenChange={(open) => {
                        setShowCompleteDialog(open)
                        if (open) {
                          setSelectedSuggestion(item)
                          // Reset the rating form for a fresh entry per date.
                          setRating(5)
                          setNotes('')
                          setWouldRepeat(null)
                          setActualCost('')
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="gradient-success text-white rounded-xl">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Mark Complete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>How was your date?</DialogTitle>
                            <DialogDescription>
                              Rate &quot;{item.idea_templates.title}&quot; and add any notes
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Rating</label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    aria-label={`Rate ${star} out of 5 stars`}
                                    className="p-1"
                                  >
                                    <Star
                                      className={`w-8 h-8 transition-colors ${
                                        star <= rating
                                          ? 'fill-accent text-accent'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Would you do this again?</label>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant={wouldRepeat === true ? 'default' : 'outline'}
                                  onClick={() => setWouldRepeat((prev) => (prev === true ? null : true))}
                                  aria-pressed={wouldRepeat === true}
                                  className={`flex-1 rounded-xl ${wouldRepeat === true ? 'gradient-success text-white' : ''}`}
                                >
                                  Yes
                                </Button>
                                <Button
                                  type="button"
                                  variant={wouldRepeat === false ? 'default' : 'outline'}
                                  onClick={() => setWouldRepeat((prev) => (prev === false ? null : false))}
                                  aria-pressed={wouldRepeat === false}
                                  className="flex-1 rounded-xl"
                                >
                                  No
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="actual-cost" className="text-sm font-medium">
                                What did it cost? ($)
                              </label>
                              <Input
                                id="actual-cost"
                                type="number"
                                inputMode="decimal"
                                min={0}
                                step="0.01"
                                value={actualCost}
                                onChange={(e) => setActualCost(e.target.value)}
                                placeholder="Optional — e.g. 85"
                                className="rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Notes (optional)</label>
                              <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="How did it go? Any memorable moments?"
                                className="rounded-xl"
                              />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              onClick={() => setShowCompleteDialog(false)}
                              className="flex-1 rounded-xl"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleComplete}
                              disabled={completingId === item.id}
                              className="flex-1 gradient-success text-white rounded-xl"
                            >
                              {completingId === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                'Save Rating'
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {item.status === 'scheduled' && item.scheduled_at && (
                      <AddToCalendarButton
                        title={item.idea_templates.title}
                        description={item.idea_templates.description}
                        scheduledAt={item.scheduled_at}
                        durationMinutes={item.idea_templates.duration_minutes}
                      />
                    )}

                    {/* Accessible delete confirmation */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive rounded-xl"
                          aria-label="Delete suggestion"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete suggestion?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove &quot;{item.idea_templates.title}&quot; from your history. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalCount > itemsPerPage && (
        <div className="flex items-center justify-between pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} suggestions
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-xl"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / itemsPerPage), p + 1))}
              disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
              className="rounded-xl"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
