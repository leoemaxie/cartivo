import { motion, AnimatePresence } from "motion/react";
import { Mic, Send, X, Camera, Sparkles, ShoppingBag } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AIOrb } from "../components/AIOrb";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { NavLink } from "react-router";

const MOCK_MESSAGES = [
  { id: 1, type: "user", text: "I'm looking for some sustainable sneakers for my morning walks.", time: "10:24 AM" },
  { 
    id: 2, 
    type: "ai", 
    text: "Great choice! Sustainability is a key focus for our curated collections this season. Based on your preference for comfort and eco-friendly materials, I found these high-performance options:", 
    time: "10:24 AM",
    products: [
      { id: "1", name: "Recycled Ocean Foam Sneakers", price: "$145.00", rating: 4.9, img: "https://images.unsplash.com/photo-1543175420-34298ee94d44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzbmVha2VyJTIwZGVzaWduZXIlMjBmb290d2VhciUyMG1pbmltYWxpc3QlMjB3aGl0ZSUyMHNob2UlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHklMjBzdHVkaW98ZW58MXx8fHwxNzcxNTQ4MzY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", source: "EcoRetail.com" },
      { id: "2", name: "Plant-Based Runner 2.0", price: "$119.00", rating: 4.7, img: "https://images.unsplash.com/photo-1759229874709-a8d0de083b91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGZhc2hpb24lMjBlY28tZnJpZW5kbHklMjBvcmdhbmljJTIwY290dG9uJTIwY2xvdGhpbmclMjBtaW5pbWFsJTIwZGVzaWduJTIwZWFydGglMjB0b25lc3xlbnwxfHx8fDE3NzE1NDgzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", source: "GreenStep" },
    ],
    sources: ["Sustainability Review 2024", "Verified Eco-Logistics"]
  }
];

export function Chat() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newUserMsg = { id: Date.now(), type: "user", text: inputValue, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages([...messages, newUserMsg]);
    setInputValue("");
    
    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const newAiMsg = { 
        id: Date.now() + 1, 
        type: "ai", 
        text: "Understood. I'm analyzing your request against our current sustainable inventory and cross-referencing with your past style preferences...", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setMessages(prev => [...prev, newAiMsg]);
    }, 2000);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate voice input
      setTimeout(() => {
        setInputValue("Show me that white jacket again.");
        setIsListening(false);
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-[calc(100vh-120px)] bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-100 rounded-full blur-[120px] opacity-30 pointer-events-none" />

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar scroll-smooth"
      >
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"} gap-4`}>
              {msg.type === "ai" && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">ShopMind AI</span>
                </div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`max-w-[85%] p-5 rounded-[28px] text-lg leading-relaxed shadow-sm ${msg.type === "user" ? "bg-slate-900 text-white rounded-tr-sm" : "bg-white text-slate-800 rounded-tl-sm border border-slate-100"}`}
              >
                {msg.text}
              </motion.div>

              {msg.products && (
                <div className="flex gap-4 overflow-x-auto pb-4 w-full no-scrollbar">
                  {msg.products.map((p: any) => (
                    <div key={p.id} className="min-w-[280px] bg-white rounded-[32px] p-4 shadow-xl border border-slate-100 flex flex-col gap-4">
                      <div className="relative aspect-square rounded-[24px] overflow-hidden bg-slate-100">
                        <ImageWithFallback src={p.img} alt={p.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-600 shadow-sm">
                          Source: {p.source}
                        </div>
                      </div>
                      <div className="px-1 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-900 leading-tight">{p.name}</h4>
                          <p className="text-indigo-600 font-bold mt-1">{p.price}</p>
                        </div>
                        <div className="flex gap-2">
                          <NavLink to={`/ar/${p.id}`} className="flex-1 bg-slate-100 text-slate-800 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                            <Camera className="w-4 h-4" /> Try in AR
                          </NavLink>
                          <button className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all">
                            <ShoppingBag className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {msg.sources && (
                <div className="flex flex-wrap gap-2">
                  {msg.sources.map((s: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                      <CornerDownRight className="w-3 h-3" />
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-200 animate-pulse" />
              <div className="flex gap-1.5">
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    className="w-1.5 h-1.5 bg-slate-300 rounded-full"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 pb-12 lg:pb-8 bg-linear-to-t from-slate-50 to-transparent">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex flex-col items-center gap-4 mb-8"
              >
                <AIOrb size="sm" active />
                <p className="text-indigo-600 font-bold animate-pulse">Listening...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white rounded-[32px] p-3 shadow-2xl border border-slate-100 flex items-center gap-3">
            <button className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all">
              <Camera className="w-6 h-6" />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 text-lg placeholder:text-slate-300"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleListening}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isListening ? "bg-red-500 text-white" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
            >
              <Mic className="w-6 h-6" />
            </motion.button>
            <button 
              onClick={handleSend}
              className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex justify-center gap-6 mt-6">
            <QuickAction label="Sizing guide" />
            <QuickAction label="Best sellers" />
            <QuickAction label="Return policy" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ label }: { label: string }) {
  return (
    <button className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
      {label}
    </button>
  );
}
