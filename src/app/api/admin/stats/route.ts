import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, events, societies, rsvps } from "@/db/schema";
import { sql, gte, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const user = session?.user as { role: string } | undefined;
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
  const [totalEvents] = await db.select({ count: sql<number>`COUNT(*)` }).from(events);
  const [totalSocieties] = await db.select({ count: sql<number>`COUNT(*)` }).from(societies);
  const [totalRsvps] = await db.select({ count: sql<number>`COUNT(*)` }).from(rsvps);
  const [recentEvents] = await db.select({ count: sql<number>`COUNT(*)` }).from(events).where(gte(events.createdAt, weekAgo));
  const [recentUsers] = await db.select({ count: sql<number>`COUNT(*)` }).from(users).where(gte(users.createdAt, weekAgo));

  const roleBreakdown = await db
    .select({ role: users.role, count: sql<number>`COUNT(*)` })
    .from(users)
    .groupBy(users.role);

  return NextResponse.json({
    totalUsers: Number(totalUsers.count),
    totalEvents: Number(totalEvents.count),
    totalSocieties: Number(totalSocieties.count),
    totalRsvps: Number(totalRsvps.count),
    eventsThisWeek: Number(recentEvents.count),
    newUsersThisWeek: Number(recentUsers.count),
    roleBreakdown: roleBreakdown.map((r) => ({ role: r.role, count: Number(r.count) })),
  });
}
