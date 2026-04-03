import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * DiscordSearch Component
 * @param {Object} props
 * @param {string} props.theme - 'dark' or 'light'
 * @param {Object} props.p - Palette object
 * @param {Function} props.onSearch - Callback when search is submitted
 * @param {Array} props.providers - List of providers to filter
 * @param {boolean} props.compact - If true, smaller for navbar
 */
export default function DiscordSearch({ theme, p, onSearch, providers = [], compact = false }) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [activeFilter, setActiveFilter] = useState(null); 
  const [results, setResults] = useState([]);
  const containerRef = useRef(null);

  const CITIES = ["Algiers", "Oran", "Constantine", "Annaba", "Sétif", "Mila", "Ferdjioua"];
  const SERVICES_LIST = ["Cleaning", "Plumbing", "Electrical", "Childcare", "Gardening", "Tutoring"];
  const CATEGORIES_LIST = ["Home Cleaning", "Plumbing", "Electrical", "Childcare", "Gardening", "Tutoring"];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
        setActiveFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (inputValue.trim() === "") {
      setResults([]);
      return;
    }

    const lowerInput = inputValue.toLowerCase();
    const filtered = providers.filter(p_item => {
      const name = p_item.name?.toLowerCase() || "";
      const service = p_item.service?.toLowerCase() || "";
      const location = p_item.location?.toLowerCase() || "";
      const tags = Array.isArray(p_item.tags) ? p_item.tags.join(" ").toLowerCase() : "";

      if (lowerInput.includes("location:")) {
        const cityMatch = lowerInput.split("location:")[1]?.trim();
        if (cityMatch && !location.includes(cityMatch)) return false;
      }
      if (lowerInput.includes("service:")) {
        const serviceMatch = lowerInput.split("service:")[1]?.trim();
        if (serviceMatch && !service.includes(serviceMatch)) return false;
      }
      
      return name.includes(lowerInput) || service.includes(lowerInput) || tags.includes(lowerInput);
    });

    setResults(filtered);
  }, [inputValue, providers]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.endsWith(" ")) {
        setActiveFilter(null);
        return;
    }
    const lastWord = val.split(" ").pop();
    if (lastWord.startsWith("location:")) setActiveFilter("location");
    else if (lastWord.startsWith("service:")) setActiveFilter("service");
    else if (lastWord.startsWith("category:")) setActiveFilter("category");
    else if (val === "") setActiveFilter(null);
  };

  const selectFilter = (filterType) => {
    setInputValue(prev => {
        const words = prev.split(" ");
        words.pop();
        return [...words, `${filterType}:`].join(" ").trimStart();
    });
    setActiveFilter(filterType);
  };

  const selectValue = (val) => {
    setInputValue(prev => {
        const words = prev.split(" ");
        const lastWord = words.pop();
        const filterKey = lastWord.split(":")[0];
        return [...words, `${filterKey}:${val} `].join(" ").trimStart();
    });
    setActiveFilter(null);
  };

  const getSuggestions = () => {
    const lastWord = inputValue.split(" ").pop();
    const currentVal = lastWord.split(":")[1] || "";
    let list = [];
    if (activeFilter === "location") list = CITIES;
    else if (activeFilter === "service") list = SERVICES_LIST;
    else if (activeFilter === "category") list = CATEGORIES_LIST;
    return list.filter(item => item.toLowerCase().includes(currentVal.toLowerCase()));
  };

  const isDark = theme === "dark";

  return (
    <div ref={containerRef} className={`relative w-full z-50 transition-all duration-300 ${compact ? 'max-w-xl' : 'max-w-3xl mx-auto'}`}>
      <div 
        className={`flex items-center rounded-2xl border transition-all duration-300 group ${
          compact ? 'p-2' : 'p-4 border-2'
        } ${
          isFocused 
            ? 'border-[#2FB0BC] shadow-[0_0_30px_rgba(47,176,188,0.15)] bg-white/5' 
            : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'
        }`}
        style={{ 
           backdropFilter: 'blur(10px)',
           background: isFocused ? p.cardBg : 'transparent'
        }}
      >
        <span className={`${compact ? 'text-lg ml-3 mr-3' : 'text-2xl ml-2 mr-4'} transition-colors duration-300 ${isFocused ? 'text-[#2FB0BC]' : 'opacity-30'}`}>⌕</span>
        <input
          className={`flex-1 bg-transparent border-none outline-none font-medium tracking-tight ${compact ? 'text-base py-1' : 'text-xl py-2'}`}
          style={{ color: p.text }}
          placeholder="Search"
          value={inputValue}
          onFocus={() => setIsFocused(true)}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSearch(inputValue, results);
          }}
        />
        <AnimatePresence>
          {inputValue && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setInputValue("")}
              className={`hover:bg-white/10 rounded-full mr-2 text-white/40 hover:text-white transition-colors ${compact ? 'p-1 text-xs' : 'p-2'}`}
            >
              ✕
            </motion.button>
          )}
        </AnimatePresence>
        {!compact && (
          <button 
            onClick={() => onSearch(inputValue, results)}
            className="px-8 py-3 rounded-xl font-bold text-white transition-all active:scale-95 shadow-lg shadow-[#2FB0BC]/20 hover:shadow-[#2FB0BC]/40"
            style={{ background: p.primary }}
          >
            Find Experts
          </button>
        )}
      </div>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className={`absolute top-full left-0 right-0 mt-4 rounded-3xl border shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-2xl ${
              isDark ? 'bg-[#0a0a0a]/90 border-white/10' : 'bg-white/95 border-gray-200'
            }`}
          >
            <div className="p-3 max-h-[450px] overflow-y-auto custom-scrollbar">
              {!activeFilter ? (
                <>
                  <div className="px-4 py-3 text-[11px] font-bold tracking-[0.1em] opacity-40 uppercase">
                    Advanced Filters
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      { id: 'location', label: 'location:', desc: 'Filter by city (e.g. Oran)' },
                      { id: 'service', label: 'service:', desc: 'Filter by job type' },
                      { id: 'category', label: 'category:', desc: 'Filter by industry' }
                    ].map(f => (
                      <button 
                        key={f.id}
                        onClick={() => selectFilter(f.id)}
                        className={`w-full text-left px-4 py-3 rounded-2xl flex items-center gap-4 transition-all ${
                          isDark ? 'hover:bg-white/5 hover:translate-x-1' : 'hover:bg-black/5 hover:translate-x-1'
                        }`}
                      >
                        <span className="text-[#2FB0BC] font-mono font-bold">{f.label}</span>
                        <span className="opacity-40 text-sm font-medium">{f.desc}</span>
                      </button>
                    ))}
                  </div>

                  {results.length > 0 && (
                    <>
                      <div className="px-4 py-3 mt-6 text-[11px] font-bold tracking-[0.1em] opacity-40 uppercase border-t border-white/5 pt-6">
                        Top Results ({results.length})
                      </div>
                      <div className="space-y-1 mt-2">
                        {results.slice(0, 5).map(provider => (
                          <div 
                            key={provider.id}
                            className={`px-4 py-3 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${
                              isDark ? 'hover:bg-white/5 hover:translate-x-1' : 'hover:bg-black/5 hover:translate-x-1'
                            }`}
                            onClick={() => onSearch(provider.name, [provider])}
                          >
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-2xl" style={{ background: p.primary }}>
                              {provider.img}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-lg" style={{ color: p.text }}>{provider.name}</div>
                              <div className="text-sm opacity-50 font-medium">{provider.service} • {provider.rating}★</div>
                            </div>
                            <div className="text-xs font-bold text-[#2FB0BC] bg-[#2FB0BC]/10 px-3 py-1.5 rounded-full uppercase tracking-wider">Profile</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 mb-4">
                    <div className="text-[11px] font-bold tracking-[0.1em] opacity-40 uppercase">
                      Select {activeFilter}
                    </div>
                    <button onClick={() => setActiveFilter(null)} className="text-xs font-bold text-[#2FB0BC] hover:underline px-2 py-1">← Back</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-2">
                    {getSuggestions().length > 0 ? (
                      getSuggestions().map(s => (
                        <button 
                          key={s} 
                          onClick={() => selectValue(s)}
                          className={`text-left px-5 py-4 rounded-2xl text-base font-medium transition-all ${
                            isDark ? 'bg-white/5 hover:bg-[#2FB0BC] hover:text-white hover:-translate-y-1' : 'bg-black/5 hover:bg-[#2FB0BC] hover:text-white hover:-translate-y-1'
                          }`}
                          style={{ color: p.text }}
                        >
                          {s}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-2 px-4 py-8 text-center opacity-30 text-lg italic font-medium">
                        No matches found for this filter...
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
