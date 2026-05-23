import { useEffect, useState } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { useBoard } from '../hooks/useBoard'
import { useModal } from '../hooks/useModal'
import { boardsApi, searchApi, membersApi } from '../api/client'
import { labelsApi } from '../api/client'
import BoardView from '../components/board/BoardView'
import CardModal from '../components/modals/CardModal'
import Loader from '../components/common/Loader'


export default function BoardPage() {
  const { board, loading, error, loadBoard, addList, updateList, deleteList, addCard, deleteCard, refreshCard, reorderList, reorderCard } = useBoard()
  const { activeCardId, openCard, closeCard } = useModal()
  const [allBoards, setAllBoards] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState({ label: null, member: null, due: null })
  const [allLabels, setAllLabels] = useState([])
  const [allMembers, setAllMembers] = useState([])

  useEffect(() => {
    boardsApi.getAll().then((r) => {
      setAllBoards(r.data)
      if (r.data.length > 0) loadBoard(r.data[0].id)
    })
    
    membersApi.getAll().then((r) => setAllMembers(r.data))
    labelsApi.getAll().then((r) => setAllLabels(r.data))
  }, [])

  const handleSearch = async (q) => {
    setSearchQuery(q)
    if (!q.trim()) { setSearchResults(null); return }
    setSearching(true)
    try {
      const res = await searchApi.search({ q: q.trim() })
      setSearchResults(res.data)
    } finally {
      setSearching(false)
    }
  }

  const actions = { addList, updateList, deleteList, addCard, deleteCard, reorderList, reorderCard }

  const filteredBoard = board ? {
    ...board,
    lists: board.lists.map((list) => ({
      ...list,
      cards: list.cards.filter((card) => {
        if (activeFilters.label && !card.labels.some((l) => l.id === activeFilters.label)) return false
        if (activeFilters.member && !card.members.some((m) => m.id === activeFilters.member)) return false
        if (activeFilters.due) {
          const today = new Date(); today.setHours(0, 0, 0, 0)
          const due = card.due_date ? new Date(card.due_date) : null
          if (!due) return false
          if (activeFilters.due === 'overdue' && due >= today) return false
          if (activeFilters.due === 'today') {
            const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
            if (due < today || due >= tomorrow) return false
          }
          if (activeFilters.due === 'week') {
            const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7)
            if (due < today || due >= nextWeek) return false
          }
        }
        return true
      })
    }))
  } : null

  if (loading) return (
  <div className="flex flex-col items-center justify-center h-screen bg-[#1d2125] gap-4">
    <div className="w-8 h-8 border-4 border-[#579dff] border-t-transparent rounded-full animate-spin" />
    <p className="text-[#8c9bab] text-sm">Loading board…</p>
    <p className="text-[#596773] text-xs">First load may take 30–60s on free tier</p>
  </div>
)
  if (error) return <div className="text-red-400 p-8">{error}</div>

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{
      background: board?.bg_color
        ? board.bg_color
        : `
          radial-gradient(circle at top left, rgba(168,85,247,0.20), transparent 25%),
          radial-gradient(circle at bottom right, rgba(236,72,153,0.16), transparent 30%),
          linear-gradient(135deg, #140f1f 0%, #1b1230 45%, #0f172a 100%)
        `
    }}>
      {/* Topbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-black/20 backdrop-blur-sm border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#579dff] rounded flex items-center justify-center text-[#1d2125] font-bold text-xs">T</div>
          <span className="text-white font-semibold text-sm hidden sm:block">
            {board?.title || 'Loading…'}
          </span>
        </div>

        {/* Board switcher if multiple boards */}
        {allBoards.length > 1 && (
          <select
            onChange={(e) => loadBoard(e.target.value)}
            className="bg-white/10 text-white text-xs px-2 py-1 rounded border border-white/20 outline-none"
          >
            {allBoards.map((b) => (
              <option key={b.id} value={b.id} style={{ backgroundColor: '#212a32' }}>{b.title}</option>
            ))}
          </select>
        )}

        {/* Search + Filter */}
        <div className="flex items-center gap-2 flex-1 max-w-2xl ml-auto">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8c9bab]" />
            <input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search cards…"
              className="w-full pl-8 pr-8 py-1.5 bg-white/10 hover:bg-white/20 focus:bg-white/20 text-white text-sm rounded border border-transparent focus:border-[#579dff] outline-none placeholder-[#8c9bab] transition-colors"
            />
            {searchQuery && (
              <button onClick={() => handleSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8c9bab] hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border transition-colors ${
              showFilters || activeFilters.label || activeFilters.member || activeFilters.due
                ? 'bg-[#579dff]/20 border-[#579dff] text-[#579dff]'
                : 'bg-white/10 border-white/20 text-[#b6c2cf] hover:bg-white/20'
            }`}
          >
            <Filter size={14} />
            Filter
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="flex items-center gap-4 px-4 py-2 bg-black/20 border-b border-white/10 text-sm flex-shrink-0 flex-wrap">
          <span className="text-[#8c9bab] text-xs font-semibold uppercase tracking-wider">Filter by</span>

          {/* Label filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {allLabels.map((label) => (
              <button
                key={label.id}
                onClick={() => setActiveFilters((p) => ({ ...p, label: p.label === label.id ? null : label.id }))}
                style={{ backgroundColor: label.color }}
                className={`px-2.5 py-0.5 rounded text-xs text-white font-medium transition-opacity ${
                  activeFilters.label && activeFilters.label !== label.id ? 'opacity-30' : 'opacity-100'
                }`}
              >
                {label.name}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-white/20" />

          {/* Member filter */}
          <div className="flex items-center gap-1.5">
            {allMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => setActiveFilters((p) => ({ ...p, member: p.member === member.id ? null : member.id }))}
                style={{ backgroundColor: member.avatar_color }}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold transition-opacity ${
                  activeFilters.member && activeFilters.member !== member.id ? 'opacity-30' : 'opacity-100'
                }`}
                title={member.name}
              >
                {member.name[0]}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-white/20" />

          {/* Due date filter */}
          <div className="flex items-center gap-1.5">
            {['overdue', 'today', 'week'].map((opt) => (
              <button
                key={opt}
                onClick={() => setActiveFilters((p) => ({ ...p, due: p.due === opt ? null : opt }))}
                className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors capitalize ${
                  activeFilters.due === opt
                    ? 'bg-[#579dff] text-[#1d2125]'
                    : 'bg-white/10 text-[#b6c2cf] hover:bg-white/20'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {(activeFilters.label || activeFilters.member || activeFilters.due) && (
            <button
              onClick={() => setActiveFilters({ label: null, member: null, due: null })}
              className="ml-auto text-xs text-[#8c9bab] hover:text-white flex items-center gap-1"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* Search results overlay */}
      {searchResults !== null && (
        <div className="absolute top-12 right-4 z-40 w-80 bg-[#282e33] border border-[#454f59] rounded-xl shadow-2xl max-h-80 overflow-y-auto">
          <div className="p-3 border-b border-[#454f59] flex items-center justify-between">
            <span className="text-xs text-[#8c9bab]">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
            <button onClick={() => { setSearchResults(null); setSearchQuery('') }} className="text-[#8c9bab] hover:text-white"><X size={14} /></button>
          </div>
          {searchResults.length === 0 ? (
            <p className="p-4 text-sm text-[#596773] text-center">No cards found</p>
          ) : (
            searchResults.map((card) => (
              <button
                key={card.id}
                onClick={() => { openCard(card.id); setSearchResults(null); setSearchQuery('') }}
                className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors border-b border-[#454f59]/50 last:border-0"
              >
                <p className="text-sm text-[#b6c2cf]">{card.title}</p>
                {card.due_date && <p className="text-xs text-[#8c9bab] mt-0.5">Due {card.due_date}</p>}
              </button>
            ))
          )}
        </div>
      )}

      {/* Board */}
      {filteredBoard && (
        <BoardView
          board={filteredBoard}
          actions={actions}
          onCardClick={openCard}
        />
      )}

            {/* Card modal */}
      {activeCardId && (
        <CardModal
          cardId={activeCardId}
          allLabels={allLabels}
          onClose={closeCard}
          onSaved={() => refreshCard(activeCardId)}
          onDeleted={async () => {
            const listId =
              board.lists.find((l) =>
                l.cards.some(
                  (c) => c.id === activeCardId
                )
              )?.id

            if (listId) {
              await deleteCard(
                listId,
                activeCardId
              )
            }

            closeCard()
          }}
        />
      )}
    </div>
  )
}
