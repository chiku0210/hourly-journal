export const dynamic = 'force-dynamic'; // ← add this

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";      // ← update import

export async function GET(req: NextRequest) {
  const sql = getDb();                  // ← create inside handler
  const date = req.nextUrl.searchParams.get("date");
  const logs = await sql`
    SELECT * FROM logs
    WHERE date = ${date}
    ORDER BY hour, minute_from
  `;
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const sql = getDb();                  // ← create inside handler
  const body = await req.json();
  const { date, hour, minute_from, minute_to, title, note, tag, intensity } = body;
  const result = await sql`
    INSERT INTO logs (date, hour, minute_from, minute_to, title, note, tag, intensity)
    VALUES (${date}, ${hour}, ${minute_from}, ${minute_to}, ${title}, ${note}, ${tag}, ${intensity})
    RETURNING *
  `;
  return NextResponse.json(result[0], { status: 201 });
}