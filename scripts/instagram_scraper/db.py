"""
db.py — Inserts parsed events into the EventTree PostgreSQL database.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime

import psycopg2
import psycopg2.extras

from parser import ParsedEvent

logger = logging.getLogger(__name__)


def get_connection(database_url: str):
    """Return a psycopg2 connection. Supports both postgres:// and postgresql:// schemes."""
    url = database_url.replace("postgres://", "postgresql://", 1)
    return psycopg2.connect(url)


def resolve_society_id(cur, society_identifier: str) -> str | None:
    """
    Look up a society by its UUID, slug, or name.
    Returns the UUID string or None if not found.
    """
    # Try UUID lookup first
    cur.execute("SELECT id FROM societies WHERE id = %s", (society_identifier,))
    row = cur.fetchone()
    if row:
        return row[0]

    # Try slug
    cur.execute("SELECT id FROM societies WHERE slug = %s", (society_identifier,))
    row = cur.fetchone()
    if row:
        return row[0]

    # Try name (case-insensitive)
    cur.execute("SELECT id FROM societies WHERE lower(name) = lower(%s)", (society_identifier,))
    row = cur.fetchone()
    if row:
        return row[0]

    return None


def resolve_user_id(cur, user_identifier: str) -> str | None:
    """Look up a user by UUID or email."""
    cur.execute("SELECT id FROM users WHERE id = %s", (user_identifier,))
    row = cur.fetchone()
    if row:
        return row[0]

    cur.execute("SELECT id FROM users WHERE email = %s", (user_identifier,))
    row = cur.fetchone()
    if row:
        return row[0]

    return None


def event_exists(cur, title: str, date: datetime, society_id: str) -> bool:
    """Check for a near-duplicate event (same title + same day + same society)."""
    cur.execute(
        """
        SELECT 1 FROM events
        WHERE society_id = %s
          AND lower(title) = lower(%s)
          AND date::date = %s::date
        LIMIT 1
        """,
        (society_id, title, date),
    )
    return cur.fetchone() is not None


def insert_event(
    cur,
    event: ParsedEvent,
    society_id: str,
    created_by_id: str,
    is_published: bool = False,
) -> str:
    """
    Insert a single event row and return the new UUID.
    Raises ValueError if a duplicate is detected.
    """
    if event_exists(cur, event.title, event.date, society_id):
        raise ValueError(f"Duplicate event: '{event.title}' on {event.date.date()}")

    event_id = str(uuid.uuid4())
    now = datetime.utcnow()

    cur.execute(
        """
        INSERT INTO events (
            id, title, description, location, date, end_date,
            category, image_url, society_id, created_by_id,
            is_published, view_count, created_at, updated_at
        ) VALUES (
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, 0, %s, %s
        )
        """,
        (
            event_id,
            event.title,
            event.description,
            event.location,
            event.date,
            event.end_date,
            event.category,
            event.image_url,
            society_id,
            created_by_id,
            is_published,
            now,
            now,
        ),
    )

    return event_id


def list_societies(database_url: str) -> list[dict]:
    """Helper to print available societies — used by the --list-societies flag."""
    conn = get_connection(database_url)
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT id, name, slug FROM societies ORDER BY name")
            return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def list_organizers(database_url: str) -> list[dict]:
    """Helper to print available organizer/admin users — used by the --list-users flag."""
    conn = get_connection(database_url)
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT id, name, email, role FROM users WHERE role IN ('organizer','admin') ORDER BY name"
            )
            return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()
