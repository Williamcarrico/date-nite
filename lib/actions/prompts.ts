'use server'

import { createClient } from '@/lib/supabase/server'

export interface PromptCard {
  id: string
  kind: 'conversation' | 'dare'
  text: string
}

/** Conversation starters & dares matched to an idea's vibes, to bring on the date. */
export async function getPromptCards(ideaTemplateId: string, limit = 3): Promise<PromptCard[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_prompt_cards', {
    p_idea_id: ideaTemplateId,
    p_limit: limit,
  })
  if (error) {
    console.error('getPromptCards error:', error)
    return []
  }
  return (data ?? []) as PromptCard[]
}
