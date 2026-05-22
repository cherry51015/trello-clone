import { useState } from 'react'
import { Plus, X } from 'lucide-react'

export default function AddList({
  onAdd,
}) {
  const [adding, setAdding] =
    useState(false)

  const [title, setTitle] =
    useState('')

  const submit = () => {
    const trimmed =
      title.trim()

    if (!trimmed) return

    onAdd(trimmed)

    setTitle('')
    setAdding(false)
  }

  if (!adding) {
    return (
      <button
        onClick={() =>
          setAdding(true)
        }
        className="
          w-full
          rounded-xl
          bg-white/10
          hover:bg-white/15
          transition-colors
          px-4 py-3
          text-left
          text-[#dfe4ea]
          text-sm
          flex items-center gap-2
          backdrop-blur-sm
        "
      >
        <Plus size={16} />
        Add another list
      </button>
    )
  }

  return (
    <div
      className="
        rounded-xl
        bg-[#101204]
        p-3
        border border-white/5
        shadow-lg
      "
    >
      <textarea
        autoFocus
        rows={3}
        value={title}
        onChange={(e) =>
          setTitle(
            e.target.value
          )
        }
        placeholder="Enter list title..."
        className="
          w-full
          rounded-lg
          bg-[#22272b]
          text-sm
          text-white
          p-3
          resize-none
          outline-none
          border border-[#579dff]/30
        "
      />

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={submit}
          className="
            bg-[#579dff]
            hover:bg-[#6ba6ff]
            transition-colors
            text-white
            text-sm
            px-4 py-2
            rounded-lg
          "
        >
          Add list
        </button>

        <button
          onClick={() => {
            setAdding(false)
            setTitle('')
          }}
          className="
            text-slate-400
            hover:text-white
            transition-colors
          "
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}