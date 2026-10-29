import "server-only";

// Limiteur simple en mémoire (par instance du serveur) contre les essais de mots de passe en rafale.
const hits = new Map<string, { count: number; until: number }>();

export function tooManyAttempts(key: string, max = 8, windowMs = 15 * 60_000) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.until < now) {
    hits.set(key, { count: 1, until: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

export function resetAttempts(key: string) {
  hits.delete(key);
}
