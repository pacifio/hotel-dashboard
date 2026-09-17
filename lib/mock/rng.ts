/**
 * Deterministic pseudo-randomness. Every dataset is generated from the tenant
 * slug, so a property always looks the same across reloads and between server
 * and client render — no hydration drift, reproducible screenshots.
 */

export function hashSeed(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export type Rng = {
  next: () => number
  int: (min: number, max: number) => number
  float: (min: number, max: number) => number
  bool: (probability?: number) => boolean
  pick: <T>(items: readonly T[]) => T
  pickMany: <T>(items: readonly T[], count: number) => T[]
  weighted: <T>(entries: readonly [T, number][]) => T
  shuffle: <T>(items: readonly T[]) => T[]
  /** Gaussian-ish value clamped to [min, max] — nicer than uniform for metrics */
  around: (center: number, spread: number, min?: number, max?: number) => number
}

export function createRng(seed: string | number): Rng {
  let state = (typeof seed === "string" ? hashSeed(seed) : seed) || 1

  const next = () => {
    // mulberry32
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const int = (min: number, max: number) =>
    Math.floor(next() * (max - min + 1)) + min

  const float = (min: number, max: number) => next() * (max - min) + min

  const pick = <T>(items: readonly T[]) =>
    items[Math.floor(next() * items.length)]

  const shuffle = <T>(items: readonly T[]) => {
    const out = [...items]
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }

  return {
    next,
    int,
    float,
    pick,
    shuffle,
    bool: (probability = 0.5) => next() < probability,
    pickMany: (items, count) => shuffle(items).slice(0, count),
    weighted: (entries) => {
      const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
      let roll = next() * total
      for (const [value, weight] of entries) {
        roll -= weight
        if (roll <= 0) return value
      }
      return entries[entries.length - 1][0]
    },
    around: (center, spread, min = -Infinity, max = Infinity) => {
      const gaussian = (next() + next() + next() + next() - 2) / 2
      return Math.min(max, Math.max(min, center + gaussian * spread))
    },
  }
}
