import { motion } from "motion/react";
import { User, Heart, Clock, Settings, Bell, Mic, Shield, CreditCard, LogOut, ChevronRight, Package, Sparkles } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { NavLink } from "react-router";

const SAVED_ITEMS = [
  { id: "1", name: "Modern Minimalist Sneakers", price: "$129.00", img: "https://images.unsplash.com/photo-1543175420-34298ee94d44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzbmVha2VyJTIwZGVzaWduZXIlMjBmb290d2VhciUyMG1pbmltYWxpc3QlMjB3aGl0ZSUyMHNob2UlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHklMjBzdHVkaW98ZW58MXx8fHwxNzcxNTQ4MzY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "4", name: "Designer Silk Scarf", price: "$89.00", img: "https://images.unsplash.com/photo-1621536531700-cb0d34d56699?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG9mJTIwc3R5bGlzaCUyMHlvdW5nJTIwd29tYW4lMjBpbiUyMHByZW1pdW0lMjBvdXRmaXQlMjBwcm9mZXNzaW9uYWwlMjBoaWdoJTIwZmFzaGlvbiUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3MTU0ODM2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
];

export function Profile() {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-12">
      {/* Profile Header */}
      <section className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
        <div className="relative">
          <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-white shadow-xl ring-2 ring-indigo-50">
             <ImageWithFallback 
                src="https://images.unsplash.com/photo-1672773027671-514295f5ead3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwbWluaW1hbGlzdCUyMGZhc2hpb24lMjBtb2RlbCUyMHBvcnRyYWl0cyUyMHN0eWxpc2glMjBjbG90aGluZyUyMGxpZmVzdHlsZSUyMGx1eHVyeXxlbnwxfHx8fDE3NzE1NDgzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                alt="Sarah" 
                className="w-full h-full object-cover" 
              />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white border-2 border-white shadow-lg">
             <Sparkles className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Sarah Mitchell</h1>
          <p className="text-slate-500 font-medium">Eco-Conscious Curator • Member since 2024</p>
          <div className="flex justify-center md:justify-start gap-3 mt-4">
             <div className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2">
                <Package className="w-4 h-4" /> 12 Orders
             </div>
             <div className="bg-indigo-50 px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 flex items-center gap-2">
                <Shield className="w-4 h-4" /> VIP Verified
             </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<Heart className="w-5 h-5 text-red-500" />} label="Wishlist" count="24" />
        <StatCard icon={<Clock className="w-5 h-5 text-indigo-500" />} label="History" count="86" />
        <StatCard icon={<Mic className="w-5 h-5 text-purple-500" />} label="Voice Pins" count="12" />
        <StatCard icon={<CreditCard className="w-5 h-5 text-emerald-500" />} label="Credits" count="$14.50" />
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Wishlist Preview */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Your Wishlist</h2>
            <button className="text-indigo-600 font-bold text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {SAVED_ITEMS.map((item) => (
              <NavLink to={`/product/${item.id}`} key={item.id} className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-slate-100 hover:border-indigo-100 transition-all group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100 group-hover:scale-110 transition-transform">
                  <ImageWithFallback src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                  <p className="text-slate-400 font-bold text-sm mt-1">{item.price}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
              </NavLink>
            ))}
          </div>
        </section>

        {/* Account Settings */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Experience Preferences</h2>
          <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
             <SettingsItem icon={<Bell className="w-5 h-5" />} label="Smart Notifications" toggle active />
             <SettingsItem icon={<Mic className="w-5 h-5" />} label="Voice Personality" value="Friendly" />
             <SettingsItem icon={<Sparkles className="w-5 h-5" />} label="AI Curations" toggle active />
             <SettingsItem icon={<Settings className="w-5 h-5" />} label="Account Settings" />
             <SettingsItem icon={<LogOut className="w-5 h-5 text-red-400" />} label="Log Out" color="red" last />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, label, count }: { icon: React.ReactNode, label: string, count: string }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-center hover:shadow-xl hover:-translate-y-1 transition-all">
       <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
         {icon}
       </div>
       <div>
         <p className="text-2xl font-bold text-slate-900">{count}</p>
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
       </div>
    </div>
  );
}

function SettingsItem({ icon, label, toggle, active, value, color, last }: { icon: React.ReactNode, label: string, toggle?: boolean, active?: boolean, value?: string, color?: string, last?: boolean }) {
  return (
    <div className={`p-6 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${!last ? "border-b border-slate-50" : ""}`}>
      <div className="flex items-center gap-4">
         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color === "red" ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400"}`}>
            {icon}
         </div>
         <span className={`font-bold text-sm ${color === "red" ? "text-red-500" : "text-slate-700"}`}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
         {value && <span className="text-sm font-bold text-slate-400 mr-2">{value}</span>}
         {toggle ? (
           <div className={`w-12 h-6 rounded-full transition-all relative p-1 ${active ? "bg-indigo-600" : "bg-slate-200"}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-all ${active ? "translate-x-6" : "translate-x-0"}`} />
           </div>
         ) : (
           <ChevronRight className="w-4 h-4 text-slate-300" />
         )}
      </div>
    </div>
  );
}
