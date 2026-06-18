'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentSeason } from '@/lib/utils/context'

export interface ReservationLinks {
  openTable?: string
  resy?: string
  yelp?: string
  googleMaps?: string
  eventbrite?: string
  meetup?: string
  airbnbExperiences?: string
  recreationGov?: string
  darkSky?: string
  nps?: string
}

export interface Suggestion {
  id: string
  ideaTemplateId: string
  title: string
  description: string
  category: string
  costLevel: number
  estimatedCostMin: number | null
  estimatedCostMax: number | null
  durationMinutes: number
  vibeTags: string[]
  requiresReservation: boolean
  reservationLinks: ReservationLinks
  status: string
  scheduledAt: string | null
  settingType: string | null
  intensityLevel: number
  reservationPlatforms: string[]
}

function generateReservationLinks(
  searchKeywords: string[] | null,
  venueType: string | null,
  category: string,
  city: string,
  state: string,
  settingType?: string | null,
  reservationPlatforms?: string[] | null
): ReservationLinks {
  const location = `${city}, ${state}`
  const query = searchKeywords?.length ? searchKeywords.join(' ') : category

  const encodedQuery = encodeURIComponent(query)
  const encodedLocation = encodeURIComponent(location)
  const encodedCity = encodeURIComponent(city.toLowerCase().replaceAll(/\s+/g, '-'))
  const stateCode = state.toLowerCase().replaceAll(/\s+/g, '-')

  const links: ReservationLinks = {}

  // OpenTable - for restaurants
  if (venueType === 'restaurant' || category === 'restaurant' ||
      reservationPlatforms?.includes('opentable')) {
    links.openTable = `https://www.opentable.com/s?term=${encodedQuery}&covers=2`
  }

  // Resy - for restaurants/bars
  if (venueType === 'restaurant' || venueType === 'bar' || category === 'restaurant' ||
      reservationPlatforms?.includes('resy')) {
    links.resy = `https://resy.com/cities/${encodedCity}?query=${encodedQuery}`
  }

  // Yelp - always included
  links.yelp = `https://www.yelp.com/search?find_desc=${encodedQuery}&find_loc=${encodedLocation}`

  // Google Maps - always included
  links.googleMaps = `https://www.google.com/maps/search/${encodedQuery}+near+${encodedLocation}`

  // Eventbrite - events, entertainment, cultural
  if (category === 'entertainment' || category === 'cultural' || category === 'activity' ||
      reservationPlatforms?.includes('eventbrite')) {
    links.eventbrite = `https://www.eventbrite.com/d/${encodedCity}--${stateCode}/events/?q=${encodedQuery}`
  }

  // Meetup - local groups, activities
  if (category === 'activity' || category === 'creative' || category === 'cultural' ||
      reservationPlatforms?.includes('meetup')) {
    links.meetup = `https://www.meetup.com/find/?keywords=${encodedQuery}&location=${encodedLocation}`
  }

  // Airbnb Experiences - tours, classes
  if (category === 'activity' || category === 'creative' || category === 'cultural' ||
      reservationPlatforms?.includes('airbnb_experiences')) {
    links.airbnbExperiences = `https://www.airbnb.com/s/${encodedLocation}/experiences?query=${encodedQuery}`
  }

  // Recreation.gov - camping, outdoor facilities
  if (category === 'outdoor' || settingType === 'mountain' || settingType === 'countryside' ||
      reservationPlatforms?.includes('recreation_gov')) {
    links.recreationGov = `https://www.recreation.gov/search?q=${encodedQuery}`
  }

  // DarkSky International - stargazing destinations
  if (reservationPlatforms?.includes('darksky') ||
      searchKeywords?.some(k => k.toLowerCase().includes('stargazing'))) {
    links.darkSky = `https://darksky.org/what-we-do/international-dark-sky-places/`
  }

  // National Park Service - night-sky programs, outdoor
  if (reservationPlatforms?.includes('nps') ||
      (category === 'outdoor' && (settingType === 'mountain' || settingType === 'desert'))) {
    links.nps = `https://www.nps.gov/subjects/nightskies/index.htm`
  }

  return links
}

// Shape of one candidate row returned by generate_couple_candidates_v3.
export interface CandidateIdeaData {
  id: string
  title: string
  description: string
  category: string
  cost_level: number
  estimated_cost_min: number | null
  estimated_cost_max: number | null
  duration_minutes: number
  vibe_tags: string[]
  requires_reservation: boolean
  search_keywords: string[] | null
  venue_type: string | null
  setting_type: string | null
  intensity_level: number
  reservation_platforms: string[]
}

// Per-signal sub-scores (0-100) for the viewing partner. Gated signals
// (vibe/category/dietary/intensity) are null when that preference is unset.
export interface ScoreSignals {
  total?: number | null
  vibe: number | null
  category: number | null
  dietary: number | null
  intensity: number | null
  cost: number | null
  seasonal: number | null
  quality: number | null
}

export interface ScoreBreakdown {
  score_a: number | null
  score_b: number | null
  final: number | null
  signals_a: ScoreSignals | null
}

export interface ScoredCandidate {
  idea_id: string
  idea_data: CandidateIdeaData
  match_score: number
  score_breakdown: ScoreBreakdown
}

/**
 * Fetch the top-N scored candidates for a profile (and optional partner).
 * Reads the v3 RPC result as an ARRAY (it is a set-returning function).
 */
export async function getCandidates(options?: {
  partnerId?: string | null
  settingTypes?: string[]
  intensityLevels?: number[]
  season?: string
  limit?: number
}): Promise<{ candidates: ScoredCandidate[]; error?: string }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { candidates: [], error: 'Unauthorized' }

  const season = options?.season ?? getCurrentSeason()

  const { data, error } = await supabase.rpc('generate_couple_candidates_v3', {
    p_profile_a: user.id,
    p_profile_b: options?.partnerId ?? undefined,
    p_setting_types: options?.settingTypes ?? undefined,
    p_intensity_levels: options?.intensityLevels ?? undefined,
    p_current_season: season,
    p_limit: options?.limit ?? 8,
  })

  if (error) {
    console.error('getCandidates error:', error)
    return { candidates: [], error: error.message }
  }

  // Set-returning RPC -> data is an array of rows.
  return { candidates: (data ?? []) as unknown as ScoredCandidate[] }
}

/**
 * Pick an index biased toward the highest-scored candidates, while still
 * varying between calls so "Get Different Idea" actually differs.
 */
function weightedTopIndex(length: number): number {
  if (length <= 1) return 0
  // Square of a uniform [0,1) skews toward 0 (the best candidates).
  return Math.floor(Math.random() ** 2 * length)
}

export async function generateSuggestion(options?: {
  settingTypes?: string[]
  intensityLevels?: number[]
  context?: {
    season?: string
  }
}): Promise<{
  success: boolean
  suggestion?: Suggestion
  error?: string
  metadata?: {
    matchScore?: number
    scoreBreakdown?: ScoreBreakdown
  }
}> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const season = options?.context?.season ?? getCurrentSeason()

  const { candidates, error: candErr } = await getCandidates({
    settingTypes: options?.settingTypes,
    intensityLevels: options?.intensityLevels,
    season,
    limit: 8,
  })

  if (candErr) {
    return { success: false, error: candErr }
  }
  if (candidates.length === 0) {
    return {
      success: false,
      error: 'No eligible date ideas found. Try adjusting your filters or preferences.',
    }
  }

  const chosen = candidates[weightedTopIndex(candidates.length)]
  const ideaData = chosen.idea_data

  // Create suggestion record
  const { data: suggestionData, error: suggestionError } = await supabase
    .from('suggestions')
    .insert({
      profile_id: user.id,
      idea_template_id: chosen.idea_id,
      status: 'suggested',
    })
    .select('id')
    .single()

  if (suggestionError || !suggestionData) {
    console.error('Error creating suggestion:', suggestionError)
    return { success: false, error: 'Failed to create suggestion' }
  }

  // Get user's location for reservation links
  const { data: profile } = await supabase
    .from('profiles')
    .select('location_city, location_state')
    .eq('id', user.id)
    .maybeSingle()

  const reservationLinks = generateReservationLinks(
    ideaData.search_keywords,
    ideaData.venue_type,
    ideaData.category,
    profile?.location_city || 'New York',
    profile?.location_state || 'New York',
    ideaData.setting_type,
    ideaData.reservation_platforms
  )

  revalidatePath('/app/history')
  revalidatePath('/app')

  return {
    success: true,
    suggestion: {
      id: suggestionData.id,
      ideaTemplateId: chosen.idea_id,
      title: ideaData.title,
      description: ideaData.description,
      category: ideaData.category,
      costLevel: ideaData.cost_level,
      estimatedCostMin: ideaData.estimated_cost_min,
      estimatedCostMax: ideaData.estimated_cost_max,
      durationMinutes: ideaData.duration_minutes,
      vibeTags: ideaData.vibe_tags,
      requiresReservation: ideaData.requires_reservation,
      reservationLinks,
      status: 'suggested',
      scheduledAt: null,
      settingType: ideaData.setting_type,
      intensityLevel: ideaData.intensity_level || 2,
      reservationPlatforms: ideaData.reservation_platforms || [],
    },
    metadata: {
      matchScore: chosen.match_score,
      scoreBreakdown: chosen.score_breakdown,
    },
  }
}

export async function scheduleSuggestion(
  suggestionId: string,
  scheduledAt: Date,
  durationMinutes?: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: updated, error } = await supabase
    .from('suggestions')
    .update({
      scheduled_at: scheduledAt.toISOString(),
      scheduled_duration_minutes: durationMinutes,
      status: 'scheduled',
    })
    .eq('id', suggestionId)
    .eq('profile_id', user.id)
    .select('idea_template_id')
    .maybeSingle()

  if (error) {
    return { success: false, error: error.message }
  }

  // Commit a 90-day no-repeat exclusion now that the couple is doing this date.
  if (updated?.idea_template_id) {
    const excludedUntil = new Date(scheduledAt)
    excludedUntil.setDate(excludedUntil.getDate() + 90)
    await supabase
      .from('exclusions')
      .upsert(
        {
          profile_id: user.id,
          idea_template_id: updated.idea_template_id,
          excluded_until: excludedUntil.toISOString(),
        },
        { onConflict: 'profile_id,idea_template_id' }
      )
  }

  revalidatePath('/app/randomize')
  revalidatePath('/app/history')
  revalidatePath('/app')

  return { success: true }
}

export async function skipSuggestion(
  suggestionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: updated, error } = await supabase
    .from('suggestions')
    .update({ status: 'skipped' } as never)
    .eq('id', suggestionId)
    .eq('profile_id', user.id)
    .select('idea_template_id')
    .maybeSingle()

  if (error) {
    return { success: false, error: error.message }
  }

  // Write a 30-day exclusion so the scorer actually stops surfacing this idea
  // for a while (the candidate generator filters on the `exclusions` table). A
  // skip is a lighter "not right now" signal than the 90-day exclusion that
  // scheduling/completing a date writes.
  if (updated?.idea_template_id) {
    const excludedUntil = new Date()
    excludedUntil.setDate(excludedUntil.getDate() + 30)
    await supabase
      .from('exclusions')
      .upsert(
        {
          profile_id: user.id,
          idea_template_id: updated.idea_template_id,
          excluded_until: excludedUntil.toISOString(),
        },
        { onConflict: 'profile_id,idea_template_id' }
      )
  }

  revalidatePath('/app/randomize')
  revalidatePath('/app/history')

  return { success: true }
}

export async function toggleFavorite(
  ideaTemplateId: string
): Promise<{ success: boolean; isFavorited: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, isFavorited: false, error: 'Unauthorized' }
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('profile_id', user.id)
    .eq('idea_template_id', ideaTemplateId)
    .maybeSingle()

  if (existing) {
    // Remove favorite
    await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id)

    revalidatePath('/app/favorites')
    return { success: true, isFavorited: false }
  } else {
    // Add favorite
    const { error } = await supabase
      .from('favorites')
      .insert({
        profile_id: user.id,
        idea_template_id: ideaTemplateId,
      } as never)

    if (error) {
      return { success: false, isFavorited: false, error: error.message }
    }

    revalidatePath('/app/favorites')
    return { success: true, isFavorited: true }
  }
}

export async function getLatestSuggestion(): Promise<Suggestion | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Single query with profile join to avoid N+1 problem
  const { data: suggestionData, error } = await supabase
    .from('suggestions')
    .select(`
      *,
      idea_templates (*),
      profiles!inner (
        location_city,
        location_state
      )
    `)
    .eq('profile_id', user.id)
    .in('status', ['suggested', 'scheduled'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !suggestionData) return null

  interface SuggestionWithTemplate {
    id: string
    idea_template_id: string
    status: string
    scheduled_at: string | null
    idea_templates: {
      search_keywords: string[] | null
      venue_type: string | null
      category: string
      title: string
      description: string
      cost_level: number
      estimated_cost_min: number | null
      estimated_cost_max: number | null
      duration_minutes: number
      vibe_tags: string[]
      requires_reservation: boolean
      setting_type: string | null
      intensity_level: number
      reservation_platforms: string[]
    }
    profiles: {
      location_city: string | null
      location_state: string | null
    }
  }

  const data = suggestionData as unknown as SuggestionWithTemplate
  const template = data.idea_templates
  const profile = data.profiles

  const reservationLinks = generateReservationLinks(
    template.search_keywords,
    template.venue_type,
    template.category,
    profile?.location_city || 'New York',
    profile?.location_state || 'New York',
    template.setting_type,
    template.reservation_platforms
  )

  return {
    id: data.id,
    ideaTemplateId: data.idea_template_id,
    title: template.title,
    description: template.description,
    category: template.category,
    costLevel: template.cost_level,
    estimatedCostMin: template.estimated_cost_min,
    estimatedCostMax: template.estimated_cost_max,
    durationMinutes: template.duration_minutes,
    vibeTags: template.vibe_tags,
    requiresReservation: template.requires_reservation,
    reservationLinks,
    status: data.status,
    scheduledAt: data.scheduled_at,
    settingType: template.setting_type,
    intensityLevel: template.intensity_level || 2,
    reservationPlatforms: template.reservation_platforms || [],
  }
}

export async function checkIsFavorited(ideaTemplateId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('profile_id', user.id)
    .eq('idea_template_id', ideaTemplateId)
    .maybeSingle()

  return !!data
}
