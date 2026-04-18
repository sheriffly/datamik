export const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/

export const normalizeUsername = (value: string) => value.trim().toLowerCase()

export const isValidUsername = (value: string) =>
  USERNAME_REGEX.test(normalizeUsername(value))

export const normalizeWebsiteUrl = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  return `https://${trimmed}`
}
