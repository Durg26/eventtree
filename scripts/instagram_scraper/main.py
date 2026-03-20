#!/usr/bin/env python3
"""
main.py — CLI entry point for the EventTree Instagram scraper.

Usage examples:

  # Scrape one handle, map it to a society, dry-run (no DB writes)
  python main.py --handle dalhousie_cs --society cs-society --dry-run

  # Scrape two handles at once, publish events immediately
  python main.py \\
    --handle dalhousie_cs --society cs-society \\
    --handle dalhousie_eng --society eng-society \\
    --limit 20 --publish

  # See what societies and users are in your DB
  python main.py --list-societies
  python main.py --list-users
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the same directory as this script
load_dotenv(Path(__file__).parent / ".env")

import anthropic

import db as db_module
import scraper as scraper_module
from parser import parse_post

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="Scrape Instagram posts and import them as events into EventTree."
    )

    # Target specification — can repeat for multiple handles
    p.add_argument(
        "--handle",
        dest="handles",
        action="append",
        metavar="INSTAGRAM_HANDLE",
        help="Instagram handle to scrape (without @). Repeat for multiple handles.",
    )
    p.add_argument(
        "--society",
        dest="societies",
        action="append",
        metavar="SOCIETY_ID_OR_SLUG",
        help="Society UUID or slug to attribute events to. Must match order of --handle.",
    )

    # Scraping options
    p.add_argument(
        "--limit",
        type=int,
        default=20,
        help="Max number of posts to fetch per handle (default: 20).",
    )
    p.add_argument(
        "--delay",
        type=float,
        default=2.5,
        help="Seconds to wait between Instagram requests (default: 2.5).",
    )

    # DB / import options
    p.add_argument(
        "--created-by",
        metavar="USER_ID_OR_EMAIL",
        help=(
            "User ID or email to attribute events to. "
            "Falls back to CREATED_BY_USER_ID env var."
        ),
    )
    p.add_argument(
        "--publish",
        action="store_true",
        default=False,
        help="Mark imported events as published (default: draft / unpublished).",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        default=False,
        help="Parse posts and print results without writing to the database.",
    )

    # Info helpers
    p.add_argument(
        "--list-societies",
        action="store_true",
        help="Print available societies from the DB and exit.",
    )
    p.add_argument(
        "--list-users",
        action="store_true",
        help="Print available organizer/admin users from the DB and exit.",
    )

    return p


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    args = build_parser().parse_args()

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        logger.error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.")
        return 1

    # -- Info helpers --
    if args.list_societies:
        rows = db_module.list_societies(database_url)
        print(f"\n{'ID':<38}  {'Slug':<25}  Name")
        print("-" * 80)
        for r in rows:
            print(f"{r['id']:<38}  {r['slug']:<25}  {r['name']}")
        return 0

    if args.list_users:
        rows = db_module.list_organizers(database_url)
        print(f"\n{'ID':<38}  {'Role':<10}  {'Email':<30}  Name")
        print("-" * 90)
        for r in rows:
            print(f"{r['id']:<38}  {r['role']:<10}  {r['email']:<30}  {r['name']}")
        return 0

    # -- Validate required args --
    if not args.handles:
        logger.error("Provide at least one --handle. Use --list-societies to see available societies.")
        return 1

    if not args.societies or len(args.societies) != len(args.handles):
        logger.error("Each --handle must have a matching --society in the same order.")
        return 1

    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    if not anthropic_key:
        logger.error("ANTHROPIC_API_KEY is not set.")
        return 1

    created_by = args.created_by or os.getenv("CREATED_BY_USER_ID")
    if not created_by and not args.dry_run:
        logger.error(
            "Provide --created-by or set CREATED_BY_USER_ID in .env "
            "(use --list-users to find a valid user ID)."
        )
        return 1

    # -- Resolve DB identifiers --
    import psycopg2

    if not args.dry_run:
        try:
            conn = db_module.get_connection(database_url)
        except psycopg2.OperationalError as exc:
            logger.error("Could not connect to database: %s", exc)
            return 1

        with conn.cursor() as cur:
            resolved_user_id = db_module.resolve_user_id(cur, created_by)
            if not resolved_user_id:
                logger.error("User '%s' not found in the database.", created_by)
                conn.close()
                return 1

            resolved_society_ids: list[str] = []
            for slug in args.societies:
                sid = db_module.resolve_society_id(cur, slug)
                if not sid:
                    logger.error("Society '%s' not found. Use --list-societies to check.", slug)
                    conn.close()
                    return 1
                resolved_society_ids.append(sid)
    else:
        conn = None
        resolved_user_id = "dry-run-user"
        resolved_society_ids = ["dry-run-" + s for s in args.societies]

    # -- Scrape + parse + insert --
    claude = anthropic.Anthropic(api_key=anthropic_key)

    total_scraped = 0
    total_events = 0
    total_inserted = 0
    total_skipped = 0

    handle_pairs = list(zip(args.handles, resolved_society_ids))

    for handle, society_id in handle_pairs:
        logger.info("=" * 60)
        logger.info("Processing @%s → society %s", handle, society_id)
        logger.info("=" * 60)

        for post in scraper_module.fetch_posts(handle, limit=args.limit, delay_seconds=args.delay):
            total_scraped += 1
            logger.info("[%s] Parsing post %s ...", handle, post.shortcode)

            parsed = parse_post(
                client=claude,
                caption=post.caption,
                post_date=post.post_date,
                image_url=post.image_url,
                source_url=post.post_url,
            )

            if parsed is None:
                logger.info("  → Not an event, skipping.")
                continue

            total_events += 1
            logger.info("  → Event detected: '%s' on %s", parsed.title, parsed.date.date())

            if args.dry_run:
                print(
                    f"\n[DRY RUN] Would insert:\n"
                    f"  Title:    {parsed.title}\n"
                    f"  Date:     {parsed.date}\n"
                    f"  Location: {parsed.location}\n"
                    f"  Category: {parsed.category}\n"
                    f"  Desc:     {parsed.description[:100]}...\n"
                    f"  Source:   {parsed.source_url}\n"
                )
                total_inserted += 1
                continue

            try:
                with conn.cursor() as cur:
                    event_id = db_module.insert_event(
                        cur,
                        event=parsed,
                        society_id=society_id,
                        created_by_id=resolved_user_id,
                        is_published=args.publish,
                    )
                conn.commit()
                logger.info("  → Inserted event %s", event_id)
                total_inserted += 1
            except ValueError as exc:
                # Duplicate
                logger.info("  → Skipped: %s", exc)
                total_skipped += 1
            except Exception as exc:
                conn.rollback()
                logger.error("  → DB error for '%s': %s", parsed.title, exc)
                total_skipped += 1

    if conn:
        conn.close()

    # -- Summary --
    logger.info("")
    logger.info("Done.")
    logger.info("  Posts scraped : %d", total_scraped)
    logger.info("  Events found  : %d", total_events)
    logger.info("  Inserted      : %d", total_inserted)
    logger.info("  Skipped       : %d", total_skipped)
    if args.dry_run:
        logger.info("  (dry-run — nothing was written to the database)")

    return 0


if __name__ == "__main__":
    sys.exit(main())
