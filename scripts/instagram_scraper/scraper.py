"""
scraper.py — Fetches recent posts from Instagram profiles using instaloader.
"""

from __future__ import annotations

import os
import time
import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Iterator

import instaloader

logger = logging.getLogger(__name__)


@dataclass
class InstagramPost:
    shortcode: str
    caption: str
    post_date: datetime
    image_url: str | None
    post_url: str


def build_loader() -> instaloader.Instaloader:
    """Create an Instaloader instance, logging in if credentials are provided."""
    loader = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_video_thumbnails=False,
        download_geotags=False,
        download_comments=False,
        save_metadata=False,
        quiet=True,
    )

    username = os.getenv("INSTAGRAM_USERNAME")
    password = os.getenv("INSTAGRAM_PASSWORD")

    if username and password:
        try:
            loader.login(username, password)
            logger.info("Logged in to Instagram as %s", username)
        except instaloader.exceptions.BadCredentialsException:
            logger.error("Instagram login failed — bad credentials. Continuing anonymously.")
        except instaloader.exceptions.TwoFactorAuthRequiredException:
            logger.error("Two-factor auth required. Continuing anonymously.")

    return loader


def fetch_posts(
    handle: str,
    limit: int = 30,
    delay_seconds: float = 2.0,
) -> Iterator[InstagramPost]:
    """
    Yield up to `limit` recent posts from the given Instagram handle.

    Args:
        handle: Instagram username (without the @).
        limit: Maximum number of posts to fetch.
        delay_seconds: Polite delay between requests to avoid rate-limiting.
    """
    loader = build_loader()

    try:
        profile = instaloader.Profile.from_username(loader.context, handle)
    except instaloader.exceptions.ProfileNotExistsException:
        logger.error("Instagram profile @%s does not exist.", handle)
        return
    except instaloader.exceptions.PrivateProfileNotFollowedException:
        logger.error("Instagram profile @%s is private.", handle)
        return

    logger.info("Fetching up to %d posts from @%s (%d total)", limit, handle, profile.mediacount)

    count = 0
    for post in profile.get_posts():
        if count >= limit:
            break

        # Skip videos — captions on reels are often just music credits
        if post.is_video:
            time.sleep(delay_seconds)
            continue

        caption = post.caption or ""
        image_url = post.url  # direct CDN URL of the first image

        yield InstagramPost(
            shortcode=post.shortcode,
            caption=caption,
            post_date=post.date_utc.replace(tzinfo=timezone.utc),
            image_url=image_url,
            post_url=f"https://www.instagram.com/p/{post.shortcode}/",
        )

        count += 1
        time.sleep(delay_seconds)

    logger.info("Fetched %d posts from @%s", count, handle)
