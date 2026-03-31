// src/pages/client/MyDependants.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Mock hooks
const useAuth = () => ({ user: { name: "Yassine" } });

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

const DEPENDANTS = [
  { id: 1, name: "Sofia Bouderba", relation: "Daughter", age: "6 years", notes: "Allergic to peanuts", avatar: "S" },
  { id: 2, name: "Amine Bouderba", relation: "Son", age: "4 years", notes: "Loves drawing", avatar: "A" },
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

export default function MyDependants() {
  const { user } = useAuth();
  const [theme, setTheme] = useState("dark");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const p = PALETTES[theme];

  useEffect(() => {
    const handle = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

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
          <a href="/client/browse" style={{ ...styles.navLink, color: p.textMuted }}>Browse</a>
          <a href="/client/bookings" style={{ ...styles.navLink, color: p.textMuted }}>My bookings</a>
          <a href="/client/notifications" style={{ ...styles.navLink, color: p.textMuted }}>Notifications</a>
        </div>
        <div style={styles.navRight}>
          <button onClick={toggleTheme} style={{ ...styles.themeBtn, color: p.text, background: p.cardBg, borderColor: p.border }}>{theme === "dark" ? "☼" : "☾"}</button>
          <a href="/client/profile" style={{ ...styles.avatarBtn, background: theme === 'dark' ? "rgba(47,176,188,0.15)" : "#D6FFF9", borderColor: p.accent, color: p.primary }}>{user?.name?.[0]?.toUpperCase()}</a>
        </div>
      </nav>

      <div style={styles.container}>
        <motion.section initial="hidden" animate="visible" variants={sectionVariants}>
          <motion.div style={styles.header} variants={itemVariants}>
            <div style={{ ...styles.label, color: p.textMuted }}>Family Management</div>
            <h1 style={{ ...styles.title, color: p.text }}>My Dependants</h1>
          </motion.div>

          <motion.div style={styles.grid} variants={itemVariants}>
            {DEPENDANTS.map(d => (
              <motion.div 
                key={d.id} 
                whileHover={{ y: -8, borderColor: p.primary }}
                style={{ ...styles.card, background: p.cardBg, borderColor: p.border }}
              >
                <div style={{ ...styles.avatar, background: "rgba(47,176,188,0.1)", border: `1px solid ${p.primary}33`, color: p.primary }}>{d.avatar}</div>
                <div style={{ ...styles.name, color: p.text }}>{d.name}</div>
                <div style={{ ...styles.relation, color: p.primary }}>{d.relation} · {d.age}</div>
                <div style={{ ...styles.notes, color: p.textMuted }}>{d.notes}</div>
                <div style={styles.cardActions}>
                   <button style={{ ...styles.editBtn, borderColor: p.border, color: p.textMuted }}>Edit</button>
                </div>
              </motion.div>
            ))}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              style={{ ...styles.addBtn, background: p.cardBg, borderColor: p.border, color: p.textMuted, borderStyle: "dashed" }}
            >
              <span style={{ fontSize: 24, marginBottom: 8, color: p.primary }}>+</span>
              Add Dependant
            </motion.button>
          </motion.div>
        </motion.section>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
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
  navLink: { fontSize: 14, fontWeight: 500 },
  navRight: { display: "flex", alignItems: "center", gap: 16 },
  themeBtn: { width: 34, height: 34, borderRadius: "50%", border: "1px solid", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  avatarBtn: { width: 34, height: 34, borderRadius: "50%", border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500 },
  container: { maxWidth: 1000, margin: "0 auto", padding: "80px 48px 120px", position: "relative", zIndex: 1 },
  header: { marginBottom: 44 },
  label: { fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },
  title: { fontFamily: "'Instrument Serif', serif", fontSize: 48, fontWeight: 400 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 },
  card: { padding: "32px", border: "1px solid", borderRadius: 20, transition: "all 0.3s", textAlign: "center" },
  avatar: { width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 600, margin: "0 auto 20px" },
  name: { fontSize: 19, fontWeight: 500, marginBottom: 6 },
  relation: { fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 },
  notes: { fontSize: 14, lineHeight: 1.6, marginBottom: 24 },
  cardActions: { display: "flex", justifyContent: "center" },
  editBtn: { padding: "8px 20px", background: "transparent", border: "1px solid", borderRadius: 8, fontSize: 13, cursor: "pointer" },
  addBtn: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px", border: "2px solid", borderRadius: 20, cursor: "pointer", background: "transparent", transition: "all 0.2s" }
};
