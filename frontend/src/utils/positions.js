// same fractional indexing logic mirrored from backend
// keeps frontend optimistic updates consistent with backend positions

export function between(prev, next) {
  if (prev == null && next == null) return 1.0
  if (prev == null) return next / 2
  if (next == null) return prev + 1.0
  return (prev + next) / 2
}