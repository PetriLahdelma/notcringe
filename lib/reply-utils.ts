export function normalizeForMatch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

export function findAnchorMatch(text: string, anchors: string[]) {
  const normalizedText = normalizeForMatch(text)
  for (const anchor of anchors) {
    const normalizedAnchor = normalizeForMatch(anchor)
    if (normalizedAnchor && normalizedText.includes(normalizedAnchor)) {
      return anchor
    }
  }
  return null
}

export function deriveLengthLabel(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  if (words <= 12) return "short"
  if (words <= 35) return "medium"
  return "long"
}
