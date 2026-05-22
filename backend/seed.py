import os
import sys
from datetime import date

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base

import app.models

from app.models import (
    Board,
    Member,
    Card,
    Label
)

from app.models.list import List

from app.models.card import (
    Checklist,
    ChecklistItem
)


Base.metadata.create_all(bind=engine)

db = SessionLocal()


def reset_data():
    db.query(ChecklistItem).delete()
    db.query(Checklist).delete()
    db.query(Card).delete()
    db.query(Label).delete()
    db.query(Member).delete()
    db.query(List).delete()
    db.query(Board).delete()

    db.commit()


def seed_members():
    members = [
        Member(
            name="Charani",
            email="charani@team.com",
            avatar_color="#579dff"
        ),
        Member(
            name="Renu",
            email="renu@team.com",
            avatar_color="#f87168"
        ),
        Member(
            name="Anusri",
            email="anusri@team.com",
            avatar_color="#9f8fef"
        ),
        Member(
            name="Bajpai",
            email="bajpai@team.com",
            avatar_color="#fea362"
        ),
    ]

    db.add_all(members)
    db.commit()

    return members


def seed_labels():
    labels = [
        Label(name="Bug", color="#f87168"),
        Label(name="Feature", color="#579dff"),
        Label(name="Design", color="#9f8fef"),
        Label(name="Research", color="#fea362"),
        Label(name="Urgent", color="#f5cd47"),
        Label(name="Done", color="#4bce97"),
    ]

    db.add_all(labels)
    db.commit()

    return labels


def seed_board():
    board = Board(
        title="Trello Clone Development Board",
        bg_color="#0c1b33"
    )

    db.add(board)
    db.commit()
    db.refresh(board)

    return board


def seed_lists(board_id: str):
    lists = [
        List(
            board_id=board_id,
            title="Backlog",
            position=1.0
        ),
        List(
            board_id=board_id,
            title="In Progress",
            position=2.0
        ),
        List(
            board_id=board_id,
            title="In Review",
            position=3.0
        ),
        List(
            board_id=board_id,
            title="Done",
            position=4.0
        ),
    ]

    db.add_all(lists)
    db.commit()

    return lists


def seed_cards(lists, labels, members):
    backlog, in_progress, review, done = lists

    cards = [
        Card(
            list_id=backlog.id,
            title="Set up CI/CD pipeline",
            description="Configure automated deployment workflow for backend and frontend services.",
            position=1.0,
            due_date=date(2026, 6, 28)
        ),

        Card(
            list_id=backlog.id,
            title="Design system audit",
            description="Review spacing, typography, and reusable UI components across the board.",
            position=2.0
        ),

        Card(
            list_id=in_progress.id,
            title="Implement drag-and-drop",
            description="Build smooth list and card reordering using dnd-kit.",
            position=1.0,
            due_date=date(2026, 6, 24)
        ),

        Card(
            list_id=in_progress.id,
            title="Fix auth race condition",
            description="Resolve duplicate token refresh issue during reload.",
            position=2.0
        ),

        Card(
            list_id=review.id,
            title="Search endpoint testing",
            description="Test filtering by labels, due dates, and assigned members.",
            position=1.0
        ),

        Card(
            list_id=done.id,
            title="Initial project setup",
            description="Backend and frontend structure initialized successfully.",
            position=1.0
        ),

        Card(
            list_id=review.id,
            title="README documentation",
            description="Documentation for the project setup and usage.",
            position=2.0
        ),
        Card(
            list_id=done.id,
            title="Search endpoint testing",
            description="Define and test search functionality for cards based on title, labels, and members.",
            position=2.0
        ),
        
    ]

    db.add_all(cards)
    db.commit()
    # Re-query card instances from DB so relationship collections are properly instrumented
    db_cards = {c.title: c for c in db.query(Card).all()}

    # Insert association rows directly to avoid relationship instrumentation issues
    from app.models.associations import card_labels, card_members

    db.execute(
        card_labels.insert(),
        [
            {"card_id": db_cards["Set up CI/CD pipeline"].id, "label_id": labels[1].id},
            {"card_id": db_cards["Design system audit"].id, "label_id": labels[2].id},
            {"card_id": db_cards["Implement drag-and-drop"].id, "label_id": labels[1].id},
            {"card_id": db_cards["Implement drag-and-drop"].id, "label_id": labels[4].id},
            {"card_id": db_cards["Fix auth race condition"].id, "label_id": labels[0].id},
            {"card_id": db_cards["Initial project setup"].id, "label_id": labels[5].id},
        ],
    )

    db.execute(
        card_members.insert(),
        [
            {"card_id": db_cards["Set up CI/CD pipeline"].id, "member_id": members[0].id},
            {"card_id": db_cards["Implement drag-and-drop"].id, "member_id": members[0].id},
            {"card_id": db_cards["Implement drag-and-drop"].id, "member_id": members[1].id},
            {"card_id": db_cards["Fix auth race condition"].id, "member_id": members[1].id},
            {"card_id": db_cards["Search endpoint testing"].id, "member_id": members[2].id},
        ],
    )

    db.commit()

    checklist = Checklist(
        card_id=cards[2].id,
        title="Implementation steps"
    )

    db.add(checklist)
    db.commit()
    db.refresh(checklist)

    checklist_items = [
        ChecklistItem(
            checklist_id=checklist.id,
            text="Install dnd-kit packages",
            is_done=True,
            position=1.0
        ),
        ChecklistItem(
            checklist_id=checklist.id,
            text="Configure DndContext",
            is_done=True,
            position=2.0
        ),
        ChecklistItem(
            checklist_id=checklist.id,
            text="Handle cross-list movement",
            is_done=False,
            position=3.0
        ),
    ]

    db.add_all(checklist_items)
    db.commit()


reset_data()

members = seed_members()
labels = seed_labels()

board = seed_board()

lists = seed_lists(board.id)

seed_cards(
    lists,
    labels,
    members
)

print("Seed data inserted successfully.")

db.close()