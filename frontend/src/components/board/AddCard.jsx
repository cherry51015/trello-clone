import { useState } from 'react'
import { Plus, X } from 'lucide-react'

export default function AddCard({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  const submit = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setTitle('')
    setOpen(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') submit()
    if (e.key === 'Escape') setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 w-full px-2 py-1.5 text-sm text-[#b6c2cf] hover:bg-white/10 rounded transition-colors"
      >
        <Plus size={16} />
        Add a card
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        autoFocus
        rows={2}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Enter a title for this card…"
        className="w-full px-3 py-2 bg-[#22272b] text-[#b6c2cf] text-sm rounded border border-[#579dff] outline-none resize-none placeholder-[#596773]"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={submit}
          className="px-3 py-1.5 bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] text-sm font-medium rounded transition-colors"
        >
          Add card
        </button>
        <button onClick={() => setOpen(false)} className="text-[#b6c2cf] hover:text-white">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}