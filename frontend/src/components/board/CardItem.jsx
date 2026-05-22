import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, CheckSquare } from 'lucide-react'

function formatDate(dateStr) {
  if (!dateStr) return null

  const d = new Date(dateStr)

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default function CardItem({
  card,
  onClick,
  isDragging,
  dragOverlay = false,
}) {
  let attributes = {}
  let listeners = {}
  let setNodeRef = null
  let transform = null
  let transition = undefined

  if (!dragOverlay) {
    const sortable = useSortable({ id: card.id })
    attributes = sortable.attributes
    listeners = sortable.listeners
    setNodeRef = sortable.setNodeRef
    transform = sortable.transform
    transition = sortable.transition
  }

  const transformStyle = dragOverlay
    ? 'rotate(2deg) scale(1.03)'
    : CSS.Transform.toString(transform)

  const style = {
    transform: transformStyle,
    transition,
    opacity: isDragging ? 0.55 : 1,
    zIndex: isDragging ? 999 : 'auto',
  }


  const allItems =
    card.checklists?.flatMap(
      (cl) => cl.items
    ) || []

  const doneItems = allItems.filter(
    (i) => i.is_done
  ).length

  const totalItems = allItems.length

  const hasChecklist = totalItems > 0

  const isChecklistComplete =
    hasChecklist &&
    doneItems === totalItems

  const isOverdue =
    card.due_date &&
    new Date(card.due_date) <
      new Date() &&
    !card.is_archived

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        bg-[#22272b]
        hover:bg-[#2c333a]
        rounded-xl
        px-3
        py-3
        cursor-pointer
        ${isDragging ? 'shadow-2xl ring-2 ring-blue-400/40' : 'shadow-sm'}
        border border-transparent
        hover:border-[#579dff]/30
        transition-all
      `}
    >
      {/* labels */}
      {card.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {card.labels.map((label) => (
            <span
              key={label.id}
              style={{
                backgroundColor:
                  label.color,
              }}
              className="
                text-[10px]
                font-medium
                text-white
                px-2
                py-[3px]
                rounded-md
                leading-none
                shadow-sm
              "
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* title */}
      <p className="text-sm text-[#dfe4ea] leading-snug font-medium break-words">
        {card.title}
      </p>

      {/* metadata */}
      {(card.due_date ||
        hasChecklist ||
        card.members?.length > 0) && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {card.due_date && (
            <span
              className={`
                flex items-center gap-1
                text-xs
                px-1.5 py-0.5
                rounded-md
                ${
                  isOverdue
                    ? 'bg-red-900/50 text-red-300'
                    : 'bg-[#1d2125] text-[#8c9bab]'
                }
              `}
            >
              <Calendar size={11} />
              {formatDate(
                card.due_date
              )}
            </span>
          )}

          {hasChecklist && (
            <span
              className={`
                flex items-center gap-1
                text-xs
                px-1.5 py-0.5
                rounded-md
                ${
                  isChecklistComplete
                    ? 'bg-green-900/40 text-green-400'
                    : 'bg-[#1d2125] text-[#8c9bab]'
                }
              `}
            >
              <CheckSquare
                size={11}
              />
              {doneItems}/
              {totalItems}
            </span>
          )}

          {card.members?.length >
            0 && (
            <div className="flex -space-x-1 ml-auto">
              {card.members
                .slice(0, 3)
                .map((m) => (
                  <div
                    key={m.id}
                    style={{
                      backgroundColor:
                        m.avatar_color,
                    }}
                    className="
                      w-7 h-7
                      rounded-full
                      flex items-center justify-center
                      text-xs
                      font-semibold
                      text-white
                      border-2 border-[#22272b]
                    "
                    title={m.name}
                  >
                    {m.name[0]}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}