import { useNavigate } from "react-router";
import { Sparkles, ArrowRight, ShoppingBag, Mic, Camera, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-indigo-50 to-purple-50 overflow-hidden flex flex-col p-6 sm:p-12 lg:p-24">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between mb-20"
      >
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <img src="/logo.webp" alt="Cartivo Logo" className="w-8 h-8" />
          <span className="text-lg font-bold text-slate-900">Cartivo</span>
        </div>
        <div className="flex items-center gap-3">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/api/login"
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </motion.a>
        </div>
      </motion.div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }} className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl gap-8 mx-auto"
      >
        <div className="mb-2">
          <img src='/logo.webp' alt="Cartivo Logo" className="w-40 h-40 z-20" />
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-2"
          >
            <Sparkles className="w-4 h-4 fill-indigo-700/20" />
            <span>Next Generation Shopping</span>
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-bold text-slate-900 tracking-tight leading-tight">
            Shop Smarter <br />
            with <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI</span>
          </h1>

          <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-lg mx-auto">
            Experience the future of retail with a personal assistant that sees what you see, hears what you need, and fits what you love.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/login"
            className="w-full sm:w-64 bg-slate-900 text-white px-8 py-5 rounded-3xl font-bold flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            Start Shopping
            <ArrowRight className="w-5 h-5" />
          </motion.a>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/chat")}
            className="w-full sm:w-64 bg-white border border-slate-200 text-slate-800 px-8 py-5 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
          >
            <Mic className="w-5 h-5" />
            Try Voice Search
          </motion.button>
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-8 text-slate-400">
          <FeatureIcon icon={<Mic className="w-6 h-6" />} label="Voice-first" />
          <FeatureIcon icon={<Sparkles className="w-6 h-6" />} label="AI Discovery" />
          <FeatureIcon icon={<Camera className="w-6 h-6" />} label="AR Virtual Try-on" />
        </div>
      </motion.div>
    </div>
  );
}

function FeatureIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-default">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
        {icon}
      </div>
      <span className="text-xs font-semibold uppercase tracking-widest">{label}</span>
    </div>
  );
}
