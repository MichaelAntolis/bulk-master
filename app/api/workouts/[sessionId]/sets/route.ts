import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const setSchema = z.object({
  exercise_name: z.string().min(1),
  weight_kg: z.number().min(0).default(0),
  reps: z.number().int().min(0).default(0),
  set_number: z.number().int().min(1).default(1),
  rpe: z.number().min(1).max(10).optional(),
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

  // Verify session belongs to user
  const { data: workoutSession } = await supabaseAdmin
    .from("workout_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", session.user.id)
    .single();

  if (!workoutSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("workout_sets")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch sets" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const body = await request.json();
  const parsed = setSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  // Verify session belongs to user
  const { data: workoutSession } = await supabaseAdmin
    .from("workout_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", session.user.id)
    .single();

  if (!workoutSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("workout_sets")
    .insert({ session_id: sessionId, ...parsed.data })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to add set" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
