import { motion } from "motion/react";

export function AIOrb({ size = "md", active = false }: { size?: "sm" | "md" | "lg", active?: boolean }) {
  const sizes = {
    sm: "w-12 h-12",
    md: "w-32 h-32",
    lg: "w-64 h-64",
  };

  return (
    <div className={`relative flex items-center justify-center ${sizes[size]}`}>
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: active ? [1, 1.2, 1] : [1, 1.1, 1],
          opacity: active ? [0.6, 0.8, 0.6] : [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: active ? 2 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-blue-500 rounded-full blur-3xl"
      />
      
      {/* Outer Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-2 border-dashed border-blue-400/30 rounded-full"
      />

      {/* Main Orb */}
      <motion.div
        animate={active ? {
          scale: [1, 1.05, 0.95, 1.02, 1],
          borderRadius: ["50% 50%", "40% 60%", "60% 40%", "50% 50%"],
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative w-full h-full bg-linear-to-br from-blue-400 via-purple-500 to-indigo-600 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.5)] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)]" />
        <motion.div
          animate={{
            x: active ? [-20, 20, -20] : [-5, 5, -5],
            y: active ? [-15, 15, -15] : [-3, 3, -3],
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="w-1/2 h-1/2 bg-white/20 rounded-full blur-xl"
        />
      </motion.div>
    </div>
  );
}
