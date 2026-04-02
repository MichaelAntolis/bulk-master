import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Delete in order of foreign key dependencies (children first)

    // 1. Delete workout_sets (via workout_sessions)
    const { data: sessions } = await supabaseAdmin
      .from("workout_sessions")
      .select("id")
      .eq("user_id", userId);

    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map((s: { id: string }) => s.id);
      await supabaseAdmin
        .from("workout_sets")
        .delete()
        .in("session_id", sessionIds);
    }

    // 2. Delete workout_sessions
    await supabaseAdmin.from("workout_sessions").delete().eq("user_id", userId);

    // 3. Delete food_logs
    await supabaseAdmin.from("food_logs").delete().eq("user_id", userId);

    // 4. Delete weight_logs
    await supabaseAdmin.from("weight_logs").delete().eq("user_id", userId);

    // 5. Delete progress photos from storage
    try {
      const { data: files } = await supabaseAdmin.storage
        .from("bulkmaster-media")
        .list(`${userId}`, { limit: 200 });

      if (files && files.length > 0) {
        // List subfolders and files recursively
        for (const item of files) {
          if (item.id) {
            // It's a file at root level
            await supabaseAdmin.storage
              .from("bulkmaster-media")
              .remove([`${userId}/${item.name}`]);
          } else {
            // It's a folder, list contents
            const { data: subFiles } = await supabaseAdmin.storage
              .from("bulkmaster-media")
              .list(`${userId}/${item.name}`, { limit: 200 });
            if (subFiles && subFiles.length > 0) {
              const paths = subFiles.map((f: { name: string }) => `${userId}/${item.name}/${f.name}`);
              await supabaseAdmin.storage.from("bulkmaster-media").remove(paths);
            }
          }
        }
      }
    } catch {
      // Storage cleanup is best-effort
    }

    // 6. Delete progress_photos table (if exists)
    try {
      await supabaseAdmin.from("progress_photos").delete().eq("user_id", userId);
    } catch {
      // Table may not exist
    }

    // 7. Delete profile
    await supabaseAdmin.from("profiles").delete().eq("user_id", userId);

    // 8. Delete NextAuth sessions & accounts
    await supabaseAdmin.from("sessions").delete().eq("userId", userId);
    await supabaseAdmin.from("accounts").delete().eq("userId", userId);

    // 9. Finally delete the user
    await supabaseAdmin.from("users").delete().eq("id", userId);

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
