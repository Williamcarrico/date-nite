'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toggleFavorite } from '@/lib/actions/suggestions'
import { HeartOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface UnfavoriteButtonProps {
  ideaTemplateId: string
  /** Idea title, used to make the toast message friendlier. */
  title?: string
}

export function UnfavoriteButton({ ideaTemplateId, title }: Readonly<UnfavoriteButtonProps>) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isRemoving, setIsRemoving] = useState(false)

  function handleRemove() {
    setIsRemoving(true)

    startTransition(async () => {
      const result = await toggleFavorite(ideaTemplateId)

      if (result.error) {
        setIsRemoving(false)
        toast.error(result.error)
        return
      }

      toast.success(title ? `Removed "${title}" from favorites` : 'Removed from favorites')
      router.refresh()
    })
  }

  const disabled = isPending || isRemoving

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleRemove}
      disabled={disabled}
      aria-label="Remove from favorites"
      className="text-muted-foreground hover:text-destructive rounded-xl"
    >
      {disabled ? (
        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
      ) : (
        <HeartOff className="w-4 h-4 mr-1" />
      )}
      Remove
    </Button>
  )
}
