import { useState } from 'react'
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { CSS } from '@dnd-kit/utilities'

import {
  MoreHorizontal,
  X,
  Check,
} from 'lucide-react'

import CardItem from './CardItem'
import AddCard from './AddCard'

export default function ListColumn({
  list,
  onAddCard,
  onDeleteList,
  onUpdateList,
  onCardClick,
  activeCardId,
}) {
  const [editingTitle, setEditingTitle] =
    useState(false)

  const [titleValue, setTitleValue] =
    useState(list.title)

  const [showMenu, setShowMenu] =
    useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
  })

  const style = {
    transform:
      CSS.Transform.toString(
        transform
      ),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const saveTitle = () => {
    const trimmed =
      titleValue.trim()

    if (
      trimmed &&
      trimmed !== list.title
    ) {
      onUpdateList(
        list.id,
        trimmed
      )
    } else {
      setTitleValue(list.title)
    }

    setEditingTitle(false)
  }

  const cardIds = list.cards.map(
    (c) => c.id
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="
        flex-shrink-0
        w-[272px]
        max-h-[calc(100vh-110px)]
        flex flex-col
        bg-[#101204]
        rounded-xl
        border border-white/5
        shadow-lg
      "
    >
      {/* header */}
      <div
        className="
          flex items-center justify-between
          px-3 pt-3 pb-2
          cursor-grab active:cursor-grabbing
        "
        {...attributes}
        {...listeners}
      >
        {editingTitle ? (
          <div className="flex items-center gap-1 flex-1">
            <input
              autoFocus
              value={titleValue}
              onChange={(e) =>
                setTitleValue(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter'
                )
                  saveTitle()

                if (
                  e.key === 'Escape'
                ) {
                  setTitleValue(
                    list.title
                  )

                  setEditingTitle(
                    false
                  )
                }
              }}
              className="
                flex-1
                bg-[#22272b]
                text-sm text-white
                px-2 py-1
                rounded
                border border-[#579dff]
                outline-none
              "
            />

            <button
              onClick={saveTitle}
              className="text-green-400 hover:text-green-300"
            >
              <Check size={14} />
            </button>

            <button
              onClick={() => {
                setTitleValue(
                  list.title
                )

                setEditingTitle(
                  false
                )
              }}
              className="text-[#8c9bab] hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <span
            onClick={() =>
              setEditingTitle(true)
            }
            className="
              text-sm
              font-semibold
              text-[#dfe4ea]
              flex-1
              cursor-pointer
              hover:text-white
              transition-colors
            "
          >
            {list.title}
          </span>
        )}

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()

              setShowMenu(
                !showMenu
              )
            }}
            className="
              p-1 rounded
              text-[#8c9bab]
              hover:bg-white/10
              hover:text-white
              transition-colors
            "
          >
            <MoreHorizontal
              size={16}
            />
          </button>

          {showMenu && (
            <div
              className="
                absolute right-0 top-8 z-50
                bg-[#282e33]
                border border-[#454f59]
                rounded-lg
                shadow-xl
                py-1
                w-44
              "
            >
              <button
                onClick={() => {
                  setShowMenu(
                    false
                  )

                  onDeleteList(
                    list.id
                  )
                }}
                className="
                  w-full text-left
                  px-4 py-2
                  text-sm
                  text-red-400
                  hover:bg-white/5
                  transition-colors
                "
              >
                Delete this list
              </button>
            </div>
          )}
        </div>
      </div>

      {/* cards */}
      <div
        className="
          px-2
          pb-2
          flex flex-col gap-2
          overflow-y-auto
        "
      >
        <SortableContext
          items={cardIds}
          strategy={
            verticalListSortingStrategy
          }
        >
          {list.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onClick={() =>
                onCardClick(card.id)
              }
              isDragging={
                activeCardId ===
                card.id
              }
            />
          ))}
        </SortableContext>

        {/* add card directly attached */}
        <div className="pt-1">
          <AddCard
            onAdd={(title) =>
              onAddCard(
                list.id,
                title
              )
            }
          />
        </div>
      </div>
    </div>
  )
}