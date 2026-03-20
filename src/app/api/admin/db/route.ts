import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  const user = session?.user as { role: string } | undefined;
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { query } = await request.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  // Only allow SELECT queries for safety
  const trimmed = query.trim().toUpperCase();
  if (!trimmed.startsWith("SELECT")) {
    return NextResponse.json({ error: "Only SELECT queries are allowed" }, { status: 400 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    // Use tagged template literal with the query string
    const rows = await sql(query as unknown as TemplateStringsArray);
    return NextResponse.json({ rows, rowCount: rows.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Query execution failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
