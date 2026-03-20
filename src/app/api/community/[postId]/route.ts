import { NextResponse } from "next/server";
import { db } from "@/db";
import { communityPosts, communityReplies, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  const [post] = await db
    .select({
      id: communityPosts.id,
      title: communityPosts.title,
      body: communityPosts.body,
      isPinned: communityPosts.isPinned,
      createdAt: communityPosts.createdAt,
      authorName: users.name,
      authorId: communityPosts.authorId,
    })
    .from(communityPosts)
    .innerJoin(users, eq(communityPosts.authorId, users.id))
    .where(eq(communityPosts.id, postId))
    .limit(1);

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const replies = await db
    .select({
      id: communityReplies.id,
      body: communityReplies.body,
      createdAt: communityReplies.createdAt,
      authorName: users.name,
      authorId: communityReplies.authorId,
    })
    .from(communityReplies)
    .innerJoin(users, eq(communityReplies.authorId, users.id))
    .where(eq(communityReplies.postId, postId))
    .orderBy(communityReplies.createdAt);

  return NextResponse.json({ ...post, replies });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const session = await auth();
  const user = session?.user as { id: string; role: string } | undefined;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, postId)).limit(1);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "admin" && post.authorId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(communityPosts).where(eq(communityPosts.id, postId));
  return NextResponse.json({ success: true });
}
