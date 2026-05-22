# Trello Clone Development Board

A modern Trello-inspired task management application built with React, FastAPI, and PostgreSQL/SQLite, focused on smooth drag-and-drop workflows, clean UI interactions, and realistic collaborative project management flows.

This project was built as a full-stack engineering assignment with emphasis on:

* intuitive UX
* responsive interactions
* clean backend architecture
* optimistic UI updates
* scalable data modeling
* professional workflow organization

The goal was not just to recreate Trello visually, but to understand and implement the interaction patterns, state flows, and product decisions behind collaborative Kanban systems.

---

# Project Preview

Features demonstrated in the application:

* Drag-and-drop cards between lists
* Reorderable columns and cards
* Checklist progress tracking
* Due dates and overdue indicators
* Member assignment
* Colored labels/tags
* Multi-filter system
* AI-assisted description generation
* Realistic seeded demo workspace
* Smooth modal interactions
* Optimistic frontend updates

---

# Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* dnd-kit
* Axios
* Lucide Icons

## Backend

* FastAPI
* SQLAlchemy
* Pydantic
* Uvicorn

## Database

* SQLite (development)
* PostgreSQL-ready structure

## AI Integration

* Gemini API integration with graceful fallback handling

---

# Core Features

## Kanban Workflow Management

The board is organized into professional workflow stages:

* Backlog
* In Progress
* In Review
* Done

Cards can be dragged seamlessly across lists while preserving ordering and state consistency.

---

## Drag and Drop System

Implemented using `dnd-kit` with smooth transitions and optimistic UI updates.

Supports:

* list reordering
* card reordering
* moving cards across columns

The UI updates immediately before backend synchronization to create a fast, Trello-like experience.

---

## Labels System

Cards support colored labels such as:

* Feature
* Bug
* Design
* Research
* Urgent

Labels can be:

* added
* removed
* filtered globally

This helps simulate real sprint planning workflows.

---

## Member Assignment

Cards support assigning multiple team members.

The board includes:

* member avatars
* filtering by assigned member
* visual assignment indicators

---

## Checklist & Progress Tracking

Cards support:

* multiple checklists
* checklist items
* completion tracking
* automatic progress calculation

Progress indicators update dynamically on the board.

---

## Due Dates & Filters

Cards support due dates with smart filtering:

* Overdue
* Today
* This Week

Overdue cards are visually highlighted to improve usability and workflow visibility.

---

## AI Description Generation

Cards support AI-generated task descriptions using Gemini integration.

The feature was intentionally designed with:

* graceful fallback handling
* disabled states during generation
* non-blocking UX behavior

This avoids breaking the application when API quotas are exceeded.

---

# Product & UX Decisions

## Workflow States vs Filters

Workflow columns and filters were intentionally separated.

Example:

* “In Progress” is a workflow state
* “Overdue” is a temporary filter condition

This mirrors how real productivity systems like Trello, Jira, and Linear structure task management.

---

## Optimistic Updates

Most interactions update instantly on the frontend before backend confirmation.

This improves perceived responsiveness and creates a smoother user experience.

Tradeoff:

* slightly more frontend complexity
* significantly better interaction feel

---

## Fractional Positioning System

Cards and lists use position-based ordering instead of index-based ordering.

This avoids:

* expensive reindexing
* unstable drag behavior
* ordering conflicts

And allows scalable drag-and-drop operations.

---

## Pre-Seeded Demo Data

The application ships with realistic seeded demo data so reviewers can immediately explore:

* filters
* labels
* drag-and-drop
* checklist progress
* due-date workflows
* collaborative task management

without manually creating content.

This was intentionally designed to improve evaluation usability.

---

# Folder Structure

```bash
trello-clone/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── seed.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
```

---

# Setup Instructions

# 1. Clone Repository

```bash
git clone <repo-url>
cd trello-clone
```

---

# 2. Backend Setup

```bash
cd backend
python -m venv venv
```

Activate environment:

## Windows

```bash
venv\Scripts\activate
```

## Mac/Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `.env`

```env
GEMINI_API_KEY=your_api_key
```

Run backend:

```bash
python -m uvicorn app.main:app --reload
```

---

# 3. Seed Demo Data

```bash
python seed.py
```

This populates:

* boards
* lists
* cards
* members
* labels
* checklists
* due dates

---

# 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```txt
http://localhost:5173
```

Backend:

```txt
http://localhost:8000
```

---

# Assumptions Made

* Single-user environment for assignment scope
* No realtime websocket synchronization
* No authentication system
* AI generation treated as enhancement, not critical dependency
* Focus prioritized on interaction quality and state consistency

---

# Challenges Solved

## Drag-and-Drop Synchronization

Handling:

* optimistic UI updates
* cross-column moves
* ordering consistency
* backend synchronization

without visual flickering.

---

## Nested Checklist State

Managing:

* checklist creation
* checklist item updates
* live progress tracking
* frontend refresh consistency

while keeping modal interactions smooth.

---

## Filter Architecture

Implemented composable filters for:

* labels
* members
* due dates

without mutating underlying board state.

---

# Future Improvements

Potential extensions:

* realtime collaboration with WebSockets
* activity logs
* comments system
* attachments
* mobile optimization
* board background customization
* notifications
* authentication & permissions

---

# Final Notes

This project was built with focus on:

* clean interaction flows
* practical product decisions
* frontend/backend consistency
* maintainable architecture
* realistic collaborative workflows

Rather than building a minimal CRUD clone, the intention was to create a polished and believable task management experience that feels close to real-world productivity tooling.
