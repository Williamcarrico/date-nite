'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

export interface ExportHistoryRow {
  status: string
  created_at: string
  scheduled_at: string | null
  idea_templates: {
    title: string
    category: string
  } | null
  completed_dates: Array<{
    rating: number | null
    notes: string | null
    actual_cost: number | null
    would_repeat: boolean | null
    completed_at: string | null
  }>
}

const HEADERS = [
  'Title',
  'Category',
  'Status',
  'Scheduled',
  'Completed',
  'Rating',
  'Would Repeat',
  'Actual Cost',
  'Notes',
] as const

/** Wrap a value for CSV, quoting/escaping when it contains commas, quotes, or newlines. */
function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function buildCsv(rows: ExportHistoryRow[]): string {
  const lines = [HEADERS.map(csvCell).join(',')]

  for (const row of rows) {
    const completion = row.completed_dates?.[0]
    lines.push(
      [
        csvCell(row.idea_templates?.title),
        csvCell(row.idea_templates?.category),
        csvCell(row.status),
        csvCell(row.scheduled_at),
        csvCell(completion?.completed_at),
        csvCell(completion?.rating),
        csvCell(
          completion?.would_repeat === null || completion?.would_repeat === undefined
            ? ''
            : completion.would_repeat
              ? 'Yes'
              : 'No'
        ),
        csvCell(completion?.actual_cost),
        csvCell(completion?.notes),
      ].join(',')
    )
  }

  return lines.join('\n')
}

export function ExportCsvButton({ history }: { history: ExportHistoryRow[] }) {
  const hasData = history.length > 0

  function handleExport() {
    if (!hasData) return

    const csv = buildCsv(history)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'date-nite-history.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Your date history is downloading')
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={!hasData}
      title={hasData ? undefined : 'No dates yet'}
    >
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </Button>
  )
}
