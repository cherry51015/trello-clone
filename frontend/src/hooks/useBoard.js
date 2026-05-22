import { useState, useCallback } from 'react'
import { boardsApi, listsApi, cardsApi } from '../api/client'
import { between } from '../utils/positions'

export function useBoard() {
  const [board, setBoard] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadBoard = useCallback(async (id) => {
    setLoading(true)
    try {
      const res = await boardsApi.getOne(id)
      setBoard(res.data)
    } catch (e) {
      setError('Failed to load board')
    } finally {
      setLoading(false)
    }
  }, [])

  const addList = async (title) => {
    const res = await listsApi.create({ title, board_id: board.id })
    setBoard((prev) => ({
      ...prev,
      lists: [...prev.lists, { ...res.data, cards: [] }],
    }))
  }

  const updateList = async (listId, title) => {
    await listsApi.update(listId, { title })
    setBoard((prev) => ({
      ...prev,
      lists: prev.lists.map((l) =>
        l.id === listId ? { ...l, title } : l
      ),
    }))
  }

  const deleteList = async (listId) => {
    await listsApi.delete(listId)
    setBoard((prev) => ({
      ...prev,
      lists: prev.lists.filter((l) => l.id !== listId),
    }))
  }

  const addCard = async (listId, title) => {
    const list = board.lists.find((l) => l.id === listId)
    const lastCard = list.cards[list.cards.length - 1]
    const res = await cardsApi.create({
      title,
      list_id: listId,
      prev_position: lastCard?.position ?? null,
      next_position: null,
    })
    setBoard((prev) => ({
      ...prev,
      lists: prev.lists.map((l) =>
        l.id === listId
          ? { ...l, cards: [...l.cards, res.data] }
          : l
      ),
    }))
  }

  const deleteCard = async (
listId,
cardId
) => {
await cardsApi.delete(cardId)

const updated =
await boardsApi.getOne(
board.id
)

setBoard(updated.data)
}


  // called after card modal saves changes - refresh just that card in state
  const refreshCard = async (cardId) => {
    const res = await cardsApi.getOne(cardId)
    const updated = res.data
    setBoard((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => ({
        ...l,
        cards: l.cards.map((c) => (c.id === cardId ? updated : c)),
      })),
    }))
  }

  // optimistic list reorder - update state immediately, then sync with backend
  const reorderList = async (listId, prevPos, nextPos) => {
    const newPos = between(prevPos, nextPos)
    setBoard((prev) => {
      const updated = prev.lists
        .map((l) => (l.id === listId ? { ...l, position: newPos } : l))
        .sort((a, b) => a.position - b.position)
      return { ...prev, lists: updated }
    })
    await listsApi.reorder(listId, {
      prev_position: prevPos,
      next_position: nextPos,
    })
  }

  // optimistic card reorder across lists
  const reorderCard = async (cardId, fromListId, toListId, prevPos, nextPos) => {
    const newPos = between(prevPos, nextPos)
    setBoard((prev) => {
      let movedCard = null
      const lists = prev.lists.map((l) => {
        if (l.id === fromListId) {
          const cards = l.cards.filter((c) => {
            if (c.id === cardId) { movedCard = c; return false }
            return true
          })
          return { ...l, cards }
        }
        return l
      })
      return {
        ...prev,
        lists: lists.map((l) => {
          if (l.id === toListId && movedCard) {
            const updated = { ...movedCard, list_id: toListId, position: newPos }
            const cards = [...l.cards, updated].sort((a, b) => a.position - b.position)
            return { ...l, cards }
          }
          return l
        }),
      }
    })
    await cardsApi.reorder(cardId, {
      list_id: toListId,
      prev_position: prevPos,
      next_position: nextPos,
    })
  }

  return {
    board,
    loading,
    error,
    loadBoard,
    addList,
    updateList,
    deleteList,
    addCard,
    deleteCard,
    refreshCard,
    reorderList,
    reorderCard,
  }
}