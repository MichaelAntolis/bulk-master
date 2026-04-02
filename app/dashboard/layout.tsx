"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Utensils, Dumbbell, BarChart3, Settings, Zap, Bell, Menu, X, Play } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";
import ThemeToggle from "@/components/ThemeToggle";
import { useDashboardSummary, useCreateWorkoutSession } from "@/hooks/useBulkmaster";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const { data: summary } = useDashboardSummary(today);
  const { mutate: createSession, isPending: creatingSession } = useCreateWorkoutSession();

  const menu = [
    { name: "Overview", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Meal Log", icon: Utensils, path: "/dashboard/meal-log" },
    { name: "Training", icon: Dumbbell, path: "/dashboard/training" },
    { name: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
    { name: "Settings", icon: Settings, path: "/dashboard/settings" }
  ];

  const handleStartSession = () => {
    createSession(
      { session_name: "Workout Session" },
      { onSuccess: () => { router.push("/dashboard/training"); setIsMobileMenuOpen(false); } }
    );
  };

  // Live macro data from API
  const macros = summary?.macros_today ?? { protein_g: 0, carbs_g: 0, fat_g: 0 };
  const target = summary?.target_calories ?? 2500;
  const caloriesIn = summary?.calories_today ?? 0;
  const currentPhase = summary?.current_phase ?? "Bulking";
  const proteinTarget = Math.round(target * 0.30 / 4);
  const carbTarget = Math.round(target * 0.45 / 4);
  const fatTarget = Math.round(target * 0.25 / 9);

  const StartSessionBtn = ({ mobile = false }: { mobile?: boolean }) => (
    <button
      onClick={handleStartSession}
      disabled={creatingSession}
      className={`w-full bg-primary hover:bg-primary-hover text-black font-black uppercase tracking-widest py-4 transition-colors relative overflow-hidden group flex items-center justify-center gap-2 disabled:opacity-60 ${mobile ? "" : ""}`}
    >
      {creatingSession ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          Starting...
        </span>
      ) : (
        <><Play size={14} strokeWidth={3} fill="currentColor" /> Start Session</>
      )}
    </button>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
      
      {/* Sidebar - Desktop */}
      <aside className="w-[280px] bg-surface border-r border-border/20 hidden md:flex flex-col justify-between flex-shrink-0 z-50">
        <div className="flex flex-col overflow-hidden">
          {/* Logo */}
          <div className="h-20 flex items-center px-8 border-b border-border/10 mb-8 shrink-0">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 bg-primary flex items-center justify-center text-black font-black">
                <Zap fill="currentColor" size={24} />
              </div>
              <div>
                <h1 className="text-primary font-black uppercase tracking-tighter text-xl leading-none">BulkMaster</h1>
                <span className="text-[9px] text-muted font-bold tracking-[0.2em] uppercase">Raw Performance</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col px-4 gap-2 overflow-y-auto">
            {menu.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link href={item.path} key={item.name}
                  className={`flex items-center gap-4 px-4 py-4 uppercase font-bold tracking-widest text-xs transition-colors relative
                    ${isActive ? "text-primary bg-primary/5" : "text-muted hover:text-foreground hover:bg-foreground/5"}`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(174,230,0,0.5)]" />}
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-border/10 shrink-0">
          <StartSessionBtn />
        </div>
      </aside>

      {/* Sidebar - Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex md:hidden">
          <div className="fixed inset-0 bg-surface/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative w-64 bg-surface h-full flex flex-col border-r border-border shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="h-20 flex items-center justify-between px-6 border-b border-border/10 shrink-0">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 bg-primary flex items-center justify-center text-black font-black">
                  <Zap fill="currentColor" size={16} />
                </div>
                <h1 className="text-primary font-black uppercase tracking-tighter leading-none">BulkMaster</h1>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-muted hover:text-foreground">
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col px-4 gap-2 py-6 overflow-y-auto flex-1">
              {menu.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link href={item.path} key={item.name} onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-4 uppercase font-bold tracking-widest text-xs transition-colors relative
                      ${isActive ? "text-primary bg-primary/5" : "text-muted hover:text-foreground hover:bg-foreground/5"}`}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-6 border-t border-border/10 shrink-0">
              <StartSessionBtn mobile />
            </div>
          </aside>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative overflow-y-auto w-full">
        
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-surface border-b border-border/20 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 sticky top-0 z-50 w-full">
          <div className="flex gap-3 items-center">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-foreground hover:text-primary transition-colors focus:outline-none p-1">
              <Menu size={24} />
            </button>
            <h1 className="text-primary font-black uppercase tracking-tighter text-lg leading-none mt-0.5">BULKMASTER</h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="text-muted hover:text-primary transition-colors p-1"><Bell size={18} /></button>
            <ThemeToggle />
            <ProfileDropdown />
          </div>
        </div>

        {/* Desktop Global Header — LIVE DATA */}
        <header className="hidden md:flex bg-surface border-b border-border/20 px-8 lg:px-12 h-20 items-center justify-between sticky top-0 z-40 flex-shrink-0 w-full">
          
          <div className="flex flex-col justify-center">
            <span className="text-[8px] text-muted font-bold uppercase tracking-[0.2em] mb-0.5">Current Phase</span>
            <span className="text-primary font-black uppercase tracking-widest text-sm leading-none border-b border-primary/30 pb-0.5 inline-block">
              {currentPhase}
            </span>
          </div>

          {/* Center Macros - LIVE */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-12 pl-12 mr-auto">
            {/* Protein */}
            <div className="w-28 xl:w-40">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[9px] text-muted font-bold tracking-widest uppercase">Protein</span>
                <span className="text-[10px] text-foreground font-bold font-mono">
                  {Math.round(macros.protein_g)}<span className="text-muted">/{proteinTarget}g</span>
                </span>
              </div>
              <div className="h-1 w-full bg-input rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${Math.min(proteinTarget > 0 ? (macros.protein_g / proteinTarget) * 100 : 0, 100)}%` }} />
              </div>
            </div>
            {/* Carbs */}
            <div className="w-28 xl:w-40">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[9px] text-muted font-bold tracking-widest uppercase">Carbs</span>
                <span className="text-[10px] text-foreground font-bold font-mono">
                  {Math.round(macros.carbs_g)}<span className="text-muted">/{carbTarget}g</span>
                </span>
              </div>
              <div className="h-1 w-full bg-input rounded-full overflow-hidden">
                <div className="h-full bg-foreground transition-all duration-700"
                  style={{ width: `${Math.min(carbTarget > 0 ? (macros.carbs_g / carbTarget) * 100 : 0, 100)}%` }} />
              </div>
            </div>
            {/* Fats */}
            <div className="w-28 xl:w-40">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[9px] text-muted font-bold tracking-widest uppercase">Fats</span>
                <span className="text-[10px] text-foreground font-bold font-mono">
                  {Math.round(macros.fat_g)}<span className="text-muted">/{fatTarget}g</span>
                </span>
              </div>
              <div className="h-1 w-full bg-input rounded-full overflow-hidden">
                <div className="h-full bg-muted transition-all duration-700"
                  style={{ width: `${Math.min(fatTarget > 0 ? (macros.fat_g / fatTarget) * 100 : 0, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Right: Daily Calories + Profile */}
          <div className="flex items-center gap-6 shrink-0">
            <ThemeToggle />
            <div className="text-right flex-col hidden xl:flex">
              <span className="text-[8px] text-muted font-bold uppercase tracking-[0.2em] mb-0.5">Daily Calories</span>
              <span className="text-xl font-black text-foreground tracking-tighter leading-none">
                {caloriesIn.toLocaleString()} <span className="text-[10px] text-muted font-bold tracking-widest">/ {target.toLocaleString()} Kcal</span>
              </span>
            </div>
            <button className="text-muted hover:text-foreground transition-colors hidden sm:block"><Bell size={20} /></button>
            <ProfileDropdown />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col w-full relative z-10">
          <div className="w-full flex-1 max-w-[1600px] mx-auto p-6 md:p-12 lg:p-16">
            {children}
          </div>

          <footer className="w-full border-t border-border/20 py-8 px-6 md:px-12 lg:px-16 mt-auto bg-surface/50">
            <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-muted w-full">
              <div className="flex flex-col items-center sm:items-start">
                <div className="text-primary font-bold tracking-widest uppercase text-sm mb-1">BulkMaster</div>
                <div className="text-[10px] tracking-wider">© 2025 BulkMaster Digital Engine</div>
              </div>
              <div className="flex gap-6 text-[10px] font-bold tracking-widest uppercase">
                <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
                <Link href="#" className="hover:text-primary transition-colors">Support</Link>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
