import { Outlet, Link, useLocation } from "react-router";
import { User, Search, ShoppingBag, Sparkles, MessageSquare, Camera } from "lucide-react";

export function Layout() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/10">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 ${
        isLanding ? "bg-transparent" : "bg-background/80 backdrop-blur-xl border-b border-border/40"
      }`}>
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-8 bg-primary rounded-xl flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform">
            <Sparkles size={18} fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight">ShopMind AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <Link to="/chat" className="hover:text-primary transition-colors">AI Assistant</Link>
          <Link to="/ar" className="hover:text-primary transition-colors">AR Try-On</Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-accent rounded-full transition-colors">
            <Search size={20} />
          </button>
          <Link to="/profile" className="p-2 hover:bg-accent rounded-full transition-colors">
            <User size={20} />
          </Link>
          <button className="relative p-2 hover:bg-accent rounded-full transition-colors">
            <ShoppingBag size={20} />
            <span className="absolute top-1 right-1 size-2 bg-primary rounded-full" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`${isLanding ? "" : "pt-20"}`}>
        <Outlet />
      </main>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-10 left-6 right-6 z-50 px-4 py-4 bg-background/60 backdrop-blur-3xl border border-white/20 rounded-[32px] flex items-center justify-around shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]">
        <Link to="/shop" className={`p-3 rounded-2xl transition-all ${location.pathname === "/shop" ? "bg-primary text-primary-foreground shadow-lg scale-110" : "text-muted-foreground"}`}>
          <ShoppingBag size={24} />
        </Link>
        <Link to="/chat" className={`p-3 rounded-2xl transition-all ${location.pathname === "/chat" ? "bg-primary text-primary-foreground shadow-lg scale-110" : "text-muted-foreground"}`}>
          <MessageSquare size={24} />
        </Link>
        <Link to="/ar" className={`p-3 rounded-2xl transition-all ${location.pathname === "/ar" ? "bg-primary text-primary-foreground shadow-lg scale-110" : "text-muted-foreground"}`}>
          <Camera size={24} />
        </Link>
        <Link to="/profile" className={`p-3 rounded-2xl transition-all ${location.pathname === "/profile" ? "bg-primary text-primary-foreground shadow-lg scale-110" : "text-muted-foreground"}`}>
          <User size={24} />
        </Link>
      </div>
    </div>
  );
}
