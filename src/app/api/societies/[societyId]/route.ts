import { NextResponse } from "next/server";
import { db } from "@/db";
import { societies, events, users } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { societySchema } from "@/lib/validators";

export async function GET(request: Request, { params }: { params: Promise<{ societyId: string }> }) {
  const { societyId } = await params;

  const [society] = await db.select().from(societies).where(eq(societies.id, societyId)).limit(1);
  if (!society) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const societyEvents = await db
    .select({
      id: events.id,
      title: events.title,
      date: events.date,
      location: events.location,
      category: events.category,
      imageUrl: events.imageUrl,
      rsvpCount: sql<number>`(SELECT COUNT(*) FROM rsvps WHERE rsvps.event_id = ${events.id} AND rsvps.status = 'going')`,
    })
    .from(events)
    .where(and(eq(events.societyId, societyId), eq(events.isPublished, true)))
    .orderBy(events.date);

  const memberCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(eq(users.societyId, societyId));

  return NextResponse.json({
    ...society,
    events: societyEvents,
    memberCount: Number(memberCount[0]?.count || 0),
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ societyId: string }> }) {
  const { societyId } = await params;
  const session = await auth();
  const user = session?.user as { id: string; role: string; societyId: string | null } | undefined;

  if (!user || (user.role !== "admin" && user.societyId !== societyId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = societySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const [updated] = await db.update(societies).set({
    ...parsed.data,
    updatedAt: new Date(),
  }).where(eq(societies.id, societyId)).returning();

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ societyId: string }> }) {
  const { societyId } = await params;
  const session = await auth();
  const user = session?.user as { role: string } | undefined;
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.delete(societies).where(eq(societies.id, societyId));
  return NextResponse.json({ success: true });
}
