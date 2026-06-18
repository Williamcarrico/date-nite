import {
  Award,
  Bell,
  CalendarClock,
  Gift,
  Heart,
  PartyPopper,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { NotificationType } from '@/lib/notifications/types'
import { NOTIFICATION_TYPES } from '@/lib/notifications/types'

/**
 * Maps the lucide icon NAME strings stored in NOTIFICATION_TYPES (`icon`) to the
 * actual lucide-react components. The names are sourced exactly from
 * `@/lib/notifications/types`: Heart, CalendarClock, Gift, PartyPopper, Award,
 * Users. `Bell` is the fallback for any unknown name.
 */
export const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  Heart,
  CalendarClock,
  Gift,
  PartyPopper,
  Award,
  Users,
  Bell,
}

const META_BY_TYPE = new Map(NOTIFICATION_TYPES.map((meta) => [meta.key, meta]))

/** Resolve the icon component + chip classes for a notification type. */
export function getNotificationVisual(type: NotificationType): {
  Icon: LucideIcon
  chip: string
} {
  const meta = META_BY_TYPE.get(type)
  const Icon = (meta && NOTIFICATION_ICONS[meta.icon]) ?? Bell
  return { Icon, chip: meta?.chip ?? 'bg-primary/10 text-primary' }
}
