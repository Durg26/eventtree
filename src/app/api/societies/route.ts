import { NextResponse } from "next/server";
import { db } from "@/db";
import { societies } from "@/db/schema";
import { auth } from "@/lib/auth";
import { societySchema } from "@/lib/validators";

export async function GET() {
  const results = await db.select().from(societies).orderBy(societies.name);
  return NextResponse.json(results);
}

export async function POST(request: Request) {
  const session = await auth();
  const user = session?.user as { id: string; role: string } | undefined;
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = societySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const [society] = await db.insert(societies).values({
    ...parsed.data,
    createdById: user.id,
  }).returning();

  return NextResponse.json(society, { status: 201 });
}
