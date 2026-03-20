import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events, societies, rsvps } from "@/db/schema";
import { eq, and, gte, ilike, sql, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { eventSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 12;
  const offset = (page - 1) * limit;

  const conditions = [eq(events.isPublished, true), gte(events.date, new Date())];
  if (category && category !== "all") {
    conditions.push(eq(events.category, category as "social" | "academic" | "cultural" | "sports" | "workshop" | "other"));
  }
  if (search) {
    conditions.push(ilike(events.title, `%${search}%`));
  }

  const results = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      location: events.location,
      date: events.date,
      category: events.category,
      imageUrl: events.imageUrl,
      societyName: societies.name,
      societyId: events.societyId,
      rsvpCount: sql<number>`(SELECT COUNT(*) FROM rsvps WHERE rsvps.event_id = ${events.id} AND rsvps.status = 'going')`,
    })
    .from(events)
    .innerJoin(societies, eq(events.societyId, societies.id))
    .where(and(...conditions))
    .orderBy(events.date)
    .limit(limit)
    .offset(offset);

  return NextResponse.json(results);
}

export async function POST(request: Request) {
  const session = await auth();
  const user = session?.user as { id: string; role: string; societyId: string | null } | undefined;
  if (!user || user.role !== "organizer" || !user.societyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  const { date, endDate, ...rest } = parsed.data;
  const [event] = await db.insert(events).values({
    ...rest,
    date: new Date(date),
    endDate: endDate ? new Date(endDate) : null,
    societyId: user.societyId,
    createdById: user.id,
  }).returning();

  return NextResponse.json(event, { status: 201 });
}
