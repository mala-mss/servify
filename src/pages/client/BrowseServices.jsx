// src/pages/client/BrowseServices.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

const PALETTES = {
  dark: {
    primary: "#2FB0BC",
    secondary: "#6BC8B2",
    accent: "#7ED4CA",
    bg: "#0e0e0e",
    cardBg: "rgba(255,255,255,0.02)",
    text: "#e8e6e0",
    textMuted: "rgba(232,230,224,0.5)",
    border: "rgba(255,255,255,0.06)",
    navBg: "rgba(14,14,14,0.85)",
    glow: "rgba(47,176,188,0.04)",
    grid: "rgba(255,255,255,0.02)"
  },
  light: {
    primary: "#2FB0BC",
    secondary: "#6BC8B2",
    accent: "#7ED4CA",
    bg: "#F8FBFB",
    cardBg: "#FFFFFF",
    text: "#2C3E50",
    textMuted: "rgba(44,62,80,0.5)",
    border: "#E0E7E7",
    navBg: "rgba(248,251,251,0.85)",
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

export default function BrowseServices() {
  const { user } = useAuth();
  const [theme, setTheme] = useState("dark");
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showNotif, setShowNotif] = useState(false);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([{ id_category: "all", name: "All Services" }]);
  const [loading, setLoading] = useState(true);
  const notifRef = useRef(null);

  const p = PALETTES[theme];

  useEffect(() => {
    const handle = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servRes, catRes] = await Promise.all([
          axiosInstance.get('/services'),
          axiosInstance.get('/services/categories')
        ]);
        setServices(servRes.data.services);
        setCategories([{ id_category: "all", name: "All Services" }, ...catRes.data.categories]);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          (s.description && s.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = activeCat === "all" || s.category_id_fk === parseInt(activeCat);
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={{ ...styles.bgGrid, backgroundImage: theme === 'dark' ? `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)` : `radial-gradient(circle at 2px 2px, ${p.grid} 1px, transparent 0)` }} />
      <div style={{ ...styles.glow, left: mousePos.x - 300, top: mousePos.y - 300, background: `radial-gradient(circle, ${p.glow} 0%, transparent 70%)` }} />

      <nav style={{ ...styles.nav, background: p.navBg, borderBottomColor: p.border }}>
        <a href="/client/home" style={{ ...styles.navLogo, textDecoration: 'none' }}>
          <span style={{ ...styles.logoMark, color: p.primary }}>◈</span>
          <span style={{ ...styles.logoText, color: p.text }}>Servify</span>
        </a>
        <div style={styles.navLinks}>
          <a href="/client/browse" style={{ ...styles.navLink, color: p.primary }}>Browse</a>
          <a href="/client/my-bookings" style={{ ...styles.navLink, color: p.textMuted }}>My bookings</a>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'none', border: 'none', color: p.text, cursor: 'pointer' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      <main style={styles.main}>
        <motion.div initial="hidden" animate="visible" variants={sectionVariants} style={styles.hero}>
          <motion.h1 variants={itemVariants} style={{ ...styles.heroTitle, color: p.text }}>
            Expert help, <span style={{ color: p.primary }}>at your door.</span>
          </motion.h1>
          <motion.div variants={itemVariants} style={styles.searchWrapper}>
            <input 
              style={{ ...styles.searchInput, background: p.cardBg, borderColor: p.border, color: p.text }}
              placeholder="Search for any service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </motion.div>
        </motion.div>

        <div style={styles.categories}>
          {categories.map(cat => (
            <button
              key={cat.id_category}
              onClick={() => setActiveCat(cat.id_category.toString())}
              style={{ 
                ...styles.categoryBtn, 
                background: activeCat === cat.id_category.toString() ? p.primary : p.cardBg,
                color: activeCat === cat.id_category.toString() ? '#fff' : p.textMuted,
                borderColor: p.border
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 40 }}>Loading services...</div>
        ) : (
          <div style={styles.grid}>
            {filteredServices.map(service => (
              <motion.div 
                key={service.id_service}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                style={{ ...styles.card, background: p.cardBg, borderColor: p.border }}
              >
                <div style={{ ...styles.cardIcon, background: p.glow, color: p.primary }}>
                  {service.name.charAt(0)}
                </div>
                <h3 style={styles.cardName}>{service.name}</h3>
                <p style={styles.cardService}>{service.category_name}</p>
                <div style={styles.cardFooter}>
                  <div style={styles.cardPrice}>Starting from ${service.base_price || '0'}</div>
                  <button style={{ ...styles.bookBtn, background: p.primary }}>View Details</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", position: "relative", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" },
  bgGrid: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4, pointerEvents: "none" },
  glow: { position: "fixed", width: 600, height: 600, borderRadius: "50%", pointerEvents: "none", zIndex: 0, opacity: 0.6, filter: "blur(80px)" },
  nav: { position: "fixed", top: 0, left: 0, right: 0, height: 80, padding: "0 60px", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(12px)", zIndex: 100, borderBottom: "1px solid" },
  navLogo: { display: "flex", alignItems: "center", gap: 10 },
  logoMark: { fontSize: 28, fontWeight: 900 },
  logoText: { fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" },
  navLinks: { display: "flex", gap: 32, alignItems: "center" },
  navLink: { fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "all 0.3s ease" },
  main: { position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "160px 40px 100px" },
  hero: { textAlign: "center", marginBottom: 80 },
  heroTitle: { fontFamily: "'Instrument Serif', serif", fontSize: "72px", lineHeight: 1, marginBottom: 40 },
  searchWrapper: { maxWidth: 600, margin: "0 auto" },
  searchInput: { width: "100%", padding: "20px 30px", borderRadius: "20px", border: "1px solid", outline: "none", fontSize: 16, transition: "all 0.3s ease" },
  categories: { display: "flex", justifyContent: "center", gap: 12, marginBottom: 60, flexWrap: "wrap" },
  categoryBtn: { padding: "10px 24px", borderRadius: "100px", border: "1px solid", cursor: "pointer", fontSize: 14, fontWeight: 500, transition: "all 0.3s ease" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 32 },
  card: { padding: 32, borderRadius: 28, border: "1px solid", transition: "all 0.3s ease", position: "relative", overflow: "hidden" },
  cardIcon: { width: 60, height: 60, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, marginBottom: 24 },
  cardName: { fontSize: 20, fontWeight: 600, marginBottom: 8 },
  cardService: { fontSize: 14, opacity: 0.6, marginBottom: 24 },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" },
  cardPrice: { fontSize: 16, fontWeight: 700 },
  bookBtn: { padding: "10px 20px", borderRadius: "12px", border: "none", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }
};
