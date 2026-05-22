import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'

import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable'

import ListColumn from './ListColumn'
import AddList from './AddList'
import CardItem from './CardItem'
import { useState } from 'react'

export default function BoardView({
  board,
  actions,
  onCardClick,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })
  )

  const listIds = board.lists.map(
    (l) => l.id
  )

  const findListByCardId = (
    cardId
  ) => {
    return board.lists.find((l) =>
      l.cards.some(
        (c) => c.id === cardId
      )
    )
  }

  const [activeCardId, setActiveCardId] = useState(null)
  const [draggingCard, setDraggingCard] = useState(null)

  const handleDragStart = (event) => {
    const { active } = event
    const list = findListByCardId(active.id)

    if (list) {
      const card = list.cards.find((c) => c.id === active.id)
      setActiveCardId(active.id)
      setDraggingCard(card)
    } else {
      setActiveCardId(null)
      setDraggingCard(null)
    }
  }

  const handleDragEnd = async (
    event
  ) => {
    const { active, over } =
      event

    if (
      !over ||
      active.id === over.id
    )
      return

    const activeList =
      board.lists.find(
        (l) => l.id === active.id
      )

    const overList =
      board.lists.find(
        (l) => l.id === over.id
      )

    // list reorder
    if (
      activeList &&
      overList
    ) {
      const oldIndex =
        board.lists.findIndex(
          (l) =>
            l.id === active.id
        )

      const newIndex =
        board.lists.findIndex(
          (l) =>
            l.id === over.id
        )

      const reordered =
        arrayMove(
          board.lists,
          oldIndex,
          newIndex
        )

      const prev =
        reordered[newIndex - 1]
          ?.position ?? null

      const next =
        reordered[newIndex + 1]
          ?.position ?? null

      actions.reorderList(
        active.id,
        prev,
        next
      )

      return
    }

    // card reorder
    const fromList =
      findListByCardId(active.id)

    const toList =
      findListByCardId(over.id)

    if (
      !fromList ||
      !toList
    )
      return

    const targetCards =
      toList.cards.filter(
        (c) => c.id !== active.id
      )

    const overIndex =
      targetCards.findIndex(
        (c) => c.id === over.id
      )

    const prev =
      targetCards[overIndex - 1]
        ?.position ?? null

    const next =
      targetCards[overIndex]
        ?.position ?? null

    actions.reorderCard(
      active.id,
      fromList.id,
      toList.id,
      prev,
      next
    )
  }

  return (
    <div
      className="
        flex-1
        overflow-x-auto
        overflow-y-hidden
        px-4
        py-4
        scroll-smooth
      "
      style={{
        background: `radial-gradient(
          circle at top left,
          rgba(59, 159, 246, 0.18),
          transparent 25%
        ), radial-gradient(
          circle at bottom right,
          rgba(139,92,246,0.14),
          transparent 25%
        ), linear-gradient(135deg, #0b1220 0%, #111827 40%, #1e293b 100%)`,
      }}

    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={(event) => {
          handleDragEnd(event)
          setActiveCardId(null)
          setDraggingCard(null)
        }}
      >
        <SortableContext
          items={listIds}
          strategy={
            horizontalListSortingStrategy
          }
        >
          <div className="flex items-start gap-4 min-h-full">
            {board.lists.map(
              (list) => (
                <ListColumn
                  key={list.id}
                  list={list}
                  onAddCard={
                    actions.addCard
                  }
                  onDeleteList={
                    actions.deleteList
                  }
                  onUpdateList={
                    actions.updateList
                  }
                  onCardClick={
                    onCardClick
                  }
                  activeCardId={activeCardId}
                />
              )
            )}

            {/* add list */}
            <div className="w-[272px] flex-shrink-0">
              <AddList
                onAdd={
                  actions.addList
                }
              />
            </div>
          </div>
        </SortableContext>

        <DragOverlay>
          {draggingCard ? (
            <CardItem
              card={draggingCard}
              onClick={() => {}}
              isDragging={true}
              dragOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}