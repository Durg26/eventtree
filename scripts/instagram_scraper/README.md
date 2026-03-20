# EventTree — Instagram Scraper

Scrapes Instagram posts from society handles, uses Claude (with vision) to extract structured event data, and inserts the results into the EventTree database.

## Setup

```bash
cd scripts/instagram_scraper

# Install Python dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and fill in DATABASE_URL, ANTHROPIC_API_KEY, and CREATED_BY_USER_ID
```

### Finding the right IDs

```bash
# List societies (to get slugs/IDs for --society)
python main.py --list-societies

# List organizer/admin users (to get your CREATED_BY_USER_ID)
python main.py --list-users
```

## Usage

### Dry run first (recommended)

Always test with `--dry-run` before writing to the database:

```bash
python main.py \
  --handle your_society_handle \
  --society cs-society \
  --limit 20 \
  --dry-run
```

### Import events (saved as drafts)

Events are imported as **unpublished drafts** by default so you can review them before they go live:

```bash
python main.py \
  --handle your_society_handle \
  --society cs-society \
  --limit 20
```

### Multiple societies at once

```bash
python main.py \
  --handle cs_society_dal    --society cs-society \
  --handle dal_engineering   --society eng-society \
  --handle dal_arts          --society arts-collective \
  --limit 30
```

### Publish immediately

```bash
python main.py --handle your_handle --society cs-society --publish
```

## How it works

```
Instagram (@handle)
      │
      ▼
 instaloader          fetches post caption + image URL
      │
      ▼
 Claude API           reads caption + image (vision)
 (claude-opus-4-6)    determines if it's an event
                      extracts: title, description, location,
                                date, end_date, category
      │
      ▼
 PostgreSQL           duplicate check (same title + date + society)
 (Neon / EventTree)   inserts event row
```

## Notes

- **Rate limiting**: The script adds a 2.5 s delay between requests by default. Reduce `--delay` cautiously.
- **Private accounts**: The script works on public accounts anonymously. Add `INSTAGRAM_USERNAME` / `INSTAGRAM_PASSWORD` to `.env` for accounts you follow.
- **Drafts**: Imported events default to `is_published = false`. Review and publish them via the organizer dashboard.
- **Duplicates**: If the same event is scraped twice (e.g. on re-run), it is skipped automatically based on matching title + date + society.
- **Vision**: When a post image is available, Claude reads both the caption and the flyer image. Event details printed on flyers (dates, rooms, times) are often not in the caption.
