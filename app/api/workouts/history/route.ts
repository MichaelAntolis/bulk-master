import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/workouts/history?exercise=Bench+Press&limit=5
// Returns last N sessions containing the given exercise, with max weight per session
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const exercise = searchParams.get("exercise");
  const limit = parseInt(searchParams.get("limit") || "5");

  if (!exercise) {
    return NextResponse.json({ error: "exercise param required" }, { status: 400 });
  }

  // Get all sessions of this user that contain the exercise
  const { data: sessions, error: sessionsError } = await supabaseAdmin
    .from("workout_sessions")
    .select("id, log_date, session_name")
    .eq("user_id", session.user.id)
    .order("log_date", { ascending: false })
    .limit(50); // Look back at last 50 sessions

  if (sessionsError || !sessions?.length) {
    return NextResponse.json({ history: [] });
  }

  const sessionIds = sessions.map((s) => s.id);

  // Get all sets for this exercise across those sessions
  const { data: sets } = await supabaseAdmin
    .from("workout_sets")
    .select("session_id, weight_kg, reps, set_number")
    .in("session_id", sessionIds)
    .ilike("exercise_name", exercise.trim());

  if (!sets?.length) {
    return NextResponse.json({ history: [] });
  }

  // Group by session and get max weight per session
  const historyMap: Record<string, { max_weight: number; total_reps: number; sets_count: number; date: string }> = {};

  for (const set of sets) {
    const sess = sessions.find((s) => s.id === set.session_id);
    if (!sess) continue;

    if (!historyMap[set.session_id]) {
      historyMap[set.session_id] = {
        max_weight: 0,
        total_reps: 0,
        sets_count: 0,
        date: sess.log_date,
      };
    }
    historyMap[set.session_id].max_weight = Math.max(
      historyMap[set.session_id].max_weight,
      Number(set.weight_kg)
    );
    historyMap[set.session_id].total_reps += Number(set.reps);
    historyMap[set.session_id].sets_count++;
  }

  const history = Object.entries(historyMap)
    .map(([sessionId, stats]) => ({ session_id: sessionId, ...stats }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  return NextResponse.json({ history, exercise });
}
