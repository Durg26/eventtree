import { NextResponse } from "next/server";
import { db } from "@/db";
import { collabResponses, collabRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ collabId: string }> }) {
  const { collabId } = await params;
  const session = await auth();
  const user = session?.user as { id: string; role: string; societyId: string | null } | undefined;

  if (!user || user.role !== "organizer" || !user.societyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check the collab exists and is open
  const [collab] = await db.select().from(collabRequests).where(eq(collabRequests.id, collabId)).limit(1);
  if (!collab) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!collab.isOpen) return NextResponse.json({ error: "This collab request is closed" }, { status: 400 });

  // Can't respond to your own society's request
  if (collab.societyId === user.societyId) {
    return NextResponse.json({ error: "Can't respond to your own collab request" }, { status: 400 });
  }

  const { message } = await request.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const [response] = await db.insert(collabResponses).values({
    collabId,
    societyId: user.societyId,
    message,
    createdById: user.id,
  }).returning();

  return NextResponse.json(response, { status: 201 });
}
