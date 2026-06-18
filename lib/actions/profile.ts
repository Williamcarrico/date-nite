'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const profileSchema = z.object({
  display_name: z.string().min(1).max(50).optional(),
  partner_name: z.string().max(50).optional(),
  location_city: z.string().max(100).optional(),
  location_state: z.string().max(50).optional(),
  budget_min: z.number().min(0).max(1000).optional(),
  budget_max: z.number().min(0).max(1000).optional(),
  cost_levels: z.array(z.number().min(1).max(4)).optional(),
  vibe_tags: z.array(z.string()).optional(),
  dietary_restrictions: z.array(z.string()).optional(),
  favorite_categories: z.array(z.string()).optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileData {
  id: string
  display_name: string | null
  partner_name: string | null
  location_city: string | null
  location_state: string | null
  max_distance_miles: number
  budget_min: number
  budget_max: number
  cost_levels: number[]
  vibe_tags: string[]
  dietary_restrictions: string[]
  preferred_day_of_week: number[] | null
  preferred_time_of_day: string[] | null
  favorite_categories: string[] | null
}

export async function getProfile(): Promise<ProfileData | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data as unknown as ProfileData
}

export async function updateProfile(formData: ProfileFormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Validate input
  const validatedData = profileSchema.safeParse(formData)
  if (!validatedData.success) {
    return { error: validatedData.error.issues[0].message }
  }

  // Ensure budget_max >= budget_min
  if (
    validatedData.data.budget_min !== undefined &&
    validatedData.data.budget_max !== undefined &&
    validatedData.data.budget_max < validatedData.data.budget_min
  ) {
    return { error: 'Maximum budget must be greater than minimum budget' }
  }

  const { error } = await supabase
    .from('profiles')
    .update(validatedData.data as never)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app')
  revalidatePath('/app/profile')

  return { success: true }
}
