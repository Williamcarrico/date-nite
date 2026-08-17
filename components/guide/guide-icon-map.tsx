import { createElement } from 'react'
import {
  BookOpen,
  CalendarCheck,
  Clock3,
  Compass,
  Handshake,
  Heart,
  ListChecks,
  MapPin,
  MessageCircle,
  Radar,
  ShieldCheck,
  Sparkles,
  Sunrise,
  type LucideIcon,
} from 'lucide-react'

/**
 * Maps the lucide icon NAME strings stored on each `GuidePart` to the actual
 * components, mirroring `components/notifications/icon-map.tsx`. Keeping the
 * data modules icon-free is what lets them stay pure data.
 */
export const GUIDE_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  CalendarCheck,
  Clock3,
  Compass,
  Handshake,
  Heart,
  ListChecks,
  MapPin,
  MessageCircle,
  Radar,
  ShieldCheck,
  Sparkles,
  Sunrise,
}

/**
 * Renders a part's icon by name, falling back to BookOpen.
 *
 * Uses `createElement` rather than assigning the looked-up component to a
 * capitalized local — that pattern trips `react-hooks/static-components`, which
 * can't tell a stable map lookup from a component defined during render.
 */
export function GuideIcon({ name, className }: { name: string; className?: string }) {
  return createElement(GUIDE_ICONS[name] ?? BookOpen, { className, 'aria-hidden': true })
}
