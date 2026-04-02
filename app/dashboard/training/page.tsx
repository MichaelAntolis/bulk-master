"use client";

import { useState, useEffect, useRef } from "react";
import { Dumbbell, TrendingUp, CheckCircle2, Trash2, Clock, Plus, Play, Square, Loader2 } from "lucide-react";
import { useWorkouts, useCreateWorkoutSession, useAddWorkoutSet, useDeleteWorkoutSet, useExerciseHistory } from "@/hooks/useBulkmaster";

const today = new Date().toISOString().split("T")[0];

// ─── Rest Timer ───────────────────────────────────────────────
function RestTimer() {
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState(90);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) { setRunning(false); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const reset = (d = duration) => { setRemaining(d); setRunning(false); };
  const setPreset = (s: number) => { setDuration(s); setRemaining(s); setRunning(false); };
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const pct = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;

  return (
    <div className="bg-card border border-border/20 rounded-sm p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <Clock className="text-primary" size={20} strokeWidth={2.5} />
        <h3 className="text-sm font-black tracking-widest uppercase">Rest Timer</h3>
      </div>
      <div className="text-center mb-10">
        <div className={`text-[4rem] md:text-[5rem] font-black tracking-tighter leading-none mb-6 font-mono ${remaining === 0 ? "text-primary animate-pulse" : "text-foreground"}`}>
          {fmt(remaining)}
        </div>
        <div className="h-1.5 w-full bg-input overflow-hidden">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>
        {remaining === 0 && <div className="text-primary text-[10px] font-black uppercase tracking-widest mt-3 animate-pulse">Rest Complete — Go!</div>}
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[60, 90, 120].map((s) => (
          <button key={s} onClick={() => setPreset(s)} className={`text-xs font-bold tracking-widest uppercase py-3 border transition-colors ${duration === s ? "bg-primary/10 border-primary text-primary" : "bg-input border-border/30 text-muted hover:text-foreground"}`}>{s}S</button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setRunning(!running)} className="flex-1 bg-primary hover:bg-primary-hover text-black font-black uppercase tracking-widest py-3 flex items-center justify-center gap-2 transition-colors">
          {running ? <><Square size={14} /> Stop</> : <><Play size={14} /> Start</>}
        </button>
        <button onClick={() => reset()} className="bg-input hover:bg-input border border-border/30 text-muted px-4 py-3 transition-colors">
          <Clock size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Progressive Overload Indicator ──────────────────────────
function OverloadIndicator({ exerciseName, currentWeight }: { exerciseName: string; currentWeight: number }) {
  const { data } = useExerciseHistory(exerciseName);
  const history = data?.history ?? [];
  const lastWeight = history.length > 0 ? history[0].max_weight : null;

  if (!exerciseName || !lastWeight) return null;

  const diff = currentWeight - lastWeight;
  const isOverload = diff > 0;

  return (
    <div className={`border p-4 md:p-5 flex gap-5 items-start ${isOverload ? "bg-primary/5 border-primary/20" : "bg-input border-border/30"}`}>
      <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${isOverload ? "bg-primary/10 text-primary" : "bg-input text-muted"}`}>
        <TrendingUp size={20} strokeWidth={2.5} />
      </div>
      <div className="pt-0.5">
        <div className={`text-[10px] font-black tracking-[0.2em] uppercase mb-1.5 ${isOverload ? "text-primary" : "text-muted"}`}>
          {isOverload ? `Overload Detected (+${diff.toFixed(1)}kg)` : `Previous: ${lastWeight}kg`}
        </div>
        <p className="text-xs md:text-sm text-muted font-medium tracking-wide">
          {isOverload ? `Last session: ${lastWeight}kg. You are logging ${diff.toFixed(1)}kg heavier!` : `Current weight matches or is below last session.`}
        </p>
      </div>
    </div>
  );
}

// ─── Set Log Form ─────────────────────────────────────────────
function SetLogForm({ sessionId }: { sessionId: string }) {
  const [form, setForm] = useState({ exercise_name: "", weight_kg: "", reps: "" });
  const { data: sessionData } = useWorkouts(today);
  const session = sessionData?.find((s: { id: string }) => s.id === sessionId);
  const sets = session?.workout_sets ?? [];
  
  const { mutate: addSet, isPending } = useAddWorkoutSet(sessionId);
  const { mutate: deleteSet } = useDeleteWorkoutSet(sessionId);

  const handleLog = () => {
    if (!form.exercise_name || !form.weight_kg || !form.reps) return;
    const setNumber = sets.filter((s: { exercise_name: string }) => s.exercise_name === form.exercise_name).length + 1;
    addSet({
      exercise_name: form.exercise_name,
      weight_kg: Number(form.weight_kg),
      reps: Number(form.reps),
      set_number: setNumber,
    }, { onSuccess: () => setForm((p) => ({ ...p, weight_kg: "", reps: "" })) });
  };

  return (
    <div className="lg:col-span-2 space-y-12">
      {/* Input Form */}
      <div className="bg-card border border-border/20 rounded-sm p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Dumbbell className="text-primary" size={28} strokeWidth={2.5} />
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none">Log Exercise</h2>
          </div>
        </div>

        <div className="mb-5">
          <label className="text-[9px] text-foreground font-bold tracking-widest uppercase block mb-2">Exercise Name</label>
          <input
            type="text"
            value={form.exercise_name}
            onChange={(e) => setForm((p) => ({ ...p, exercise_name: e.target.value }))}
            placeholder="e.g. Bench Press, Squat..."
            className="w-full bg-input border border-border/50 text-foreground px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted/50"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Weight (KG)", key: "weight_kg", type: "number" },
            { label: "Reps", key: "reps", type: "number" },
          ].map((f) => (
            <div key={f.key} className="space-y-2">
              <label className="text-[9px] text-foreground font-bold tracking-widest uppercase">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                className="w-full bg-white text-black font-black text-2xl px-4 h-[60px] focus:outline-none focus:ring-4 focus:ring-primary/50 transition-shadow"
              />
            </div>
          ))}
          <div className="col-span-2 md:col-span-1 flex items-end">
            <button onClick={handleLog} disabled={isPending || !form.exercise_name || !form.weight_kg || !form.reps} className="w-full h-[60px] bg-primary hover:bg-primary-hover text-black font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} strokeWidth={3} />} Log Set
            </button>
          </div>
        </div>

        {form.exercise_name && form.weight_kg && (
          <OverloadIndicator exerciseName={form.exercise_name} currentWeight={Number(form.weight_kg)} />
        )}
      </div>

      {/* Completed Sets */}
      {sets.length > 0 && (
        <div>
          <h3 className="text-sm font-black tracking-widest uppercase mb-6 text-foreground/80">Completed Sets</h3>
          <div className="space-y-3">
            {sets.map((set: { id: string; exercise_name: string; set_number: number; weight_kg: number; reps: number }, i: number) => (
              <div key={set.id} className="bg-card border border-border/20 border-l-[3px] border-l-primary p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                <div className="flex flex-wrap gap-6 md:gap-12">
                  <div>
                    <div className="text-[9px] text-muted font-bold tracking-widest uppercase mb-1">Exercise</div>
                    <div className="text-sm font-black tracking-tight truncate max-w-[140px]">{set.exercise_name}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-muted font-bold tracking-widest uppercase mb-1">Set</div>
                    <div className="text-xl md:text-2xl font-black">{String(set.set_number).padStart(2, "0")}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-muted font-bold tracking-widest uppercase mb-1">Load</div>
                    <div className="text-xl md:text-2xl font-black tracking-tighter">{set.weight_kg} <span className="text-sm text-foreground/50 tracking-widest">KG</span></div>
                  </div>
                  <div>
                    <div className="text-[9px] text-muted font-bold tracking-widest uppercase mb-1">Reps</div>
                    <div className="text-xl md:text-2xl font-black">{set.reps}</div>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <CheckCircle2 size={22} className="text-primary drop-shadow-[0_0_8px_rgba(174,230,0,0.5)]" strokeWidth={3} />
                  <button onClick={() => deleteSet(set.id)} className="text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainingPage() {
  const { data: sessions, isLoading } = useWorkouts(today);
  const { mutate: createSession, isPending: creating } = useCreateWorkoutSession();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const currentSession = sessions?.find((s: { id: string }) => s.id === activeSessionId) ?? sessions?.[0] ?? null;

  return (
    <div className="flex flex-col min-h-full animate-in fade-in zoom-in-95 duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-foreground leading-none mb-3">
            Training <span className="text-primary">Log</span>
          </h1>
          {currentSession ? (
            <p className="text-muted text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
              Session: {currentSession.session_name} <span className="mx-3 text-border">|</span> {currentSession.workout_sets?.length ?? 0} Sets Logged
            </p>
          ) : (
            <p className="text-muted text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">No active session today</p>
          )}
        </div>
        
        {!currentSession && (
          <button
            onClick={() => createSession({ session_name: "Workout Session" }, { onSuccess: (s) => setActiveSessionId(s.id) })}
            disabled={creating}
            className="bg-primary hover:bg-primary-hover text-black font-black uppercase tracking-widest px-8 py-4 flex items-center gap-3 transition-colors disabled:opacity-50"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Start Session
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="h-64 bg-card border border-border/20 animate-pulse" />
      ) : !currentSession ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border/40 text-center">
          <Dumbbell className="text-muted mb-4" size={40} strokeWidth={1.5} />
          <h3 className="font-black uppercase tracking-widest text-lg mb-2">No Session Today</h3>
          <p className="text-muted text-sm">Start a session to begin logging your sets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <SetLogForm sessionId={currentSession.id} />
          <div className="space-y-6">
            <RestTimer />
            {/* Session Volume Widget */}
            <div className="bg-card border border-border/20 rounded-sm p-6 md:p-8">
              <h3 className="text-sm font-black tracking-widest uppercase mb-6">Session Volume</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-black tracking-tighter text-primary leading-none">
                  {(currentSession.workout_sets ?? []).reduce((sum: number, s: { weight_kg: number; reps: number }) => sum + (s.weight_kg * s.reps), 0).toLocaleString()}
                </span>
                <span className="text-[9px] text-muted font-bold tracking-[0.2em] uppercase">Total KG</span>
              </div>
              <div className="space-y-3 text-xs font-bold tracking-widest uppercase">
                <div className="flex justify-between items-center border-b border-border/10 pb-3">
                  <span className="text-muted">Total Sets</span>
                  <span className="text-foreground">{currentSession.workout_sets?.length ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Status</span>
                  <span className={currentSession.ended_at ? "text-muted" : "text-primary"}>
                    {currentSession.ended_at ? "Completed" : "In Progress"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
