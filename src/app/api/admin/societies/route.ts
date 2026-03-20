import { NextResponse } from "next/server";
import { db } from "@/db";
import { societies, users, events } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const user = session?.user as { role: string } | undefined;
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allSocieties = await db
    .select({
      id: societies.id,
      name: societies.name,
      slug: societies.slug,
      contactEmail: societies.contactEmail,
      createdAt: societies.createdAt,
      memberCount: sql<number>`(SELECT COUNT(*) FROM users WHERE users.society_id = ${societies.id})`,
      eventCount: sql<number>`(SELECT COUNT(*) FROM events WHERE events.society_id = ${societies.id})`,
    })
    .from(societies)
    .orderBy(societies.name);

  return NextResponse.json(allSocieties);
}
