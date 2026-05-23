from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database import Base, engine

import app.models

from app.routers import (
    boards,
    lists,
    cards,
    members,
    search,
    labels
)


app = FastAPI(
    title="Trello Clone API",
    version="1.0.0"
)


app.add_middleware(
    app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)


app.include_router(boards.router)
app.include_router(lists.router)
app.include_router(cards.router)
app.include_router(members.router)
app.include_router(labels.router)
app.include_router(search.router)


@app.get("/health")
def health():
    return {
        "status": "ok"
    }

@app.get("/")
def root():
    return {
        "message": "Trello Clone API"
    }