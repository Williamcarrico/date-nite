'use client'

import { Button } from '@/components/ui/button'
import { downloadICS } from '@/lib/utils/ics'
import { CalendarPlus } from 'lucide-react'
import { toast } from 'sonner'

interface AddToCalendarButtonProps {
  title: string
  description: string
  /** ISO-8601 string for the date/time the event starts. */
  scheduledAt: string
  durationMinutes: number
  location?: string
  /** Visual variant passed through to the underlying Button. */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  label?: string
}

export function AddToCalendarButton({
  title,
  description,
  scheduledAt,
  durationMinutes,
  location,
  variant = 'outline',
  size = 'sm',
  className = 'rounded-xl',
  label = 'Add to Calendar',
}: Readonly<AddToCalendarButtonProps>) {
  function handleDownload() {
    const startTime = new Date(scheduledAt)
    if (Number.isNaN(startTime.getTime())) {
      toast.error('Could not read the scheduled date')
      return
    }

    downloadICS({
      title: `Date Night: ${title}`,
      description,
      startTime,
      durationMinutes,
      location,
    })

    toast.success('Calendar file downloaded!')
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleDownload}
      className={className}
      aria-label={label}
    >
      <CalendarPlus className="w-4 h-4 mr-2" />
      {label}
    </Button>
  )
}
