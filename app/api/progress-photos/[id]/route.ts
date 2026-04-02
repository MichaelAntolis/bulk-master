import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// DELETE /api/progress-photos/[id]
// id can be a DB record id OR a storage file name
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const url = new URL(request.url);
  const storagePath = url.searchParams.get("path"); // optional: full storage path

  try {
    // 1. Delete from progress_photos table (ignore error if table doesn't exist)
    try {
      await supabaseAdmin
        .from("progress_photos")
        .delete()
        .eq("id", id)
        .eq("user_id", session.user.id);
    } catch {
      // Ignore - table may not exist yet
    }

    // 2. Delete from Supabase Storage if path is provided
    if (storagePath) {
      // Verify the path belongs to this user
      if (!storagePath.startsWith(session.user.id)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      await supabaseAdmin.storage
        .from("bulkmaster-media")
        .remove([storagePath]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete photo error:", err);
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}
