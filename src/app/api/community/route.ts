import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { communityPosts, users, societies, communityReplies } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { communityPostSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  const posts = await db
    .select({
      id: communityPosts.id,
      title: communityPosts.title,
      body: communityPosts.body,
      isPinned: communityPosts.isPinned,
      createdAt: communityPosts.createdAt,
      authorName: users.name,
      authorId: communityPosts.authorId,
      societyId: communityPosts.societyId,
      societyName: societies.name,
      replyCount: sql<number>`(SELECT COUNT(*) FROM community_replies WHERE community_replies.post_id = ${communityPosts.id})`,
    })
    .from(communityPosts)
    .innerJoin(users, eq(communityPosts.authorId, users.id))
    .leftJoin(societies, eq(communityPosts.societyId, societies.id))
    .orderBy(desc(communityPosts.isPinned), desc(communityPosts.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = communityPostSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const user = session.user as { id: string; societyId: string | null };

  const [post] = await db.insert(communityPosts).values({
    ...parsed.data,
    authorId: user.id,
    societyId: user.societyId,
  }).returning();

  return NextResponse.json(post, { status: 201 });
}
