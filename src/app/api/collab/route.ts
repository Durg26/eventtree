import { NextResponse } from "next/server";
import { db } from "@/db";
import { collabRequests, societies, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { collabSchema } from "@/lib/validators";

export async function GET() {
  const results = await db
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
      responseCount: sql<number>`(SELECT COUNT(*) FROM collab_responses WHERE collab_responses.collab_id = ${collabRequests.id})`,
    })
    .from(collabRequests)
    .innerJoin(societies, eq(collabRequests.societyId, societies.id))
    .innerJoin(users, eq(collabRequests.createdById, users.id))
    .orderBy(desc(collabRequests.isOpen), desc(collabRequests.createdAt));

  return NextResponse.json(results);
}

export async function POST(request: Request) {
  const session = await auth();
  const user = session?.user as { id: string; role: string; societyId: string | null } | undefined;
  if (!user || user.role !== "organizer" || !user.societyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = collabSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const [collab] = await db.insert(collabRequests).values({
    ...parsed.data,
    societyId: user.societyId,
    createdById: user.id,
  }).returning();

  return NextResponse.json(collab, { status: 201 });
}
