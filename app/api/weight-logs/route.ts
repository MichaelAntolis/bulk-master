import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const weightLogSchema = z.object({
  weight_kg: z.number().min(20).max(300),
  log_date: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = parseInt(searchParams.get("range") || "30");

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - range);

  const { data, error } = await supabaseAdmin
    .from("weight_logs")
    .select("id, weight_kg, log_date, notes")
    .eq("user_id", session.user.id)
    .gte("log_date", fromDate.toISOString().split("T")[0])
    .order("log_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch weight logs" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = weightLogSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 }
    );
  }

  const logDate = parsed.data.log_date || new Date().toISOString().split("T")[0];

  // Upsert: if entry for today already exists, update it
  const { data, error } = await supabaseAdmin
    .from("weight_logs")
    .upsert(
      {
        user_id: session.user.id,
        weight_kg: parsed.data.weight_kg,
        log_date: logDate,
        notes: parsed.data.notes,
      },
      { onConflict: "user_id,log_date" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save weight log" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
