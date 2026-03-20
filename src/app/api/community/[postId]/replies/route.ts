import { NextResponse } from "next/server";
import { db } from "@/db";
import { communityReplies } from "@/db/schema";
import { auth } from "@/lib/auth";
import { replySchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = replySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const [reply] = await db.insert(communityReplies).values({
    postId,
    authorId: session.user.id!,
    body: parsed.data.body,
  }).returning();

  return NextResponse.json(reply, { status: 201 });
}
