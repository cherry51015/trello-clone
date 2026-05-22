import { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  Users,
  CheckSquare,
  Trash2,
  Wand2,
} from 'lucide-react'

import {
  cardsApi,
  checklistsApi,
  membersApi,
} from '../../api/client'

export default function CardModal({
  cardId,
  allLabels = [],
  onClose,
  onSaved,
  onDeleted,
}) {
  const [card, setCard] = useState(null)

  const [allMembers, setAllMembers] =
    useState([])

  const [titleDraft, setTitleDraft] =
    useState('')

  const [descDraft, setDescDraft] =
    useState('')

  const [newChecklistTitle, setNewChecklistTitle] =
    useState('')

  const [newItemTexts, setNewItemTexts] =
    useState({})

  const [generating, setGenerating] =
    useState(false)

  useEffect(() => {
    if (!cardId) return

    cardsApi.getOne(cardId).then((r) => {
      setCard(r.data)

      setTitleDraft(r.data.title)

      setDescDraft(
        r.data.description || ''
      )
    })

    membersApi
      .getAll()
      .then((r) => setAllMembers(r.data))
  }, [cardId])

  if (!card) return null

  const saveTitle = async () => {
    const trimmed =
      titleDraft.trim()

    if (
      !trimmed ||
      trimmed === card.title
    )
      return

    await cardsApi.update(card.id, {
      title: trimmed,
    })

    setCard((p) => ({
      ...p,
      title: trimmed,
    }))

    onSaved?.()
  }

  const saveDesc = async () => {
    await cardsApi.update(card.id, {
      description: descDraft,
    })

    setCard((p) => ({
      ...p,
      description: descDraft,
    }))

    onSaved?.()
  }

  const setDueDate = async (e) => {
    const value = e.target.value

    await cardsApi.update(card.id, {
      due_date: value,
    })

    setCard((p) => ({
      ...p,
      due_date: value,
    }))

    onSaved?.()
  }

  const toggleMember = async (
    member
  ) => {
    const exists = card.members.some(
      (m) => m.id === member.id
    )

    if (exists) {
      await cardsApi.removeMember(
        card.id,
        member.id
      )

      setCard((p) => ({
        ...p,
        members: p.members.filter(
          (m) => m.id !== member.id
        ),
      }))
    } else {
      await cardsApi.addMember(
        card.id,
        member.id
      )

      setCard((p) => ({
        ...p,
        members: [...p.members, member],
      }))
    }

    onSaved?.()
  }

  const addChecklist = async () => {
const trimmed = newChecklistTitle.trim()

if (!trimmed) return

const res = await checklistsApi.create(
card.id,
{
title: trimmed,
}
)

setCard(res.data)

setNewChecklistTitle('')

onSaved?.()
}

 const deleteChecklist = async (
checklistId
) => {
await checklistsApi.delete(
card.id,
checklistId
)

const updated =
await cardsApi.getOne(card.id)

setCard(updated.data)

onSaved?.()
}

  const addItem = async (
  checklistId
) => {
  const text =
    newItemTexts[
      checklistId
    ]?.trim()

  if (!text) return

  await checklistsApi.addItem(
    card.id,
    checklistId,
    {
      text,
    }
  )

  const updated =
    await cardsApi.getOne(card.id)

  setCard(updated.data)

  setNewItemTexts((prev) => ({
    ...prev,
    [checklistId]: '',
  }))

  onSaved?.()
}
  const toggleItem = async (
checklistId,
item
) => {
await checklistsApi.updateItem(
card.id,
checklistId,
item.id,
{
is_done: !item.is_done,
}
)

const updated =
await cardsApi.getOne(card.id)

setCard(updated.data)

onSaved?.()
}


  const generateDesc = async () => {
    if (descDraft.trim()) return

    setGenerating(true)

    try {
      const res =
        await cardsApi.generateDescription(
          card.id
        )

      const generated =
        res.data?.description?.trim()

      if (!generated) {
        setDescDraft(
          'AI could not generate a description right now.'
        )

        return
      }

      setDescDraft(generated)

      setCard((p) => ({
        ...p,
        description: generated,
      }))

      await cardsApi.update(card.id, {
        description: generated,
      })

      onSaved?.()
    } catch (err) {
      setDescDraft(
        'Failed to generate description.'
      )
    } finally {
      setGenerating(false)
    }
  }

  const deleteCard = async () => {
    if (onDeleted) {
      await onDeleted()
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 pt-10 px-4">
      <div className="w-full max-w-4xl rounded-2xl bg-[#282e33] shadow-2xl overflow-hidden">
        <div className="flex">
          {/* left */}
          <div className="flex-1 p-6">
            {/* title */}
            <div className="flex items-start justify-between mb-5">
              <input
                value={titleDraft}
                onChange={(e) =>
                  setTitleDraft(
                    e.target.value
                  )
                }
                onBlur={saveTitle}
                className="
                  bg-transparent
                  text-2xl
                  font-semibold
                  text-white
                  outline-none
                  w-full
                "
              />

              <button
                onClick={onClose}
                className="
                  text-slate-400
                  hover:text-white
                  transition-colors
                "
              >
                <X size={24} />
              </button>
            </div>

            {/* description */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3
                  className="
                    text-slate-300
                    font-semibold
                    uppercase
                    tracking-wide
                    text-sm
                  "
                >
                  Description
                </h3>

                <button
                  onClick={generateDesc}
                  disabled={
                    generating ||
                    descDraft.trim()
                  }
                  className={`
                    flex items-center gap-2 text-sm transition-colors
                    ${
                      descDraft.trim()
                        ? 'text-slate-500 cursor-not-allowed'
                        : 'text-blue-400 hover:text-blue-300'
                    }
                  `}
                >
                  <Wand2 size={15} />

                  {generating
                    ? 'Generating...'
                    : 'AI suggest'}
                </button>
              </div>

              <textarea
                name="description"
                value={descDraft}
                onChange={(e) =>
                  setDescDraft(
                    e.target.value
                  )
                }
                onBlur={saveDesc}
                rows={4}
                placeholder="Add a more detailed description..."
                className="
                  w-full
                  rounded-xl
                  bg-[#1f252b]
                  p-4
                  text-slate-200
                  outline-none
                  resize-none
                  border border-transparent
                  focus:border-[#579dff]/40
                "
              />
            </div>

            {/* checklist section */}
            {card.checklists.length >
              0 && (
              <div className="space-y-6">
                {card.checklists.map(
                  (cl) => {
                    const checklistDone =
                      cl.items.filter(
                        (i) =>
                          i.is_done
                      ).length

                    const checklistTotal =
                      cl.items.length

                    const checklistProgress =
                      checklistTotal >
                      0
                        ? Math.round(
                            (checklistDone /
                              checklistTotal) *
                              100
                          )
                        : 0

                    return (
                      <div
                        key={cl.id}
                        className="
                          rounded-xl
                          bg-[#1f252b]
                          p-4
                        "
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <CheckSquare
                              size={
                                18
                              }
                              className="text-slate-300"
                            />

                            <h3 className="text-lg font-semibold text-slate-200">
                              {
                                cl.title
                              }
                            </h3>
                          </div>

                          <button
                            onClick={() =>
                              deleteChecklist(
                                cl.id
                              )
                            }
                            className="
                              text-red-400
                              hover:text-red-300
                              text-sm
                              transition-colors
                            "
                          >
                            Delete
                          </button>
                        </div>

                        {/* progress */}
                        <div className="mb-4">
                          <div className="h-2 w-full rounded-full bg-[#11161b] overflow-hidden">
                            <div
                              style={{
                                width: `${checklistProgress}%`,
                              }}
                              className="h-full bg-green-400 transition-all"
                            />
                          </div>

                          <div className="mt-1 text-xs text-slate-400">
                            {checklistDone}/{checklistTotal} completed

                          </div>
                        </div>

                        {/* items */}
                        <div className="space-y-2">
                          {cl.items.map(
                            (
                              item
                            ) => (
                              <label
                                key={
                                  item.id
                                }
                                className="
                                  flex items-center gap-3
                                  rounded-lg
                                  bg-[#282e33]
                                  px-3 py-2
                                "
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    item.is_done
                                  }
                                  onChange={() =>
                                    toggleItem(
                                      cl.id,
                                      item
                                    )
                                  }
                                />

                                <span
                                  className={`text-sm ${
                                    item.is_done
                                      ? 'line-through opacity-50 text-slate-400'
                                      : 'text-slate-200'
                                  }`}
                                >
                                  {
                                    item.text
                                  }
                                </span>
                              </label>
                            )
                          )}
                        </div>

                        {/* add item */}
                        <div className="mt-3 flex gap-2">
                          <input
                            name="checklist-item"
                            value={
                              newItemTexts[
                                cl.id
                              ] || ''
                            }
                            onChange={(
                              e
                            ) =>
                              setNewItemTexts(
                                (
                                  p
                                ) => ({
                                  ...p,
                                  [cl.id]:
                                    e
                                      .target
                                      .value,
                                })
                              )
                            }
                            placeholder="Add an item..."
                            className="
                              flex-1
                              rounded-lg
                              bg-[#282e33]
                              px-4 py-2
                              text-sm
                              text-slate-200
                              outline-none
                            "
                          />

                          <button
                            onClick={() =>
                              addItem(
                                cl.id
                              )
                            }
                            className="
                              rounded-lg
                              bg-slate-600
                              px-4 py-2
                              text-sm
                              text-white
                              hover:bg-slate-500
                              transition-colors
                            "
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            )}

            {/* add checklist */}
            <div className="mt-6 rounded-xl bg-[#1f252b] p-4">
              <div className="flex gap-2">
                <input
                  name="new-checklist"
                  value={
                    newChecklistTitle
                  }
                  onChange={(e) =>
                    setNewChecklistTitle(
                      e.target.value
                    )
                  }
                  placeholder="New checklist title..."
                  className="
                    flex-1
                    rounded-lg
                    bg-[#282e33]
                    px-4 py-2
                    text-sm
                    text-slate-200
                    outline-none
                  "
                />

                <button
                  onClick={addChecklist}
                  className="
                    rounded-lg
                    bg-slate-600
                    px-4 py-2
                    text-sm
                    text-white
                    hover:bg-slate-500
                    transition-colors
                  "
                >
                  Add checklist
                </button>
              </div>
            </div>
          </div>

          {/* sidebar */}
          <div className="w-[300px] border-l border-slate-700 bg-[#22272b] p-5">
            <h3 className="mb-5 text-base font-semibold text-slate-300">
              Add to card
            </h3>

            {/* members */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                <Users size={15} />
                Members
              </div>

              <div className="space-y-2">
                {allMembers.map(
                  (member) => {
                    const active =
                      card.members.some(
                        (m) =>
                          m.id ===
                          member.id
                      )

                    return (
                      <button
                        key={
                          member.id
                        }
                        onClick={() =>
                          toggleMember(
                            member
                          )
                        }
                        className={`
                          flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition
                          ${
                            active
                              ? 'bg-blue-500/25 text-white'
                              : 'text-slate-300 hover:bg-white/5'
                          }
                        `}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
                          {
                            member
                              .name[0]
                          }
                        </div>

                        {
                          member.name
                        }
                      </button>
                    )
                  }
                )}
              </div>
            </div>
                        {/* labels */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                Labels
              </div>

              <div className="flex flex-wrap gap-2">
                {allLabels.map((label) => {
                  const active =
                    card.labels?.some(
                      (l) =>
                        l.id === label.id
                    )

                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={async () => {
                        if (active) {
                          await cardsApi.removeLabel(
                            card.id,
                            label.id
                          )
                        } else {
                          await cardsApi.addLabel(
                            card.id,
                            label.id
                          )
                        }

                        const updated =
                          await cardsApi.getOne(
                            card.id
                          )

                        setCard(updated.data)

                        onSaved?.()
                      }}
                      style={{
                        backgroundColor:
                          label.color,
                      }}
                      className={`
                        px-3 py-1.5 rounded-md
                        text-xs font-medium text-white
                        transition-all border
                        ${
                          active
                            ? 'border-white scale-105'
                            : 'border-transparent opacity-80 hover:opacity-100'
                        }
                      `}
                    >
                      {label.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* due date */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                <Calendar size={15} />
                Due date
              </div>

              <input
                type="date"
                name="due-date"
                value={
                  card.due_date
                    ? card.due_date.slice(
                        0,
                        10
                      )
                    : ''
                }
                onChange={setDueDate}
                className="
                  w-full
                  rounded-lg
                  border border-slate-700
                  bg-[#1f252b]
                  px-4 py-3
                  text-sm
                  text-slate-200
                  outline-none
                "
              />
            </div>

            {/* delete */}
            <button
              onClick={deleteCard}
              className="
                mt-6
                flex w-full items-center justify-center gap-2
                rounded-lg
                bg-red-500/20
                px-4 py-3
                text-sm
                text-red-400
                hover:bg-red-500/30
                transition-colors
              "
            >
              <Trash2 size={16} />
              Delete card
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}