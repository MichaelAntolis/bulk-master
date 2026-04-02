import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const foodLogSchema = z.object({
  food_name: z.string().min(1),
  brand: z.string().optional(),
  barcode: z.string().optional(),
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  calories: z.number().min(0),
  protein_g: z.number().min(0).default(0),
  carbs_g: z.number().min(0).default(0),
  fat_g: z.number().min(0).default(0),
  serving_g: z.number().min(0).default(100),
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
    .from("food_logs")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("log_date", date)
    .order("logged_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch food logs" }, { status: 500 });
  }

  // Group by meal type
  const grouped = {
    breakfast: data.filter((f) => f.meal_type === "breakfast"),
    lunch: data.filter((f) => f.meal_type === "lunch"),
    dinner: data.filter((f) => f.meal_type === "dinner"),
    snack: data.filter((f) => f.meal_type === "snack"),
    totals: {
      calories: data.reduce((sum, f) => sum + Number(f.calories), 0),
      protein_g: data.reduce((sum, f) => sum + Number(f.protein_g), 0),
      carbs_g: data.reduce((sum, f) => sum + Number(f.carbs_g), 0),
      fat_g: data.reduce((sum, f) => sum + Number(f.fat_g), 0),
    },
  };

  return NextResponse.json(grouped);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = foodLogSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("food_logs")
    .insert({
      user_id: session.user.id,
      ...parsed.data,
      log_date: parsed.data.log_date || new Date().toISOString().split("T")[0],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to add food log" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
