export type NotificationType =
  | 'couple_linked'
  | 'match_found'
  | 'date_scheduled'
  | 'mystery_created'
  | 'mystery_revealed'
  | 'date_reminder'
  | 'badge_earned'

export interface NotificationRow {
  id: string
  recipient_id: string
  type: NotificationType
  title: string
  body: string
  href: string | null
  metadata: Record<string, unknown> | null
  read: boolean
  created_at: string
}

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  message: string
  href: string | null
  read: boolean
  createdAtISO: string
}

export function mapRow(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.body,
    href: row.href,
    read: row.read,
    createdAtISO: row.created_at,
  }
}

/**
 * Metadata for each notification type. `icon` is a lucide-react v1 icon NAME
 * (a string, not the component) so this module stays server/client-safe — the
 * UI maps the name to the actual component. `chip` is a set of Tailwind classes
 * for the icon chip, built from the app's oklch design tokens.
 */
export const NOTIFICATION_TYPES: {
  key: NotificationType
  label: string
  description: string
  icon: string
  chip: string
}[] = [
  {
    key: 'match_found',
    label: 'Match found',
    description: 'When you and your partner match on a date idea',
    icon: 'Heart',
    chip: 'bg-primary/10 text-primary',
  },
  {
    key: 'date_scheduled',
    label: 'Date scheduled',
    description: 'When a date you both agreed on gets added to the calendar',
    icon: 'CalendarClock',
    chip: 'bg-secondary/10 text-secondary',
  },
  {
    key: 'date_reminder',
    label: 'Date reminders',
    description: 'A friendly nudge before an upcoming date so you never miss it',
    icon: 'CalendarClock',
    chip: 'bg-warning/10 text-warning',
  },
  {
    key: 'mystery_created',
    label: 'Mystery date created',
    description: 'When your partner plans a surprise mystery date for the two of you',
    icon: 'Gift',
    chip: 'bg-accent/15 text-accent-foreground',
  },
  {
    key: 'mystery_revealed',
    label: 'Mystery date revealed',
    description: 'When a mystery date is unwrapped and the details are revealed',
    icon: 'PartyPopper',
    chip: 'bg-accent/15 text-accent-foreground',
  },
  {
    key: 'badge_earned',
    label: 'Badge earned',
    description: 'When you unlock a new achievement badge together',
    icon: 'Award',
    chip: 'bg-success/10 text-success',
  },
  {
    key: 'couple_linked',
    label: 'Partner linked',
    description: 'When you and your partner successfully link your accounts',
    icon: 'Users',
    chip: 'bg-primary/10 text-primary',
  },
]

export const PUSH_PREF_KEY = 'push_enabled'

/**
 * Default notification preferences. Every notification type plus the push
 * toggle defaults to enabled — a missing key in the stored prefs is treated as
 * enabled, and this object provides the explicit baseline for the settings UI.
 */
export const DEFAULT_PREFS: Record<string, boolean> = {
  couple_linked: true,
  match_found: true,
  date_scheduled: true,
  mystery_created: true,
  mystery_revealed: true,
  date_reminder: true,
  badge_earned: true,
  [PUSH_PREF_KEY]: true,
}
