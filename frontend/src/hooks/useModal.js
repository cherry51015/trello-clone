import { useState } from 'react'

export function useModal() {
  const [activeCardId, setActiveCardId] = useState(null)

  const openCard = (id) => setActiveCardId(id)
  const closeCard = () => setActiveCardId(null)

  return { activeCardId, openCard, closeCard }
}