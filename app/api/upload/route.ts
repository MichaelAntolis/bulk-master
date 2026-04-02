import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// Max file size 5MB
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "progress" | "avatar"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, or WebP." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${session.user.id}/${type ?? "progress"}/${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from("bulkmaster-media")
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("bulkmaster-media")
      .getPublicUrl(data.path);

    // If progress photo: save to progress_photos table if exists, else just return URL
    if (type === "progress") {
      const label = formData.get("label") as string | null;
      try {
        await supabaseAdmin.from("progress_photos").insert({
          user_id: session.user.id,
          url: urlData.publicUrl,
          label: label || `Progress Photo ${new Date().toLocaleDateString()}`,
          taken_at: new Date().toISOString(),
        });
      } catch {
        // Ignore if table doesn't exist yet
      }
    }

    return NextResponse.json({ url: urlData.publicUrl, path: data.path });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
