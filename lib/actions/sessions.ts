'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentSeason } from '@/lib/utils/context'
import { getCouple } from '@/lib/actions/couples'
import { getCandidates } from '@/lib/actions/suggestions'
import type { Json } from '@/types/database'

export interface DeckCard {
  candidateId: string
  ideaTemplateId: string
  title: string
  description: string
  category: string
  costLevel: number
  estimatedCostMin: number | null
  estimatedCostMax: number | null
  durationMinutes: number
  vibeTags: string[]
  settingType: string | null
  intensityLevel: number
  matchScore: number
}

export interface SessionState {
  status: 'picking' | 'revealed' | 'resolved' | 'expired'
  candidateCount: number
  myPicks: number
  partnerPicks: number
  myDone: boolean
  partnerDone: boolean
  matchIdeaIds: string[]
  chosenIdeaId: string | null
}

function parseState(data: unknown): SessionState {
  const d = (data ?? {}) as Record<string, unknown>
  return {
    status: (d.status as SessionState['status']) ?? 'picking',
    candidateCount: Number(d.candidate_count ?? 0),
    myPicks: Number(d.my_picks ?? 0),
    partnerPicks: Number(d.partner_picks ?? 0),
    myDone: Boolean(d.my_done),
    partnerDone: Boolean(d.partner_done),
    matchIdeaIds: (d.match_idea_ids as string[]) ?? [],
    chosenIdeaId: (d.chosen_idea_id as string) ?? null,
  }
}

/** Start a new Blind Double-Pick round for the current user's active couple. */
export async function startRound(options?: {
  settingTypes?: string[]
  intensityLevels?: number[]
}): Promise<{ sessionId?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const couple = await getCouple()
  if (!couple?.isActive || !couple.partnerId) {
    return { error: 'Link with your partner first.' }
  }

  const season = getCurrentSeason()
  const { candidates, error } = await getCandidates({
    partnerId: couple.partnerId,
    settingTypes: options?.settingTypes,
    intensityLevels: options?.intensityLevels,
    season,
    limit: 5,
  })
  if (error) return { error }
  if (candidates.length < 2) {
    return { error: 'Not enough fresh ideas to play. Try clearing filters.' }
  }

  const { data: session, error: sErr } = await supabase
    .from('date_sessions')
    .insert({
      couple_id: couple.id,
      created_by: user.id,
      mode: 'double_pick',
      status: 'picking',
      filters: { settingTypes: options?.settingTypes, intensityLevels: options?.intensityLevels },
      context: { season },
    })
    .select('id')
    .single()

  if (sErr || !session) return { error: sErr?.message ?? 'Could not start round.' }

  const rows = candidates.map((c, i) => ({
    session_id: session.id,
    idea_template_id: c.idea_id,
    match_score: c.match_score,
    score_breakdown: c.score_breakdown as unknown as Json,
    position: i,
  }))
  const { error: cErr } = await supabase.from('session_candidates').insert(rows)
  if (cErr) {
    await supabase.from('date_sessions').delete().eq('id', session.id)
    return { error: cErr.message }
  }

  revalidatePath('/app/play')
  return { sessionId: session.id }
}

/** The couple's current in-flight round (picking or revealed), if any. */
export async function getActiveSession(): Promise<{ sessionId: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const couple = await getCouple()
  if (!couple?.isActive) return null

  const { data } = await supabase
    .from('date_sessions')
    .select('id')
    .eq('couple_id', couple.id)
    .eq('mode', 'double_pick')
    .in('status', ['picking', 'revealed'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data ? { sessionId: data.id } : null
}

/** The deck of candidate ideas for a session (shared, identical for both partners). */
export async function getDeck(sessionId: string): Promise<DeckCard[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('session_candidates')
    .select(`
      id, idea_template_id, match_score, position,
      idea_templates!inner (
        title, description, category, cost_level, estimated_cost_min,
        estimated_cost_max, duration_minutes, vibe_tags, setting_type, intensity_level
      )
    `)
    .eq('session_id', sessionId)
    .order('position', { ascending: true })

  type Row = {
    id: string
    idea_template_id: string
    match_score: number | null
    idea_templates: {
      title: string; description: string; category: string; cost_level: number
      estimated_cost_min: number | null; estimated_cost_max: number | null
      duration_minutes: number; vibe_tags: string[] | null
      setting_type: string | null; intensity_level: number | null
    }
  }

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    candidateId: r.id,
    ideaTemplateId: r.idea_template_id,
    title: r.idea_templates.title,
    description: r.idea_templates.description,
    category: r.idea_templates.category,
    costLevel: r.idea_templates.cost_level,
    estimatedCostMin: r.idea_templates.estimated_cost_min,
    estimatedCostMax: r.idea_templates.estimated_cost_max,
    durationMinutes: r.idea_templates.duration_minutes,
    vibeTags: r.idea_templates.vibe_tags ?? [],
    settingType: r.idea_templates.setting_type,
    intensityLevel: r.idea_templates.intensity_level ?? 2,
    matchScore: Number(r.match_score ?? 0),
  }))
}

export async function getSessionState(sessionId: string): Promise<SessionState | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_session_state', { p_session_id: sessionId })
  if (error) {
    console.error('getSessionState error:', error)
    return null
  }
  return parseState(data)
}

/** Record one swipe and try to resolve (reveals if both partners are now done). */
export async function submitPick(
  sessionId: string,
  candidateId: string,
  liked: boolean
): Promise<{ state?: SessionState; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('session_picks')
    .upsert(
      { session_id: sessionId, profile_id: user.id, candidate_id: candidateId, liked },
      { onConflict: 'session_id,profile_id,candidate_id' }
    )
  if (error) return { error: error.message }

  // Attempt resolution; reveals only when BOTH partners have finished.
  const { data, error: rErr } = await supabase.rpc('resolve_session', { p_session_id: sessionId })
  if (rErr) return { error: rErr.message }

  revalidatePath('/app/play')
  return { state: parseState(data) }
}

/**
 * Commit the couple to a chosen idea: resolve the session, create a schedulable
 * suggestion for the current user, and write a 90-day no-repeat exclusion for
 * BOTH partners.
 */
export async function chooseMatch(
  sessionId: string,
  ideaTemplateId: string
): Promise<{ suggestionId?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const couple = await getCouple()
  if (!couple?.isActive) return { error: 'No active couple.' }

  const { error: upErr } = await supabase
    .from('date_sessions')
    .update({ status: 'resolved', chosen_idea_id: ideaTemplateId, resolved_at: new Date().toISOString() })
    .eq('id', sessionId)
  if (upErr) return { error: upErr.message }

  const { data: suggestion, error: sErr } = await supabase
    .from('suggestions')
    .insert({ profile_id: user.id, idea_template_id: ideaTemplateId, status: 'suggested' })
    .select('id')
    .single()
  if (sErr || !suggestion) return { error: sErr?.message ?? 'Could not create suggestion.' }

  // 90-day no-repeat for both partners.
  const excludedUntil = new Date()
  excludedUntil.setDate(excludedUntil.getDate() + 90)
  const profileIds = [user.id, couple.partnerId].filter(Boolean) as string[]
  await supabase.from('exclusions').upsert(
    profileIds.map((pid) => ({
      profile_id: pid,
      idea_template_id: ideaTemplateId,
      excluded_until: excludedUntil.toISOString(),
    })),
    { onConflict: 'profile_id,idea_template_id' }
  )

  revalidatePath('/app/play')
  revalidatePath('/app')
  return { suggestionId: suggestion.id }
}
