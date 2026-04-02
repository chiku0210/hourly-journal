import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import type { LogInsert } from "@/lib/schema";

// GET /api/logs?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Missing or invalid date. Use YYYY-MM-DD format." }, { status: 400 });
  }

  const logs = await sql`
    SELECT * FROM logs
    WHERE date = ${date}
    ORDER BY hour ASC, minute_from ASC
  `;

  return NextResponse.json(logs);
}

// POST /api/logs
export async function POST(req: NextRequest) {
  const body = (await req.json()) as LogInsert;

  const { date, hour, minute_from, minute_to, title, note, tag, intensity } = body;

  if (!date || hour === undefined || !title) {
    return NextResponse.json({ error: "Missing required fields: date, hour, title" }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO logs (date, hour, minute_from, minute_to, title, note, tag, intensity)
    VALUES (
      ${date},
      ${hour},
      ${minute_from ?? 0},
      ${minute_to ?? 59},
      ${title},
      ${note ?? null},
      ${tag ?? "general"},
      ${intensity ?? 3}
    )
    RETURNING *
  `;

  return NextResponse.json(result[0], { status: 201 });
}
