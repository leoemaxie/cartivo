import { useNavigate } from "react-router";
import { Sparkles, ArrowRight, ShoppingBag, Mic, Camera } from "lucide-react";
import { motion } from "motion/react";
import { AIOrb } from "../components/AIOrb";

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-white overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[10%] left-[10%] w-[30vw] h-[30vw] bg-indigo-200 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-purple-200 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl gap-8"
      >
        {/* Animated AI Assistant Placeholder */}
        <div className="mb-12">
          <AIOrb size="md" />
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="w-full sm:w-64 bg-slate-900 text-white px-8 py-5 rounded-3xl font-bold flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            Start Shopping
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          
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
