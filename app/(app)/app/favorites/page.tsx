import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Clock, DollarSign, Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { CATEGORIES, COST_LEVELS } from '@/lib/constants/options'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Favorites' }

interface FavoriteWithTemplate {
  id: string
  profile_id: string
  idea_template_id: string
  created_at: string
  idea_templates: {
    id: string
    title: string
    description: string
    category: string
    cost_level: number
    duration_minutes: number
    vibe_tags: string[]
  }
}

async function getFavorites(userId: string): Promise<FavoriteWithTemplate[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      idea_templates (*)
    `)
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching favorites:', error)
    return []
  }

  return (data as unknown as FavoriteWithTemplate[]) || []
}

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const favorites = await getFavorites(user.id)

  const getCategoryEmoji = (category: string) => {
    return CATEGORIES.find((c) => c.value === category)?.emoji || '🎯'
  }

  const getCostLabel = (level: number) => {
    return COST_LEVELS.find((c) => c.value === level)?.label || '$'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Favorites</h1>
        <p className="text-muted-foreground mt-1">
          Your saved date ideas for later
        </p>
      </div>

      {favorites.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">
              When you find date ideas you love, save them here for easy access
            </p>
            <Link href="/app/randomize">
              <Button className="gradient-primary text-white rounded-xl">
                Discover Date Ideas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((favorite) => {
            const template = favorite.idea_templates as {
              id: string
              title: string
              description: string
              category: string
              cost_level: number
              duration_minutes: number
              vibe_tags: string[]
            }

            return (
              <Card key={favorite.id} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="gradient-primary p-3 text-white flex items-center gap-2">
                  <span className="text-xl">{getCategoryEmoji(template.category)}</span>
                  <span className="text-sm font-medium capitalize">{template.category}</span>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-2">{template.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {getCostLabel(template.cost_level)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {Math.round(template.duration_minutes / 60)}h
                    </span>
                  </div>

                  {template.vibe_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.vibe_tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs rounded-full capitalize">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-1 text-primary">
                      <Heart className="w-4 h-4 fill-current" />
                      <span className="text-xs">Favorited</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
