import { useState, useRef, useEffect } from "react";
import { Camera, X, Check, Share2, Sparkles, ChevronLeft, ChevronRight, ShoppingCart, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { toast } from "sonner";
import { Link } from "react-router";

const AR_PRODUCTS = [
  {
    id: "1",
    name: "Minimalist Leather Sneakers",
    price: "$189.00",
    image: "https://images.unsplash.com/photo-1642957464439-7c653ed1328c",
    overlay: "https://images.unsplash.com/photo-1555145777-08bc06f96c63", // Mock AR overlay image
  },
  {
    id: "2",
    name: "Onyx Edition Smart Watch",
    price: "$349.00",
    image: "https://images.unsplash.com/photo-1578934856555-c762fea60c92",
    overlay: "https://images.unsplash.com/photo-1765970101376-4d5153f56e81",
  },
];

export function AR() {
  const [selectedProduct, setSelectedProduct] = useState(AR_PRODUCTS[0]);
  const [isProcessing, setIsProcessing] = useState(true);
  const [showBefore, setShowBefore] = useState(false);

  useEffect(() => {
    // Simulate AR initialization
    const timer = setTimeout(() => setIsProcessing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleCapture = () => {
    toast.success("Photo captured and saved to gallery!");
  };

  return (
    <div className="relative h-screen bg-black overflow-hidden pt-10">
      {/* AR Background Mock (Full screen camera preview) */}
      <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center overflow-hidden">
        {/* Placeholder for camera preview */}
        <div className="relative w-full h-full">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9" // Street style / lifestyle shot
            alt="Camera background"
            className={`w-full h-full object-cover transition-all duration-700 ${showBefore ? "grayscale-0" : "grayscale-[0.4] contrast-125"}`}
          />
          
          {/* Mock AR overlay - item appearing in the scene */}
          {!isProcessing && !showBefore && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 pointer-events-none"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [-1, 1, -1]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full h-full bg-white/20 backdrop-blur-xl rounded-full p-8 border border-white/40 shadow-2xl flex items-center justify-center"
                >
                   <ImageWithFallback
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)]"
                  />
                </motion.div>
                
                {/* AR Tracking Points */}
                <div className="absolute top-0 left-0 size-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 size-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 size-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 size-4 border-b-2 border-r-2 border-primary" />
              </div>
            </motion.div>
          )}

          {/* AR Processing UI */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white space-y-8"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="size-20 border-4 border-primary/20 border-t-primary rounded-full"
                  />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-black mb-2 tracking-tight uppercase">Initializing AR Engine</h3>
                  <p className="text-white/60">Scanning your environment...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-24 left-6 right-6 flex items-center justify-between z-10">
        <Link 
          to="/dashboard" 
          className="p-3 bg-black/40 backdrop-blur-xl text-white rounded-full hover:bg-black/60 transition-all border border-white/10 shadow-lg"
        >
          <X size={20} />
        </Link>
        
        <div className="flex bg-black/40 backdrop-blur-xl rounded-2xl p-1 border border-white/10 shadow-lg">
          <button
            onClick={() => setShowBefore(false)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${!showBefore ? "bg-primary text-primary-foreground shadow-lg" : "text-white/60 hover:text-white"}`}
          >
            AR Active
          </button>
          <button
            onClick={() => setShowBefore(true)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${showBefore ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"}`}
          >
            Before
          </button>
        </div>

        <button className="p-3 bg-black/40 backdrop-blur-xl text-white rounded-full hover:bg-black/60 transition-all border border-white/10 shadow-lg">
          <RefreshCcw size={20} />
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-10 left-0 right-0 px-6 space-y-8 z-10">
        {/* Product Carousel */}
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {AR_PRODUCTS.map((product) => (
            <motion.button
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 flex items-center gap-4 p-3 pr-6 rounded-2xl border transition-all ${
                selectedProduct.id === product.id 
                  ? "bg-white border-white shadow-2xl scale-105" 
                  : "bg-black/40 backdrop-blur-xl border-white/10 text-white"
              }`}
            >
              <div className="size-14 rounded-xl overflow-hidden bg-accent">
                <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <p className={`text-xs font-bold uppercase tracking-widest ${selectedProduct.id === product.id ? "text-primary" : "text-white/40"}`}>Selected</p>
                <p className={`font-black truncate w-32 ${selectedProduct.id === product.id ? "text-black" : "text-white"}`}>{product.name}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <button 
            className="p-5 bg-white/10 backdrop-blur-xl text-white rounded-full border border-white/20 hover:bg-white/20"
          >
            <Share2 size={24} />
          </button>
          
          <button
            onClick={handleCapture}
            className="relative size-20 rounded-full border-4 border-white flex items-center justify-center p-1 bg-transparent hover:scale-105 transition-all shadow-2xl"
          >
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-primary group active:scale-90 transition-transform">
               <Camera size={32} />
            </div>
          </button>

          <Link
            to={`/product/${selectedProduct.id}`}
            className="px-8 py-5 bg-primary text-primary-foreground rounded-full font-black flex items-center gap-3 shadow-2xl hover:scale-105 transition-all"
          >
            <ShoppingCart size={20} />
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
}
