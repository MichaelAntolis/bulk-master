import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const sessionUpdateSchema = z.object({
  session_name: z.string().optional(),
  notes: z.string().optional(),
  ended_at: z.string().nullable().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;

  const { data, error } = await supabaseAdmin
    .from("workout_sessions")
    .select(`*, workout_sets (*)`)
    .eq("id", sessionId)
    .eq("user_id", session.user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const body = await request.json();
  const parsed = sessionUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("workout_sessions")
    .update(parsed.data)
    .eq("id", sessionId)
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;

  const { error } = await supabaseAdmin
    .from("workout_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", session.user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
