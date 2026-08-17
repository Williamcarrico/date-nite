'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import type { GuideChecklistGroup } from '@/lib/constants/guide/types'
import { GUIDE_CHECKLIST_STORAGE_KEY } from '@/lib/constants/guide/storage'
import { RichText } from './rich-text'

/* -------------------------------------------------------------------------- */
/* localStorage-backed store                                                   */
/*                                                                            */
/* Modelled as an external store rather than effect-driven state. That's what  */
/* localStorage actually is, it keeps the server and hydration snapshots       */
/* explicitly separate (so there's no hydration mismatch), and it syncs across */
/* tabs for free.                                                             */
/* -------------------------------------------------------------------------- */

const EMPTY: ReadonlySet<string> = new Set<string>()

const listeners = new Set<() => void>()

/** Cached so `getSnapshot` is referentially stable between actual changes. */
let snapshot: ReadonlySet<string> | null = null

function readFromStorage(): ReadonlySet<string> {
  try {
    const raw = window.localStorage.getItem(GUIDE_CHECKLIST_STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return EMPTY
    return new Set(parsed.filter((id): id is string => typeof id === 'string'))
  } catch {
    // Private mode, storage disabled, or corrupt JSON.
    return EMPTY
  }
}

function writeToStorage(value: ReadonlySet<string>) {
  try {
    window.localStorage.setItem(GUIDE_CHECKLIST_STORAGE_KEY, JSON.stringify([...value]))
  } catch {
    // Nothing useful to do if the write fails.
  }
}

function getSnapshot(): ReadonlySet<string> {
  snapshot ??= readFromStorage()
  return snapshot
}

/** The server (and the hydration pass) always renders an unchecked list. */
function getServerSnapshot(): ReadonlySet<string> {
  return EMPTY
}

function emit() {
  for (const listener of listeners) listener()
}

function onStorageEvent(event: StorageEvent) {
  if (event.key !== null && event.key !== GUIDE_CHECKLIST_STORAGE_KEY) return
  snapshot = readFromStorage()
  emit()
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener('storage', onStorageEvent)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorageEvent)
  }
}

function setChecked(next: ReadonlySet<string>) {
  snapshot = next
  writeToStorage(next)
  emit()
}

/* -------------------------------------------------------------------------- */

export function GuideChecklist({ groups }: { groups: readonly GuideChecklistGroup[] }) {
  const checked = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = useCallback((id: string) => {
    const next = new Set(getSnapshot())
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setChecked(next)
  }, [])

  const total = useMemo(
    () => groups.reduce((sum, group) => sum + group.items.length, 0),
    [groups]
  )
  const done = useMemo(
    () =>
      groups.reduce(
        (sum, group) => sum + group.items.filter((item) => checked.has(item.id)).length,
        0
      ),
    [groups, checked]
  )

  return (
    <div className="my-6">
      <div className="mb-4 flex items-center gap-4">
        <Progress value={total === 0 ? 0 : (done / total) * 100} className="h-2 flex-1" />
        <p className="w-20 shrink-0 text-sm tabular-nums text-muted-foreground" aria-live="polite">
          {done} of {total}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl"
          onClick={() => setChecked(EMPTY)}
          disabled={done === 0}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <div key={group.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h4 className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary">
              {group.title}
            </h4>
            <ul className="space-y-2.5">
              {group.items.map((item) => {
                const inputId = `guide-check-${item.id}`
                const isChecked = checked.has(item.id)
                return (
                  <li key={item.id} className="flex items-start gap-3">
                    <Checkbox
                      id={inputId}
                      checked={isChecked}
                      onCheckedChange={() => toggle(item.id)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={inputId}
                      className={`cursor-pointer text-sm leading-relaxed transition-colors ${
                        isChecked ? 'text-muted-foreground line-through' : 'text-foreground'
                      }`}
                    >
                      <RichText text={item.text} />
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
