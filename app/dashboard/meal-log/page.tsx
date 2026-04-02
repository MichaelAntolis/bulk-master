"use client";

import { useState, useEffect, useCallback } from "react";
import { Sun, Moon, Search, Trash2, Plus, Coffee, X, Loader2 } from "lucide-react";
import { useFoodLogs, useAddFoodLog, useDeleteFoodLog, useFoodSearch } from "@/hooks/useBulkmaster";

// Inline debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const today = new Date().toISOString().split("T")[0];
const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface FoodSearchResult {
  food_name: string;
  brand: string;
  barcode: string;
  calories_per_100g: number;
  protein_g_per_100g: number;
  carbs_g_per_100g: number;
  fat_g_per_100g: number;
}

interface AddFoodModalProps {
  mealType: MealType;
  onClose: () => void;
}

function AddFoodModal({ mealType, onClose }: AddFoodModalProps) {
  const [query, setQuery] = useState("");
  const [serving, setServing] = useState(100);
  const [selected, setSelected] = useState<FoodSearchResult | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manual, setManual] = useState({ food_name: "", calories: "", protein_g: "", carbs_g: "", fat_g: "" });

  const debouncedQuery = useDebounce(query, 400);
  const { data: searchData, isFetching } = useFoodSearch(debouncedQuery);
  const { mutate: addFood, isPending } = useAddFoodLog(today);

  const handleSelectResult = (item: FoodSearchResult) => {
    setSelected(item);
    setQuery(item.food_name);
  };

  const calculatedCalories = selected ? Math.round(selected.calories_per_100g * serving / 100) : null;
  const calculatedProtein = selected ? Math.round(selected.protein_g_per_100g * serving / 100 * 10) / 10 : null;
  const calculatedCarbs = selected ? Math.round(selected.carbs_g_per_100g * serving / 100 * 10) / 10 : null;
  const calculatedFat = selected ? Math.round(selected.fat_g_per_100g * serving / 100 * 10) / 10 : null;

  const handleSubmit = () => {
    if (manualMode) {
      if (!manual.food_name || !manual.calories) return;
      addFood({
        food_name: manual.food_name,
        meal_type: mealType,
        calories: Number(manual.calories),
        protein_g: Number(manual.protein_g) || 0,
        carbs_g: Number(manual.carbs_g) || 0,
        fat_g: Number(manual.fat_g) || 0,
        serving_g: 100,
        log_date: today,
      }, { onSuccess: onClose });
    } else if (selected && calculatedCalories !== null) {
      addFood({
        food_name: selected.food_name,
        brand: selected.brand,
        barcode: selected.barcode,
        meal_type: mealType,
        calories: calculatedCalories,
        protein_g: calculatedProtein ?? 0,
        carbs_g: calculatedCarbs ?? 0,
        fat_g: calculatedFat ?? 0,
        serving_g: serving,
        log_date: today,
      }, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-border/50 w-full max-w-lg shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border/20 flex justify-between items-center sticky top-0 bg-surface z-10">
          <div>
            <div className="text-[9px] text-primary font-bold uppercase tracking-widest mb-0.5">Add Food</div>
            <h3 className="text-lg font-black uppercase tracking-tight">
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Mode toggle */}
          <div className="flex gap-3">
            <button onClick={() => setManualMode(false)} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest border transition-colors ${!manualMode ? "bg-primary text-black border-primary" : "border-border text-muted hover:border-primary/30"}`}>
              Search Database
            </button>
            <button onClick={() => setManualMode(true)} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest border transition-colors ${manualMode ? "bg-primary text-black border-primary" : "border-border text-muted hover:border-primary/30"}`}>
              Manual Entry
            </button>
          </div>

          {!manualMode ? (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                {isFetching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-muted animate-spin" size={16} />}
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
                  placeholder="Search food (e.g. chicken breast)..."
                  className="w-full bg-input border border-border/50 text-foreground px-12 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted/60"
                  autoFocus
                />
              </div>

              {/* Fallback notice */}
              {!selected && searchData?.notice && (
                <div className="text-[10px] text-amber-500/80 bg-amber-500/5 border border-amber-500/20 px-3 py-2 font-medium">
                  ⚠ {searchData.notice}
                </div>
              )}

              {/* Results */}
              {!selected && searchData?.results?.length > 0 && (
                <div className="border border-border/30 divide-y divide-border/20 max-h-48 overflow-y-auto">
                  {searchData.source === "local" && (
                    <div className="px-4 py-2 bg-input/50 text-[9px] text-muted font-bold uppercase tracking-widest">
                      Local Database
                    </div>
                  )}
                  {searchData.results.map((item: FoodSearchResult, i: number) => (
                    <button key={i} onClick={() => handleSelectResult(item)} className="w-full text-left px-4 py-3 hover:bg-foreground/5 transition-colors">
                      <div className="font-bold text-xs text-foreground">{item.food_name}</div>
                      <div className="text-[10px] text-muted">{item.brand ? `${item.brand} · ` : ""}{item.calories_per_100g} kcal/100g</div>
                    </button>
                  ))}
                </div>
              )}
              {!selected && debouncedQuery.length >= 2 && searchData?.results?.length === 0 && !isFetching && (
                <p className="text-[11px] text-muted text-center py-2">No results found. Try manual entry.</p>
              )}

              {/* Selected: serving size */}
              {selected && (
                <div className="bg-input border border-primary/20 p-4 space-y-3">
                  <div className="font-bold text-sm text-foreground">{selected.food_name}</div>
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] text-muted font-bold uppercase tracking-widest whitespace-nowrap">Serving (g)</label>
                    <input type="number" value={serving} onChange={(e) => setServing(Number(e.target.value))} min={1} className="bg-surface border border-border/50 text-foreground px-3 py-2 w-24 text-center font-bold focus:outline-none focus:border-primary/50" />
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    <div><div className="font-black text-foreground">{calculatedCalories}</div><div className="text-muted">kcal</div></div>
                    <div><div className="font-black text-foreground">{calculatedProtein}g</div><div className="text-muted">protein</div></div>
                    <div><div className="font-black text-foreground">{calculatedCarbs}g</div><div className="text-muted">carbs</div></div>
                    <div><div className="font-black text-foreground">{calculatedFat}g</div><div className="text-muted">fat</div></div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Manual entry form */
            <div className="space-y-4">
              {[
                { key: "food_name", label: "Food Name", type: "text", placeholder: "e.g. Chicken Breast" },
                { key: "calories", label: "Calories (kcal)", type: "number", placeholder: "165" },
                { key: "protein_g", label: "Protein (g)", type: "number", placeholder: "31" },
                { key: "carbs_g", label: "Carbs (g)", type: "number", placeholder: "0" },
                { key: "fat_g", label: "Fat (g)", type: "number", placeholder: "3.6" },
              ].map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="text-[10px] text-muted font-bold uppercase tracking-widest">{field.label}</label>
                  <input
                    type={field.type}
                    value={manual[field.key as keyof typeof manual]}
                    onChange={(e) => setManual((p) => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-input border border-border/50 text-foreground px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isPending || (!manualMode && !selected) || (manualMode && !manual.food_name)}
            className="w-full bg-primary text-black font-black uppercase tracking-widest py-3 hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? <><Loader2 size={16} className="animate-spin" /> Adding...</> : <>Add to {mealType.charAt(0).toUpperCase() + mealType.slice(1)} →</>}
          </button>
        </div>
      </div>
    </div>
  );
}

interface FoodLogItem {
  id: string;
  food_name: string;
  brand?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_g: number;
}

function MealSection({ title, icon, mealType, items }: {
  title: string; icon: React.ReactNode; mealType: MealType; items: FoodLogItem[];
}) {
  const [showModal, setShowModal] = useState(false);
  const { mutate: deleteFood } = useDeleteFoodLog(today);

  return (
    <>
      {showModal && <AddFoodModal mealType={mealType} onClose={() => setShowModal(false)} />}
      <div className="bg-card border border-border/20 rounded-sm p-6 md:p-8 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {icon}
            <h3 className="text-xl font-black tracking-tight uppercase">{title}</h3>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-[10px] font-bold uppercase tracking-widest border border-primary/20 hover:border-primary/50 px-3 py-2">
            <Plus size={12} /> Add
          </button>
        </div>

        {items.length === 0 ? (
          <div className="mb-6 border border-dashed border-border/40 py-8 flex items-center justify-center">
            <span className="text-xs font-bold text-muted tracking-wide">No entries yet.</span>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-start border-l-4 border-l-primary pl-4 py-2 hover:bg-foreground/5 transition-colors group">
                <div className="flex-1 min-w-0 mr-3">
                  <h4 className="font-bold text-sm text-foreground tracking-wide mb-0.5 truncate">{item.food_name}</h4>
                  <div className="text-[9px] text-muted font-bold uppercase tracking-widest">{item.serving_g}g {item.brand ? `· ${item.brand}` : ""}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-black text-sm text-foreground">{Math.round(item.calories)} kcal</div>
                    <div className="text-[9px] text-muted font-bold tracking-widest">P:{Math.round(item.protein_g)}g C:{Math.round(item.carbs_g)}g F:{Math.round(item.fat_g)}g</div>
                  </div>
                  <button onClick={() => deleteFood(item.id)} className="text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function MealLogPage() {
  const { data: logs, isLoading } = useFoodLogs(today);

  return (
    <div className="flex flex-col min-h-full animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-foreground leading-none mb-3">
            Nutrition <span className="text-primary">Log</span>
          </h1>
          <p className="text-muted text-sm font-medium tracking-wide">{todayLabel} — Fueling the Machine</p>
        </div>
        {/* Daily Totals */}
        {logs?.totals && (
          <div className="bg-card border border-border/20 px-6 py-4 text-right">
            <div className="text-[9px] text-muted font-bold uppercase tracking-widest mb-1">Today Total</div>
            <div className="text-2xl font-black text-foreground">{Math.round(logs.totals.calories).toLocaleString()} <span className="text-xs text-muted">kcal</span></div>
            <div className="text-[10px] text-muted mt-1">P:{Math.round(logs.totals.protein_g)}g · C:{Math.round(logs.totals.carbs_g)}g · F:{Math.round(logs.totals.fat_g)}g</div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-card border border-border/20 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          <div className="lg:col-span-2 space-y-6">
            <MealSection title="Breakfast" icon={<Sun className="text-primary" size={24} strokeWidth={2.5} />} mealType="breakfast" items={logs?.breakfast ?? []} />
            <MealSection title="Lunch" icon={<Sun className="text-muted" size={24} strokeWidth={2.5} />} mealType="lunch" items={logs?.lunch ?? []} />
            <MealSection title="Dinner" icon={<Moon className="text-muted" size={24} strokeWidth={2.5} />} mealType="dinner" items={logs?.dinner ?? []} />
          </div>
          <div className="col-span-1">
            <MealSection title="Snacks" icon={<Coffee className="text-muted" size={20} strokeWidth={2.5} />} mealType="snack" items={logs?.snack ?? []} />
          </div>
        </div>
      )}
    </div>
  );
}
