/**
 * Context Utilities for Date Nite
 * Provides temporal context for intelligent suggestion matching
 */

/**
 * Gets the current season based on month
 * @returns 'spring' | 'summer' | 'fall' | 'winter'
 */
export function getCurrentSeason(): string {
  const month = new Date().getMonth() // 0-11

  // Spring: March (2), April (3), May (4)
  if (month >= 2 && month <= 4) return 'spring'

  // Summer: June (5), July (6), August (7)
  if (month >= 5 && month <= 7) return 'summer'

  // Fall: September (8), October (9), November (10)
  if (month >= 8 && month <= 10) return 'fall'

  // Winter: December (11), January (0), February (1)
  return 'winter'
}

/**
 * Gets the time of day based on current hour
 * @returns 'morning' | 'afternoon' | 'evening' | 'night'
 */
export function getTimeOfDay(): string {
  const hour = new Date().getHours() // 0-23

  // Morning: 5am - 11:59am
  if (hour >= 5 && hour < 12) return 'morning'

  // Afternoon: 12pm - 4:59pm
  if (hour >= 12 && hour < 17) return 'afternoon'

  // Evening: 5pm - 8:59pm
  if (hour >= 17 && hour < 21) return 'evening'

  // Night: 9pm - 4:59am
  return 'night'
}

/**
 * Gets the current day of week
 * @returns 0 (Sunday) to 6 (Saturday)
 */
export function getDayOfWeek(): number {
  return new Date().getDay()
}

/**
 * Gets a friendly label for day of week
 */
export function getDayLabel(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[day] || 'Unknown'
}

/**
 * Gets a friendly label for time of day
 */
export function getTimeOfDayLabel(timeOfDay: string): string {
  const labels: Record<string, string> = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night'
  }
  return labels[timeOfDay] || timeOfDay
}

/**
 * Gets a friendly label for season
 */
export function getSeasonLabel(season: string): string {
  const labels: Record<string, string> = {
    spring: 'Spring',
    summer: 'Summer',
    fall: 'Fall',
    winter: 'Winter'
  }
  return labels[season] || season
}

/**
 * Gets season emoji
 */
export function getSeasonEmoji(season: string): string {
  const emojis: Record<string, string> = {
    spring: '🌸',
    summer: '☀️',
    fall: '🍂',
    winter: '❄️'
  }
  return emojis[season] || '📅'
}

/**
 * Gets time of day emoji
 */
export function getTimeOfDayEmoji(timeOfDay: string): string {
  const emojis: Record<string, string> = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌆',
    night: '🌙'
  }
  return emojis[timeOfDay] || '🕐'
}

/**
 * Checks if a date is appropriate for the current season
 */
export function isSeasonalMatch(seasonal: string[] | null, strictSeason: boolean = false): boolean {
  if (!seasonal || seasonal.length === 0) {
    return true // No seasonal restrictions
  }

  const currentSeason = getCurrentSeason()
  const matches = seasonal.includes(currentSeason)

  // If strict, must match. Otherwise, just a preference
  return strictSeason ? matches : true
}

/**
 * Gets context object for suggestion matching
 */
export function getMatchingContext() {
  return {
    season: getCurrentSeason(),
    dayOfWeek: getDayOfWeek(),
    timeOfDay: getTimeOfDay(),
    timestamp: new Date().toISOString()
  }
}
