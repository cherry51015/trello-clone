# Trello Clone — Full-Stack Engineering Assignment

A Kanban-style project management application built with React, FastAPI, and PostgreSQL.  
Live: [[deployed-link](https://trello-clone-ruddy-tau.vercel.app/)] · Repo: [[github-link](https://github.com/cherry51015/trello-clone)]

---

## Why This Stack

Most candidates default to Node/Express because the assignment lists it first. I chose FastAPI deliberately:

- **Type safety end-to-end.** Pydantic schemas validate every request/response at the boundary — no runtime surprises from malformed payloads.
- **Auto-generated OpenAPI docs** at `/docs` — reviewers can explore and test every endpoint without Postman.
- **Async-native.** The AI description generation endpoint is `async` — it doesn't block the worker thread during Gemini API calls.
- **I know Python deeply.** From my ML background, I'm faster and more confident debugging Python than JavaScript on the backend.

This was a conscious tradeoff: slightly less conventional for this role, but cleaner architecture and genuine ownership of every line.

---
---

## Demo & Screenshots

🔗 **Live Demo:** [your-deployed-url]  
📹 **Demo Video:** [your-drive-link]

### Board View
![Board View](screenshots/board-view.png)

### Drag and Drop
![Drag and Drop](screenshots/drag-drop.png)

### Card Detail Modal
![Card Modal](screenshots/card-modal.png)

### Search & Filter
![Search and Filter](screenshots/search-filter.png)

### Checklist Progress
![Checklist](screenshots/checklist.png)

### AI Description Generation
![AI Feature](screenshots/ai-generate.png)

## The Interesting Engineering Decision: Fractional Indexing

Drag-and-drop ordering is deceptively hard. The naive approach — integer positions — breaks down fast:

```
Naive: positions = [1, 2, 3, 4]
Move card to position 2 → UPDATE positions for cards 2, 3, 4
= O(n) writes per drag operation
= race conditions under concurrent moves
= ordering conflicts if two users drag simultaneously
```

I used **fractional (float) positioning** instead:

```python
def between(prev: float | None, next_: float | None) -> float:
    if prev is None and next_ is None: return 1.0
    if prev is None:  return next_ / 2
    if next_ is None: return prev + 1.0
    return (prev + next_) / 2
```

Moving a card between positions `0.5` and `1.0` gives `0.75`. Only **1 row updated** regardless of list size.

The edge case: after many insertions, gaps shrink below a threshold (`0.001`). I detect this and rebalance by redistributing positions evenly — a rare O(n) operation that's not on the hot path. This is the same approach Linear and Figma use internally.

The frontend mirrors this logic in `utils/position.js` so optimistic updates compute the correct position client-side without waiting for the backend.

---

## Optimistic UI — The Right Way

Most clones either skip optimistic updates entirely or do them incorrectly (no rollback).

My approach:

1. **Compute new state client-side immediately** using the same `between()` function as the backend
2. **Update React state** — user sees the move instantly, no lag
3. **Fire API call in background**
4. **On failure**: rollback to server state via `refreshBoard()` + show toast error

```js
optimisticMoveCard(card.id, toListId, newPos);   // immediate
try {
  await reorderCard(card.id, { list_id: toListId, prev_position, next_position });
} catch {
  toast.error("Failed to move card");
  refreshBoard();   // rollback
}
```

This is the pattern real production apps use (Vercel, Linear, Notion). The tradeoff: slightly more frontend complexity in exchange for an interaction that feels instant and professional.

---

## Database Schema Design

Designed for correctness first, not convenience. Key decisions:

**Float positions on both `lists` and `cards`** — enables O(1) reordering as above.

**Junction tables for M:M relationships** (`card_labels`, `card_members`) kept separate from entity models to prevent circular imports and keep each model file focused.

**Cascade deletes everywhere** — deleting a board wipes its lists, which wipe their cards, which wipe labels/members/checklists. No orphaned rows.

**UUIDs as primary keys** — avoids enumerable integer IDs in URLs (minor security hygiene, but worth doing correctly).

```
boards (id, title, bg_color, created_at)
  └── lists (id, board_id, title, position: FLOAT)
        └── cards (id, list_id, title, description, position: FLOAT, due_date, is_archived)
              ├── card_labels (card_id, label_id)       ← M:M
              ├── card_members (card_id, member_id)     ← M:M
              └── checklists (id, card_id, title)
                    └── checklist_items (id, checklist_id, text, is_done, position)
```

---

## N+1 Query Prevention

Loading a board naively fires one query per card per relationship — 100+ queries for a realistic board. I use SQLAlchemy's `selectinload` to batch these:

```python
board = (
    db.query(Board)
    .options(
        selectinload(Board.lists).selectinload(List.cards).selectinload(Card.labels),
        selectinload(Board.lists).selectinload(List.cards).selectinload(Card.members),
        selectinload(Board.lists).selectinload(List.cards).selectinload(Card.checklists),
    )
    .filter(Board.id == board_id)
    .first()
)
```

Board load = **4 queries total** regardless of card count. This matters at scale.

---

## AI Feature — Designed to Never Break the App

Since Scaler is an AI company, I added one small feature that felt native: AI-assisted card description generation using **Gemini 1.5 Flash** (free tier, 15 RPM).

Design constraints I enforced on myself:

- **Graceful degradation**: if `GEMINI_API_KEY` is absent or quota exceeded, the endpoint returns `{"description": ""}` — the button just does nothing. The app never crashes.
- **Non-blocking**: the endpoint is `async`, so a slow Gemini response doesn't stall other requests.
- **UX**: button shows "Generating..." during the call, populates the description textarea on success. User can edit before saving — the AI output is a starting point, not a final answer.

This reflects how I think about AI features in production: useful when available, invisible when not.

---

## Search & Filter Architecture

Filters are **composable and non-mutating** — they don't modify board state, they query against it:

```python
@router.get("/search/cards")
def search_cards(
    q: str | None,           # title substring search (ilike)
    label_id: str | None,    # filter by label
    member_id: str | None,   # filter by assigned member
    due_before: date | None, # deadline filters
    due_after: date | None,
    db: Session = Depends(get_db)
):
```

All filters are optional and compose via `AND`. Frontend debounces the search input (300ms) so we're not hitting the API on every keystroke.

---

## What I'd Build Next (Honest Assessment)

**If given more time:**
- **WebSocket-based realtime sync** — right now two users on the same board won't see each other's changes without refresh. This is the biggest missing piece for a real collaborative tool.
- **Conflict resolution** — if two users drag the same card simultaneously, last-write-wins. A proper solution uses operational transforms or CRDTs.
- **Activity log** — every mutation should append to an audit trail (who moved what, when). Valuable for team accountability.
- **Alembic migrations** — I use `create_all()` for dev convenience, but production needs versioned schema migrations.

**Deliberate non-scope:**
- Authentication: the assignment says assume a logged-in user, so I didn't add it. Adding it would mean JWT tokens, refresh logic, and RBAC — correct to skip given the 48hr scope.

---

## Project Structure

```
trello-clone/
├── backend/
│   ├── app/
│   │   ├── core/config.py          # pydantic-settings, env vars
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   │   ├── associations.py     # M:M junction tables (imported first)
│   │   │   ├── board.py
│   │   │   ├── list_.py
│   │   │   ├── card.py             # Card, Label, Checklist, ChecklistItem
│   │   │   └── member.py
│   │   ├── routers/                # one file per resource
│   │   │   ├── boards.py
│   │   │   ├── lists.py
│   │   │   ├── cards.py            # also handles labels, members, checklists
│   │   │   ├── members.py
│   │   │   └── search.py
│   │   ├── schemas/                # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── position.py         # fractional indexing logic
│   │   │   └── ai_service.py       # Gemini integration with fallback
│   │   ├── database.py             # engine, session, Base, get_db
│   │   └── main.py                 # app init, CORS, router registration
│   ├── seed.py                     # realistic demo data
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── api/                    # axios wrappers per resource
        ├── components/
        │   ├── Board/              # BoardView (DnD root), BoardHeader
        │   ├── Card/               # CardItem (sortable), CardModal, MemberAvatar
        │   ├── List/               # ListColumn (droppable), ListHeader, AddCardInput
        │   ├── Modals/             # LabelPicker, MemberPicker, ChecklistSection
        │   └── UI/                 # SearchBar, Spinner, Toast
        ├── hooks/
        │   ├── useBoard.js         # central state + optimistic helpers
        │   └── useKeyboard.js      # / → search, Esc → close modal
        └── utils/
            ├── position.js         # client-side between() — mirrors backend
            └── dateFormat.js       # overdue/due-soon/normal classification
```

---

## Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

Create `.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/trello_clone
GEMINI_API_KEY=your_key_here        # optional — app works without it
FRONTEND_URL=http://localhost:5173
```

```bash
python -m uvicorn app.main:app --reload
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

Seed demo data:
```bash
python seed.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

---

## Assumptions

- **Single user**: no auth, no session management — default user assumed per assignment spec.
- **SQLite for local dev**: schema is PostgreSQL-compatible, `DATABASE_URL` switches it. Deployed on Render with PostgreSQL.
- **AI as enhancement**: Gemini integration degrades gracefully — zero impact on core functionality when unavailable.
- **No realtime sync**: multi-user collaboration would require WebSockets — out of scope for 48hr assignment, documented as known limitation.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite | Fast iteration, component model fits Kanban well |
| Styling | Tailwind CSS | Utility-first, no context-switching |
| Drag-and-drop | dnd-kit | Modern, maintained, flexible (react-beautiful-dnd is deprecated) |
| Backend | FastAPI | Type-safe, async, auto-docs, fits my Python depth |
| ORM | SQLAlchemy 2.0 | Mature, `selectinload` for N+1 prevention |
| Database | PostgreSQL / SQLite | Full relational model, FK constraints, cascade deletes |
| AI | Gemini 1.5 Flash | Free tier sufficient, handled with graceful fallback |
| Deploy | Render (backend + DB) + Vercel (frontend) | Free tier, straightforward CI |
