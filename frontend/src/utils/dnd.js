// helpers to extract prev/next positions from an ordered array
// used by both list reorder and card reorder handlers

export function getNeighborPositions(items, activeId, overIndex) {
  const filtered = items.filter((item) => item.id !== activeId)
  const prev = filtered[overIndex - 1]?.position ?? null
  const next = filtered[overIndex]?.position ?? null
  return { prev, next }
}