import { NextResponse } from "next/server";
import { db } from "@/db";
import { events, societies, rsvps } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { eventSchema } from "@/lib/validators";

export async function GET(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  const [event] = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      location: events.location,
      date: events.date,
      endDate: events.endDate,
      category: events.category,
      imageUrl: events.imageUrl,
      isPublished: events.isPublished,
      viewCount: events.viewCount,
      societyId: events.societyId,
      societyName: societies.name,
      societySlug: societies.slug,
      societyLogo: societies.logoUrl,
      createdById: events.createdById,
      createdAt: events.createdAt,
      rsvpCount: sql<number>`(SELECT COUNT(*) FROM rsvps WHERE rsvps.event_id = ${events.id} AND rsvps.status = 'going')`,
      interestedCount: sql<number>`(SELECT COUNT(*) FROM rsvps WHERE rsvps.event_id = ${events.id} AND rsvps.status = 'interested')`,
    })
    .from(events)
    .innerJoin(societies, eq(events.societyId, societies.id))
    .where(eq(events.id, eventId))
    .limit(1);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Increment view count
  await db.update(events).set({ viewCount: sql`${events.viewCount} + 1` }).where(eq(events.id, eventId));

  return NextResponse.json(event);
}

export async function PUT(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const session = await auth();
  const user = session?.user as { id: string; role: string; societyId: string | null } | undefined;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [existing] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "admin" && existing.createdById !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { date, endDate, ...rest } = parsed.data;
  const [updated] = await db.update(events).set({
    ...rest,
    date: new Date(date),
    endDate: endDate ? new Date(endDate) : null,
    updatedAt: new Date(),
  }).where(eq(events.id, eventId)).returning();

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const session = await auth();
  const user = session?.user as { id: string; role: string } | undefined;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [existing] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "admin" && existing.createdById !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(events).where(eq(events.id, eventId));
  return NextResponse.json({ success: true });
}
