'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  generateSuggestion,
  scheduleSuggestion,
  skipSuggestion,
  toggleFavorite,
  getLatestSuggestion,
  checkIsFavorited,
  type Suggestion,
} from '@/lib/actions/suggestions'
import { downloadICS } from '@/lib/utils/ics'
import { COST_LEVELS, CATEGORIES, SETTING_TYPES, INTENSITY_LEVELS } from '@/lib/constants/options'
import {
  getCurrentSeason,
  getTimeOfDay,
  getSeasonEmoji,
  getTimeOfDayEmoji,
  getSeasonLabel,
  getTimeOfDayLabel,
} from '@/lib/utils/context'
import {
  Sparkles,
  RefreshCw,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  MapPin,
  Star,
  Download,
  Loader2,
  AlertCircle,
  PartyPopper,
  Filter,
  Utensils,
  Search,
  Ticket,
  Users,
  Home,
  Tent,
  Mountain,
  ChevronDown,
  ChevronUp,
  Zap,
  ThumbsDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { AnimatePresence, m } from 'motion/react'

export default function RandomizePage() {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState('19:00')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSettings, setSelectedSettings] = useState<string[]>([])
  const [selectedIntensity, setSelectedIntensity] = useState<number[]>([])
  const [matchScore, setMatchScore] = useState<number | null>(null)
  const [scoreBreakdown, setScoreBreakdown] = useState<Record<string, number | null> | null>(null)
  const [temporalContext, setTemporalContext] = useState({
    season: getCurrentSeason(),
    timeOfDay: getTimeOfDay(),
  })

  const toggleSetting = (value: string) => {
    setSelectedSettings(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    )
  }

  const toggleIntensity = (value: number) => {
    setSelectedIntensity(prev =>
      prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
    )
  }

  const getSettingEmoji = (setting: string | null) => {
    if (!setting) return null
    return SETTING_TYPES.find(s => s.value === setting)?.emoji
  }

  const getSettingLabel = (setting: string | null) => {
    if (!setting) return null
    return SETTING_TYPES.find(s => s.value === setting)?.label
  }

  const getIntensityEmoji = (level: number) => {
    return INTENSITY_LEVELS.find(i => i.value === level)?.emoji || '⚡'
  }

  const getIntensityLabel = (level: number) => {
    return INTENSITY_LEVELS.find(i => i.value === level)?.label || 'Moderate'
  }

  const activeFilterCount = selectedSettings.length + selectedIntensity.length

  // Load latest suggestion on mount
  useEffect(() => {
    async function loadLatest() {
      const latest = await getLatestSuggestion()
      if (latest) {
        setSuggestion(latest)
        const favorited = await checkIsFavorited(latest.ideaTemplateId)
        setIsFavorited(favorited)
      }
    }
    loadLatest()
  }, [])

  async function handleGenerate() {
    setIsLoading(true)
    setError(null)

    // Mark the current suggestion skipped so abandoned ideas don't pile up as
    // status='suggested'. Best-effort: a skip failure shouldn't block generating.
    if (suggestion) {
      try {
        await skipSuggestion(suggestion.id)
      } catch {
        // Ignore — proceed to generate a fresh idea regardless.
      }
    }

    // Update temporal context
    const currentSeason = getCurrentSeason()
    const currentTimeOfDay = getTimeOfDay()
    setTemporalContext({
      season: currentSeason,
      timeOfDay: currentTimeOfDay,
    })

    // Call generateSuggestion with filters and context
    const result = await generateSuggestion({
      settingTypes: selectedSettings.length > 0 ? selectedSettings : undefined,
      intensityLevels: selectedIntensity.length > 0 ? selectedIntensity : undefined,
      context: {
        season: currentSeason,
      },
    })

    setIsLoading(false)

    if (result.error) {
      setError(result.error)
      setMatchScore(null)
      setScoreBreakdown(null)
      toast.error(result.error)
    } else if (result.suggestion) {
      setSuggestion(result.suggestion)
      setIsFavorited(false)

      // Store match score and breakdown if available
      if (result.metadata?.matchScore) {
        setMatchScore(result.metadata.matchScore)
      }
      if (result.metadata?.scoreBreakdown) {
        setScoreBreakdown(result.metadata.scoreBreakdown)
      }

      toast.success('New date idea generated!', {
        icon: <PartyPopper className="w-4 h-4" />,
      })
    }
  }

  async function handleSkip() {
    if (!suggestion) return

    toast('Skipped — we won\'t suggest that one again right now', {
      icon: <ThumbsDown className="w-4 h-4" />,
    })

    // handleGenerate already skips the current suggestion before generating a
    // fresh one, so this avoids double-skipping.
    await handleGenerate()
  }

  async function handleSchedule() {
    if (!suggestion || !selectedDate) return

    setIsScheduling(true)

    // Combine date and time
    const [hours, minutes] = selectedTime.split(':').map(Number)
    const scheduledAt = new Date(selectedDate)
    scheduledAt.setHours(hours, minutes, 0, 0)

    const result = await scheduleSuggestion(
      suggestion.id,
      scheduledAt,
      suggestion.durationMinutes
    )

    setIsScheduling(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      setSuggestion({
        ...suggestion,
        status: 'scheduled',
        scheduledAt: scheduledAt.toISOString(),
      })
      setShowScheduleDialog(false)
      toast.success('Date scheduled!', {
        icon: <CalendarIcon className="w-4 h-4" />,
      })
    }
  }

  async function handleToggleFavorite() {
    if (!suggestion) return

    // Optimistic UI update
    setIsFavorited(prev => !prev)

    const result = await toggleFavorite(suggestion.ideaTemplateId)

    if (result.error) {
      // Roll back
      setIsFavorited(prev => !prev)
      toast.error(result.error)
    } else {
      setIsFavorited(result.isFavorited)
      toast.success(result.isFavorited ? 'Added to favorites!' : 'Removed from favorites')
    }
  }

  function handleDownloadCalendar() {
    if (!suggestion || !suggestion.scheduledAt) return

    downloadICS({
      title: `Date Night: ${suggestion.title}`,
      description: suggestion.description,
      startTime: new Date(suggestion.scheduledAt),
      durationMinutes: suggestion.durationMinutes,
    })

    toast.success('Calendar file downloaded!')
  }

  const getCostLabel = (level: number) => {
    return COST_LEVELS.find((c) => c.value === level)?.label || '$'
  }

  const getCategoryEmoji = (category: string) => {
    return CATEGORIES.find((c) => c.value === category)?.emoji || '🎯'
  }

  const timeOptions = []
  for (let h = 10; h <= 22; h++) {
    for (const m of ['00', '30']) {
      const hour = h > 12 ? h - 12 : h
      const ampm = h >= 12 ? 'PM' : 'AM'
      timeOptions.push({
        value: `${h.toString().padStart(2, '0')}:${m}`,
        label: `${hour}:${m} ${ampm}`,
      })
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold">Get Date Ideas</h1>
        <p className="text-muted-foreground mt-1">
          Discover your next perfect date night
        </p>
      </div>

      {/* Filters Card */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="filters-panel"
            className="flex w-full items-center justify-between text-left"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="text-lg leading-none font-semibold">Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="rounded-full">
                  {activeFilterCount} active
                </Badge>
              )}
            </span>
            {showFilters ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </CardHeader>
        <CardContent id="filters-panel" hidden={!showFilters} className="space-y-4 pt-0">
            {/* Setting Type Pills */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Setting</p>
              <div className="flex flex-wrap gap-2">
                {SETTING_TYPES.map((setting) => (
                  <button
                    key={setting.value}
                    type="button"
                    aria-pressed={selectedSettings.includes(setting.value)}
                    onClick={() => toggleSetting(setting.value)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring ${
                      selectedSettings.includes(setting.value)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-primary/10'
                    }`}
                  >
                    {setting.emoji} {setting.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity Level Buttons */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Intensity</p>
              <div className="flex flex-wrap gap-2">
                {INTENSITY_LEVELS.map((level) => (
                  <Button
                    key={level.value}
                    variant={selectedIntensity.includes(level.value) ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                    onClick={() => toggleIntensity(level.value)}
                  >
                    {level.emoji} {level.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  setSelectedSettings([])
                  setSelectedIntensity([])
                }}
              >
                Clear all filters
              </Button>
            )}
          </CardContent>
      </Card>

      {/* Generate Button */}
      {!suggestion && (
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full gradient-primary flex items-center justify-center mb-6 shadow-playful-lg animate-pulse-glow">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Ready to discover something amazing?</h2>
            <p className="text-muted-foreground mb-6">
              Click the button below to get a personalized date idea based on your preferences
            </p>
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              size="lg"
              className="gradient-primary text-white shadow-playful hover:shadow-playful-lg transition-all rounded-xl h-14 px-8 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Finding the perfect date...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Date Idea
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !suggestion && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Suggestion Card — animated in/out */}
      <AnimatePresence mode="wait">
        {suggestion && (
          <m.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="border-0 shadow-lg overflow-hidden">
              {/* Category Banner */}
              <div className="gradient-primary p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryEmoji(suggestion.category)}</span>
                    <span className="font-medium capitalize">{suggestion.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Temporal Context */}
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {getSeasonEmoji(temporalContext.season)} {getSeasonLabel(temporalContext.season)}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {getTimeOfDayEmoji(temporalContext.timeOfDay)} {getTimeOfDayLabel(temporalContext.timeOfDay)}
                    </Badge>
                    {suggestion.status === 'scheduled' && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        Scheduled
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-2xl">{suggestion.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-2 text-base">
                      {suggestion.description}
                    </CardDescription>

                    {/* Match Score Progress Bar */}
                    {matchScore !== null && (
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Match quality
                          </span>
                          <span className={`font-semibold ${
                            matchScore >= 90 ? 'text-success' :
                            matchScore >= 70 ? 'text-primary' :
                            'text-secondary'
                          }`}>
                            {Math.round(matchScore)}%
                          </span>
                        </div>
                        <Progress value={matchScore} className="h-2" />
                      </div>
                    )}

                    {/* Score Breakdown — Accordion */}
                    {scoreBreakdown && (
                      <Accordion type="single" collapsible className="mt-2">
                        <AccordionItem value="breakdown" className="border-0">
                          <AccordionTrigger className="text-sm text-muted-foreground py-2 hover:no-underline">
                            <span className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Why this suggestion?
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                              {scoreBreakdown.score_a != null && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Your fit:</span>
                                  <span className="font-medium">{Math.round(scoreBreakdown.score_a)}%</span>
                                </div>
                              )}
                              {scoreBreakdown.score_b != null && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Partner&apos;s fit:</span>
                                  <span className="font-medium">{Math.round(scoreBreakdown.score_b)}%</span>
                                </div>
                              )}
                              {scoreBreakdown.final != null && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {scoreBreakdown.score_b != null ? 'Mutual match:' : 'Match:'}
                                  </span>
                                  <span className="font-medium">{Math.round(scoreBreakdown.final)}%</span>
                                </div>
                              )}
                              <div className="pt-1 mt-1 border-t border-border/50 text-xs text-muted-foreground">
                                Scored on your vibes, budget, dietary needs, the season, and how couples rated this idea.
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {/* Setting & Intensity Badges */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {suggestion.settingType && (
                        <Badge variant="secondary" className="rounded-full">
                          {getSettingEmoji(suggestion.settingType)} {getSettingLabel(suggestion.settingType)}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="rounded-full">
                        <Zap className="w-3 h-3 mr-1" />
                        {getIntensityEmoji(suggestion.intensityLevel)} {getIntensityLabel(suggestion.intensityLevel)}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleFavorite}
                    aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    className={`shrink-0 rounded-xl ${isFavorited ? 'text-primary' : ''}`}
                  >
                    <Star className={`w-5 h-5 transition-all ${isFavorited ? 'fill-current scale-110' : ''}`} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-xl bg-muted">
                    <DollarSign className="w-5 h-5 mx-auto text-success mb-1" />
                    <p className="font-semibold">{getCostLabel(suggestion.costLevel)}</p>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.estimatedCostMin && suggestion.estimatedCostMax
                        ? `$${suggestion.estimatedCostMin}-${suggestion.estimatedCostMax}`
                        : 'Varies'}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted">
                    <Clock className="w-5 h-5 mx-auto text-secondary mb-1" />
                    <p className="font-semibold">{Math.round(suggestion.durationMinutes / 60)}h</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted">
                    <MapPin className="w-5 h-5 mx-auto text-primary mb-1" />
                    <p className="font-semibold">{suggestion.requiresReservation ? 'Yes' : 'No'}</p>
                    <p className="text-xs text-muted-foreground">Reservation</p>
                  </div>
                </div>

                {/* Vibes */}
                {suggestion.vibeTags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Vibes</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestion.vibeTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-full capitalize">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scheduled Info */}
                {suggestion.scheduledAt && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary">Scheduled for</p>
                        <p className="text-lg font-semibold">
                          {format(new Date(suggestion.scheduledAt), "EEEE, MMMM d 'at' h:mm a")}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadCalendar}
                        className="rounded-xl"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Add to Calendar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reservation Links */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Book or Find</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {suggestion.reservationLinks.openTable && (
                      <a href={suggestion.reservationLinks.openTable} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full rounded-xl justify-start">
                          <Utensils className="w-4 h-4 mr-2" />
                          OpenTable
                        </Button>
                      </a>
                    )}
                    {suggestion.reservationLinks.resy && (
                      <a href={suggestion.reservationLinks.resy} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full rounded-xl justify-start">
                          <Utensils className="w-4 h-4 mr-2" />
                          Resy
                        </Button>
                      </a>
                    )}
                    {suggestion.reservationLinks.eventbrite && (
                      <a href={suggestion.reservationLinks.eventbrite} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full rounded-xl justify-start">
                          <Ticket className="w-4 h-4 mr-2" />
                          Eventbrite
                        </Button>
                      </a>
                    )}
                    {suggestion.reservationLinks.meetup && (
                      <a href={suggestion.reservationLinks.meetup} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full rounded-xl justify-start">
                          <Users className="w-4 h-4 mr-2" />
                          Meetup
                        </Button>
                      </a>
                    )}
                    {suggestion.reservationLinks.airbnbExperiences && (
                      <a href={suggestion.reservationLinks.airbnbExperiences} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full rounded-xl justify-start">
                          <Home className="w-4 h-4 mr-2" />
                          Airbnb
                        </Button>
                      </a>
                    )}
                    {suggestion.reservationLinks.recreationGov && (
                      <a href={suggestion.reservationLinks.recreationGov} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full rounded-xl justify-start">
                          <Tent className="w-4 h-4 mr-2" />
                          Recreation.gov
                        </Button>
                      </a>
                    )}
                    {suggestion.reservationLinks.darkSky && (
                      <a href={suggestion.reservationLinks.darkSky} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full rounded-xl justify-start">
                          <Star className="w-4 h-4 mr-2" />
                          DarkSky
                        </Button>
                      </a>
                    )}
                    {suggestion.reservationLinks.nps && (
                      <a href={suggestion.reservationLinks.nps} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full rounded-xl justify-start">
                          <Mountain className="w-4 h-4 mr-2" />
                          NPS
                        </Button>
                      </a>
                    )}
                    {suggestion.reservationLinks.yelp && (
                      <a href={suggestion.reservationLinks.yelp} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full rounded-xl justify-start">
                          <Search className="w-4 h-4 mr-2" />
                          Yelp
                        </Button>
                      </a>
                    )}
                    {suggestion.reservationLinks.googleMaps && (
                      <a href={suggestion.reservationLinks.googleMaps} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full rounded-xl justify-start">
                          <MapPin className="w-4 h-4 mr-2" />
                          Google Maps
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {!suggestion.scheduledAt && (
                    <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                      <DialogTrigger asChild>
                        <Button className="flex-1 gradient-primary text-white rounded-xl h-12">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Schedule This Date
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Schedule Your Date</DialogTitle>
                          <DialogDescription>
                            Pick a date and time for &quot;{suggestion.title}&quot;
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="flex justify-center">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              disabled={(date) => date < new Date()}
                              className="rounded-xl border"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Time</label>
                            <Select value={selectedTime} onValueChange={setSelectedTime}>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setShowScheduleDialog(false)}
                            className="flex-1 rounded-xl"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSchedule}
                            disabled={!selectedDate || isScheduling}
                            className="flex-1 gradient-primary text-white rounded-xl"
                          >
                            {isScheduling ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Scheduling...
                              </>
                            ) : (
                              'Confirm'
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex-1 rounded-xl h-12"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Get Different Idea
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    disabled={isLoading}
                    className="flex-1 rounded-xl h-12 text-muted-foreground"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Not Interested
                  </Button>
                </div>

                {/* 90-day notice */}
                <p className="text-xs text-center text-muted-foreground">
                  This idea won&apos;t be suggested again for 90 days
                </p>
              </CardContent>
            </Card>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
