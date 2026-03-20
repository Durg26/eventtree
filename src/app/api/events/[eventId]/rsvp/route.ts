import { NextResponse } from "next/server";
import { db } from "@/db";
import { rsvps } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await request.json();
  if (!["going", "interested"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const userId = session.user.id!;

  // Upsert: delete existing then insert
  await db.delete(rsvps).where(and(eq(rsvps.userId, userId), eq(rsvps.eventId, eventId)));
  const [rsvp] = await db.insert(rsvps).values({ userId, eventId, status }).returning();

  return NextResponse.json(rsvp);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.delete(rsvps).where(and(eq(rsvps.userId, session.user.id!), eq(rsvps.eventId, eventId)));
  return NextResponse.json({ success: true });
}
