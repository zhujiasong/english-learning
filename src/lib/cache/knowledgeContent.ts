'use client'

const CACHE_PREFIX = 'english-learning:knowledge-content:'

interface CachedKnowledgeContent {
  content: string
  cachedAt: number
}

function getCacheKey(id: string, version: string) {
  return CACHE_PREFIX + id + ':' + encodeURIComponent(version)
}

export function getCachedKnowledgeContent(
  id: string,
  version: string
): string | null {
  try {
    const raw = localStorage.getItem(getCacheKey(id, version))
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<CachedKnowledgeContent>
    return typeof parsed.content === 'string' && parsed.content.trim()
      ? parsed.content
      : null
  } catch {
    return null
  }
}

export function setCachedKnowledgeContent(
  id: string,
  version: string,
  content: string
) {
  try {
    const payload: CachedKnowledgeContent = {
      content,
      cachedAt: Date.now(),
    }
    localStorage.setItem(getCacheKey(id, version), JSON.stringify(payload))
  } catch {
    // localStorage may be unavailable or full; keep the in-memory UI state usable.
  }
}

export function clearCachedKnowledgeContent(id: string, version: string) {
  try {
    localStorage.removeItem(getCacheKey(id, version))
  } catch {
    // ignore
  }
}

export function hasCachedKnowledgeContent(id: string, version: string) {
  return getCachedKnowledgeContent(id, version) !== null
}
