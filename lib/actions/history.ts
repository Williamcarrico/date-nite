'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSuggestionHistory(
  status?: string,
  limit = 20,
  offset = 0
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], count: 0 }

  let query = supabase
    .from('suggestions')
    .select(`
      *,
      idea_templates (*),
      completed_dates (*)
    `, { count: 'exact' })
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching history:', error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}

export async function completeSuggestion(
  suggestionId: string,
  rating: number,
  notes?: string,
  actualCost?: number,
  wouldRepeat?: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Update suggestion status
  const { error: updateError } = await supabase
    .from('suggestions')
    .update({ status: 'completed' } as never)
    .eq('id', suggestionId)
    .eq('profile_id', user.id)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Create completed_dates record
  const { error: insertError } = await supabase
    .from('completed_dates')
    .insert({
      suggestion_id: suggestionId,
      profile_id: user.id,
      rating,
      notes,
      actual_cost: actualCost,
      would_repeat: wouldRepeat,
    } as never)

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  revalidatePath('/app/history')
  revalidatePath('/app')

  return { success: true }
}

export async function deleteSuggestion(
  suggestionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('suggestions')
    .delete()
    .eq('id', suggestionId)
    .eq('profile_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/history')
  revalidatePath('/app')

  return { success: true }
}
