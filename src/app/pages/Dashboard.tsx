import { motion } from "motion/react";
import { Search, Filter, Sparkles, TrendingUp, Leaf, ArrowRight, Star, Heart } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { NavLink } from "react-router";

const PRODUCTS = [
  { id: "1", name: "Modern Minimalist Sneakers", price: "$129.00", rating: 4.8, category: "Recommended", img: "https://images.unsplash.com/photo-1543175420-34298ee94d44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzbmVha2VyJTIwZGVzaWduZXIlMjBmb290d2VhciUyMG1pbmltYWxpc3QlMjB3aGl0ZSUyMHNob2UlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHklMjBzdHVkaW98ZW58MXx8fHwxNzcxNTQ4MzY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "2", name: "Eco-Friendly Linen Jacket", price: "$249.00", rating: 4.9, category: "Sustainable", img: "https://images.unsplash.com/photo-1759229874709-a8d0de083b91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGZhc2hpb24lMjBlY28tZnJpZW5kbHklMjBvcmdhbmljJTIwY290dG9uJTIwY2xvdGhpbmclMjBtaW5pbWFsJTIwZGVzaWduJTIwZWFydGglMjB0b25lc3xlbnwxfHx8fDE3NzE1NDgzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "3", name: "Smart Vision Glasses", price: "$399.00", rating: 4.7, category: "Trending", img: "https://images.unsplash.com/photo-1562330744-0e81c1e9dd88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGdsYXNzZXMlMjBhdWdtZW50ZWQlMjByZWFsaXR5JTIwdGVjaCUyMGZ1dHVyaXN0aWMlMjB3ZWFyYWJsZSUyMEFJJTIwaGVhZHNldCUyMGRlc2lnbnxlbnwxfHx8fDE3NzE1NDgzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "4", name: "Designer Silk Scarf", price: "$89.00", rating: 4.6, category: "Recommended", img: "https://images.unsplash.com/photo-1621536531700-cb0d34d56699?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG9mJTIwc3R5bGlzaCUyMHlvdW5nJTIwd29tYW4lMjBpbiUyMHByZW1pdW0lMjBvdXRmaXQlMjBwcm9mZXNzaW9uYWwlMjBoaWdoJTIwZmFzaGlvbiUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3MTU0ODM2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
];

export function Dashboard() {
  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div>
          <p className="text-slate-500 font-medium tracking-wide">Good evening, Sarah</p>
          <h1 className="text-4xl font-bold text-slate-900 mt-2 tracking-tight">Your Smart Shop</h1>
        </div>
        
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by text, photo, or voice..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
          <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 cursor-pointer" />
        </div>
      </motion.div>

      {/* Filter Chips */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
        <Chip active label="For You" icon={<Sparkles className="w-4 h-4" />} />
        <Chip label="Trending" icon={<TrendingUp className="w-4 h-4" />} />
        <Chip label="Sustainable" icon={<Leaf className="w-4 h-4" />} />
        <Chip label="Under $100" />
        <Chip label="New Arrivals" />
      </div>

      {/* Recommended Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recommended for You</h2>
          <button className="text-indigo-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* AI Insight Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-linear-to-r from-indigo-600 to-indigo-800 rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden shadow-xl"
      >
        <div className="relative z-10 max-w-md space-y-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-3xl font-bold leading-tight">AI Fashion Curator</h3>
          <p className="text-indigo-100/80 leading-relaxed text-lg">
            Based on your recent interest in sustainable fabrics, I've curated a new collection of organic cotton layers for spring.
          </p>
          <button className="bg-white text-indigo-700 font-bold px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-all flex items-center gap-3 mt-4">
            Explore Collection
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full hidden md:block opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-[80px]" />
        </div>
        <div className="absolute bottom-[-50px] right-[-50px] w-96 h-96 bg-purple-500/30 rounded-full blur-[100px]" />
      </motion.div>

      {/* Trending Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Trending Now</h2>
          <button className="text-slate-500 font-semibold flex items-center gap-2 hover:text-slate-800 transition-all">
            See More <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-64 rounded-[32px] bg-slate-200 animate-pulse" />
          ))}
        </div>
      </section>
    </div>
  );
}

function Chip({ label, icon, active = false }: { label: string, icon?: React.ReactNode, active?: boolean }) {
  return (
    <button className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border ${active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
      {icon}
      {label}
    </button>
  );
}

function ProductCard({ product, index }: { product: any, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className="group"
    >
      <NavLink to={`/product/${product.id}`} className="space-y-4">
        <div className="relative aspect-square rounded-[32px] overflow-hidden bg-slate-100 shadow-sm transition-all group-hover:shadow-xl group-hover:-translate-y-1">
          <ImageWithFallback src={product.img} alt={product.name} className="w-full h-full object-cover" />
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all">
            <Heart className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
        
        <div className="px-2">
          <div className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>{product.category}</span>
          </div>
          <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{product.name}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-slate-900">{product.price}</span>
            <div className="flex items-center gap-1 text-sm font-bold text-slate-500">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>
        </div>
      </NavLink>
    </motion.div>
  );
}
