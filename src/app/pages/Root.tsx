import { Outlet, NavLink, useLocation } from "react-router";
import { Home, Search, User, Sparkles, FileText, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Root() {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center">
      {!isLanding && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
            <NavLink to="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-indigo-600">
              <Sparkles className="w-6 h-6" />
              <span>ShopMind <span className="text-slate-900">AI</span></span>
            </NavLink>
            <div className="flex items-center gap-4">
              <NavLink
                to="/pdf-report"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                <FileText className="w-4 h-4" />
                PDF Report
              </NavLink>
              {isAuthenticated && (
                <a
                  href="/api/logout"
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </a>
              )}
              <NavLink to="/profile" className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-slate-100 flex items-center justify-center">
                {user?.profileImageUrl ? (
                  <ImageWithFallback src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-500" />
                )}
              </NavLink>
            </div>
          </div>
        </nav>
      )}

      <main className={`w-full max-w-screen-xl flex-1 ${!isLanding ? "pt-16 pb-24 lg:pb-0" : ""}`}>
        <Outlet />
      </main>

      {!isLanding && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/90 backdrop-blur-xl border-t border-slate-200 px-8 py-3 pb-8">
          <div className="flex justify-between items-center max-w-md mx-auto">
            <NavIcon to="/dashboard" icon={<Home className="w-6 h-6" />} label="Home" />
            <NavIcon to="/chat" icon={<Search className="w-6 h-6" />} label="AI Chat" />
            <NavIcon to="/pdf-report" icon={<FileText className="w-6 h-6" />} label="PDF" />
            <NavIcon to="/profile" icon={<User className="w-6 h-6" />} label="Account" />
          </div>
        </nav>
      )}
    </div>
  );
}

function NavIcon({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? "text-indigo-600" : "text-slate-400"}`}>
      <div className="relative">
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  );
}
