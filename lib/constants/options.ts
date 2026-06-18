export const VIBE_TAGS = [
  { value: 'romantic', label: 'Romantic', emoji: '💕' },
  { value: 'adventurous', label: 'Adventurous', emoji: '🎢' },
  { value: 'chill', label: 'Chill', emoji: '😌' },
  { value: 'fun', label: 'Fun', emoji: '🎉' },
  { value: 'fancy', label: 'Fancy', emoji: '✨' },
  { value: 'cozy', label: 'Cozy', emoji: '🛋️' },
  { value: 'active', label: 'Active', emoji: '🏃' },
  { value: 'creative', label: 'Creative', emoji: '🎨' },
  { value: 'foodie', label: 'Foodie', emoji: '🍕' },
  { value: 'cultural', label: 'Cultural', emoji: '🎭' },
  { value: 'relaxing', label: 'Relaxing', emoji: '🧘' },
  { value: 'social', label: 'Social', emoji: '👥' },
] as const

export const DIETARY_RESTRICTIONS = [
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'gluten-free', label: 'Gluten-Free', emoji: '🌾' },
  { value: 'kosher', label: 'Kosher', emoji: '✡️' },
  { value: 'halal', label: 'Halal', emoji: '☪️' },
  { value: 'dairy-free', label: 'Dairy-Free', emoji: '🥛' },
  { value: 'nut-free', label: 'Nut-Free', emoji: '🥜' },
] as const

export const COST_LEVELS = [
  { value: 1, label: '$', description: 'Budget-friendly ($0-30)' },
  { value: 2, label: '$$', description: 'Moderate ($30-75)' },
  { value: 3, label: '$$$', description: 'Upscale ($75-150)' },
  { value: 4, label: '$$$$', description: 'Luxury ($150+)' },
] as const

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
  'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
] as const

export const CATEGORIES = [
  { value: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { value: 'activity', label: 'Activity', emoji: '🎯' },
  { value: 'creative', label: 'Creative', emoji: '🎨' },
  { value: 'outdoor', label: 'Outdoor', emoji: '🌳' },
  { value: 'cultural', label: 'Cultural', emoji: '🏛️' },
  { value: 'relaxation', label: 'Relaxation', emoji: '💆' },
] as const

export const SETTING_TYPES = [
  { value: 'big_city', label: 'Big City', emoji: '🏙️', description: 'High energy, high variety' },
  { value: 'suburbs', label: 'Suburbs', emoji: '🏘️', description: 'Low friction, cozy spots' },
  { value: 'coastal', label: 'Coastal', emoji: '🏖️', description: 'Beach, waterfront vibes' },
  { value: 'mountain', label: 'Mountain', emoji: '⛰️', description: 'Forest, high country' },
  { value: 'desert', label: 'Desert', emoji: '🏜️', description: 'Southwest landscapes' },
  { value: 'countryside', label: 'Countryside', emoji: '🌾', description: 'Rural, farmland charm' },
  { value: 'tropical', label: 'Tropical', emoji: '🌴', description: 'Island, warm weather' },
  { value: 'cold_weather', label: 'Cold Weather', emoji: '❄️', description: 'Snowy regions' },
  { value: 'indoor_only', label: 'Indoor Only', emoji: '🏠', description: 'Rainy day backup' },
  { value: 'at_home', label: 'At Home', emoji: '🛋️', description: 'No travel required' },
] as const

export const INTENSITY_LEVELS = [
  { value: 1, label: 'Low Effort', emoji: '🍃', description: 'Dessert crawl, sunset walk' },
  { value: 2, label: 'Moderate', emoji: '⚡', description: 'Cooking class, museum' },
  { value: 3, label: 'High Energy', emoji: '🔥', description: 'Kayaking, rock climbing' },
  { value: 4, label: 'Full Send', emoji: '🚀', description: 'Weekend cabin, camping trip' },
] as const

export const QUICK_FILTERS = [
  { value: 'romantic', label: 'Romantic', emoji: '💕' },
  { value: 'fun_silly', label: 'Fun & Silly', emoji: '🎉' },
  { value: 'intellectual', label: 'Intellectual', emoji: '🧠' },
  { value: 'active', label: 'Active', emoji: '🏃' },
  { value: 'creative', label: 'Creative', emoji: '🎨' },
  { value: 'low_budget', label: 'Low Budget', emoji: '💰' },
  { value: 'luxury', label: 'Luxury', emoji: '✨' },
] as const

export const RESERVATION_PLATFORMS = [
  { value: 'opentable', label: 'OpenTable', icon: 'Utensils' },
  { value: 'resy', label: 'Resy', icon: 'Utensils' },
  { value: 'yelp', label: 'Yelp', icon: 'Search' },
  { value: 'google_maps', label: 'Google Maps', icon: 'MapPin' },
  { value: 'eventbrite', label: 'Eventbrite', icon: 'Ticket' },
  { value: 'meetup', label: 'Meetup', icon: 'Users' },
  { value: 'airbnb_experiences', label: 'Airbnb Experiences', icon: 'Home' },
  { value: 'recreation_gov', label: 'Recreation.gov', icon: 'Tent' },
  { value: 'darksky', label: 'DarkSky International', icon: 'Star' },
  { value: 'nps', label: 'National Park Service', icon: 'Mountain' },
] as const

export type SettingType = typeof SETTING_TYPES[number]['value']
export type IntensityLevel = typeof INTENSITY_LEVELS[number]['value']
export type QuickFilter = typeof QUICK_FILTERS[number]['value']
export type ReservationPlatform = typeof RESERVATION_PLATFORMS[number]['value']
