'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CoupleInfo {
  id: string
  status: 'pending' | 'active'
  inviteCode: string
  role: 'owner' | 'partner'
  partnerId: string | null
  partnerName: string | null
  isActive: boolean
}

// Unambiguous code alphabet (no 0/O/1/I) for easy verbal/text sharing.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function makeInviteCode(seed: number): string {
  let code = ''
  let n = seed
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor((Math.random() * 1_000_003 + n) % CODE_ALPHABET.length)]
    n = (n * 31 + 7) % 1_000_003
  }
  return code
}

/** The current user's couple, if any (active preferred, else a pending invite they created). */
export async function getCouple(): Promise<CoupleInfo | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: couples } = await supabase
    .from('couples')
    .select('id, status, invite_code, partner_a, partner_b')
    .or(`partner_a.eq.${user.id},partner_b.eq.${user.id}`)
    .order('status', { ascending: true }) // 'active' < 'pending' alphabetically -> active first

  const couple = couples?.find((c) => c.status === 'active') ?? couples?.[0]
  if (!couple) return null

  const role: 'owner' | 'partner' = couple.partner_a === user.id ? 'owner' : 'partner'
  const partnerId = role === 'owner' ? couple.partner_b : couple.partner_a

  let partnerName: string | null = null
  if (partnerId) {
    const { data: p } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', partnerId)
      .maybeSingle()
    partnerName = p?.display_name ?? null
  }

  return {
    id: couple.id,
    status: couple.status as 'pending' | 'active',
    inviteCode: couple.invite_code,
    role,
    partnerId,
    partnerName,
    isActive: couple.status === 'active',
  }
}

/** Create (or return the existing) pending invite for the current user. */
export async function createCoupleInvite(): Promise<{ inviteCode?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const existing = await getCouple()
  if (existing?.isActive) return { error: 'You are already linked with a partner.' }
  if (existing?.status === 'pending' && existing.role === 'owner') {
    return { inviteCode: existing.inviteCode }
  }

  // Retry on the (rare) unique-code collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const inviteCode = makeInviteCode(attempt)
    const { error } = await supabase
      .from('couples')
      .insert({ partner_a: user.id, invite_code: inviteCode, status: 'pending' })
    if (!error) {
      revalidatePath('/app/play')
      return { inviteCode }
    }
    if (!error.message.toLowerCase().includes('duplicate')) {
      return { error: error.message }
    }
  }
  return { error: 'Could not generate an invite code. Please try again.' }
}

/** Accept a partner's invite code, linking both profiles into an active couple. */
export async function acceptCoupleInvite(code: string): Promise<{ success: boolean; error?: string }> {
  const trimmed = code.trim().toUpperCase()
  if (trimmed.length < 4) return { success: false, error: 'Enter a valid invite code.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.rpc('accept_couple_invite', { p_code: trimmed })
  if (error) return { success: false, error: error.message }

  revalidatePath('/app/play')
  revalidatePath('/app')
  return { success: true }
}

export interface CoupleBadge {
  id: string
  label: string
  emoji: string
  earned: boolean
}

export interface CoupleStats {
  totalDates: number
  currentStreakWeeks: number
  settingsExplored: number
  badges: CoupleBadge[]
}

function isoWeekKey(d: Date): string {
  // ISO week number (Mon-based), good enough for a weekly streak.
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - day + 3)
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4))
  const week = 1 + Math.round(
    ((date.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7
  )
  return `${date.getUTCFullYear()}-${week}`
}

/** Aggregate milestones for the couple, across BOTH partners' completed dates. */
export async function getCoupleStats(): Promise<CoupleStats | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const couple = await getCouple()
  if (!couple?.isActive) return null

  const ids = [user.id, couple.partnerId].filter(Boolean) as string[]

  const { data } = await supabase
    .from('completed_dates')
    .select('completed_at, suggestions!inner(idea_templates!inner(setting_type))')
    .in('profile_id', ids)
    .order('completed_at', { ascending: false })

  const rows = (data ?? []) as unknown as Array<{
    completed_at: string | null
    suggestions: { idea_templates: { setting_type: string | null } }
  }>

  const totalDates = rows.length
  const settings = new Set(rows.map((r) => r.suggestions.idea_templates.setting_type).filter(Boolean))
  const settingsExplored = settings.size

  // Current streak: consecutive ISO weeks (incl. this or last week) with a date.
  const weeks = new Set(rows.map((r) => (r.completed_at ? isoWeekKey(new Date(r.completed_at)) : '')))
  let currentStreakWeeks = 0
  const cursor = new Date()
  // Allow the streak to "start" from either this week or last week.
  if (!weeks.has(isoWeekKey(cursor))) cursor.setDate(cursor.getDate() - 7)
  while (weeks.has(isoWeekKey(cursor))) {
    currentStreakWeeks++
    cursor.setDate(cursor.getDate() - 7)
  }

  const badges: CoupleBadge[] = [
    { id: 'first', label: 'First Date', emoji: '🌱', earned: totalDates >= 1 },
    { id: 'five', label: '5 Dates', emoji: '✨', earned: totalDates >= 5 },
    { id: 'ten', label: '10 Dates', emoji: '🏆', earned: totalDates >= 10 },
    { id: 'streak', label: '3-Week Streak', emoji: '🔥', earned: currentStreakWeeks >= 3 },
    { id: 'explorer', label: 'Explorers (5 settings)', emoji: '🧭', earned: settingsExplored >= 5 },
  ]

  return { totalDates, currentStreakWeeks, settingsExplored, badges }
}

/** Unlink the current user's couple. */
export async function unlinkCouple(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const couple = await getCouple()
  if (!couple) return { success: true }

  const { error } = await supabase.from('couples').delete().eq('id', couple.id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/app/play')
  revalidatePath('/app')
  return { success: true }
}
