import { Utensils, Maximize2, Activity, ShieldCheck, Cloud } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LandingPage() {

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      {/* 2. Hero Section */}
      <section className="relative w-full min-h-[750px] flex items-center border-b border-border/30 overflow-hidden">
        {/* Background Image Container (Placeholder for User's Image) */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center lg:bg-right-top bg-no-repeat opacity-40 dark:opacity-70 mix-blend-multiply dark:mix-blend-screen"
          style={{ backgroundImage: "url('/images/hero-bg.png')" }}
        />
        {/* Gradients to blend the image seamlessly */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-0"></div>

        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 relative z-10 w-full items-center">
          <div className="flex flex-col space-y-6 max-w-2xl py-20">
            <div className="text-primary font-bold text-xs md:text-sm tracking-[0.3em] uppercase">
              Engineered For Growth
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter">
              <span className="text-foreground block mb-2">Unleash the bulk:</span>
              <span className="text-primary">Master your mass</span>
            </h1>
            
            <p className="text-muted text-lg md:text-xl leading-relaxed max-w-lg mt-4">
              A raw performance ecosystem for those who demand more. Track surplus, log volume, and visualize your evolution with industrial precision.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
              <button className="bg-primary text-black font-bold uppercase tracking-wide px-8 py-4 w-full sm:w-auto hover:bg-primary-hover transition-colors">
                Get Started
              </button>
              <button className="bg-card text-muted font-bold uppercase tracking-wide px-8 py-4 border border-border w-full sm:w-auto hover:text-foreground transition-colors">
                View Analytics
              </button>
            </div>
          </div>

          {/* Floating Stat Widget */}
          <div className="hidden lg:flex justify-end items-center mr-10 relative">
             <div className="border-r-4 border-primary pr-6 text-right">
                <div className="text-7xl font-black text-foreground tracking-tighter drop-shadow-2xl">
                  +4.2<span className="text-3xl text-muted ml-1">LBS</span>
                </div>
                <div className="text-primary text-sm font-bold tracking-[0.2em] mt-2">
                  LEAN MASS GAINED / 30D
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-24 max-w-[1400px] mx-auto px-6 w-full">
        <div className="mb-14">
          <h2 className="text-3xl font-black uppercase tracking-tight inline-block relative">
            Core Systems
            <span className="absolute -bottom-3 left-0 w-1/2 h-1 bg-primary"></span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-card border border-border/50 p-8 hover:border-primary/50 transition-colors relative overflow-hidden group">
            <Utensils className="text-primary mb-6" size={28} />
            <h3 className="text-xl font-bold uppercase tracking-tight mb-3">Calorie Surplus Tracking</h3>
            <p className="text-muted text-sm leading-relaxed">
              Precision-mapped macro distribution designed for anabolic optimization. Sync your intake with your output.
            </p>
            {/* Faint Graph Background effect */}
            <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
               <Activity size={180} />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-card border border-border/50 p-8 hover:border-primary/50 transition-colors">
            <Maximize2 className="text-primary mb-6" size={28} />
            <h3 className="text-xl font-bold uppercase tracking-tight mb-3">Overload Logs</h3>
            <p className="text-muted text-sm leading-relaxed">
              Never plateaue. Automated volume tracking ensures every session is more intense than the last.
            </p>
          </div>

          {/* Card 3 (Half width on desktop, but spans differently in actual grid) */}
          <div className="bg-card border border-border/50 p-8 hover:border-primary/50 transition-colors">
            <Activity className="text-primary mb-6" size={28} />
            <h3 className="text-xl font-bold uppercase tracking-tight mb-3">Performance Data</h3>
            <p className="text-muted text-sm leading-relaxed">
              Visualizing metrics through a brutalist lens. Clear, hard data for raw results.
            </p>
          </div>

          {/* Card 4 (Spans 2 columns) */}
          <div className="md:col-span-2 bg-card border border-border/50 p-8 flex flex-col sm:flex-row items-center gap-8 hover:border-primary/50 transition-colors">
            <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
              {/* Fake SVG Gauge */}
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" className="stroke-border fill-transparent" strokeWidth="12" />
                <circle cx="64" cy="64" r="56" className="stroke-primary fill-transparent" strokeWidth="12" strokeDasharray="351.8" strokeDashoffset="87.9" />
              </svg>
              <div className="text-center">
                <div className="text-3xl font-black text-foreground">75%</div>
                <div className="text-[10px] text-muted font-bold tracking-widest uppercase">Daily Load</div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-3">Dynamic Power Gauge</h3>
              <p className="text-muted text-sm leading-relaxed mb-4">
                Our signature visualizer for real-time tracking of your total daily volume against historical peaks.
              </p>
              <div className="flex gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-surface text-primary px-3 py-1 border border-primary/20">Peak Intensity</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-surface text-muted px-3 py-1 border border-border">Volume Cap</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The System Section */}
      <section id="system" className="py-24 border-t border-border/30 bg-surface">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-14">
            <h2 className="text-3xl font-black uppercase tracking-tight inline-block relative">
              The Protocol
              <span className="absolute -bottom-3 left-0 w-1/2 h-1 bg-foreground"></span>
            </h2>
          </div>
          <div className="flex flex-col lg:flex-row gap-0 border border-border/50 shadow-2xl">
             {/* Steps */}
             <div className="flex-1 p-10 border-b lg:border-b-0 lg:border-r border-border/50 bg-card hover:bg-input transition-colors relative group">
                <div className="text-[120px] font-black text-muted/10 absolute top-4 right-4 leading-none pointer-events-none group-hover:text-primary/10 transition-colors">01</div>
                <h4 className="text-xl font-bold uppercase tracking-widest mb-4 mt-8 relative z-10">Baseline Config</h4>
                <p className="text-sm text-muted relative z-10 leading-relaxed">Establish your metabolic parameters, TDEE, and physical baseline. The engine calibrates to your exact biology.</p>
             </div>
             <div className="flex-1 p-10 border-b lg:border-b-0 lg:border-r border-border/50 bg-card hover:bg-input transition-colors relative group">
                <div className="text-[120px] font-black text-muted/10 absolute top-4 right-4 leading-none pointer-events-none group-hover:text-primary/10 transition-colors">02</div>
                <h4 className="text-xl font-bold uppercase tracking-widest mb-4 mt-8 relative z-10">Daily Execution</h4>
                <p className="text-sm text-muted relative z-10 leading-relaxed">Log calories without friction. Record training volume with zero lag. The system processes your raw input instantly.</p>
             </div>
             <div className="flex-1 p-10 bg-card hover:bg-input transition-colors relative group">
                <div className="text-[120px] font-black text-muted/10 absolute top-4 right-4 leading-none pointer-events-none group-hover:text-primary/10 transition-colors">03</div>
                <h4 className="text-xl font-bold uppercase tracking-widest mb-4 mt-8 relative z-10">Predictive Yield</h4>
                <p className="text-sm text-muted relative z-10 leading-relaxed">View algorithmic projections of your tissue accrual based on adherence. Eliminate guesswork from your bulk.</p>
             </div>
          </div>
        </div>
      </section>

      {/* 5. Results Section */}
      <section id="results" className="py-24 max-w-[1400px] mx-auto px-6 w-full">
         <div className="mb-14">
            <h2 className="text-3xl font-black uppercase tracking-tight inline-block relative">
              Expected Output
              <span className="absolute -bottom-3 left-0 w-1/2 h-1 bg-primary"></span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="bg-card border border-border/50 p-8 flex flex-col justify-between">
                <div className="text-primary font-bold text-[10px] tracking-widest uppercase mb-6">Efficiency</div>
                <div className="text-6xl font-black text-foreground tracking-tighter mb-2">94<span className="text-2xl text-muted text-medium">%</span></div>
                <p className="text-xs text-muted font-bold uppercase tracking-widest">Average User Adherence</p>
             </div>
             <div className="bg-card border border-border/50 p-8 flex flex-col justify-between">
                <div className="text-primary font-bold text-[10px] tracking-widest uppercase mb-6">Hypertrophy</div>
                <div className="text-6xl font-black text-foreground tracking-tighter mb-2">+12<span className="text-xl text-muted text-medium"> LBS</span></div>
                <p className="text-xs text-muted font-bold uppercase tracking-widest">Lean Tissue / 16 Weeks</p>
             </div>
             <div className="bg-card border border-border/50 p-8 flex flex-col justify-between">
                <div className="text-primary font-bold text-[10px] tracking-widest uppercase mb-6">Strength</div>
                <div className="text-6xl font-black text-foreground tracking-tighter mb-2">2.5<span className="text-2xl text-muted text-medium">x</span></div>
                <p className="text-xs text-muted font-bold uppercase tracking-widest">Volume Load Multiplier</p>
             </div>
             <div className="bg-primary p-8 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] cursor-pointer transition-transform shadow-[0_0_30px_rgba(174,230,0,0.2)]">
                <div className="absolute inset-0 bg-black/10 mix-blend-overlay group-hover:bg-transparent transition-colors"></div>
                <div className="text-black font-bold text-[10px] tracking-widest uppercase mb-6 relative z-10">Initiative</div>
                <div className="text-4xl font-black text-black tracking-tighter mb-4 uppercase leading-[1.1] relative z-10">Stop guessing. Start tracking.</div>
                <Link href="/onboarding?step=1" className="text-xs text-black font-black uppercase tracking-widest flex items-center gap-2 relative z-10 group-hover:pl-2 transition-all">
                  Join Protocol <span>→</span>
                </Link>
             </div>
          </div>
      </section>

      {/* 6. Command Action / Auth Section */}
      <section id="login" className="py-24 border-t border-border/30 bg-surface">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Copy */}
          <div className="flex flex-col">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-none tracking-tighter mb-6">
              <span className="block text-foreground">Command Your</span>
              <span className="block text-primary">Transformation</span>
            </h2>
            <p className="text-muted text-lg mb-12 max-w-md">
              Join the elite 1% who track every gram and every rep. BulkMaster is the digital backbone for your physical peak.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="bg-card p-3 border border-border/50">
                  <ShieldCheck className="text-primary" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground uppercase tracking-wide text-sm mb-1">Biometric Integration</h4>
                  <p className="text-muted text-sm">Sync with any wearable for metabolic precision.</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="bg-card p-3 border border-border/50">
                  <Cloud className="text-primary" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground uppercase tracking-wide text-sm mb-1">Cloud Matrix Sync</h4>
                  <p className="text-muted text-sm">Access your logs from any device, anywhere, instantly.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Dummy Auth Form Container */}
          <div className="bg-background border border-border p-6 md:p-12 w-full max-w-lg mx-auto lg:mt-0 lg:ml-auto">
            <div className="mb-10 border-b border-border/40 pb-4">
              <h3 className="text-foreground font-bold tracking-widest text-sm uppercase relative inline-block">
                Login
                <span className="absolute -bottom-4 left-0 w-full h-[2px] bg-primary"></span>
              </h3>
            </div>

            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-muted font-bold uppercase tracking-widest">Identification / Email</label>
                <input 
                  type="text"
                  placeholder="operator@bulkmaster.io" 
                  className="w-full bg-input/50 border border-border text-foreground px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-muted font-bold uppercase tracking-widest">Access Key / Password</label>
                <input 
                  type="password"
                  placeholder="••••••••••••" 
                  className="w-full bg-input/50 border border-border text-foreground px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted/50"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 bg-input/80 border border-border group-hover:border-primary/50 flex items-center justify-center">
                     <div className="w-2 h-2 bg-primary hidden group-focus-within:block"></div>
                  </div>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Stay Linked</span>
                </label>
                <button type="button" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                  Forgot Key?
                </button>
              </div>

              <button type="button" className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 mt-8 hover:bg-primary-hover transition-all">
                Initiate Engine
              </button>

              <div className="pt-6 text-center border-t border-border/40 mt-6 md:mt-8">
                <span className="text-[11px] text-muted font-bold uppercase tracking-widest mr-2 block sm:inline mb-2 sm:mb-0">Awaiting clearance?</span>
                <Link href="/onboarding?step=1" className="text-[11px] text-primary font-bold uppercase tracking-widest hover:underline">
                  Create Registry Here
                </Link>
              </div>
            </form>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
