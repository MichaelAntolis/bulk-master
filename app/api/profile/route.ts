import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const profileUpdateSchema = z.object({
  username: z.string().optional(),
  age: z.number().int().min(10).max(100).optional(),
  height_cm: z.number().min(100).max(250).optional(),
  weight_start_kg: z.number().min(30).max(300).optional(),
  gender: z.enum(["male", "female"]).optional(),
  activity_level: z
    .enum(["sedentary", "light", "moderate", "active", "very_active"])
    .optional(),
  tdee: z.number().optional(),
  target_calories: z.number().optional(),
  surplus_kcal: z.number().int().optional(),
  current_phase: z.string().optional(),
  onboarding_done: z.boolean().optional(),
  // Allow updating avatar image URL; empty string means 'clear the avatar'
  image: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Get user name/email/image from users table
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("name, email, image")
    .eq("id", session.user.id)
    .single();

  // Merge profile + user info, image comes from users table
  return NextResponse.json({
    ...data,
    name: user?.name,
    email: user?.email,
    image: user?.image ?? null,
  });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = profileUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 }
    );
  }

  // Separate image (goes to users table) from profile fields
  const { image, ...profileFields } = parsed.data;

  // Update users table if image is provided (empty string = clear)
  if (image !== undefined) {
    const imageValue = image === "" ? null : image;
    await supabaseAdmin
      .from("users")
      .update({ image: imageValue })
      .eq("id", session.user.id);
  }

  // Update profiles table (only if there are profile fields to update)
  if (Object.keys(profileFields).length > 0) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert({
        user_id: session.user.id,
        ...profileFields,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    // Re-fetch user image to include in response
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("name, email, image")
      .eq("id", session.user.id)
      .single();

    return NextResponse.json({ ...data, name: user?.name, email: user?.email, image: user?.image ?? null });
  }

  // Image-only update
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("name, email, image")
    .eq("id", session.user.id)
    .single();

  return NextResponse.json({ image: user?.image ?? null, name: user?.name, email: user?.email });
}
