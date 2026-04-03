// src/pages/client/BrowseProviders.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

const PALETTES = {
  dark: {
    primary: "#2FB0BC",
    secondary: "#6BC8B2",
    bg: "#0e0e0e",
    cardBg: "rgba(255,255,255,0.02)",
    text: "#e8e6e0",
    textMuted: "rgba(232,230,224,0.5)",
    border: "rgba(255,255,255,0.06)",
    glow: "rgba(47,176,188,0.04)",
    grid: "rgba(255,255,255,0.02)"
  },
  light: {
    primary: "#2FB0BC",
    secondary: "#6BC8B2",
    bg: "#F8FBFB",
    cardBg: "#FFFFFF",
    text: "#2C3E50",
    textMuted: "rgba(44,62,80,0.5)",
    border: "#E0E7E7",
    glow: "rgba(47,176,188,0.06)",
    grid: "#E0E7E7"
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9], staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function BrowseProviders() {
  const { user } = useAuth();
  const [theme, setTheme] = useState("dark");
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([{ id_category: "all", name: "All Categories" }]);
  const [loading, setLoading] = useState(true);

  const p = PALETTES[theme];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [provRes, catRes] = await Promise.all([
          axiosInstance.get('/users/providers/search'),
          axiosInstance.get('/services/categories')
        ]);
        
        if (provRes.data.success) {
            const mapped = provRes.data.providers.map(p_item => ({
                id: p_item.provider_id,
                name: p_item.name,
                service: p_item.services?.[0] || "Provider",
                rating: p_item.rating || 0,
                reviews: p_item.review_count || 0,
                location: p_item.location || "Unknown",
                price: p_item.price_per_hour || 0,
                img: p_item.name[0],
                categories: p_item.categories || []
            }));
            setProviders(mapped);
        }
        setCategories([{ id_category: "all", name: "All Categories" }, ...catRes.data.categories]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProviders = providers.filter(prov => {
    const matchesSearch = prov.name.toLowerCase().includes(search.toLowerCase()) || 
                          prov.service.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCat === "all" || prov.categories.includes(activeCat);
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={{ ...styles.bgGrid, backgroundImage: theme === 'dark' ? `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)` : `radial-gradient(circle at 2px 2px, ${p.grid} 1px, transparent 0)` }} />
      
      <main style={styles.main}>
        <motion.div initial="hidden" animate="visible" variants={sectionVariants} style={styles.hero}>
          <motion.h1 variants={itemVariants} style={{ ...styles.heroTitle, color: p.text }}>
            Find the perfect <span style={{ color: p.primary }}>caregiver.</span>
          </motion.h1>
          <motion.div variants={itemVariants} style={styles.searchWrapper}>
            <input 
              style={{ ...styles.searchInput, background: p.cardBg, borderColor: p.border, color: p.text }}
              placeholder="Search by name or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </motion.div>
        </motion.div>

        <div style={styles.categories}>
          {categories.map(cat => (
            <button
              key={cat.id_category}
              onClick={() => setActiveCat(cat.id_category === 'all' ? 'all' : cat.name)}
              style={{ 
                ...styles.categoryBtn, 
                background: (activeCat === "all" && cat.id_category === "all") || (activeCat === cat.name) ? p.primary : p.cardBg,
                color: (activeCat === "all" && cat.id_category === "all") || (activeCat === cat.name) ? '#fff' : p.textMuted,
                borderColor: p.border
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 40, opacity: 0.5 }}>Discovering experts...</div>
        ) : (
          <div style={styles.grid}>
            {filteredProviders.length > 0 ? (
              filteredProviders.map(provider => (
                <motion.div 
                  key={provider.id}
                  variants={itemVariants}
                  whileHover={{ y: -8, borderColor: p.primary }}
                  style={{ ...styles.card, background: p.cardBg, borderColor: p.border }}
                >
                  <div style={styles.cardHeader}>
                    <div style={{ ...styles.avatar, background: "rgba(47,176,188,0.1)", color: p.primary }}>
                      {provider.img}
                    </div>
                    <div style={styles.badge}>Available</div>
                  </div>
                  
                  <div style={styles.cardBody}>
                    <h3 style={styles.cardName}>{provider.name}</h3>
                    <p style={{ ...styles.cardService, color: p.primary }}>{provider.service}</p>
                    
                    <div style={styles.meta}>
                      <span>★ {provider.rating} ({provider.reviews})</span>
                      <span>•</span>
                      <span>{provider.location}</span>
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <div style={styles.price}>
                      <span style={styles.priceValue}>${provider.price}</span>
                      <span style={{ fontSize: 10, opacity: 0.5 }}>/hr</span>
                    </div>
                    <a href={`/client/provider/${provider.id}`} style={{ ...styles.viewBtn, background: p.primary }}>
                      View Profile
                    </a>
                  </div>
                </motion.div>
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', opacity: 0.5 }}>
                No providers found matching your criteria.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", position: "relative", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" },
  bgGrid: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4, pointerEvents: "none" },
  main: { position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "80px 40px 100px" },
  hero: { textAlign: "center", marginBottom: 60 },
  heroTitle: { fontFamily: "'Instrument Serif', serif", fontSize: "clamp(48px, 6vw, 72px)", lineHeight: 1, marginBottom: 32 },
  searchWrapper: { maxWidth: 500, margin: "0 auto" },
  searchInput: { width: "100%", padding: "18px 28px", borderRadius: "18px", border: "1px solid", outline: "none", fontSize: 15, transition: "all 0.3s ease" },
  categories: { display: "flex", justifyContent: "center", gap: 10, marginBottom: 50, flexWrap: "wrap" },
  categoryBtn: { padding: "10px 22px", borderRadius: "100px", border: "1px solid", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.3s ease" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 },
  card: { padding: 28, borderRadius: 24, border: "1px solid", transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)", display: "flex", flexDirection: "column", gap: 20 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  avatar: { width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 },
  badge: { padding: "4px 10px", background: "rgba(107,200,178,0.1)", color: "#6BC8B2", borderRadius: 99, fontSize: 10, fontWeight: 700, textTransform: "uppercase" },
  cardName: { fontSize: 19, fontWeight: 700 },
  cardService: { fontSize: 14, fontWeight: 600, marginTop: 4 },
  meta: { display: "flex", gap: 12, fontSize: 12, opacity: 0.6, marginTop: 12, fontWeight: 500 },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.03)" },
  price: { display: "flex", alignItems: "baseline", gap: 2 },
  priceValue: { fontSize: 18, fontWeight: 700 },
  viewBtn: { padding: "10px 20px", borderRadius: "12px", border: "none", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, textDecoration: "none", transition: "transform 0.2s" }
};
