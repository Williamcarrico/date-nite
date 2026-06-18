'use server'

import { createClient } from '@/lib/supabase/server'

interface CompletedDateWithIdea {
  rating: number | null
  actual_cost: number | null
  would_repeat: boolean | null
  completed_at: string
  suggestions: {
    idea_templates: {
      category: string
      vibe_tags: string[]
      cost_level: number
      setting_type: string
      intensity_level: number
      estimated_cost_min: number | null
      estimated_cost_max: number | null
    }
  }
}

interface ProfileInsights {
  totalDates: number
  avgRating: number
  totalSpent: number
  favoriteCategory: string | null
  categoryDistribution: Record<string, number>
  vibeDistribution: Record<string, number>
  insights: Array<{
    type: 'positive' | 'suggestion' | 'info'
    message: string
  }>
}

function getMostFrequent<T>(arr: T[]): T | null {
  if (arr.length === 0) return null
  const counts: Record<string, number> = {}
  arr.forEach((item) => {
    const key = String(item)
    counts[key] = (counts[key] || 0) + 1
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as T | null
}

export async function getProfileInsights(profileId: string): Promise<ProfileInsights | null> {
  const supabase = await createClient()

  const { data: completedDates, error } = await supabase
    .from('completed_dates')
    .select(`
      *,
      suggestions!inner(
        idea_templates!inner(
          category,
          vibe_tags,
          cost_level,
          setting_type,
          intensity_level,
          estimated_cost_min,
          estimated_cost_max
        )
      )
    `)
    .eq('profile_id', profileId)

  if (error) {
    console.error('Error fetching completed dates:', error)
    return null
  }

  const dates = completedDates as unknown as CompletedDateWithIdea[]

  if (!dates || dates.length === 0) {
    return {
      totalDates: 0,
      avgRating: 0,
      totalSpent: 0,
      favoriteCategory: null,
      categoryDistribution: {},
      vibeDistribution: {},
      insights: [],
    }
  }

  // Calculate basic statistics
  const totalDates = dates.length
  const avgRating = dates.reduce((sum, d) => sum + (d.rating || 0), 0) / totalDates
  const totalSpent = dates.reduce((sum, d) => sum + (d.actual_cost || 0), 0)

  // Category frequency
  const categoryCount: Record<string, number> = {}
  dates.forEach((d) => {
    const cat = d.suggestions.idea_templates.category
    categoryCount[cat] = (categoryCount[cat] || 0) + 1
  })
  const favoriteCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null

  // Vibe frequency
  const vibeCount: Record<string, number> = {}
  dates.forEach((d) => {
    d.suggestions.idea_templates.vibe_tags?.forEach((vibe: string) => {
      vibeCount[vibe] = (vibeCount[vibe] || 0) + 1
    })
  })

  // Generate personalized insights
  const insights: Array<{ type: 'positive' | 'suggestion' | 'info'; message: string }> = []

  // High rating category suggestion
  const highRatedCategories = dates
    .filter((d) => (d.rating || 0) >= 4)
    .map((d) => d.suggestions.idea_templates.category)
  const mostLovedCategory = getMostFrequent(highRatedCategories)
  if (mostLovedCategory && mostLovedCategory !== favoriteCategory) {
    insights.push({
      type: 'suggestion',
      message: `You rated ${mostLovedCategory} dates highly. Try more ${mostLovedCategory} ideas!`,
    })
  }

  // Budget efficiency
  const budgetDeltas = dates
    .filter((d) => d.actual_cost && d.suggestions.idea_templates.estimated_cost_min)
    .map((d) => (d.actual_cost || 0) - (d.suggestions.idea_templates.estimated_cost_min || 0))

  if (budgetDeltas.length > 0) {
    const avgBudgetDelta = budgetDeltas.reduce((sum, delta) => sum + delta, 0) / budgetDeltas.length
    if (Math.abs(avgBudgetDelta) < 5) {
      insights.push({
        type: 'positive',
        message: `You're great at budgeting! You average within $${Math.abs(avgBudgetDelta).toFixed(0)} of estimated costs.`,
      })
    } else if (avgBudgetDelta > 20) {
      insights.push({
        type: 'info',
        message: `Your dates tend to cost about $${avgBudgetDelta.toFixed(0)} more than estimated. Consider adjusting your budget range.`,
      })
    }
  }

  // Variety suggestion
  const uniqueCategories = new Set(dates.map((d) => d.suggestions.idea_templates.category)).size
  if (uniqueCategories < 3 && totalDates >= 5) {
    insights.push({
      type: 'suggestion',
      message: `You've tried ${uniqueCategories} categories. Branch out and explore more variety!`,
    })
  }

  // Would repeat ratio
  const wouldRepeatCount = dates.filter((d) => d.would_repeat).length
  const wouldRepeatRatio = wouldRepeatCount / totalDates
  if (wouldRepeatRatio > 0.8) {
    insights.push({
      type: 'positive',
      message: `You loved ${Math.round(wouldRepeatRatio * 100)}% of your dates! You're great at finding activities you enjoy.`,
    })
  }

  // High rating streak
  const recentDates = dates.slice(-5)
  const recentHighRatings = recentDates.filter((d) => (d.rating || 0) >= 4).length
  if (recentHighRatings >= 4 && recentDates.length >= 4) {
    insights.push({
      type: 'positive',
      message: "You're on a roll! Your last few dates have been fantastic.",
    })
  }

  return {
    totalDates,
    avgRating,
    totalSpent,
    favoriteCategory,
    categoryDistribution: categoryCount,
    vibeDistribution: vibeCount,
    insights,
  }
}

export async function getRatingDistribution(profileId: string): Promise<Record<number, number>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('completed_dates')
    .select('rating')
    .eq('profile_id', profileId)

  if (error) {
    console.error('Error fetching ratings:', error)
    return {}
  }

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const rows = data as unknown as Array<{ rating: number | null }>
  rows?.forEach((d) => {
    if (d.rating && d.rating >= 1 && d.rating <= 5) {
      distribution[d.rating]++
    }
  })

  return distribution
}

interface MonthlyTrend {
  month: string
  count: number
  avgCost: number
}

export async function getDateTrends(profileId: string): Promise<MonthlyTrend[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('completed_dates')
    .select('completed_at, actual_cost')
    .eq('profile_id', profileId)
    .order('completed_at', { ascending: true })

  if (error) {
    console.error('Error fetching trends:', error)
    return []
  }

  if (!data || data.length === 0) return []

  // Group by month
  const trendRows = data as unknown as Array<{ completed_at: string; actual_cost: number | null }>
  const monthlyData: Record<string, { count: number; totalCost: number }> = {}
  trendRows.forEach((d) => {
    const month = d.completed_at.substring(0, 7) // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { count: 0, totalCost: 0 }
    }
    monthlyData[month].count++
    monthlyData[month].totalCost += d.actual_cost || 0
  })

  return Object.entries(monthlyData)
    .map(([month, stats]) => ({
      month,
      count: stats.count,
      avgCost: stats.count > 0 ? stats.totalCost / stats.count : 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

interface PreferenceWeights {
  vibe_weights: Record<string, number>
  category_weights: Record<string, number>
  setting_weights: Record<string, number>
  total_completions: number
  avg_rating: number | null
  completion_rate: number | null
}

/**
 * Derive lightweight preference "weights" from the user's highly-rated completed
 * dates (rating >= 4). This replaces the never-deployed user_preference_weights
 * table; a full learning loop is Phase 4 scope.
 */
export async function getPreferenceWeights(profileId: string): Promise<PreferenceWeights | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('completed_dates')
    .select(`
      rating,
      would_repeat,
      suggestions!inner(
        idea_templates!inner(category, vibe_tags, setting_type)
      )
    `)
    .eq('profile_id', profileId)

  if (error) {
    console.error('Error fetching preference weights:', error)
    return null
  }

  const rows = (data ?? []) as unknown as Array<{
    rating: number | null
    would_repeat: boolean | null
    suggestions: { idea_templates: { category: string; vibe_tags: string[] | null; setting_type: string | null } }
  }>

  if (rows.length === 0) return null

  const vibe_weights: Record<string, number> = {}
  const category_weights: Record<string, number> = {}
  const setting_weights: Record<string, number> = {}
  let ratingSum = 0
  let ratingCount = 0
  let repeatCount = 0

  for (const r of rows) {
    const idea = r.suggestions.idea_templates
    // Weight by how much the date was liked: a 5★ counts more than a 3★.
    const w = ((r.rating ?? 3) - 2) / 3 // 1★->-0.33 ... 5★->1.0
    category_weights[idea.category] = (category_weights[idea.category] || 0) + w
    if (idea.setting_type) {
      setting_weights[idea.setting_type] = (setting_weights[idea.setting_type] || 0) + w
    }
    idea.vibe_tags?.forEach((v) => {
      vibe_weights[v] = (vibe_weights[v] || 0) + w
    })
    if (r.rating != null) {
      ratingSum += r.rating
      ratingCount++
    }
    if (r.would_repeat) repeatCount++
  }

  return {
    vibe_weights,
    category_weights,
    setting_weights,
    total_completions: rows.length,
    avg_rating: ratingCount > 0 ? ratingSum / ratingCount : null,
    completion_rate: rows.length > 0 ? repeatCount / rows.length : null,
  }
}
