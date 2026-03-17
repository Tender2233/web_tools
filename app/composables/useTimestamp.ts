import { computed, onUnmounted, ref, watch } from 'vue'

export type TimestampUnit = 's' | 'ms'

export interface TimestampStats {
  utcOffset: string
  weekday: string
  iso8601: string
  relative: string
  utcDatetime: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Format a Date object to "yyyy-MM-dd HH:mm:ss" in the given IANA timezone.
 */
function formatInTimezone(date: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date)

  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00'
  const year = get('year')
  const month = get('month')
  const day = get('day')
  let hour = get('hour')
  const minute = get('minute')
  const second = get('second')

  // Intl may return '24' for midnight in some engines — normalise
  if (hour === '24') hour = '00'

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

/**
 * Parse "yyyy-MM-dd HH:mm:ss" (or "yyyy-MM-ddTHH:mm:ss") string as a wall-clock
 * time in the given IANA timezone and return a UTC Date.
 * Returns null if the string is malformed.
 */
function parseInTimezone(datetime: string, tz: string): Date | null {
  // Accept both space and T separator
  const normalised = datetime.trim().replace('T', ' ')
  const match = normalised.match(
    /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})$/
  )
  if (!match) return null

  const [, y, mo, d, h, mi, s] = match

  // Build an ISO string with the timezone offset by querying Intl for that tz
  // Strategy: ask Intl what UTC offset the timezone has at an approximate epoch,
  // then adjust. We use the "subtract offset" trick via a reference formatter.
  const isoLocal = `${y}-${mo}-${d}T${h}:${mi}:${s}`

  // Use Temporal-inspired approach: find offset via formatting a candidate Date
  // We iterate at most twice to handle DST gaps/folds.
  const candidate = new Date(`${isoLocal}Z`) // treat as UTC first
  const offsetMs = getTimezoneOffsetMs(candidate, tz)
  const adjusted = new Date(candidate.getTime() - offsetMs)

  // Verify the adjusted date still maps back to the same wall-clock time
  const check = formatInTimezone(adjusted, tz)
  if (check === `${y}-${mo}-${d} ${h}:${mi}:${s}`) return adjusted

  // DST edge: try with the adjusted offset
  const offsetMs2 = getTimezoneOffsetMs(adjusted, tz)
  const adjusted2 = new Date(candidate.getTime() - offsetMs2)
  return adjusted2
}

/**
 * Returns the UTC offset in milliseconds for a given Date in a timezone.
 * A positive result means the timezone is ahead of UTC.
 */
function getTimezoneOffsetMs(date: Date, tz: string): number {
  const utcStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'UTC',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(date)

  const tzStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(date)

  return new Date(tzStr.replace(' ', 'T') + 'Z').getTime() -
         new Date(utcStr.replace(' ', 'T') + 'Z').getTime()
}

/**
 * Human-readable UTC offset string e.g. "UTC+08:00"
 */
function getUtcOffsetString(date: Date, tz: string): string {
  const ms = getTimezoneOffsetMs(date, tz)
  const totalMin = Math.round(ms / 60000)
  const sign = totalMin >= 0 ? '+' : '-'
  const abs = Math.abs(totalMin)
  const hh = String(Math.floor(abs / 60)).padStart(2, '0')
  const mm = String(abs % 60).padStart(2, '0')
  return `UTC${sign}${hh}:${mm}`
}

/**
 * Returns a relative time string like "3 minutes ago" or "in 2 hours".
 */
function relativeTime(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const diffMs = date.getTime() - Date.now()
  const diffSec = Math.round(diffMs / 1000)
  const absSec = Math.abs(diffSec)

  if (absSec < 60) return rtf.format(diffSec, 'second')
  const diffMin = Math.round(diffSec / 60)
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute')
  const diffHour = Math.round(diffSec / 3600)
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour')
  const diffDay = Math.round(diffSec / 86400)
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, 'day')
  const diffMonth = Math.round(diffSec / (86400 * 30))
  if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, 'month')
  return rtf.format(Math.round(diffSec / (86400 * 365)), 'year')
}

// ─── Composable ─────────────────────────────────────────────────────────────

export const useTimestamp = () => {
  // All IANA timezone names
  const timezones: string[] = Intl.supportedValuesOf('timeZone')

  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // ── State ──────────────────────────────────────────────────────────────────
  const timestampInput = ref('')
  const datetimeInput  = ref('')
  const unit           = ref<TimestampUnit>('s')
  const selectedTimezone = ref(browserTimezone)
  const error          = ref('')
  const tzSearch       = ref('')
  const copiedField    = ref<'ts' | 'dt' | null>(null)

  // Which field was last edited — drives which direction to convert on tz change
  const lastEdited = ref<'timestamp' | 'datetime' | null>(null)

  // ── Computed ───────────────────────────────────────────────────────────────
  const filteredTimezones = computed(() => {
    const q = tzSearch.value.toLowerCase().trim()
    if (!q) return timezones
    return timezones.filter(tz => tz.toLowerCase().includes(q))
  })

  const resolvedDate = computed<Date | null>(() => {
    if (lastEdited.value === 'timestamp' && timestampInput.value.trim()) {
      const n = Number(timestampInput.value.trim())
      if (isNaN(n)) return null
      return new Date(unit.value === 's' ? n * 1000 : n)
    }
    if (lastEdited.value === 'datetime' && datetimeInput.value.trim()) {
      return parseInTimezone(datetimeInput.value, selectedTimezone.value)
    }
    return null
  })

  const stats = computed<TimestampStats | null>(() => {
    const d = resolvedDate.value
    if (!d || isNaN(d.getTime())) return null
    return {
      utcOffset:   getUtcOffsetString(d, selectedTimezone.value),
      weekday:     new Intl.DateTimeFormat('en-US', { timeZone: selectedTimezone.value, weekday: 'long' }).format(d),
      iso8601:     d.toISOString(),
      relative:    relativeTime(d),
      utcDatetime: formatInTimezone(d, 'UTC')
    }
  })

  const hasValidResult = computed(() => !!resolvedDate.value && !error.value)

  // ── Conversion logic ───────────────────────────────────────────────────────

  /** Recompute the "other" field whenever inputs or settings change */
  function syncFromTimestamp() {
    const raw = timestampInput.value.trim()
    if (!raw) { datetimeInput.value = ''; error.value = ''; return }
    const n = Number(raw)
    if (isNaN(n) || !isFinite(n)) { error.value = 'Invalid timestamp'; return }
    const d = new Date(unit.value === 's' ? n * 1000 : n)
    if (isNaN(d.getTime())) { error.value = 'Timestamp out of range'; return }
    error.value = ''
    datetimeInput.value = formatInTimezone(d, selectedTimezone.value)
  }

  function syncFromDatetime() {
    const raw = datetimeInput.value.trim()
    if (!raw) { timestampInput.value = ''; error.value = ''; return }
    const d = parseInTimezone(raw, selectedTimezone.value)
    if (!d) { error.value = 'Expected format: yyyy-MM-dd HH:mm:ss'; return }
    if (isNaN(d.getTime())) { error.value = 'Invalid date/time'; return }
    error.value = ''
    const ms = d.getTime()
    timestampInput.value = unit.value === 's'
      ? String(Math.floor(ms / 1000))
      : String(ms)
  }

  // ── Watchers ───────────────────────────────────────────────────────────────

  watch(timestampInput, () => {
    lastEdited.value = 'timestamp'
    syncFromTimestamp()
  })

  watch(datetimeInput, () => {
    lastEdited.value = 'datetime'
    syncFromDatetime()
  })

  watch(unit, () => {
    // Reformat the timestamp value when unit flips
    if (lastEdited.value === 'timestamp' && timestampInput.value.trim()) {
      const n = Number(timestampInput.value.trim())
      if (!isNaN(n)) {
        const ms = unit.value === 'ms' ? n * 1000 : Math.floor(n / 1000)
        timestampInput.value = String(ms)
      }
    } else if (lastEdited.value === 'datetime') {
      syncFromDatetime()
    }
  })

  watch(selectedTimezone, () => {
    if (lastEdited.value === 'timestamp') {
      syncFromTimestamp()
    } else if (lastEdited.value === 'datetime') {
      syncFromDatetime()
    }
  })

  // ── Live "now" ticker ──────────────────────────────────────────────────────
  // Aligned to the top of each wall-clock second so the display never lags.
  const nowTimestamp = ref(Math.floor(Date.now() / 1000))
  const nowDatetime  = computed(() => formatInTimezone(new Date(nowTimestamp.value * 1000), selectedTimezone.value))

  let tickInterval: ReturnType<typeof setInterval> | null = null
  const alignTicker = () => {
    nowTimestamp.value = Math.floor(Date.now() / 1000)
    tickInterval = setInterval(() => {
      nowTimestamp.value = Math.floor(Date.now() / 1000)
    }, 1000)
  }
  // Wait until the next exact second boundary, then start the 1s interval
  const msUntilNextSecond = 1000 - (Date.now() % 1000)
  const alignTimeout = setTimeout(alignTicker, msUntilNextSecond)

  onUnmounted(() => {
    clearTimeout(alignTimeout)
    if (tickInterval) clearInterval(tickInterval)
  })

  // ── Actions ────────────────────────────────────────────────────────────────

  const useNow = () => {
    lastEdited.value = 'timestamp'
    const ms = Date.now()
    timestampInput.value = unit.value === 's'
      ? String(Math.floor(ms / 1000))
      : String(ms)
  }

  const clearAll = () => {
    timestampInput.value = ''
    datetimeInput.value  = ''
    error.value          = ''
    lastEdited.value     = null
  }

  const copyText = async (text: string, field: 'ts' | 'dt') => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      copiedField.value = field
      setTimeout(() => { copiedField.value = null }, 1500)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const copyTimestamp = () => copyText(timestampInput.value, 'ts')
  const copyDatetime  = () => copyText(datetimeInput.value, 'dt')

  return {
    // State
    timestampInput,
    datetimeInput,
    unit,
    selectedTimezone,
    error,
    tzSearch,
    copiedField,
    lastEdited,
    // Computed
    filteredTimezones,
    timezones,
    stats,
    hasValidResult,
    nowTimestamp,
    nowDatetime,
    // Actions
    useNow,
    clearAll,
    copyTimestamp,
    copyDatetime
  }
}
