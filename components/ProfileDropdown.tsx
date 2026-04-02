"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Settings, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useProfile } from "@/hooks/useBulkmaster";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const { data: profile } = useProfile();
  const qc = useQueryClient();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen for avatar-updated event from settings page to refresh profile cache
  useEffect(() => {
    const handleAvatarUpdated = () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    };
    window.addEventListener("avatar-updated", handleAvatarUpdated);
    return () => window.removeEventListener("avatar-updated", handleAvatarUpdated);
  }, [qc]);

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: "/login" });
  };

  // Avatar image: prefer profile.image (DB), fallback to session.user.image, then initials
  const avatarUrl = profile?.image ?? session?.user?.image ?? null;
  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "BM";

  const displayName = session?.user?.name?.toUpperCase() || "OPERATOR";
  const displayEmail = session?.user?.email || "";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 border border-primary/40 hover:border-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 flex-shrink-0 flex items-center justify-center overflow-hidden"
        aria-label="Toggle profile menu"
      >
        {avatarUrl ? (
          // Show avatar image
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${avatarUrl})` }}
          />
        ) : (
          // Show initials fallback
          <span className="text-primary font-black text-sm tracking-widest">{initials}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-surface border border-border/50 shadow-2xl z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-4 border-b border-border/20 bg-muted/10 flex items-center gap-3">
            {/* Mini avatar in dropdown header */}
            <div className="w-10 h-10 flex-shrink-0 bg-primary/20 border border-primary/40 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${avatarUrl})` }} />
              ) : (
                <span className="text-primary font-black text-sm">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-0.5">
                Operator Profile
              </div>
              <div className="text-sm font-black text-foreground truncate uppercase tracking-widest">
                {displayName}
              </div>
              <div className="text-[10px] text-muted truncate">{displayEmail}</div>
            </div>
          </div>

          <div className="mt-1 pb-1 flex flex-col">
            <div className="px-4 py-2">
              <div className="text-[11px] text-primary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Active / Synced
              </div>
            </div>
          </div>

          <div className="py-2 border-t border-border/10">
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted hover:text-foreground hover:bg-foreground/5 transition-colors border-l-2 border-transparent hover:border-primary"
            >
              <Settings size={16} /> Settings
            </Link>
          </div>

          <div className="py-2 border-t border-border/20">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors border-l-2 border-transparent hover:border-red-500"
            >
              <LogOut size={16} /> Logout / Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
