import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET: fetch all progress photos for the user
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Try to fetch from progress_photos table first
    const { data: dbPhotos, error } = await supabaseAdmin
      .from("progress_photos")
      .select("*")
      .eq("user_id", session.user.id)
      .order("taken_at", { ascending: false });

    if (!error && dbPhotos) {
      return NextResponse.json({ photos: dbPhotos, source: "db" });
    }

    // Fallback: list files directly from Storage bucket
    const { data: storageFiles, error: storageError } = await supabaseAdmin.storage
      .from("bulkmaster-media")
      .list(`${session.user.id}/progress`, { limit: 50, sortBy: { column: "created_at", order: "desc" } });

    if (storageError || !storageFiles) {
      return NextResponse.json({ photos: [], source: "empty" });
    }

    const photos = storageFiles.map((file) => {
      const { data: urlData } = supabaseAdmin.storage
        .from("bulkmaster-media")
        .getPublicUrl(`${session.user.id}/progress/${file.name}`);
      return {
        id: file.id,
        url: urlData.publicUrl,
        label: file.name.replace(/\.[^.]+$/, "").replace(/-/g, " "),
        taken_at: file.created_at,
      };
    });

    return NextResponse.json({ photos, source: "storage" });
  } catch (err) {
    console.error("Fetch photos error:", err);
    return NextResponse.json({ photos: [], source: "error" });
  }
}
