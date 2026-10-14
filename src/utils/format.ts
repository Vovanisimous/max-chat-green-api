const timeFormat = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
})

const dayFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
})

const dayKey = (ts: number) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export const formatTime = (ts: number) => timeFormat.format(ts)

export function formatDayLabel(ts: number, now = Date.now()): string {
  if (dayKey(ts) === dayKey(now)) return 'Сегодня'
  if (dayKey(ts) === dayKey(now - 24 * 60 * 60 * 1000)) return 'Вчера'
  return dayFormat.format(ts)
}

export const isSameDay = (a: number, b: number) => dayKey(a) === dayKey(b)

/** Для списка чатов: время за сегодня, иначе — дата */
export function formatListTime(ts: number, now = Date.now()): string {
  return isSameDay(ts, now)
    ? formatTime(ts)
    : new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
      }).format(ts)
}

const AVATAR_COLORS = [
  ['#4f9dff', '#3a6df0'],
  ['#9b6bff', '#6a3df0'],
  ['#ff8a5c', '#f0553a'],
  ['#3ccf91', '#1fa56f'],
  ['#ffb347', '#f08a1f'],
  ['#ff6b9a', '#e03a76'],
] as const

export function avatarGradient(seed: string): string {
  let hash = 0
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  const [from, to] = AVATAR_COLORS[hash % AVATAR_COLORS.length]
  return `linear-gradient(135deg, ${from}, ${to})`
}

export function initials(title: string): string {
  const letters = title
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, '')[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
  return (letters || '#').toUpperCase()
}
