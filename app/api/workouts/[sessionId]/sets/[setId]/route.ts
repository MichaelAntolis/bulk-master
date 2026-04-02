import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const setUpdateSchema = z.object({
  exercise_name: z.string().min(1).optional(),
  weight_kg: z.number().min(0).optional(),
  reps: z.number().int().min(0).optional(),
  rpe: z.number().min(1).max(10).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; setId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, setId } = await params;
  const body = await request.json();
  const parsed = setUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
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
    .update(parsed.data)
    .eq("id", setId)
    .eq("session_id", sessionId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to update set" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; setId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, setId } = await params;

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

  const { error } = await supabaseAdmin
    .from("workout_sets")
    .delete()
    .eq("id", setId)
    .eq("session_id", sessionId);

  if (error) {
    return NextResponse.json({ error: "Failed to delete set" }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
