import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Star, Heart, Share2, Camera, ShoppingBag, Sparkles, MessageSquare, Info, ShieldCheck, Truck, CheckCircle, TrendingUp, ExternalLink } from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { addItemsToCart } from "../../services/cartStore";
import { aggregateBundleEvidence, type BundleEvidence } from "../../services/evidenceAggregator";

const PRODUCTS = {
  "1": { name: "Modern Minimalist Sneakers", price: "$129.00", rating: 4.8, reviews: 124, description: "A perfect blend of style and sustainability. These sneakers are made from 100% recycled materials and feature our signature cloud-foam comfort tech.", colors: ["#FFFFFF", "#1E293B", "#6366F1"], img: "https://images.unsplash.com/photo-1543175420-34298ee94d44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzbmVha2VyJTIwZGVzaWduZXIlMjBmb290d2VhciUyMG1pbmltYWxpc3QlMjB3aGl0ZSUyMHNob2UlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHklMjBzdHVkaW98ZW58MXx8fHwxNzcxNTQ4MzY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  "2": { name: "Eco-Friendly Linen Jacket", price: "$249.00", rating: 4.9, reviews: 86, description: "Stay cool and conscious with this lightweight linen jacket. Sourced from organic flax and hand-finished for premium quality.", colors: ["#D1D5DB", "#4B5563", "#065F46"], img: "https://images.unsplash.com/photo-1759229874709-a8d0de083b91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGZhc2hpb24lMjBlY28tZnJpZW5kbHklMjBvcmdhbmljJTIwY290dG9uJTIwY2xvdGhpbmclMjBtaW5pbWFsJTIwZGVzaWduJTIwZWFydGglMjB0b25lc3xlbnwxfHx8fDE3NzE1NDgzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  "3": { name: "Smart Vision Glasses", price: "$399.00", rating: 4.7, reviews: 52, description: "The ultimate tech-accessory. Featuring integrated AR displays and voice-controlled AI assistant integration.", colors: ["#000000", "#111827", "#FACC15"], img: "https://images.unsplash.com/photo-1562330744-0e81c1e9dd88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGdsYXNzZXMlMjBhdWdtZW50ZWQlMjByZWFsaXR5JTIwdGVjaCUyMGZ1dHVyaXN0aWMlMjB3ZWFyYWJsZSUyMEFJJTIwaGVhZHNldCUyMGRlc2lnbnxlbnwxfHx8fDE3NzE1NDgzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
};

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("AI Summary");
  const [selectedColor, setSelectedColor] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [evidence, setEvidence] = useState<BundleEvidence | null>(null);

  const product = PRODUCTS[id as keyof typeof PRODUCTS] || PRODUCTS["1"];

  useEffect(() => {
    aggregateBundleEvidence({
      bundleId: id || "1",
      query: product.name,
      category: "fashion",
    }).then(setEvidence).catch(() => {/* silently ignore */});
  }, [id, product.name]);

  const handleBuyNow = () => {
    const priceNum = parseFloat(product.price.replace(/[^0-9.]/g, ""));
    addItemsToCart([{
      productId: id || "1",
      name: product.name,
      price: priceNum,
      category: "fashion",
      quantity: 1,
    }]);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-screen lg:pt-8">
        {/* Left: Product Images */}
        <div className="lg:w-1/2 p-6 space-y-4">
          <div className="relative aspect-square rounded-[40px] overflow-hidden bg-slate-100 shadow-xl lg:shadow-none lg:border border-slate-100">
             <ImageWithFallback src={product.img} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
             <div className="absolute top-6 left-6 flex flex-col gap-3">
               <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-900 shadow-lg hover:bg-white transition-all">
                 <ChevronLeft className="w-6 h-6" />
               </button>
             </div>
             <div className="absolute top-6 right-6 flex flex-col gap-3">
               <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-400 shadow-lg hover:text-red-500 transition-all">
                 <Heart className="w-6 h-6" />
               </button>
               <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-400 shadow-lg hover:text-slate-900 transition-all">
                 <Share2 className="w-5 h-5" />
               </button>
             </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-square rounded-[24px] overflow-hidden bg-slate-100 border border-slate-100 opacity-60 hover:opacity-100 cursor-pointer transition-all">
                <ImageWithFallback src={product.img} alt={product.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="lg:w-1/2 p-6 md:p-12 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-widest text-xs">
              <Sparkles className="w-4 h-4" />
              ShopMind AI Recommended
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-slate-900">{product.price}</span>
              <div className="w-[1px] h-6 bg-slate-200" />
              <div className="flex items-center gap-1.5 font-bold">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-slate-900">{product.rating}</span>
                <span className="text-slate-400 text-sm font-medium">({product.reviews} reviews)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-900">Select Color</h3>
            <div className="flex gap-4">
              {product.colors.map((color, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  className={`w-12 h-12 rounded-2xl border-2 transition-all p-1 ${selectedColor === i ? "border-indigo-600" : "border-slate-100"}`}
                >
                  <div className="w-full h-full rounded-xl" style={{ backgroundColor: color }} />
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Tabs */}
          <div className="space-y-6">
            <div className="flex border-b border-slate-100">
              {["AI Summary", "Overview", "Reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-bold text-sm transition-all relative ${activeTab === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "AI Summary" ? (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100 space-y-4"
                >
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                        <Sparkles className="w-5 h-5 text-white" />
                     </div>
                     <div>
                        <p className="text-indigo-600 font-bold text-sm">AI Curated Insight</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Confidence: 98%</p>
                     </div>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium italic">
                    "This item perfectly matches your interest in minimalist footwear. It uses high-performance materials usually found in professional athlete gear, but redesigned for everyday eco-conscious lifestyles. Verified highly durable based on long-term owner reviews."
                  </p>
                  {evidence && (
                    <div className="border-t border-indigo-100 pt-4 space-y-3">
                      <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> Trend Evidence
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed">{evidence.summary}</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {[
                          { label: "Trend", value: evidence.trendScore },
                          { label: "Price", value: evidence.priceScore },
                          { label: "Buzz", value: evidence.popularityScore },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-white rounded-xl p-2 border border-indigo-100">
                            <div className="text-lg font-extrabold text-indigo-600">{value}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</div>
                          </div>
                        ))}
                      </div>
                      {evidence.sourceCitations.length > 0 && (
                        <div className="space-y-1.5">
                          {evidence.sourceCitations.slice(0, 2).map((c, i) => (
                            <a
                              key={i}
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-2 text-xs text-slate-500 hover:text-indigo-600 transition-colors group"
                            >
                              <ExternalLink className="w-3 h-3 mt-0.5 shrink-0 group-hover:text-indigo-500" />
                              <span className="line-clamp-1">{c.title}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <button onClick={() => navigate("/chat")} className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline">
                    <MessageSquare className="w-4 h-4" /> Ask AI about fit & sizing
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 text-slate-600 leading-relaxed"
                >
                  <p>{product.description}</p>
                  <ul className="space-y-3">
                     <FeatureItem icon={<ShieldCheck className="w-5 h-5" />} label="Sustainable Materials" />
                     <FeatureItem icon={<Truck className="w-5 h-5" />} label="Carbon-Neutral Delivery" />
                     <FeatureItem icon={<Info className="w-5 h-5" />} label="365-Day Return Policy" />
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-slate-900 text-white py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-slate-800 shadow-xl transition-all"
            >
              {addedToCart ? (
                <><CheckCircle className="w-6 h-6 text-green-400" /> Added to Cart!</>
              ) : (
                <><ShoppingBag className="w-6 h-6" /> Buy Now</>
              )}
            </button>
            <button 
              onClick={() => navigate(`/ar/${id || "1"}`)}
              className="flex-1 bg-white border border-slate-200 text-slate-900 py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm"
            >
               <Camera className="w-6 h-6 text-indigo-500" /> Try in AR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <li className="flex items-center gap-3 font-bold text-slate-900 text-sm">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
        {icon}
      </div>
      {label}
    </li>
  );
}
