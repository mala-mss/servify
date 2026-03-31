// src/pages/client/BrowseServices.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Mock hooks
const useAuth = () => ({ user: { name: "Yassine" } });

const NOTIFICATIONS = [
  { id: 1, title: "Booking Confirmed", desc: "Your cleaning with Maria is set.", time: "2h ago", unread: true },
  { id: 2, title: "New Message", desc: "Alex: I'll be there at 10.", time: "5h ago", unread: true },
  { id: 3, title: "Reminder", desc: "Tutoring tomorrow at 4 PM.", time: "1d ago", unread: false },
];

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

const CATEGORIES = [
  { id: "all", name: "All Services" },
  { id: "cleaning", name: "Cleaning" },
  { id: "plumbing", name: "Plumbing" },
  { id: "electrical", name: "Electrical" },
  { id: "childcare", name: "Childcare" },
  { id: "gardening", name: "Gardening" },
  { id: "tutoring", name: "Tutoring" },
];

const PROVIDERS = [
  { id: 1, name: "Alex Johnson", category: "plumbing", service: "Master Plumber", rating: 4.9, reviews: 124, img: "A", price: "$45/hr" },
  { id: 2, name: "Maria Garcia", category: "cleaning", service: "Cleaning Expert", rating: 4.8, reviews: 89, img: "M", price: "$30/hr" },
  { id: 3, name: "David Chen", category: "electrical", service: "Electrician", rating: 5.0, reviews: 56, img: "D", price: "$55/hr" },
  { id: 4, name: "Sarah Miller", category: "childcare", service: "Professional Nanny", rating: 4.7, reviews: 112, img: "S", price: "$25/hr" },
  { id: 5, name: "John Smith", category: "gardening", service: "Landscaper", rating: 4.9, reviews: 45, img: "J", price: "$40/hr" },
  { id: 6, name: "Emily White", category: "tutoring", service: "Math Tutor", rating: 5.0, reviews: 38, img: "E", price: "$35/hr" },
];

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
  const notifRef = useRef(null);

  const p = PALETTES[theme];

  useEffect(() => {
    const handle = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const filteredProviders = PROVIDERS.filter(pr => {
    const matchesSearch = pr.name.toLowerCase().includes(search.toLowerCase()) || 
                          pr.service.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCat === "all" || pr.category === activeCat;
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
          
          <div style={{ position: "relative" }} ref={notifRef}>
            <button 
              onClick={() => setShowNotif(!showNotif)} 
              style={{ ...styles.navLinkBtn, color: p.textMuted }}
            >
              Notifications
              {NOTIFICATIONS.some(n => n.unread) && <span style={{ ...styles.navNotifDot, background: p.primary }} />}
            </button>
            
            <AnimatePresence>
              {showNotif && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{ ...styles.notifDropdown, background: p.cardBg, borderColor: p.border, backdropFilter: "blur(20px)" }}
                >
                  <div style={styles.notifDropHeader}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Notifications</span>
                    <a href="/client/notifications" style={{ fontSize: 11, color: p.primary }}>View all</a>
                  </div>
                  <div style={styles.notifDropList}>
                    {NOTIFICATIONS.map(n => (
                      <div key={n.id} style={{ ...styles.notifDropItem, borderBottomColor: p.border }}>
                        <div style={styles.notifDropTitleRow}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{n.title}</span>
                          <span style={{ fontSize: 10, opacity: 0.5 }}>{n.time}</span>
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>{n.desc}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div style={styles.navRight}>
          <button onClick={toggleTheme} style={{ ...styles.themeBtn, color: p.text, background: p.cardBg, borderColor: p.border }}>{theme === "dark" ? "☼" : "☾"}</button>
          <a href="/client/profile" style={{ ...styles.avatarBtn, background: theme === 'dark' ? "rgba(47,176,188,0.15)" : "#D6FFF9", borderColor: p.accent, color: p.primary }}>{user?.name?.[0]?.toUpperCase()}</a>
        </div>
      </nav>

      <div style={styles.container}>
        <motion.section initial="hidden" animate="visible" variants={sectionVariants}>
          <motion.div style={styles.header} variants={itemVariants}>
            <div style={{ ...styles.label, color: p.textMuted }}>Available Professionals</div>
            <h1 style={{ ...styles.title, color: p.text }}>Find your expert</h1>
          </motion.div>

          {/* Search & Categories */}
          <motion.div style={styles.filterSection} variants={itemVariants}>
            <div style={{ ...styles.searchBar, background: p.cardBg, borderColor: p.border }}>
              <span style={{ color: p.textMuted }}>⌕</span>
              <input 
                placeholder="Search by name or service..." 
                style={{ ...styles.searchInput, color: p.text }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={styles.catRow}>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCat(cat.id)}
                  style={{ 
                    ...styles.catBtn, 
                    background: activeCat === cat.id ? p.primary : p.cardBg,
                    color: activeCat === cat.id ? "#fff" : p.text,
                    borderColor: activeCat === cat.id ? p.primary : p.border
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Providers Grid */}
          <motion.div style={styles.grid} variants={itemVariants}>
            <AnimatePresence>
              {filteredProviders.map(pr => (
                <motion.div 
                  layout
                  key={pr.id} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -8, borderColor: p.primary }}
                  style={{ ...styles.card, background: p.cardBg, borderColor: p.border }}
                >
                  <div style={{ ...styles.cardImg, background: theme === 'dark' ? "rgba(255,255,255,0.05)" : "#D6FFF9", color: p.primary }}>{pr.img}</div>
                  <div style={styles.cardInfo}>
                    <div style={{ ...styles.cardName, color: p.text }}>{pr.name}</div>
                    <div style={{ ...styles.cardService, color: p.textMuted }}>{pr.service}</div>
                    <div style={{ ...styles.cardRating, color: p.primary }}>★ {pr.rating} <span style={{ color: p.textMuted, fontSize: 12, fontWeight: 400 }}>({pr.reviews} reviews)</span></div>
                  </div>
                  <div style={{ ...styles.cardFooter, borderTopColor: p.border }}>
                    <div style={{ ...styles.cardPrice, color: p.text }}>{pr.price}</div>
                    <button style={{ ...styles.bookBtn, background: p.primary }}>Book Now</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          
          {filteredProviders.length === 0 && (
            <motion.div style={{ ...styles.empty, color: p.textMuted }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              No providers found matching your search.
            </motion.div>
          )}
        </motion.section>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input { font-family: 'DM Sans', sans-serif; outline: none; }
      `}</style>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", position: "relative" },
  bgGrid: { position: "absolute", inset: 0, backgroundSize: "40px 40px", zIndex: 0, pointerEvents: "none" },
  glow: { position: "fixed", width: 600, height: 600, borderRadius: "50%", pointerEvents: "none", zIndex: 0 },
  nav: { position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 64, borderBottom: "1px solid", backdropFilter: "blur(12px)" },
  navLogo: { display: "flex", alignItems: "center", gap: 10 },
  logoMark: { fontSize: 20 },
  logoText: { fontSize: 17, fontWeight: 500 },
  navLinks: { display: "flex", gap: 32 },
  navLink: { fontSize: 14, fontWeight: 500, textDecoration: "none" },
  navLinkBtn: { background: "none", border: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, position: "relative" },
  navNotifDot: { width: 6, height: 6, borderRadius: "50%", position: "absolute", top: -2, right: -8 },
  navRight: { display: "flex", alignItems: "center", gap: 16 },

  notifDropdown: { position: "absolute", top: "calc(100% + 12px)", right: -100, width: 320, borderRadius: 16, border: "1px solid", padding: "16px 0", zIndex: 1000, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" },
  notifDropHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 8 },
  notifDropList: { maxHeight: 300, overflowY: "auto" },
  notifDropItem: { padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s", cursor: "pointer" },
  notifDropTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  themeBtn: { width: 34, height: 34, borderRadius: "50%", border: "1px solid", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  avatarBtn: { width: 34, height: 34, borderRadius: "50%", border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, textDecoration: "none" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "80px 48px 120px", position: "relative", zIndex: 1 },
  header: { marginBottom: 44 },
  label: { fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },
  title: { fontFamily: "'Instrument Serif', serif", fontSize: 48, fontWeight: 400 },
  filterSection: { display: "flex", flexDirection: "column", gap: 24, marginBottom: 48 },
  searchBar: { display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", border: "1px solid", borderRadius: 14, maxWidth: 500 },
  searchInput: { background: "transparent", border: "none", fontSize: 15, flex: 1 },
  catRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  catBtn: { padding: "8px 18px", borderRadius: 999, border: "1px solid", fontSize: 13, cursor: "pointer", transition: "all 0.2s" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 },
  card: { padding: "24px", border: "1px solid", borderRadius: 20, transition: "all 0.3s" },
  cardImg: { width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 600, marginBottom: 16 },
  cardName: { fontSize: 18, fontWeight: 500, marginBottom: 4 },
  cardService: { fontSize: 14, marginBottom: 12 },
  cardRating: { fontSize: 13, fontWeight: 600 },
  cardFooter: { marginTop: 20, paddingTop: 16, borderTop: "1px solid", display: "flex", alignItems: "center", justifyContent: "space-between" },
  cardPrice: { fontSize: 15, fontWeight: 600 },
  bookBtn: { padding: "8px 16px", borderRadius: 8, border: "none", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" },
  empty: { textAlign: "center", padding: "60px 0", fontSize: 16 }
};
