import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/20 py-8 bg-surface mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2">
           <span className="text-primary font-black text-xl tracking-tighter uppercase">BulkMaster</span>
           <span className="text-muted text-xs tracking-wide">© 2024 BulkMaster Digital Engine</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-[11px] font-bold tracking-widest uppercase text-muted">
          <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
          <Link href="#" className="hover:text-primary transition-colors">Support</Link>
        </div>

        <div className="flex items-center gap-4">
           <button className="bg-card p-2 flex border border-border items-center justify-center hover:border-primary/50 text-muted hover:text-primary transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
           </button>
           <button className="bg-card p-2 flex border border-border items-center justify-center hover:border-primary/50 text-muted hover:text-primary transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
           </button>
        </div>
      </div>
    </footer>
  );
}
