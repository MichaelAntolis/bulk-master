"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMsg("Account created! Please login to continue.");
    }
    if (searchParams.get("error") === "CredentialsSignin") {
      setError("Invalid email or password. Please try again.");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. System access denied.");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Subtle background industrial accents */}
      <div className="absolute top-1/4 -left-10 md:left-10 text-[20vw] font-black text-muted/5 pointer-events-none select-none">
        SYSTEM
      </div>
      <div className="absolute bottom-10 -right-10 md:right-10 text-[10vw] font-black text-muted/5 pointer-events-none select-none">
        ACCESS
      </div>

      <div className="bg-surface border border-border/50 p-8 md:p-12 w-full max-w-lg shadow-2xl relative z-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground mb-3">
            Auth <span className="text-primary">Node</span>
          </h1>
          <p className="text-muted text-xs font-bold tracking-[0.2em] uppercase">
            Enter Credentials to Access Engine
          </p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            ✓ {successMsg}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wider">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-muted font-bold uppercase tracking-widest block">
              Identification / Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="operator@bulkmaster.io"
              required
              className="w-full bg-input/50 border border-border/50 text-foreground px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted/50"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] text-muted font-bold uppercase tracking-widest mb-0">
                Access Key / Password
              </label>
              <button
                type="button"
                className="text-[9px] font-bold text-primary uppercase tracking-widest hover:underline"
              >
                Forgot Key?
              </button>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              required
              className="w-full bg-input/50 border border-border/50 text-foreground px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted/50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 mt-8 hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(174,230,0,0.15)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                Initiate Engine <span className="text-lg leading-none">→</span>
              </>
            )}
          </button>

          <div className="pt-8 text-center border-t border-border/20 mt-8">
            <span className="text-[10px] text-muted font-bold uppercase tracking-widest mr-2">
              No Credentials?
            </span>
            <Link
              href="/register"
              className="text-[10px] text-foreground font-black uppercase tracking-widest hover:text-primary transition-colors border-b border-primary/30 pb-0.5"
            >
              Request Registry
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center pt-32 pb-24">
          <div className="text-primary font-bold text-xs uppercase tracking-widest animate-pulse">Initializing Interface...</div>
        </div>
      }>
        <LoginContent />
      </Suspense>
      <Footer />
    </div>
  );
}
