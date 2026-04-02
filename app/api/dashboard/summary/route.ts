import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const userId = session.user.id;

  try {
    // Parallel queries for efficiency
    const [profileResult, foodLogsResult, workoutResult, weightResult] =
      await Promise.all([
        supabaseAdmin
          .from("profiles")
          .select("target_calories, surplus_kcal, current_phase, tdee")
          .eq("user_id", userId)
          .single(),

        supabaseAdmin
          .from("food_logs")
          .select("calories, protein_g, carbs_g, fat_g")
          .eq("user_id", userId)
          .eq("log_date", date),

        supabaseAdmin
          .from("workout_sessions")
          .select("id, session_name, ended_at")
          .eq("user_id", userId)
          .eq("log_date", date)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabaseAdmin
          .from("weight_logs")
          .select("weight_kg, log_date")
          .eq("user_id", userId)
          .order("log_date", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    const profile = profileResult.data;
    const foodLogs = foodLogsResult.data || [];
    const workout = workoutResult.data;
    const latestWeight = weightResult.data;

    // Calculate today's totals
    const caloriesToday = foodLogs.reduce(
      (sum, f) => sum + Number(f.calories),
      0
    );
    const macrosToday = {
      protein_g: Math.round(
        foodLogs.reduce((sum, f) => sum + Number(f.protein_g), 0)
      ),
      carbs_g: Math.round(
        foodLogs.reduce((sum, f) => sum + Number(f.carbs_g), 0)
      ),
      fat_g: Math.round(
        foodLogs.reduce((sum, f) => sum + Number(f.fat_g), 0)
      ),
    };

    // Get workout sets count if session exists
    let workoutSetsCount = 0;
    if (workout?.id) {
      const { count } = await supabaseAdmin
        .from("workout_sets")
        .select("*", { count: "exact", head: true })
        .eq("session_id", workout.id);
      workoutSetsCount = count || 0;
    }

    return NextResponse.json({
      target_calories: Number(profile?.target_calories) || 2500,
      surplus_kcal: Number(profile?.surplus_kcal) || 300,
      current_phase: profile?.current_phase || "Bulking",
      calories_today: Math.round(caloriesToday),
      macros_today: macrosToday,
      latest_weight_kg: latestWeight?.weight_kg
        ? Number(latestWeight.weight_kg)
        : null,
      workout_today: workout
        ? {
            session_id: workout.id,
            session_name: workout.session_name,
            total_sets: workoutSetsCount,
            ended_at: workout.ended_at,
          }
        : null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch dashboard summary" },
      { status: 500 }
    );
  }
}
