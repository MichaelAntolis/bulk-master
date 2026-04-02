import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const updateSchema = z.object({
  food_name: z.string().min(1).optional(),
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  calories: z.number().min(0).optional(),
  protein_g: z.number().min(0).optional(),
  carbs_g: z.number().min(0).optional(),
  fat_g: z.number().min(0).optional(),
  serving_g: z.number().min(0).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("food_logs")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", session.user.id) // Ensure user owns this log
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to update food log" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from("food_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id); // Ensure user owns this log

  if (error) {
    return NextResponse.json({ error: "Failed to delete food log" }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
