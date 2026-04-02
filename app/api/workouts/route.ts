import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const sessionSchema = z.object({
  session_name: z.string().default("Workout Session"),
  notes: z.string().optional(),
  log_date: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const { data, error } = await supabaseAdmin
    .from("workout_sessions")
    .select(`
      *,
      workout_sets (*)
    `)
    .eq("user_id", session.user.id)
    .eq("log_date", date)
    .order("started_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch workouts" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = sessionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("workout_sessions")
    .insert({
      user_id: session.user.id,
      ...parsed.data,
      log_date: parsed.data.log_date || new Date().toISOString().split("T")[0],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create workout session" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
