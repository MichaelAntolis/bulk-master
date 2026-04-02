"use client";

import { useState, useEffect } from "react";
import { Bell, Zap } from "lucide-react";
import Link from "next/link";
import ProfileDropdown from "./ProfileDropdown";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  isLoggedIn?: boolean;
}

export default function Navbar({ isLoggedIn = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initialize on component mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Mobile Header */}
      <div className={`md:hidden flex items-center justify-between px-4 sm:px-6 fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "h-16 bg-background/80 backdrop-blur-xl border-b border-border/20" : "h-16 bg-transparent pointer-events-none"
      }`}>
         <div className="flex gap-3 items-center pointer-events-auto">
            <Link href="/" className="text-primary font-black uppercase tracking-tighter text-lg leading-none mt-0.5">
               BULKMASTER
            </Link>
         </div>
         
         <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
           {isLoggedIn ? (
             <>
               <button className="text-muted hover:text-primary transition-colors p-1">
                 <Bell size={18} />
               </button>
               <ThemeToggle />
               <ProfileDropdown />
             </>
           ) : (
             <div className="flex items-center gap-3 pointer-events-auto">
               <ThemeToggle />
               <Link href="/login" className="text-[9px] text-muted font-bold tracking-widest uppercase hover:text-foreground transition-colors">
                 Login
               </Link>
               <Link href="/register" className="bg-primary text-black px-3 py-1.5 text-[9px] font-black tracking-widest uppercase hover:bg-primary-hover transition-colors">
                 Register
               </Link>
             </div>
           )}
         </div>
      </div>

      {/* Desktop Header */}
      <header className={`hidden md:flex px-8 lg:px-12 items-center justify-between fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "h-20 bg-background/80 backdrop-blur-xl border-b border-border/20" : "h-24 bg-transparent pointer-events-none"
      }`}>
         
         {/* Left Logo */}
         <Link href="/" className="text-primary font-black uppercase tracking-tighter text-2xl leading-none flex items-center gap-3 pointer-events-auto">
            BULKMASTER
         </Link>

         {/* Center Links (Landing Page specific) */}
         <div className="hidden lg:flex items-center gap-8 pl-12 mr-auto pointer-events-auto">
            <Link href="/#features" className="text-[11px] text-muted font-bold tracking-widest uppercase hover:text-foreground transition-colors">Features</Link>
            <Link href="/#system" className="text-[11px] text-muted font-bold tracking-widest uppercase hover:text-foreground transition-colors">System</Link>
            <Link href="/#results" className="text-[11px] text-muted font-bold tracking-widest uppercase hover:text-foreground transition-colors">Results</Link>
         </div>

         {/* Right Section */}
         <div className="flex items-center gap-6 shrink-0 pointer-events-auto">
           {isLoggedIn ? (
             <>
               <ThemeToggle />
               <button className="text-muted hover:text-foreground transition-colors">
                 <Bell size={20} />
               </button>
               <ProfileDropdown />
             </>
           ) : (
             <>
               <ThemeToggle />
               <Link href="/login" className="text-[11px] text-muted font-bold tracking-widest uppercase hover:text-foreground transition-colors">
                 Login
               </Link>
               <Link href="/register" className="bg-primary text-black px-6 py-3 text-[10px] font-black tracking-widest uppercase hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(174,230,0,0.15)]">
                 Register
               </Link>
             </>
           )}
         </div>
      </header>

    </>
  );
}
