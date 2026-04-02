"use client";

import { useState, useRef } from "react";
import { ArrowRight, Camera, Scale, Loader2, Upload, Trash2 } from "lucide-react";
import { useWeightLogs, useLogWeight, useWorkouts, useProgressPhotos, useUploadPhoto, useDeleteProgressPhoto } from "@/hooks/useBulkmaster";
import { useQuery } from "@tanstack/react-query";

// ─── Weight Chart (SVG line chart from real data) ─────────────
function WeightChart({ logs }: { logs: { weight_kg: number; log_date: string }[] }) {
  if (!logs || logs.length < 2) {
    return (
      <div className="flex-1 min-h-[180px] flex items-center justify-center">
        <p className="text-muted text-xs font-bold uppercase tracking-widest">Log at least 2 weights to see trajectory</p>
      </div>
    );
  }

  const weights = logs.map((l) => Number(l.weight_kg));
  const minW = Math.min(...weights) - 0.5;
  const maxW = Math.max(...weights) + 0.5;
  const range = maxW - minW || 1;
  const n = logs.length;

  // Build SVG path
  const points = logs.map((l, i) => {
    const x = (i / (n - 1)) * 100;
    const y = 40 - ((Number(l.weight_kg) - minW) / range) * 36;
    return `${x} ${y}`;
  });
  const pathD = `M ${points.join(" L ")}`;
  const areaD = `M ${points[0]} L ${points.join(" L ")} L 100 40 L 0 40 Z`;

  const gain = weights[weights.length - 1] - weights[0];

  return (
    <div className="flex-1 w-full relative flex flex-col justify-end min-h-[180px]">
      <div className="flex justify-between text-[9px] text-muted font-bold uppercase tracking-widest mb-2">
        <span>{minW.toFixed(1)} kg</span>
        <span className={`font-black ${gain >= 0 ? "text-primary" : "text-red-400"}`}>
          {gain >= 0 ? "+" : ""}{gain.toFixed(1)} kg trend
        </span>
        <span>{maxW.toFixed(1)} kg</span>
      </div>
      <div className="absolute w-full h-[1px] bg-white/[0.03] bottom-[25%]" />
      <div className="absolute w-full h-[1px] bg-white/[0.03] bottom-[50%]" />
      <div className="absolute w-full h-[1px] bg-white/[0.03] bottom-[75%]" />
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full overflow-visible z-10 min-h-[150px]">
        <defs>
          <linearGradient id="weight-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#aee600" />
            <stop offset="100%" stopColor="rgba(174,230,0,0)" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#weight-grad)" opacity="0.1" />
        <path d={pathD} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary drop-shadow-[0_0_12px_rgba(174,230,0,0.5)]" />
        {/* Latest point */}
        <circle cx={100} cy={40 - ((weights[weights.length - 1] - minW) / range) * 36}
          r="2" fill="#aee600" className="drop-shadow-[0_0_8px_rgba(174,230,0,0.8)]" />
      </svg>
      <div className="flex justify-between text-[9px] font-bold tracking-[0.2em] uppercase text-[#555] mt-4 border-t border-white/[0.05] pt-3">
        <span>{logs[0]?.log_date?.slice(5)}</span>
        <span>{logs[Math.floor(n / 2)]?.log_date?.slice(5)}</span>
        <span className="text-primary">{logs[n - 1]?.log_date?.slice(5)}</span>
      </div>
    </div>
  );
}

// ─── Weekly Load Volume (from real workout sets) ──────────────
function WeeklyLoadChart() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();

  // Get last 7 days dates
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const todayDay = (today.getDay() + 6) % 7; // 0=Mon, 6=Sun

  // Fetch workout data for each day
  const queries = dates.map((date) =>
    useQuery({
      queryKey: ["workouts", date],
      queryFn: async () => {
        const res = await fetch(`/api/workouts?date=${date}`);
        return res.ok ? res.json() : [];
      },
      staleTime: 300_000,
    })
  );

  const volumes = dates.map((_, i) => {
    const sessions = queries[i].data ?? [];
    return sessions.reduce((total: number, sess: { workout_sets?: { weight_kg: number; reps: number }[] }) => {
      return total + (sess.workout_sets ?? []).reduce(
        (s: number, set: { weight_kg: number; reps: number }) => s + Number(set.weight_kg) * Number(set.reps), 0
      );
    }, 0);
  });

  const maxVol = Math.max(...volumes, 1);
  const totalVolume = volumes.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-card border border-border/20 p-6 md:p-8 mb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h3 className="text-xl md:text-2xl font-black tracking-tighter uppercase mb-1">Weekly Load Volume</h3>
          <p className="text-xs text-muted font-medium tracking-wide">Total tonnage across all sessions this week.</p>
        </div>
        <div className="flex flex-col">
          <span className="text-4xl md:text-5xl font-black tracking-tighter text-primary leading-none">
            {(totalVolume / 1000).toFixed(1)}<span className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase relative -top-1 ml-2">Total T</span>
          </span>
        </div>
      </div>

      <div className="h-56 w-full flex items-end justify-between gap-[2px] sm:gap-4 md:gap-8 px-2 border-b border-border/20 relative">
        <div className="absolute w-full h-[1px] bg-white/[0.03] bottom-[25%]" />
        <div className="absolute w-full h-[1px] bg-white/[0.03] bottom-[50%]" />
        <div className="absolute w-full h-[1px] bg-white/[0.03] bottom-[75%]" />
        {days.map((day, i) => {
          const pct = (volumes[i] / maxVol) * 85;
          const isToday = i === todayDay;
          const hasData = volumes[i] > 0;
          return (
            <div key={day} className="flex flex-col items-center flex-1 h-full justify-end group relative">
              {hasData && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-primary text-[9px] font-bold text-primary px-2 py-0.5 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {volumes[i].toLocaleString()} kg
                </div>
              )}
              <div
                className={`w-full mb-3 border-t-2 transition-all ${
                  isToday && hasData
                    ? "bg-primary shadow-[0_0_20px_rgba(174,230,0,0.15)] border-primary"
                    : hasData
                    ? "bg-foreground/20 border-foreground/30 group-hover:bg-foreground/30"
                    : "bg-transparent border-dashed border-foreground/10"
                }`}
                style={{ height: `${Math.max(pct, 3)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center text-[9px] font-bold tracking-[0.2em] uppercase text-[#555] mt-4 px-2">
        {days.map((d, i) => (
          <span key={d} className={i === todayDay ? "text-primary drop-shadow-[0_0_5px_rgba(174,230,0,0.5)]" : ""}>{d}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Progress Photo Gallery ───────────────────────────────────
interface ProgressPhoto {
  id?: string;
  url: string;
  label: string;
  taken_at?: string;
}

function ProgressGallery() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load persisted photos from Supabase
  const { data: photoData, isLoading: photosLoading } = useProgressPhotos();
  const photos: ProgressPhoto[] = photoData?.photos ?? [];

  // Upload mutation — auto-invalidates progress-photos query on success
  const { mutate: uploadPhoto, isPending: uploading } = useUploadPhoto();
  const { mutate: deletePhoto } = useDeleteProgressPhoto();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    uploadPhoto(
      { file, label: label || `Progress Photo ${new Date().toLocaleDateString()}`, type: "progress" },
      {
        onSuccess: () => setLabel(""),
        onError: (err: Error) => setUploadError(err.message),
        onSettled: () => {
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
      }
    );
  };

  const handleDelete = (photo: ProgressPhoto) => {
    const photoId = photo.id ?? photo.url;
    setDeletingId(photoId);
    // Extract storage path from public URL
    // URL format: .../object/public/bulkmaster-media/{userId}/progress/{filename}
    let storagePath: string | undefined;
    try {
      const urlObj = new URL(photo.url);
      const pathParts = urlObj.pathname.split("/object/public/bulkmaster-media/");
      if (pathParts[1]) storagePath = pathParts[1];
    } catch {
      // ignore
    }
    deletePhoto(
      { id: photoId, path: storagePath },
      { onSettled: () => setDeletingId(null) }
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">Visual Evolution</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Photo label (optional)"
            className="bg-input border border-border/50 text-foreground px-3 py-2 text-xs focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted/50 w-40"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="border border-primary text-primary hover:bg-primary/5 text-[9px] font-black tracking-[0.2em] uppercase px-5 py-2.5 flex items-center gap-3 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            {uploading ? "Uploading..." : "Upload New"}
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleUpload} className="hidden" />
        </div>
      </div>

      {uploadError && (
        <div className="mb-6 p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold">
          ⚠ {uploadError}
          {(uploadError.includes("bucket") || uploadError.includes("storage") || uploadError.includes("Upload failed")) && (
            <span className="block mt-1 text-[10px] normal-case font-normal">
              Pastikan bucket &ldquo;bulkmaster-media&rdquo; sudah dibuat di Supabase Dashboard → Storage, dan policies sudah diset (lihat tutorial_setup.md Langkah 1.5).
            </span>
          )}
        </div>
      )}

      {/* Loading state */}
      {photosLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] bg-card border border-border/20 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!photosLoading && photos.length === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border/40 hover:border-primary/40 transition-colors p-16 flex flex-col items-center justify-center gap-4 cursor-pointer group"
        >
          <Upload size={32} className="text-muted group-hover:text-primary transition-colors" />
          <div className="text-center">
            <p className="font-black uppercase tracking-widest text-muted group-hover:text-foreground transition-colors">Upload Progress Photo</p>
            <p className="text-[11px] text-muted/60 mt-1">JPG, PNG, or WebP · Max 5MB · Saved to your account</p>
          </div>
        </div>
      )}

      {/* Photo grid */}
      {!photosLoading && photos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {photos.map((photo, i) => (
            <div
              key={photo.id ?? i}
              className={`group relative aspect-[3/4] overflow-hidden bg-card border rounded-sm ${
                i === 0
                  ? "border-2 border-primary shadow-[0_0_30px_rgba(174,230,0,0.15)] md:col-span-2 xl:col-span-1"
                  : "border-border/20"
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{
                  backgroundImage: `url(${photo.url})`,
                  filter: i === 0 ? "none" : "saturate(0) contrast(1.1) brightness(0.8)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              {i === 0 && (
                <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(174,230,0,1)] animate-pulse" />
              )}
              <div className="absolute top-4 left-4 bg-primary/10 text-primary px-3 py-1.5 text-[8px] font-black tracking-[0.15em] uppercase border border-primary/20">
                {i === 0 ? "Latest" : `Photo ${photos.length - i}`}
              </div>

              {/* Hover delete button */}
              <button
                onClick={() => handleDelete(photo)}
                disabled={deletingId === (photo.id ?? photo.url)}
                className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 text-white w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 z-10 disabled:opacity-60"
                title="Delete photo"
              >
                {deletingId === (photo.id ?? photo.url)
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Trash2 size={14} strokeWidth={2.5} />}
              </button>

              <div className="absolute bottom-6 left-6 right-6">
                <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-1 drop-shadow-lg line-clamp-1">
                  {photo.label}
                </h4>
                {photo.taken_at && (
                  <p className="text-[10px] text-primary font-bold tracking-widest uppercase">
                    {new Date(photo.taken_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Add more slot */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[3/4] border-2 border-dashed border-border/30 hover:border-primary/40 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-colors"
          >
            <Upload size={24} className="text-muted group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-foreground">Add Photo</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Analytics Page ──────────────────────────────────────
export default function AnalyticsPage() {
  const [weight, setWeight] = useState("");
  const { data: weightLogs = [], isLoading: logsLoading } = useWeightLogs(90);
  const { mutate: logWeight, isPending: logging } = useLogWeight();

  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight_kg : null;

  const handleLogWeight = () => {
    const val = parseFloat(weight);
    if (!val || val < 20 || val > 300) return;
    logWeight(
      { weight_kg: val },
      { onSuccess: () => setWeight("") }
    );
  };

  return (
    <div className="flex flex-col min-h-full animate-in fade-in zoom-in-95 duration-500 pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div>
          <p className="text-muted text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-2">Performance Hub</p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
            Progress<br /><span className="text-primary">Engine.</span>
          </h1>
        </div>
        <div className="text-left md:text-right">
          <div className="text-[9px] text-muted font-bold tracking-[0.2em] uppercase mb-1">Current Mass</div>
          {logsLoading ? (
            <div className="h-12 w-32 bg-input animate-pulse" />
          ) : (
            <div className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground leading-none">
              {latestWeight ? Number(latestWeight).toFixed(1) : "—"}
              <span className="text-xl text-primary md:text-2xl ml-1 tracking-widest uppercase">kg</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid 1: Daily Entry + Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Daily Weight Entry */}
        <div className="bg-card border-t-[3px] border-t-primary border-b border-x border-border/20 p-6 md:p-8 flex flex-col justify-between shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-4 mb-4">
            <Scale className="text-foreground" size={24} strokeWidth={2.5} />
            <h3 className="text-sm font-black tracking-widest uppercase">Log Morning Weight</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-4 mb-6">
            <div className="relative">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogWeight()}
                placeholder={latestWeight ? Number(latestWeight).toFixed(1) : "00.0"}
                step="0.1"
                min="20"
                max="300"
                className="w-full bg-input text-foreground font-black text-4xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-left placeholder:text-muted/20 border border-border/50"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-muted font-black tracking-widest uppercase text-lg">KG</span>
            </div>
            
            <button
              onClick={handleLogWeight}
              disabled={logging || !weight}
              className="w-full bg-primary hover:bg-primary-hover text-black font-black uppercase tracking-widest py-5 flex justify-between items-center px-6 transition-colors shadow-lg shadow-primary/10 disabled:opacity-50"
            >
              {logging ? (
                <span className="flex items-center gap-2 mx-auto"><Loader2 size={16} className="animate-spin" /> Logging...</span>
              ) : (
                <>Log Morning Weight <ArrowRight size={20} strokeWidth={3} /></>
              )}
            </button>
          </div>

          {/* Last 5 entries */}
          {weightLogs.length > 0 && (
            <div className="border-t border-foreground/5 pt-4 space-y-1.5">
              <div className="text-[9px] text-muted font-bold uppercase tracking-widest mb-2">Recent</div>
              {[...weightLogs].reverse().slice(0, 4).map((log, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-muted">{new Date(log.log_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span className={`font-black ${i === 0 ? "text-primary" : "text-foreground"}`}>{Number(log.weight_kg).toFixed(1)} kg</span>
                </div>
              ))}
            </div>
          )}

          {weightLogs.length === 0 && !logsLoading && (
            <div className="border-t border-foreground/5 pt-4">
              <p className="text-[9px] text-muted font-bold uppercase tracking-[0.1em] leading-relaxed">
                Recommended: Log immediately after waking, before eating.
              </p>
            </div>
          )}
        </div>

        {/* Mass Trajectory Chart */}
        <div className="bg-card border border-border/20 p-6 md:p-8 lg:col-span-2 flex flex-col relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-black tracking-widest uppercase">Mass Trajectory</h3>
              <span className="bg-input text-muted text-[9px] font-bold tracking-widest px-2 py-0.5 border border-border/30 rounded-sm">90D</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase text-muted">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Weight Trend
            </div>
          </div>
          {logsLoading ? (
            <div className="flex-1 min-h-[180px] bg-input/30 animate-pulse" />
          ) : (
            <WeightChart logs={weightLogs} />
          )}
        </div>
      </div>

      {/* Weekly Load Volume - Real Data */}
      <WeeklyLoadChart />

      {/* Visual Evolution - Real Photos */}
      <ProgressGallery />
    </div>
  );
}
