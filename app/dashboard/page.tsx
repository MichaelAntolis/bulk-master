"use client";

import { Flame, Droplet, Wheat, TrendingUp, Scale } from "lucide-react";
import Link from "next/link";
import { useDashboardSummary } from "@/hooks/useBulkmaster";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-input/60 animate-pulse rounded-sm ${className}`} />;
}

export default function DashboardOverviewPage() {
  const today = new Date().toISOString().split("T")[0];
  const { data: summary, isLoading } = useDashboardSummary(today);

  const caloriesIn = summary?.calories_today ?? 0;
  const target = summary?.target_calories ?? 2500;
  const efficiency = target > 0 ? Math.min(Math.round((caloriesIn / target) * 100), 100) : 0;
  const remaining = Math.max(target - caloriesIn, 0);

  const macros = summary?.macros_today ?? { protein_g: 0, carbs_g: 0, fat_g: 0 };
  // Rough macro targets based on target calories
  const proteinTarget = Math.round(target * 0.3 / 4);
  const carbTarget = Math.round(target * 0.45 / 4);
  const fatTarget = Math.round(target * 0.25 / 9);

  const proteinPct = proteinTarget > 0 ? Math.min(Math.round((macros.protein_g / proteinTarget) * 100), 100) : 0;
  const carbPct = carbTarget > 0 ? Math.min(Math.round((macros.carbs_g / carbTarget) * 100), 100) : 0;
  const fatPct = fatTarget > 0 ? Math.min(Math.round((macros.fat_g / fatTarget) * 100), 100) : 0;

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-foreground leading-none mb-3">
            Daily <span className="text-primary">Engine</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right flex flex-col sm:flex">
            <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Weight Log</span>
            {isLoading ? (
              <SkeletonBlock className="h-8 w-24 mt-1" />
            ) : (
              <span className="text-2xl font-black text-foreground tracking-tighter">
                {summary?.latest_weight_kg
                  ? `${summary.latest_weight_kg} `
                  : "--- "}
                <span className="text-xs text-muted font-bold tracking-widest">KG</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Top Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Caloric Surplus Card */}
        <div className="lg:col-span-2 bg-card rounded-sm p-8 relative overflow-hidden flex flex-col justify-between border border-border/20 min-h-[300px]">
          <div className="absolute inset-0 bg-gradient-to-br dark:from-[#1a1b1d] dark:to-[#121315]/50 z-0"></div>
          
          <div className="relative z-10 mb-12">
            <div className="text-primary font-bold uppercase tracking-[0.2em] text-[9px] mb-4">Engine Fueling</div>
            <h2 className="text-4xl text-foreground font-black uppercase tracking-tighter mb-2">Caloric Surplus</h2>
            
            <div className="flex items-center gap-2 mb-2">
              <Flame size={14} className="text-muted" />
              {isLoading ? (
                <SkeletonBlock className="h-5 w-40" />
              ) : (
                <span className="text-sm text-muted font-medium tracking-wide">
                  {caloriesIn.toLocaleString()} / {target.toLocaleString()} kcal
                </span>
              )}
            </div>
            {isLoading ? (
              <SkeletonBlock className="h-4 w-32" />
            ) : (
              <div className={`font-bold text-xs uppercase tracking-widest ${remaining > 0 ? "text-primary" : "text-green-400"}`}>
                {remaining > 0 ? `+${remaining.toLocaleString()} Kcal Remaining` : "✓ Target Reached!"}
              </div>
            )}
          </div>

          <div className="relative z-10 flex justify-between items-end w-full">
            <Link href="/dashboard/meal-log" className="border border-border bg-card hover:bg-card-hover text-muted hover:text-foreground text-[10px] font-bold uppercase tracking-widest px-8 py-3 transition-colors border-b-2 border-b-primary">
              Log Meal
            </Link>
            <div className="text-right">
              {isLoading ? (
                <SkeletonBlock className="h-16 w-24" />
              ) : (
                <>
                  <div className="text-6xl text-foreground font-black tracking-tighter leading-none mb-1">
                    {efficiency}<span className="text-2xl text-muted leading-none">%</span>
                  </div>
                  <div className="text-[9px] text-muted font-bold uppercase tracking-[0.2em]">Efficiency</div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Workout Card */}
        <div className="col-span-1 bg-input rounded-sm p-8 relative overflow-hidden flex flex-col justify-between border border-border/20 min-h-[300px]">
          <div className="absolute inset-0 bg-surface/80 z-0"></div>
          <div className="absolute inset-0 bg-[url('/images/workout-bg.png')] bg-cover bg-center mix-blend-multiply dark:mix-blend-overlay opacity-25 dark:opacity-40 z-0 border border-border/10"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="bg-primary text-black font-black uppercase tracking-widest text-[8px] inline-block px-2 py-1 mb-3">
                {summary?.workout_today ? "Today&apos;s Session" : "No Session Yet"}
              </div>
              {isLoading ? (
                <SkeletonBlock className="h-10 w-48 mb-6" />
              ) : (
                <h2 className="text-3xl text-foreground font-black uppercase tracking-tighter mb-6 leading-[1.1]">
                  {summary?.workout_today?.session_name || "Start Training"}
                </h2>
              )}
              
              {summary?.workout_today && (
                <div className="space-y-4 text-xs font-bold tracking-widest uppercase">
                  <div className="flex items-center justify-between border-b border-foreground/5 pb-2">
                    <span className="text-muted">Completed Sets</span>
                    <span className="text-foreground">{summary.workout_today.total_sets}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Status</span>
                    <span className={summary.workout_today.ended_at ? "text-muted" : "text-primary"}>
                      {summary.workout_today.ended_at ? "Completed" : "In Progress"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Link href="/dashboard/training" className="w-full bg-primary hover:bg-primary-hover text-black font-black uppercase tracking-widest py-4 mt-8 flex justify-center items-center gap-2 transition-colors">
              {summary?.workout_today ? "Continue Session →" : "Start Workout →"}
            </Link>
          </div>
        </div>
      </div>

      {/* Macros Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Protein */}
        <div className="bg-card rounded-sm p-6 border border-border/20 border-l-[3px] border-l-primary relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-[8px] text-muted font-bold uppercase tracking-[0.2em] mb-1">Macro: Muscle</div>
              <h3 className="text-foreground font-black uppercase tracking-widest text-lg">Protein</h3>
            </div>
            <Droplet className="text-primary" size={20} />
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            {isLoading ? <SkeletonBlock className="h-10 w-20" /> : (
              <>
                <span className="text-4xl font-black tracking-tighter text-foreground">{Math.round(macros.protein_g)}</span>
                <span className="text-[10px] text-muted font-bold tracking-widest uppercase">/ {proteinTarget} G</span>
              </>
            )}
          </div>
          <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-700" style={{ width: `${proteinPct}%` }}></div>
          </div>
        </div>

        {/* Carbohydrates */}
        <div className="bg-card rounded-sm p-6 border border-border/20 border-l-[3px] border-l-border relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-[8px] text-muted font-bold uppercase tracking-[0.2em] mb-1">Macro: Energy</div>
              <h3 className="text-foreground font-black uppercase tracking-widest text-lg">Carbohydrates</h3>
            </div>
            <Wheat className="text-muted" size={20} />
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            {isLoading ? <SkeletonBlock className="h-10 w-20" /> : (
              <>
                <span className="text-4xl font-black tracking-tighter text-foreground">{Math.round(macros.carbs_g)}</span>
                <span className="text-[10px] text-muted font-bold tracking-widest uppercase">/ {carbTarget} G</span>
              </>
            )}
          </div>
          <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-foreground transition-all duration-700" style={{ width: `${carbPct}%` }}></div>
          </div>
        </div>

        {/* Fats */}
        <div className="bg-card rounded-sm p-6 border border-border/20 border-l-[3px] border-l-border relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-[8px] text-muted font-bold uppercase tracking-[0.2em] mb-1">Macro: Hormonal</div>
              <h3 className="text-foreground font-black uppercase tracking-widest text-lg">Fats</h3>
            </div>
            <TrendingUp className="text-muted" size={20} />
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            {isLoading ? <SkeletonBlock className="h-10 w-20" /> : (
              <>
                <span className="text-4xl font-black tracking-tighter text-foreground">{Math.round(macros.fat_g)}</span>
                <span className="text-[10px] text-muted font-bold tracking-widest uppercase">/ {fatTarget} G</span>
              </>
            )}
          </div>
          <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-muted transition-all duration-700" style={{ width: `${fatPct}%` }}></div>
          </div>
        </div>
      </div>

      {/* Quick actions row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/analytics" className="bg-card rounded-sm p-6 border border-border/20 hover:border-primary/30 transition-colors flex items-center gap-4 group">
          <div className="w-12 h-12 bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <Scale size={20} className="text-primary" />
          </div>
          <div>
            <div className="text-[9px] text-muted font-bold uppercase tracking-widest mb-1">Quick Log</div>
            <div className="text-sm font-black uppercase tracking-widest">Log Today&apos;s Weight</div>
          </div>
        </Link>
        <Link href="/dashboard/meal-log" className="bg-card rounded-sm p-6 border border-border/20 hover:border-primary/30 transition-colors flex items-center gap-4 group">
          <div className="w-12 h-12 bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <Flame size={20} className="text-primary" />
          </div>
          <div>
            <div className="text-[9px] text-muted font-bold uppercase tracking-widest mb-1">Quick Log</div>
            <div className="text-sm font-black uppercase tracking-widest">Add Food Entry</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
