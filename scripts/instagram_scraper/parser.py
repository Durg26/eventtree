"""
parser.py — Uses the Claude API to extract structured event data from Instagram posts.

Uses vision when an image URL is available so that details on flyers/posters
(which rarely appear in the caption) are captured too.
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Literal

import anthropic
import httpx

logger = logging.getLogger(__name__)

VALID_CATEGORIES = {"social", "academic", "cultural", "sports", "workshop", "other"}

SYSTEM_PROMPT = """You are an assistant that extracts structured event information from
university society Instagram posts. You will receive a post caption and possibly an image.

Your job:
1. Determine whether the post announces a specific upcoming event.
2. If it does, extract the event details as JSON.
3. If it does NOT (e.g. it's a general update, a congratulations post, a meme, or a
   recruitment post with no specific event date), return {"is_event": false}.

Rules:
- Only extract events that have a clear date (even if approximate).
- "location" must be a physical place or "Online" — never leave it blank; use "TBD" if unknown.
- "description" should be a clean 1–3 sentence summary suitable for a website listing.
- "category" must be one of: social, academic, cultural, sports, workshop, other.
- All dates must be ISO 8601 format (YYYY-MM-DDTHH:MM:SS). If no year is given, assume
  the current or next calendar year. If no time is given, use 18:00:00 as a reasonable default.
- Return ONLY raw JSON with no markdown fences or explanation."""

EVENT_SCHEMA = """{
  "is_event": true,
  "title": "string",
  "description": "string (1-3 sentences)",
  "location": "string",
  "date": "ISO 8601 datetime",
  "end_date": "ISO 8601 datetime or null",
  "category": "social | academic | cultural | sports | workshop | other",
  "image_url": "string or null"
}"""


@dataclass
class ParsedEvent:
    title: str
    description: str
    location: str
    date: datetime
    end_date: datetime | None
    category: Literal["social", "academic", "cultural", "sports", "workshop", "other"]
    image_url: str | None
    source_url: str


def _fetch_image_as_base64(url: str) -> tuple[str, str] | None:
    """Download image and return (base64_data, media_type) or None on failure."""
    import base64

    try:
        resp = httpx.get(url, timeout=10, follow_redirects=True)
        resp.raise_for_status()
        content_type = resp.headers.get("content-type", "image/jpeg").split(";")[0].strip()
        b64 = base64.standard_b64encode(resp.content).decode("utf-8")
        return b64, content_type
    except Exception as exc:
        logger.warning("Could not fetch image %s: %s", url, exc)
        return None


def _build_message_content(caption: str, post_date: datetime, image_url: str | None) -> list:
    """Build the message content list for Claude, optionally including the post image."""
    date_str = post_date.strftime("%B %d, %Y")
    text_block = {
        "type": "text",
        "text": (
            f"Post date: {date_str}\n\n"
            f"Caption:\n{caption or '(no caption)'}\n\n"
            f"Extract event info using this schema:\n{EVENT_SCHEMA}"
        ),
    }

    if not image_url:
        return [text_block]

    image_data = _fetch_image_as_base64(image_url)
    if not image_data:
        return [text_block]

    b64, media_type = image_data
    return [
        {
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": media_type,
                "data": b64,
            },
        },
        text_block,
    ]


def parse_post(
    client: anthropic.Anthropic,
    caption: str,
    post_date: datetime,
    image_url: str | None,
    source_url: str,
) -> ParsedEvent | None:
    """
    Ask Claude to determine if the post is an event and extract structured data.

    Returns a ParsedEvent if the post is an event, otherwise None.
    """
    content = _build_message_content(caption, post_date, image_url)

    try:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=600,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": content}],
        )
    except anthropic.APIError as exc:
        logger.error("Claude API error for post %s: %s", source_url, exc)
        return None

    raw = response.content[0].text.strip()

    # Strip markdown fences if the model adds them despite instructions
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("Could not parse JSON from Claude for post %s:\n%s", source_url, raw)
        return None

    if not data.get("is_event"):
        logger.debug("Post %s is not an event — skipping.", source_url)
        return None

    # Validate required fields
    for field in ("title", "description", "location", "date", "category"):
        if not data.get(field):
            logger.warning("Missing field '%s' in parsed event for %s", field, source_url)
            return None

    category = data["category"] if data["category"] in VALID_CATEGORIES else "other"

    try:
        event_date = datetime.fromisoformat(data["date"]).replace(tzinfo=timezone.utc)
    except (ValueError, TypeError):
        logger.warning("Invalid date '%s' for post %s", data.get("date"), source_url)
        return None

    end_date = None
    if data.get("end_date"):
        try:
            end_date = datetime.fromisoformat(data["end_date"]).replace(tzinfo=timezone.utc)
        except (ValueError, TypeError):
            pass

    return ParsedEvent(
        title=data["title"][:255],
        description=data["description"],
        location=data["location"],
        date=event_date,
        end_date=end_date,
        category=category,
        image_url=image_url,
        source_url=source_url,
    )
