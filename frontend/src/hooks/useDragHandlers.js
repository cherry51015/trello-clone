import { useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { getNeighborPositions } from '../utils/dnd'

export function useDragHandlers(board, reorderList, reorderCard) {
  const [activeItem, setActiveItem] = useState(null) // { type, data }

  const findListByCardId = (cardId) =>
    board?.lists.find((l) => l.cards.some((c) => c.id === cardId))

  const onDragStart = ({ active }) => {
    const list = board.lists.find((l) => l.id === active.id)
    if (list) {
      setActiveItem({ type: 'list', data: list })
      return
    }
    const cardList = findListByCardId(active.id)
    if (cardList) {
      const card = cardList.cards.find((c) => c.id === active.id)
      setActiveItem({ type: 'card', data: card })
    }
  }

  const onDragEnd = ({ active, over }) => {
    setActiveItem(null)
    if (!over || active.id === over.id) return

    const isListDrag = board.lists.some((l) => l.id === active.id)

    if (isListDrag) {
      const listIds = board.lists.map((l) => l.id)
      const oldIndex = listIds.indexOf(active.id)
      const newIndex = listIds.indexOf(over.id)
      if (oldIndex === newIndex) return

      const reordered = arrayMove(board.lists, oldIndex, newIndex)
      const { prev, next } = getNeighborPositions(reordered, active.id, newIndex)
      reorderList(active.id, prev, next)
      return
    }

    // card drag
    const fromList = findListByCardId(active.id)
    if (!fromList) return

    // dropped on a list container or a card
    const toList =
      board.lists.find((l) => l.id === over.id) ||
      findListByCardId(over.id)

    if (!toList) return

    const toCards = toList.cards.filter((c) => c.id !== active.id)
    const overIndex = toList.id === fromList.id
      ? toCards.findIndex((c) => c.id === over.id)
      : toList.cards.findIndex((c) => c.id === over.id)

    const insertIndex = overIndex === -1 ? toCards.length : overIndex
    const { prev, next } = getNeighborPositions(toCards, active.id, insertIndex)

    reorderCard(active.id, fromList.id, toList.id, prev, next)
  }

  return { activeItem, onDragStart, onDragEnd }
}