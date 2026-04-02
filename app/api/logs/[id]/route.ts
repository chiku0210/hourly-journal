export const dynamic = 'force-dynamic'; // ← add this

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";      // ← update import

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const sql = getDb();                  // ← create inside handler
  const { id } = await params;
  const body = await req.json();
  const result = await sql`
    UPDATE logs SET
      title       = ${body.title},
      note        = ${body.note},
      tag         = ${body.tag},
      intensity   = ${body.intensity},
      minute_from = ${body.minute_from},
      minute_to   = ${body.minute_to},
      updated_at  = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(result[0]);
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const sql = getDb();                  // ← create inside handler
  const { id } = await params;
  await sql`DELETE FROM logs WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}