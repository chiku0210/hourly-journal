import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import type { LogUpdate } from "@/lib/schema";

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/logs/:id
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const body = (await req.json()) as LogUpdate;

  const result = await sql`
    UPDATE logs SET
      title       = COALESCE(${body.title ?? null}, title),
      note        = COALESCE(${body.note ?? null}, note),
      tag         = COALESCE(${body.tag ?? null}, tag),
      intensity   = COALESCE(${body.intensity ?? null}, intensity),
      minute_from = COALESCE(${body.minute_from ?? null}, minute_from),
      minute_to   = COALESCE(${body.minute_to ?? null}, minute_to),
      updated_at  = now()
    WHERE id = ${id}
    RETURNING *
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Log not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}

// DELETE /api/logs/:id
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;

  await sql`DELETE FROM logs WHERE id = ${id}`;

  return NextResponse.json({ success: true });
}
