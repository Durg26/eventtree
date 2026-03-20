import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events, societies } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const user = session?.user as { role: string } | undefined;
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allEvents = await db
    .select({
      id: events.id,
      title: events.title,
      date: events.date,
      category: events.category,
      isPublished: events.isPublished,
      viewCount: events.viewCount,
      societyId: events.societyId,
      societyName: societies.name,
      createdAt: events.createdAt,
      rsvpCount: sql<number>`(SELECT COUNT(*) FROM rsvps WHERE rsvps.event_id = ${events.id})`,
    })
    .from(events)
    .leftJoin(societies, eq(events.societyId, societies.id))
    .orderBy(events.createdAt);

  return NextResponse.json(allEvents);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const user = session?.user as { id: string; role: string } | undefined;
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, description, location, date, endDate, category, imageUrl, societyId, isPublished } = body;

  if (!title || !description || !location || !date || !category || !societyId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [event] = await db.insert(events).values({
    title,
    description,
    location,
    date: new Date(date),
    endDate: endDate ? new Date(endDate) : null,
    category,
    imageUrl: imageUrl || null,
    societyId,
    createdById: user.id,
    isPublished: isPublished ?? false,
  }).returning();

  return NextResponse.json(event, { status: 201 });
}
