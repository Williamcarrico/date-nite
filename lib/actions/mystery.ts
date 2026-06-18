'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCouple } from '@/lib/actions/couples'
import { getCandidates, type ScoredCandidate } from '@/lib/actions/suggestions'

export interface MysteryView {
  isPlanner: boolean
  revealed: boolean
  status: string
  scheduledAt: string | null
  dressCode: string | null
  costLevel: number
  intensityLevel: number
  durationMinutes: number
  requiresReservation: boolean
  // Full fields — present only for the planner or once revealed:
  ideaTemplateId?: string
  title?: string
  description?: string
  category?: string
  vibeTags?: string[]
  settingType?: string | null
  estimatedCostMin?: number | null
  estimatedCostMax?: number | null
}

function parseView(data: unknown): MysteryView {
  const d = (data ?? {}) as Record<string, unknown>
  return {
    isPlanner: Boolean(d.is_planner),
    revealed: Boolean(d.revealed),
    status: (d.status as string) ?? 'picking',
    scheduledAt: (d.scheduled_at as string) ?? null,
    dressCode: (d.dress_code as string) ?? null,
    costLevel: Number(d.cost_level ?? 1),
    intensityLevel: Number(d.intensity_level ?? 2),
    durationMinutes: Number(d.duration_minutes ?? 120),
    requiresReservation: Boolean(d.requires_reservation),
    ideaTemplateId: (d.idea_template_id as string) ?? undefined,
    title: (d.title as string) ?? undefined,
    description: (d.description as string) ?? undefined,
    category: (d.category as string) ?? undefined,
    vibeTags: (d.vibe_tags as string[]) ?? undefined,
    settingType: (d.setting_type as string | null) ?? undefined,
    estimatedCostMin: (d.estimated_cost_min as number | null) ?? undefined,
    estimatedCostMax: (d.estimated_cost_max as number | null) ?? undefined,
  }
}

/** Candidate ideas for the planner to choose from (couple-blended scoring). */
export async function getMysteryCandidates(): Promise<{ candidates: ScoredCandidate[]; error?: string }> {
  const couple = await getCouple()
  if (!couple?.isActive || !couple.partnerId) return { candidates: [], error: 'Link with your partner first.' }
  return getCandidates({ partnerId: couple.partnerId, limit: 6 })
}

/** Planner secretly picks (and optionally schedules) a date for their partner. */
export async function createMysteryDate(input: {
  ideaTemplateId: string
  scheduledAt?: string | null
  dressCode?: string | null
}): Promise<{ sessionId?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const couple = await getCouple()
  if (!couple?.isActive) return { error: 'Link with your partner first.' }

  const { data: session, error: sErr } = await supabase
    .from('date_sessions')
    .insert({ couple_id: couple.id, created_by: user.id, mode: 'mystery', status: 'picking' })
    .select('id')
    .single()
  if (sErr || !session) return { error: sErr?.message ?? 'Could not create mystery.' }

  const { error: mErr } = await supabase.from('mystery_dates').insert({
    session_id: session.id,
    planner_id: user.id,
    idea_template_id: input.ideaTemplateId,
    scheduled_at: input.scheduledAt ?? null,
    dress_code: input.dressCode ?? null,
  })
  if (mErr) {
    await supabase.from('date_sessions').delete().eq('id', session.id)
    return { error: mErr.message }
  }

  revalidatePath('/app/play')
  return { sessionId: session.id }
}

/** The couple's current pending mystery (awaiting reveal), if any. */
export async function getActiveMystery(): Promise<{ sessionId: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const couple = await getCouple()
  if (!couple?.isActive) return null

  const { data } = await supabase
    .from('date_sessions')
    .select('id')
    .eq('couple_id', couple.id)
    .eq('mode', 'mystery')
    .eq('status', 'picking')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data ? { sessionId: data.id } : null
}

export async function getMysteryView(sessionId: string): Promise<MysteryView | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_mystery_view', { p_session_id: sessionId })
  if (error) {
    console.error('getMysteryView error:', error)
    return null
  }
  return parseView(data)
}

export async function revealMystery(sessionId: string): Promise<{ view?: MysteryView; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('reveal_mystery', { p_session_id: sessionId })
  if (error) return { error: error.message }
  revalidatePath('/app/play')
  revalidatePath('/app')
  return { view: parseView(data) }
}

/** Planner cancels an unrevealed mystery (recipient must not be able to destroy the surprise). */
export async function cancelMystery(sessionId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Only the planner may cancel. The mystery_dates RLS is planner-only, so a
  // partner gets no row back here.
  const { data: m } = await supabase
    .from('mystery_dates')
    .select('planner_id, revealed')
    .eq('session_id', sessionId)
    .maybeSingle()
  if (!m || m.planner_id !== user.id) {
    return { success: false, error: 'Only the planner can cancel this mystery.' }
  }

  const { error } = await supabase.from('date_sessions').delete().eq('id', sessionId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/app/play')
  return { success: true }
}
