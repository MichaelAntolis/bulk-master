"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, LineChart, Lock, Loader2, Save, Trash2 } from "lucide-react";
import { useProfile, useUpdateProfile } from "@/hooks/useBulkmaster";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending, isSuccess } = useUpdateProfile();
  const { theme, setTheme } = useTheme();
  // Prevent hydration mismatch — useTheme returns undefined on server
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    height_cm: "",
    age: "",
    target_calories: "",
    surplus_kcal: "",
    current_phase: "Bulking",
  });

  // Sync form + avatarUrl when profile loads — useEffect to avoid render-phase setState
  const [synced, setSynced] = useState(false);
  useEffect(() => {
    if (profile && !synced) {
      setForm({
        height_cm: profile.height_cm?.toString() ?? "",
        age: profile.age?.toString() ?? "",
        target_calories: profile.target_calories?.toString() ?? "",
        surplus_kcal: profile.surplus_kcal?.toString() ?? "",
        current_phase: profile.current_phase ?? "Bulking",
      });
      // Load existing avatar from DB if not already set in state
      if (profile.image && !avatarUrl) {
        setAvatarUrl(profile.image);
      }
      setSynced(true);
    }
  }, [profile, synced, avatarUrl]);

  const handleSave = () => {
    updateProfile({
      height_cm: form.height_cm ? Number(form.height_cm) : undefined,
      age: form.age ? Number(form.age) : undefined,
      target_calories: form.target_calories ? Number(form.target_calories) : undefined,
      surplus_kcal: form.surplus_kcal ? Number(form.surplus_kcal) : undefined,
      current_phase: form.current_phase || undefined,
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setAvatarError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", "avatar");
    try {
      // 1. Upload file to Supabase Storage
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      // 2. Set local preview immediately
      setAvatarUrl(data.url);

      // 3. Persist to database (users.image column) via profile API
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: data.url }),
      });

      // 4. Notify ProfileDropdown to refresh
      window.dispatchEvent(new Event("avatar-updated"));
    } catch (err) {
      setAvatarError((err as Error).message);
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;
    setAvatarUploading(true);
    setAvatarError("");
    try {
      // Clear image in database (set to null)
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: "" }),
      });
      // Clear local state
      setAvatarUrl(null);
      // Notify header
      window.dispatchEvent(new Event("avatar-updated"));
    } catch (err) {
      setAvatarError((err as Error).message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete account");
      }
      // Sign out after successful deletion
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setAvatarError((err as Error).message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full animate-in fade-in zoom-in-95 duration-500 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div>
          <p className="text-muted text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Command Center</p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-foreground leading-none mb-3">
            Profile & <span className="text-primary">Settings</span>
          </h1>
        </div>
        <div className="flex gap-4 w-full md:w-auto shadow-lg">
          <button onClick={() => setSynced(false)} className="flex-1 md:flex-none bg-input hover:bg-input border border-border/20 text-foreground text-[9px] font-black tracking-[0.2em] uppercase px-8 py-4 transition-colors">
            Discard
          </button>
          <button onClick={handleSave} disabled={isPending} className="flex-1 md:flex-none bg-primary hover:bg-primary-hover text-black text-[9px] font-black tracking-[0.2em] uppercase px-8 py-4 transition-colors shadow-[0_0_20px_rgba(174,230,0,0.15)] flex items-center gap-2 disabled:opacity-50">
            {isPending ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </div>

      {isSuccess && (
        <div className="mb-8 p-4 border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          ✓ Settings saved successfully
        </div>
      )}

      {/* Grid: Identity & Biometric */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Identity Card */}
        <div className="bg-card border border-border/20 p-6 md:p-8 flex flex-col relative shadow-lg">
          <h3 className="text-xs font-black tracking-widest uppercase mb-8 text-foreground/80">Identity</h3>
          
          <div className="relative aspect-square w-full sm:w-[70%] mx-auto lg:w-full mb-10 bg-input border border-border/10 p-2 group flex items-center justify-center overflow-hidden">
                      {/* Avatar preview */}
            {avatarUrl ? (
              <div className="absolute inset-2 bg-cover bg-center"
                style={{ backgroundImage: `url(${avatarUrl})` }} />
            ) : (
              <div className="text-6xl font-black text-primary/20 select-none">
                {profile?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() ?? "BM"}
              </div>
            )}
            <div className="absolute inset-4 border border-white/10 pointer-events-none transition-all group-hover:inset-3 group-hover:border-primary/30" />
            
            {/* Upload button */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute bottom-4 right-4 bg-primary text-black w-10 h-10 flex items-center justify-center shadow-[0_0_15px_rgba(174,230,0,0.3)] hover:scale-105 active:scale-95 transition-transform z-10 disabled:opacity-60"
            >
              {avatarUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={18} strokeWidth={2.5} />}
            </button>

            {/* Delete button — only show when avatar is set */}
            {avatarUrl && (
              <button
                onClick={handleRemoveAvatar}
                disabled={avatarUploading}
                title="Remove photo"
                className="absolute bottom-4 left-4 bg-red-500/90 hover:bg-red-500 text-white w-10 h-10 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all z-10 disabled:opacity-60"
              >
                <Trash2 size={18} strokeWidth={2.5} />
              </button>
            )}

            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleAvatarUpload} className="hidden" />
          </div>

          {avatarError && (
            <p className="text-[10px] text-red-400 mb-3">⚠ {avatarError}</p>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] text-muted font-bold tracking-widest uppercase">Full Name</label>
              <div className="w-full bg-input/50 border border-border/20 text-foreground font-black px-4 py-3 text-xs uppercase tracking-widest">
                {isLoading ? "Loading..." : profile?.name ?? "—"}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-muted font-bold tracking-widest uppercase">Email</label>
              <div className="w-full bg-input/50 border border-border/20 text-muted px-4 py-3 text-xs">
                {isLoading ? "Loading..." : profile?.email ?? "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Biometric Data Card */}
        <div className="bg-card border border-border/20 p-6 md:p-8 lg:col-span-2 flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xs font-black tracking-widest uppercase text-foreground/80">Biometric Data</h3>
            <LineChart className="text-primary" size={20} strokeWidth={2.5} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-10 flex-1">
            {[
              { label: "Height", key: "height_cm", unit: "CM" },
              { label: "Age", key: "age", unit: "YRS" },
              { label: "Target Calories", key: "target_calories", unit: "KCAL" },
              { label: "Daily Surplus", key: "surplus_kcal", unit: "KCAL" },
            ].map((field) => (
              <div key={field.key} className="border-b border-foreground/5 hover:border-primary/50 transition-colors pb-2 flex justify-between items-end group relative">
                <div className="absolute w-0 h-[2px] bg-primary bottom-[-1px] left-0 transition-all duration-300 group-focus-within:w-full" />
                <div className="flex flex-col w-full">
                  <label className="text-[9px] text-muted font-bold tracking-[0.2em] uppercase mb-1">{field.label}</label>
                  {isLoading ? (
                    <div className="h-12 bg-input/50 animate-pulse" />
                  ) : (
                    <input
                      type="number"
                      value={form[field.key as keyof typeof form]}
                      onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                      className="bg-transparent text-4xl lg:text-5xl font-black tracking-tighter text-foreground focus:outline-none w-full"
                    />
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground pb-2 ml-4">{field.unit}</span>
              </div>
            ))}
          </div>

          {/* Current Phase */}
          <div className="bg-input border border-border/10 p-5 border-l-[4px] border-l-primary">
            <div className="text-[9px] text-muted font-bold tracking-widest uppercase mb-3">Current Phase</div>
            <div className="flex gap-3">
              {["Bulking", "Cutting", "Maintenance"].map((phase) => (
                <button
                  key={phase}
                  onClick={() => setForm((p) => ({ ...p, current_phase: phase }))}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest border transition-colors ${form.current_phase === phase ? "bg-primary text-black border-primary" : "bg-surface border-border/30 text-muted hover:border-primary/30"}`}
                >
                  {phase}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Configuration */}
      <div className="bg-card border border-border/20 p-6 md:p-8 mb-8 shadow-lg">
        <h3 className="text-xs font-black tracking-widest uppercase mb-8 text-foreground/80">System Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          
          {/* Theme */}
          <div className="space-y-3">
            <label className="text-[9px] text-muted font-bold tracking-[0.2em] uppercase">Interface Mode</label>
            <div className="flex h-14 bg-input border border-border/20 overflow-hidden">
              {/* Use suppressHydrationWarning + mounted guard to avoid SSR/client className mismatch */}
              <button
                onClick={() => setTheme("dark")}
                suppressHydrationWarning
                className={`flex-1 text-[9px] font-black tracking-widest uppercase border-b-2 transition-colors ${
                  mounted && theme === "dark"
                    ? "bg-primary/5 border-primary text-primary"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                Dark Engine
              </button>
              <button
                onClick={() => setTheme("light")}
                suppressHydrationWarning
                className={`flex-1 text-[9px] font-black tracking-widest uppercase border-b-2 transition-colors ${
                  mounted && theme === "light"
                    ? "bg-primary/5 border-primary text-primary"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                Lab White
              </button>
            </div>
          </div>

          {/* Blank placeholder */}
          <div className="space-y-3">
            <label className="text-[9px] text-muted font-bold tracking-[0.2em] uppercase">Unit System</label>
            <div className="flex h-14 bg-input border border-border/20 overflow-hidden">
              <button className="flex-1 bg-primary/5 border-b-2 border-primary text-primary text-[9px] font-black tracking-widest uppercase">Metric (KG)</button>
              <button className="flex-1 text-muted text-[9px] font-black tracking-widest uppercase border-b-2 border-transparent">Imperial (LB)</button>
            </div>
          </div>

          {/* Security */}
          <div className="space-y-3">
            <label className="text-[9px] text-muted font-bold tracking-[0.2em] uppercase">Security Access</label>
            <button className="w-full h-14 bg-input hover:bg-input border border-border/20 transition-colors flex items-center justify-between px-6 group">
              <span className="text-[10px] font-black text-foreground tracking-widest uppercase group-hover:text-primary transition-colors">Change Password</span>
              <Lock size={16} className="text-muted group-hover:text-primary transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card border border-red-500/20 p-6 md:p-8">
        <h3 className="text-xs font-black tracking-widest uppercase mb-6 text-red-500/80">Danger Zone</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest px-8 py-4 transition-colors"
          >
            Logout / Disconnect
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-500/10 hover:bg-red-600/30 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest px-8 py-4 transition-colors"
          >
            Delete Account Permanently
          </button>
        </div>
        <p className="text-[10px] text-muted mt-4">
          Deleting your account will permanently erase all data including workouts, food logs, weight history, progress photos, and profile information. This action cannot be undone.
        </p>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface border border-red-500/30 p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-red-500 uppercase tracking-tighter mb-4">
              ⚠ Delete Account
            </h3>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              This will <strong className="text-red-400">permanently delete</strong> your entire account and all associated data. This action is <strong className="text-red-400">irreversible</strong>.
            </p>
            <p className="text-xs text-muted mb-6">
              Type <strong className="text-foreground font-mono">DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE here"
              className="w-full bg-input border border-red-500/30 text-foreground px-4 py-3 mb-6 focus:outline-none focus:border-red-500 transition-colors placeholder:text-muted/50 font-mono uppercase tracking-widest text-sm"
            />
            <div className="flex gap-4">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}
                className="flex-1 bg-input border border-border/30 text-foreground text-[10px] font-black uppercase tracking-widest py-4 transition-colors hover:bg-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest py-4 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
