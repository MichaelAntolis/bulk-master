"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); return; }
    if (formData.password.length < 8) { setError("Password must be at least 8 characters"); return; }

    setIsLoading(true);
    try {
      // 1. Register
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }

      // 2. Auto-login after successful registration
      const loginResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (loginResult?.error) {
        // Login failed, redirect to login page
        router.push("/login?registered=true");
        return;
      }

      // 3. Redirect directly to onboarding
      router.push("/onboarding");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow flex items-center justify-center pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/4 -left-10 md:left-10 text-[20vw] font-black text-muted/5 pointer-events-none select-none">JOIN</div>
        <div className="absolute bottom-10 -right-10 md:right-10 text-[10vw] font-black text-muted/5 pointer-events-none select-none">REGISTRY</div>

        <div className="bg-surface border border-border/50 p-8 md:p-12 w-full max-w-lg shadow-2xl relative z-10">
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground mb-3">
              Create <span className="text-primary">Account</span>
            </h1>
            <p className="text-muted text-xs font-bold tracking-[0.2em] uppercase">Register to access the engine</p>
          </div>

          {error && (
            <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider">⚠ {error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { name: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
              { name: "email", label: "Email Address", type: "email", placeholder: "operator@bulkmaster.io" },
              { name: "password", label: "Password", type: "password", placeholder: "Min. 8 characters" },
              { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Repeat your password" },
            ].map((f) => (
              <div key={f.name} className="space-y-2">
                <label className="text-[10px] text-muted font-bold uppercase tracking-widest block">{f.label}</label>
                <input type={f.type} name={f.name} value={formData[f.name as keyof typeof formData]}
                  onChange={handleChange} placeholder={f.placeholder} required
                  className="w-full bg-input/50 border border-border/50 text-foreground px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted/50" />
              </div>
            ))}

            <button type="submit" disabled={isLoading}
              className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 mt-4 hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(174,230,0,0.15)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : <>Initialize Engine <span className="text-lg leading-none">→</span></>}
            </button>

            <div className="pt-6 text-center border-t border-border/20 mt-6">
              <span className="text-[10px] text-muted font-bold uppercase tracking-widest mr-2">Already registered?</span>
              <Link href="/login" className="text-[10px] text-foreground font-black uppercase tracking-widest hover:text-primary transition-colors border-b border-primary/30 pb-0.5">
                Access System
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
