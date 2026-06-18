interface ICSEvent {
  title: string
  description: string
  startTime: Date
  durationMinutes: number
  location?: string
}

export function generateICS(event: ICSEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const endTime = new Date(event.startTime.getTime() + event.durationMinutes * 60000)
  const now = new Date()

  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
  }

  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@datenite.app`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Date Nite//Date Night Randomizer//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(event.startTime)}`,
    `DTEND:${formatDate(endTime)}`,
    `DTSTAMP:${formatDate(now)}`,
    `UID:${uid}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
  ]

  if (event.location) {
    lines.push(`LOCATION:${escapeText(event.location)}`)
  }

  lines.push('END:VEVENT', 'END:VCALENDAR')

  return lines.join('\r\n')
}

export function downloadICS(event: ICSEvent): void {
  const icsContent = generateICS(event)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `date-night-${Date.now()}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
