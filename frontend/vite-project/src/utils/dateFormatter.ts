export function formatDateDisplay(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (targetDate.getTime() === today.getTime()) {
    return 'Today'
  }

  if (targetDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow'
  }

  const monthShort = date.toLocaleString('default', { month: 'short' })
  const day = date.getDate()

  if (date.getFullYear() === now.getFullYear()) {
    return `${day} ${monthShort}`
  }

  return `${day} ${monthShort} ${date.getFullYear()}`
}
