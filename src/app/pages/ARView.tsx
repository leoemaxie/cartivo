import { motion, AnimatePresence } from "motion/react";
import { X, Camera, Share2, CornerUpLeft, CornerUpRight, ShoppingBag, Eye, EyeOff, Sparkles, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams, NavLink } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const PRODUCTS = [
  { id: "1", name: "Modern Minimalist Sneakers", price: "$129.00", img: "https://images.unsplash.com/photo-1543175420-34298ee94d44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzbmVha2VyJTIwZGVzaWduZXIlMjBmb290d2VhciUyMG1pbmltYWxpc3QlMjB3aGl0ZSUyMHNob2UlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHklMjBzdHVkaW98ZW58MXx8fHwxNzcxNTQ4MzY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "2", name: "Eco-Friendly Linen Jacket", price: "$249.00", img: "https://images.unsplash.com/photo-1759229874709-a8d0de083b91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGZhc2hpb24lMjBlY28tZnJpZW5kbHklMjBvcmdhbmljJTIwY290dG9uJTIwY2xvdGhpbmclMjBtaW5pbWFsJTIwZGVzaWduJTIwZWFydGglMjB0b25lc3xlbnwxfHx8fDE3NzE1NDgzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "3", name: "Smart Vision Glasses", price: "$399.00", img: "https://images.unsplash.com/photo-1562330744-0e81c1e9dd88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGdsYXNzZXMlMjBhdWdtZW50ZWQlMjByZWFsaXR5JTIwdGVjaCUyMGZ1dHVyaXN0aWMlMjB3ZWFyYWJsZSUyMEFJJTIwaGVhZHNldCUyMGRlc2lnbnxlbnwxfHx8fDE3NzE1NDgzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
];

export function ARView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showProduct, setShowProduct] = useState(true);
  const [scanning, setScanning] = useState(true);
  const [activeId, setActiveId] = useState(id || "1");

  useEffect(() => {
    const timer = setTimeout(() => setScanning(false), 2000);
    return () => clearTimeout(timer);
  }, [activeId]);

  const currentProduct = PRODUCTS.find(p => p.id === activeId) || PRODUCTS[0];

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center overflow-hidden">
      {/* Camera Mock Background */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1749705319317-f9a2bf24fe3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjbGVhbiUyMGxpdmluZyUyMHJvb20lMjBpbnRlcmlvciUyMGRlc2lnbmVyJTIwbWluaW1hbGlzdCUyMGhpZ2gtZW5kJTIwaG9tZSUyMG9mZmljZXxlbnwxfHx8fDE3NzE1NDgzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
          alt="Camera view" 
          className="w-full h-full object-cover opacity-60 grayscale-[0.5]"
        />
        
        {/* AR Overlay Visualization */}
        <AnimatePresence>
          {showProduct && !scanning && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 z-10"
            >
              <div className="relative group">
                <ImageWithFallback 
                  src={currentProduct.img} 
                  alt={currentProduct.name} 
                  className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] mix-blend-screen"
                />
                
                {/* Floating AR Measurement Pointers */}
                <div className="absolute top-[20%] right-[-20px] bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  Length: 28.5cm
                </div>
                <div className="absolute bottom-[10%] left-[-20px] bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                  Optimal Fit
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanning Animation */}
        <AnimatePresence>
          {scanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
            >
              <div className="w-64 h-64 border-2 border-indigo-500/50 rounded-full relative overflow-hidden">
                <motion.div
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute w-full h-[2px] bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                />
              </div>
              <p className="mt-8 text-indigo-400 font-bold uppercase tracking-[0.2em] text-sm flex items-center gap-3">
                <Sparkles className="w-5 h-5 animate-spin" />
                Analyzing Surface...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-30">
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex bg-white/10 backdrop-blur-md rounded-full border border-white/20 p-1">
          <button 
            onClick={() => setShowProduct(true)}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${showProduct ? "bg-white text-slate-900 shadow-lg" : "text-white"}`}
          >
            AR Active
          </button>
          <button 
            onClick={() => setShowProduct(false)}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${!showProduct ? "bg-white text-slate-900 shadow-lg" : "text-white"}`}
          >
            Real View
          </button>
        </div>

        <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Capture Button */}
      <div className="absolute bottom-40 flex flex-col items-center gap-4 z-30">
         <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1.5 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all"
        >
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
             <Camera className="w-8 h-8 text-slate-900" />
          </div>
        </motion.button>
        <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Tap to capture</span>
      </div>

      {/* Bottom Carousel */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-30 bg-linear-to-t from-black/80 to-transparent">
        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
          {PRODUCTS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setScanning(true);
                setActiveId(p.id);
              }}
              className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all p-1 ${activeId === p.id ? "border-indigo-500 scale-110 shadow-[0_0_20px_rgba(99,102,241,0.5)]" : "border-transparent opacity-60"}`}
            >
              <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden">
                <ImageWithFallback src={p.img} alt={p.name} className="w-full h-full object-cover" />
              </div>
            </button>
          ))}
          <button className="flex-shrink-0 w-24 h-24 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all">
             <ShoppingBag className="w-6 h-6 text-white/40" />
             <span className="text-[10px] font-bold text-white/40">Shop more</span>
          </button>
        </div>
      </div>

      {/* Product Mini Info */}
      <motion.div 
        animate={{ y: [20, 0] }}
        className="absolute bottom-28 left-6 right-6 flex items-center justify-between z-30"
      >
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 flex items-center gap-4 max-w-xs">
          <div className="w-12 h-12 bg-white rounded-2xl overflow-hidden flex-shrink-0">
             <ImageWithFallback src={currentProduct.img} alt={currentProduct.name} className="w-full h-full object-cover" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-white font-bold text-sm truncate">{currentProduct.name}</h4>
            <p className="text-indigo-400 font-bold text-xs">{currentProduct.price}</p>
          </div>
        </div>
        
        <NavLink to={`/product/${currentProduct.id}`} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl hover:scale-110 transition-all">
           <ShoppingBag className="w-6 h-6" />
        </NavLink>
      </motion.div>
    </div>
  );
}
