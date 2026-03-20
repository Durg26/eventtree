import { NextResponse } from "next/server";
import { db } from "@/db";
import { collabRequests, collabResponses, societies, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ collabId: string }> }) {
  const { collabId } = await params;

  const [collab] = await db
    .select({
      id: collabRequests.id,
      title: collabRequests.title,
      description: collabRequests.description,
      eventType: collabRequests.eventType,
      isOpen: collabRequests.isOpen,
      createdAt: collabRequests.createdAt,
      societyId: collabRequests.societyId,
      societyName: societies.name,
      createdByName: users.name,
    })
    .from(collabRequests)
    .innerJoin(societies, eq(collabRequests.societyId, societies.id))
    .innerJoin(users, eq(collabRequests.createdById, users.id))
    .where(eq(collabRequests.id, collabId))
    .limit(1);

  if (!collab) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const responses = await db
    .select({
      id: collabResponses.id,
      message: collabResponses.message,
      createdAt: collabResponses.createdAt,
      societyName: societies.name,
      createdByName: users.name,
    })
    .from(collabResponses)
    .innerJoin(societies, eq(collabResponses.societyId, societies.id))
    .innerJoin(users, eq(collabResponses.createdById, users.id))
    .where(eq(collabResponses.collabId, collabId))
    .orderBy(collabResponses.createdAt);

  return NextResponse.json({ ...collab, responses });
}

export async function PUT(request: Request, { params }: { params: Promise<{ collabId: string }> }) {
  const { collabId } = await params;
  const session = await auth();
  const user = session?.user as { id: string; role: string } | undefined;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [existing] = await db.select().from(collabRequests).where(eq(collabRequests.id, collabId)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "admin" && existing.createdById !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const [updated] = await db.update(collabRequests).set({
    ...(body.isOpen !== undefined ? { isOpen: body.isOpen } : {}),
    ...(body.title ? { title: body.title } : {}),
    ...(body.description ? { description: body.description } : {}),
    updatedAt: new Date(),
  }).where(eq(collabRequests.id, collabId)).returning();

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ collabId: string }> }) {
  const { collabId } = await params;
  const session = await auth();
  const user = session?.user as { id: string; role: string } | undefined;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [existing] = await db.select().from(collabRequests).where(eq(collabRequests.id, collabId)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "admin" && existing.createdById !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(collabRequests).where(eq(collabRequests.id, collabId));
  return NextResponse.json({ success: true });
}
