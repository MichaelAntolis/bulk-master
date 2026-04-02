import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─────────────────────────────────────────
// DASHBOARD SUMMARY
// ─────────────────────────────────────────
export function useDashboardSummary(date?: string) {
  const today = date || new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: ["dashboard-summary", today],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/summary?date=${today}`);
      if (!res.ok) throw new Error("Failed to fetch summary");
      return res.json();
    },
    staleTime: 30_000,
  });
}

// ─────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
}

// ─────────────────────────────────────────
// FOOD LOGS
// ─────────────────────────────────────────
export function useFoodLogs(date?: string) {
  const today = date || new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: ["food-logs", today],
    queryFn: async () => {
      const res = await fetch(`/api/food-logs?date=${today}`);
      if (!res.ok) throw new Error("Failed to fetch food logs");
      return res.json();
    },
  });
}

export function useAddFoodLog(date?: string) {
  const qc = useQueryClient();
  const today = date || new Date().toISOString().split("T")[0];
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/food-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add food");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["food-logs", today] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
}

export function useDeleteFoodLog(date?: string) {
  const qc = useQueryClient();
  const today = date || new Date().toISOString().split("T")[0];
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/food-logs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete food");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["food-logs", today] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
}

// ─────────────────────────────────────────
// FOOD SEARCH (Open Food Facts)
// ─────────────────────────────────────────
export function useFoodSearch(query: string) {
  return useQuery({
    queryKey: ["food-search", query],
    queryFn: async () => {
      if (!query || query.trim().length < 2) return { results: [] };
      const res = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: query.trim().length >= 2,
    staleTime: 3_600_000, // 1 hour
  });
}

// ─────────────────────────────────────────
// WORKOUTS
// ─────────────────────────────────────────
export function useWorkouts(date?: string) {
  const today = date || new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: ["workouts", today],
    queryFn: async () => {
      const res = await fetch(`/api/workouts?date=${today}`);
      if (!res.ok) throw new Error("Failed to fetch workouts");
      return res.json();
    },
  });
}

export function useCreateWorkoutSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { session_name?: string; notes?: string }) => {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create session");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workouts"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
}

export function useAddWorkoutSet(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      exercise_name: string;
      weight_kg: number;
      reps: number;
      set_number: number;
    }) => {
      const res = await fetch(`/api/workouts/${sessionId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add set");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workouts"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
}

export function useDeleteWorkoutSet(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (setId: string) => {
      const res = await fetch(`/api/workouts/${sessionId}/sets/${setId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete set");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useExerciseHistory(exerciseName: string) {
  return useQuery({
    queryKey: ["exercise-history", exerciseName],
    queryFn: async () => {
      const res = await fetch(
        `/api/workouts/history?exercise=${encodeURIComponent(exerciseName)}&limit=5`
      );
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
    enabled: exerciseName.trim().length > 0,
    staleTime: 60_000,
  });
}

// ─────────────────────────────────────────
// WEIGHT LOGS
// ─────────────────────────────────────────
export function useWeightLogs(range: number = 90) {
  return useQuery({
    queryKey: ["weight-logs", range],
    queryFn: async () => {
      const res = await fetch(`/api/weight-logs?range=${range}`);
      if (!res.ok) throw new Error("Failed to fetch weight logs");
      return res.json();
    },
  });
}

export function useLogWeight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { weight_kg: number; notes?: string }) => {
      const res = await fetch("/api/weight-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to log weight");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weight-logs"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
}

// ─────────────────────────────────────────
// PROGRESS PHOTOS
// ─────────────────────────────────────────
export function useProgressPhotos() {
  return useQuery({
    queryKey: ["progress-photos"],
    queryFn: async () => {
      const res = await fetch("/api/progress-photos");
      if (!res.ok) return { photos: [] };
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useUploadPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, label, type }: { file: File; label?: string; type: "progress" | "avatar" }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      if (label) formData.append("label", label);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      return data as { url: string; path: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["progress-photos"] });
    },
  });
}

export function useDeleteProgressPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, path }: { id: string; path?: string }) => {
      const url = path
        ? `/api/progress-photos/${encodeURIComponent(id)}?path=${encodeURIComponent(path)}`
        : `/api/progress-photos/${encodeURIComponent(id)}`;
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Delete failed");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["progress-photos"] });
    },
  });
}
