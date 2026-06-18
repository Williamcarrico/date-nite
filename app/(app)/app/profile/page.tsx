'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getProfile, updateProfile, type ProfileFormData } from '@/lib/actions/profile'
import { VIBE_TAGS, DIETARY_RESTRICTIONS, COST_LEVELS, US_STATES, CATEGORIES } from '@/lib/constants/options'
import { User, MapPin, DollarSign, Heart, Utensils, Save, Loader2, Calendar, Star, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileFormData>({
    display_name: '',
    partner_name: '',
    location_city: '',
    location_state: '',
    max_distance_miles: 25,
    budget_min: 0,
    budget_max: 200,
    cost_levels: [1, 2, 3],
    vibe_tags: [],
    dietary_restrictions: [],
    preferred_day_of_week: [],
    preferred_time_of_day: [],
    favorite_categories: [],
  })

  useEffect(() => {
    async function loadProfile() {
      const data = await getProfile()
      if (data) {
        setProfile({
          display_name: data.display_name || '',
          partner_name: data.partner_name || '',
          location_city: data.location_city || '',
          location_state: data.location_state || '',
          max_distance_miles: data.max_distance_miles || 25,
          budget_min: data.budget_min || 0,
          budget_max: data.budget_max || 200,
          cost_levels: data.cost_levels || [1, 2, 3],
          vibe_tags: data.vibe_tags || [],
          dietary_restrictions: data.dietary_restrictions || [],
          preferred_day_of_week: data.preferred_day_of_week || [],
          preferred_time_of_day: data.preferred_time_of_day || [],
          favorite_categories: data.favorite_categories || [],
        })
      }
      setIsLoading(false)
    }
    loadProfile()
  }, [])

  async function handleSave() {
    setIsSaving(true)
    const result = await updateProfile(profile)
    setIsSaving(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Profile updated! Taking you back to your dashboard.')
      router.push('/app')
    }
  }

  function toggleArrayValue<T extends string | number>(array: T[], value: T): T[] {
    return array.includes(value)
      ? array.filter((v) => v !== value)
      : [...array, value]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link
          href="/app"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="font-display text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize your preferences to get better date suggestions
        </p>
      </div>

      {/* Personal Info */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Personal Info
          </CardTitle>
          <CardDescription>Tell us about you and your partner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Your Name</Label>
              <Input
                id="display_name"
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                placeholder="Your name"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner_name">Partner&apos;s Name</Label>
              <Input
                id="partner_name"
                value={profile.partner_name}
                onChange={(e) => setProfile({ ...profile, partner_name: e.target.value })}
                placeholder="Partner's name"
                className="rounded-xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-secondary" />
            Location
          </CardTitle>
          <CardDescription>Where are you based?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location_city">City</Label>
              <Input
                id="location_city"
                value={profile.location_city}
                onChange={(e) => setProfile({ ...profile, location_city: e.target.value })}
                placeholder="e.g. Austin"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location_state">State</Label>
              <Select
                value={profile.location_state}
                onValueChange={(value) => setProfile({ ...profile, location_state: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Max Distance</Label>
              <span className="text-sm text-muted-foreground">
                {profile.max_distance_miles} miles
              </span>
            </div>
            <Slider
              value={[profile.max_distance_miles || 25]}
              onValueChange={([value]) => setProfile({ ...profile, max_distance_miles: value })}
              min={5}
              max={100}
              step={5}
              className="py-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Budget */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-success" />
            Budget
          </CardTitle>
          <CardDescription>Set your spending preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Budget Range</Label>
              <span className="text-sm text-muted-foreground">
                ${profile.budget_min} - ${profile.budget_max}
              </span>
            </div>
            <Slider
              value={[profile.budget_min || 0, profile.budget_max || 200]}
              onValueChange={([min, max]) => setProfile({ ...profile, budget_min: min, budget_max: max })}
              min={0}
              max={500}
              step={10}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label>Preferred Price Levels</Label>
            <div className="flex flex-wrap gap-2">
              {COST_LEVELS.map((level) => (
                <Button
                  key={level.value}
                  type="button"
                  variant={profile.cost_levels?.includes(level.value) ? 'default' : 'outline'}
                  onClick={() =>
                    setProfile({
                      ...profile,
                      cost_levels: toggleArrayValue(profile.cost_levels || [], level.value),
                    })
                  }
                  className={`rounded-xl ${
                    profile.cost_levels?.includes(level.value) ? 'gradient-primary text-white' : ''
                  }`}
                >
                  {level.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Select all price levels you&apos;re comfortable with
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Vibes */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Date Vibes
          </CardTitle>
          <CardDescription>What kind of dates do you enjoy?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {VIBE_TAGS.map((vibe) => (
              <Badge
                key={vibe.value}
                asChild
                variant={profile.vibe_tags?.includes(vibe.value) ? 'default' : 'outline'}
                className={`cursor-pointer text-sm py-2 px-3 rounded-xl transition-all ${
                  profile.vibe_tags?.includes(vibe.value)
                    ? 'gradient-primary text-white border-0'
                    : 'hover:bg-muted'
                }`}
              >
                <button
                  type="button"
                  aria-pressed={profile.vibe_tags?.includes(vibe.value) ?? false}
                  onClick={() =>
                    setProfile({
                      ...profile,
                      vibe_tags: toggleArrayValue(profile.vibe_tags || [], vibe.value),
                    })
                  }
                >
                  {vibe.emoji} {vibe.label}
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dietary */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-accent" />
            Dietary Preferences
          </CardTitle>
          <CardDescription>Any dietary restrictions to consider?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {DIETARY_RESTRICTIONS.map((diet) => (
              <div key={diet.value} className="flex items-center space-x-3">
                <Checkbox
                  id={diet.value}
                  checked={profile.dietary_restrictions?.includes(diet.value)}
                  onCheckedChange={(checked) => {
                    setProfile({
                      ...profile,
                      dietary_restrictions: checked
                        ? [...(profile.dietary_restrictions || []), diet.value]
                        : (profile.dietary_restrictions || []).filter((d) => d !== diet.value),
                    })
                  }}
                />
                <label
                  htmlFor={diet.value}
                  className="text-sm font-medium cursor-pointer"
                >
                  {diet.emoji} {diet.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Temporal Preferences */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Time Preferences
          </CardTitle>
          <CardDescription>When do you prefer to go on dates?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Day of Week Selector */}
          <div>
            <Label>Preferred Days</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <Badge
                  key={day}
                  asChild
                  variant={profile.preferred_day_of_week?.includes(index) ? 'default' : 'outline'}
                  className={`cursor-pointer text-sm py-2 px-3 rounded-xl transition-all ${
                    profile.preferred_day_of_week?.includes(index)
                      ? 'gradient-primary text-white border-0'
                      : 'hover:bg-muted'
                  }`}
                >
                  <button
                    type="button"
                    aria-pressed={profile.preferred_day_of_week?.includes(index) ?? false}
                    onClick={() =>
                      setProfile({
                        ...profile,
                        preferred_day_of_week: toggleArrayValue(profile.preferred_day_of_week || [], index),
                      })
                    }
                  >
                    {day}
                  </button>
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Select the days when you&apos;re most available for dates
            </p>
          </div>

          {/* Time of Day Selector */}
          <div>
            <Label>Preferred Times</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { value: 'morning', label: 'Morning', emoji: '🌅' },
                { value: 'afternoon', label: 'Afternoon', emoji: '☀️' },
                { value: 'evening', label: 'Evening', emoji: '🌆' },
                { value: 'night', label: 'Night', emoji: '🌙' },
              ].map((time) => (
                <Badge
                  key={time.value}
                  asChild
                  variant={profile.preferred_time_of_day?.includes(time.value) ? 'default' : 'outline'}
                  className={`cursor-pointer text-sm py-2 px-3 rounded-xl transition-all ${
                    profile.preferred_time_of_day?.includes(time.value)
                      ? 'gradient-primary text-white border-0'
                      : 'hover:bg-muted'
                  }`}
                >
                  <button
                    type="button"
                    aria-pressed={profile.preferred_time_of_day?.includes(time.value) ?? false}
                    onClick={() =>
                      setProfile({
                        ...profile,
                        preferred_time_of_day: toggleArrayValue(profile.preferred_time_of_day || [], time.value),
                      })
                    }
                  >
                    {time.emoji} {time.label}
                  </button>
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Select the times when you prefer to have dates
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Favorite Categories */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Favorite Categories
          </CardTitle>
          <CardDescription>What types of dates do you love most?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Badge
                key={category.value}
                asChild
                variant={profile.favorite_categories?.includes(category.value) ? 'default' : 'outline'}
                className={`cursor-pointer text-sm py-2 px-3 rounded-xl transition-all ${
                  profile.favorite_categories?.includes(category.value)
                    ? 'gradient-primary text-white border-0'
                    : 'hover:bg-muted'
                }`}
              >
                <button
                  type="button"
                  aria-pressed={profile.favorite_categories?.includes(category.value) ?? false}
                  onClick={() =>
                    setProfile({
                      ...profile,
                      favorite_categories: toggleArrayValue(profile.favorite_categories || [], category.value),
                    })
                  }
                >
                  {category.emoji} {category.label}
                </button>
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Select your favorite types of dates for better suggestions
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pb-8">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gradient-primary text-white shadow-playful hover:shadow-playful-lg transition-shadow rounded-xl h-12 px-8"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
