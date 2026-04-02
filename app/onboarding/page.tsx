"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Activity, Dumbbell, Zap, BedDouble, ChevronLeft, ChevronRight, ArrowRight, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "",
    activity: "",
    surplus: "+500"
  });

  const TOTAL_STEPS = 4;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const startStep = searchParams.get("step");
      if (startStep && !isNaN(Number(startStep))) {
        setStep(Math.min(Math.max(Number(startStep), 1), TOTAL_STEPS));
      }
    }
  }, []);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // TDEE Calculation (Mifflin-St Jeor)
  const calculateTDEE = () => {
    if (!data.weight || !data.height || !data.age || !data.gender || !data.activity) return "---";
    let bmr = 10 * Number(data.weight) + 6.25 * Number(data.height) - 5 * Number(data.age);
    bmr += data.gender === "MALE" ? 5 : -161;
    let multiplier = 1.2;
    if (data.activity === "MODERATE") multiplier = 1.375;
    if (data.activity === "ACTIVE") multiplier = 1.55;
    if (data.activity === "ATHLETE") multiplier = 1.725;
    return Math.round(bmr * multiplier).toLocaleString();
  };

  const getStepInfo = () => {
    switch (step) {
      case 1: return { title: "System Initialization", subtitle: "Prepare your digital ecosystem for maximum hypertrophy. We map your starting point to architect the perfect trajectory." };
      case 2: return { title: "Engine Calibration", subtitle: "Precision metrics drive maximum hypertrophy. We calculate your baseline physical engine output to ensure optimal calibration." };
      case 3: return { title: "Target Calculator", subtitle: "Determine your daily metabolic burnout. We align your activity baseline with scientific TDEE algorithms." };
      case 4: return { title: "Bulking Parameters", subtitle: "Set the ultimate surplus threshold. Choose your rate of lean mass gain and lock in your daily nutrition goals." };
      default: return { title: "", subtitle: "" };
    }
  };

  const { title, subtitle } = getStepInfo();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow flex flex-col md:flex-row w-full min-h-[800px]">
        
        {/* Left Column */}
        <div className="w-full md:w-[40%] bg-surface border-r border-border/30 p-10 lg:p-16 xl:p-24 flex justify-end relative overflow-hidden">
          <div className="w-full max-w-md flex flex-col h-full">
            <div className="relative z-10 flex-grow">
              
              <div className="mt-32 relative">
                 <div className="absolute -top-16 -left-6 text-[100px] font-black text-foreground/5 tracking-tighter leading-none pointer-events-none select-none">
                   STEP<br/>0{step}
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground mb-6 leading-none">
                   {title}
                 </h1>
                 <p className="text-muted text-base leading-relaxed">
                   {subtitle}
                 </p>
              </div>
            </div>

            <div className="relative z-10 mt-24">
               <div className="flex items-center gap-4 border-l-4 border-primary pl-4">
                  <div className="bg-primary text-black p-3">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary uppercase tracking-widest text-[11px] mb-1">Live Sync</h4>
                    <div className="text-muted text-[10px] uppercase tracking-wider">Real-time metabolic tracking</div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column (Form Area) */}
        <div className="w-full md:w-[60%] pt-24 md:pt-32 p-10 lg:p-16 xl:p-24 bg-background flex justify-start relative">
           
           <div className="w-full max-w-2xl flex flex-col h-full">
             {/* Form Header */}
             <div className="flex justify-between items-end mb-12 border-b border-border/40 pb-6 w-full">
                <div>
                   <div className="text-[10px] text-muted font-bold tracking-widest uppercase mb-2">
                     {step === 1 && "Start Your Journey"}
                     {step === 2 && "Biometric Inputs"}
                     {step === 3 && "Activity Multiplier"}
                     {step === 4 && "Finalization"}
                   </div>
                   <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">
                     {step === 1 && "Welcome"}
                     {step === 2 && "Physical Profile"}
                     {step === 3 && "Daily Expenditure"}
                     {step === 4 && "Surplus Goal"}
                   </h2>
                </div>
                <span className="text-primary font-bold tracking-widest text-lg ml-8 flex-shrink-0">0{step} / 0{TOTAL_STEPS}</span>
             </div>

             {/* Form Contents */}
             <div className="flex-grow flex flex-col justify-center w-full">
                
                {/* STEP 1: Introduction */}
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <p className="text-lg text-muted">Welcome to the elite 1%. BulkMaster is designed strictly for those who want to bulk with precision, leaving no gram unaccounted for.</p>
                    <p className="text-lg text-muted">To calculate your precise <strong className="text-foreground">Total Daily Energy Expenditure (TDEE)</strong> and recommended caloric surplus, we need your baseline biometric data.</p>
                    <div className="bg-card border border-border/50 p-6 mt-6">
                      <h4 className="text-primary font-bold uppercase tracking-wider mb-2 text-sm">Why We Need This</h4>
                      <p className="text-xs text-muted leading-relaxed">Your data remains purely localized. We utilize the Mifflin-St Jeor formula to architect your baseline. Every output generated will serve as your daily engine metric going forward.</p>
                    </div>
                  </div>
                )}

                {/* STEP 2: Physical Profile (was step 3) */}
                {step === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] text-muted font-bold uppercase tracking-widest">Weight (KG)</label>
                        <input type="number" value={data.weight} onChange={(e)=>setData({...data, weight: e.target.value})} className="w-full bg-input border border-border focus:border-primary/50 text-foreground px-4 py-4 focus:outline-none transition-colors" placeholder="85.0" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] text-muted font-bold uppercase tracking-widest">Height (CM)</label>
                        <input type="number" value={data.height} onChange={(e)=>setData({...data, height: e.target.value})} className="w-full bg-input border border-border focus:border-primary/50 text-foreground px-4 py-4 focus:outline-none transition-colors" placeholder="188" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] text-muted font-bold uppercase tracking-widest">Age</label>
                        <input type="number" value={data.age} onChange={(e)=>setData({...data, age: e.target.value})} className="w-full bg-input border border-border focus:border-primary/50 text-foreground px-4 py-4 focus:outline-none transition-colors" placeholder="28" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] text-muted font-bold uppercase tracking-widest">Gender</label>
                        <div className="flex gap-4 h-[58px]">  
                          <button onClick={()=>setData({...data, gender: 'MALE'})} className={`flex-1 font-bold tracking-widest text-xs uppercase border transition-colors ${data.gender === 'MALE' ? 'bg-card-hover border-primary text-primary' : 'bg-input border-border text-muted hover:border-primary/30'}`}>Male</button>
                          <button onClick={()=>setData({...data, gender: 'FEMALE'})} className={`flex-1 font-bold tracking-widest text-xs uppercase border transition-colors ${data.gender === 'FEMALE' ? 'bg-card-hover border-primary text-primary' : 'bg-input border-border text-muted hover:border-primary/30'}`}>Female</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Activity & TDEE (was step 4) */}
                {step === 3 && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-4">
                      <label className="text-[10px] text-muted font-bold uppercase tracking-widest">Daily Activity Multiplier</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <button onClick={()=>setData({...data, activity: 'SEDENTARY'})} className={`p-4 flex flex-col items-center justify-center gap-3 border transition-colors ${data.activity === 'SEDENTARY' ? 'bg-card-hover border-primary text-primary' : 'bg-input border-border text-muted hover:border-primary/30'}`}>
                           <BedDouble size={20} />
                           <span className="text-[9px] font-bold tracking-widest uppercase">Sedentary</span>
                        </button>
                        <button onClick={()=>setData({...data, activity: 'MODERATE'})} className={`p-4 flex flex-col items-center justify-center gap-3 border transition-colors ${data.activity === 'MODERATE' ? 'bg-card-hover border-primary text-primary' : 'bg-input border-border text-muted hover:border-primary/30'}`}>
                           <Activity size={20} />
                           <span className="text-[9px] font-bold tracking-widest uppercase">Moderate</span>
                        </button>
                        <button onClick={()=>setData({...data, activity: 'ACTIVE'})} className={`p-4 flex flex-col items-center justify-center gap-3 border transition-colors ${data.activity === 'ACTIVE' ? 'bg-card-hover border-primary text-primary' : 'bg-input border-border text-muted hover:border-primary/30'}`}>
                           <Dumbbell size={20} />
                           <span className="text-[9px] font-bold tracking-widest uppercase">Active</span>
                        </button>
                        <button onClick={()=>setData({...data, activity: 'ATHLETE'})} className={`p-4 flex flex-col items-center justify-center gap-3 border transition-colors ${data.activity === 'ATHLETE' ? 'bg-card-hover border-primary text-primary' : 'bg-input border-border text-muted hover:border-primary/30'}`}>
                           <Zap size={20} />
                           <span className="text-[9px] font-bold tracking-widest uppercase">Athlete</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-card border border-border/80 p-8 rounded-sm relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4">
                          <div className="text-[9px] text-primary font-bold uppercase tracking-[0.2em] text-right">Maintenance Mode</div>
                          <div className="text-[8px] text-muted text-right">±5% Margin of Error</div>
                       </div>
                       <h4 className="text-[10px] text-muted font-bold uppercase tracking-widest mb-4">Calculated TDEE</h4>
                       <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black tracking-tighter text-foreground">{calculateTDEE()}</span>
                          <span className="text-sm text-primary font-bold tracking-widest">KCAL / DAY</span>
                       </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Target Bulking (was step 5) */}
                {step === 4 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-4">
                      <label className="text-[10px] text-muted font-bold uppercase tracking-widest">Select Caloric Surplus Phase</label>
                      <div className="grid grid-cols-1 gap-4">
                        <button onClick={()=>setData({...data, surplus: '+300'})} className={`p-6 flex items-center justify-between border transition-all ${data.surplus === '+300' ? 'bg-primary/5 border-primary text-primary shadow-[0_0_15px_rgba(174,230,0,0.1)]' : 'bg-input border-border text-muted hover:border-primary/30'}`}>
                           <div className="text-left">
                             <div className="font-bold uppercase tracking-widest text-sm mb-1 text-foreground">Lean Bulk</div>
                             <div className="text-[10px] opacity-80 uppercase tracking-widest">+300 Kcal / Minimal Fat Gain</div>
                           </div>
                           <div className={`text-2xl font-black ${data.surplus === '+300' ? 'text-primary' : 'text-muted'}`}>+300</div>
                        </button>

                        <button onClick={()=>setData({...data, surplus: '+500'})} className={`p-6 flex items-center justify-between border transition-all ${data.surplus === '+500' ? 'bg-primary/5 border-primary text-primary shadow-[0_0_15px_rgba(174,230,0,0.1)]' : 'bg-input border-border text-muted hover:border-primary/30'}`}>
                           <div className="text-left">
                             <div className="font-bold uppercase tracking-widest text-sm mb-1 text-foreground">Standard Bulk</div>
                             <div className="text-[10px] opacity-80 uppercase tracking-widest">+500 Kcal / Balanced Hypertrophy</div>
                           </div>
                           <div className={`text-2xl font-black ${data.surplus === '+500' ? 'text-primary' : 'text-muted'}`}>+500</div>
                        </button>

                        <button onClick={()=>setData({...data, surplus: '+700'})} className={`p-6 flex items-center justify-between border transition-all ${data.surplus === '+700' ? 'bg-primary/5 border-primary text-primary shadow-[0_0_15px_rgba(174,230,0,0.1)]' : 'bg-input border-border text-muted hover:border-primary/30'}`}>
                           <div className="text-left">
                             <div className="font-bold uppercase tracking-widest text-sm mb-1 text-foreground">Aggressive Bulk</div>
                             <div className="text-[10px] opacity-80 uppercase tracking-widest">+700 Kcal / Fast Weight Gain</div>
                           </div>
                           <div className={`text-2xl font-black ${data.surplus === '+700' ? 'text-primary' : 'text-muted'}`}>+700</div>
                        </button>
                      </div>
                    </div>

                    {data.activity && data.weight && (
                      <div className="bg-primary/10 border border-primary/20 p-6 flex items-baseline justify-between gap-4 mt-6">
                         <span className="text-[10px] text-primary font-bold uppercase tracking-widest">New Daily Target:</span>
                         <span className="text-3xl font-black text-foreground">
                           {(parseInt(calculateTDEE().replace(/,/g, '')) + parseInt(data.surplus)).toLocaleString()} <span className="text-sm text-primary uppercase">Kcal</span>
                         </span>
                      </div>
                    )}
                  </div>
                )}

             </div>

             {/* Form Footer Action */}
             <div className="flex items-center justify-between mt-16 pt-8 border-t border-border/40 w-full">
               <button 
                  onClick={prevStep} 
                  disabled={step === 1}
                  className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${step === 1 ? 'text-muted/30 cursor-not-allowed' : 'text-muted hover:text-foreground'}`}
               >
                  <ChevronLeft size={16} /> Back
               </button>

               {step < TOTAL_STEPS ? (
                 <button 
                    onClick={nextStep} 
                    className="bg-primary hover:bg-primary-hover text-black font-black uppercase tracking-widest px-8 py-4 flex items-center gap-3 transition-colors"
                 >
                   Next Step <ChevronRight size={18} />
                 </button>
               ) : (
                 <button
                   disabled={isSaving}
                   onClick={async () => {
                     setIsSaving(true);
                     const activityMap: Record<string, string> = {
                       SEDENTARY: "sedentary", MODERATE: "moderate",
                       ACTIVE: "active", ATHLETE: "very_active",
                     };
                     const tdeeNum = parseInt(calculateTDEE().replace(/,/g, "")) || 0;
                     const surplusNum = parseInt(data.surplus) || 300;
                     try {
                       await fetch("/api/profile", {
                         method: "PUT",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({
                           age: data.age ? Number(data.age) : undefined,
                           height_cm: data.height ? Number(data.height) : undefined,
                           weight_start_kg: data.weight ? Number(data.weight) : undefined,
                           gender: data.gender === "MALE" ? "male" : data.gender === "FEMALE" ? "female" : undefined,
                           activity_level: activityMap[data.activity] ?? "moderate",
                           tdee: tdeeNum,
                           target_calories: tdeeNum + surplusNum,
                           surplus_kcal: surplusNum,
                           current_phase: "Bulking",
                           onboarding_done: true,
                         }),
                       });

                       // Also log the starting weight
                       if (data.weight) {
                         await fetch("/api/weight-logs", {
                           method: "POST",
                           headers: { "Content-Type": "application/json" },
                           body: JSON.stringify({ weight_kg: Number(data.weight) }),
                         });
                       }

                       router.push("/dashboard");
                     } catch {
                       setIsSaving(false);
                     }
                   }}
                   className="bg-primary hover:bg-primary-hover text-black font-black uppercase tracking-widest px-8 py-4 flex items-center gap-3 transition-colors shadow-[0_0_20px_rgba(174,230,0,0.3)] disabled:opacity-60"
                 >
                   {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <>Initialize Dashboard <ArrowRight size={18} /></>}
                 </button>
               )}
             </div>

           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
