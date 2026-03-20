import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { hash } from "bcryptjs";

export async function GET() {
  const session = await auth();
  const user = session?.user as { role: string } | undefined;
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      societyId: users.societyId,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);

  return NextResponse.json(allUsers);
}

export async function POST(request: Request) {
  const session = await auth();
  const user = session?.user as { role: string } | undefined;
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, email, password, role, societyId } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
  }

  const passwordHash = await hash(password, 12);
  const [newUser] = await db.insert(users).values({
    name,
    email,
    passwordHash,
    role: role || "student",
    societyId: societyId || null,
  }).returning();

  return NextResponse.json(newUser, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await auth();
  const user = session?.user as { role: string } | undefined;
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, name, email, role, societyId, password } = body;

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (role) updateData.role = role;
  if (societyId !== undefined) updateData.societyId = societyId || null;
  if (password) updateData.passwordHash = await hash(password, 12);

  const [updated] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const session = await auth();
  const user = session?.user as { role: string } | undefined;
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ success: true });
}
