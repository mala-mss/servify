// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BOOKINGS } from "../utils/mockData";

const useAuth = () => ({ user: { name: "malak" }, logout: () => {} });

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

const getStatusStyle = (status) => {
  switch (status) {
    case "upcoming":  return { color: "#6BC8B2", bg: "rgba(107,200,178,0.1)" };
    case "completed": return { color: "#2FB0BC", bg: "rgba(47,176,188,0.1)" };
    case "pending":   return { color: "#F59E0B", bg: "rgba(245,158,11,0.1)" };
    case "cancelled": return { color: "#f87171", bg: "rgba(248,113,113,0.1)" };
    default:          return { color: "#e8e6e0", bg: "rgba(255,255,255,0.1)" };
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9], staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const QUICK_ACTIONS = [
  { label: "Browse Services", sub: "Find a professional", icon: "◈", href: "/client/browse" },
  { label: "Book a Service",  sub: "Schedule a new job",  icon: "◎", href: "/book" },
  { label: "My Dependants",   sub: "Manage family members", icon: "◆", href: "/client/dependants" },
  { label: "My Profile",      sub: "Edit your account",   icon: "✦", href: "/client/profile" },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState("dark");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const p = PALETTES[theme];

  useEffect(() => {
    const handle = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle, { passive: true });
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  const upcoming  = BOOKINGS.filter(b => b.status === "upcoming").length;
  const pending   = BOOKINGS.filter(b => b.status === "pending").length;
  const completed = BOOKINGS.filter(b => b.status === "completed").length;
  const recentBookings = BOOKINGS.slice(0, 3);

  const STATS = [
    { label: "Upcoming",  value: upcoming,  color: "#6BC8B2" },
    { label: "Pending",   value: pending,   color: "#F59E0B" },
    { label: "Completed", value: completed, color: "#2FB0BC" },
  ];

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      {/* Background grid */}
      <div style={{
        ...styles.bgGrid,
        backgroundImage: theme === "dark"
          ? `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)`
          : `radial-gradient(circle at 2px 2px, ${p.grid} 1px, transparent 0)`
      }} />

      {/* Mouse glow */}
      <div style={{
        ...styles.glow,
        left: mousePos.x - 300,
        top: mousePos.y - 300,
        background: `radial-gradient(circle, ${p.glow} 0%, transparent 70%)`
      }} />

      {/* MAIN */}
      <div style={styles.container}>
        <motion.div initial="hidden" animate="visible" variants={sectionVariants}>

          {/* Header */}
          <motion.div style={styles.header} variants={itemVariants}>
            <div style={{ ...styles.label, color: p.textMuted }}>Overview</div>
            <h1 style={{ ...styles.title, color: p.text }}>
              Welcome back, {user?.name}
            </h1>
          </motion.div>

          {/* Stats */}
          <motion.div style={styles.statsRow} variants={itemVariants}>
            {STATS.map(s => (
              <div
                key={s.label}
                style={{ ...styles.statCard, background: p.cardBg, borderColor: p.border }}
              >
                <div style={{ fontSize: 32, fontWeight: 600, color: s.color, fontFamily: "'Instrument Serif', serif" }}>
                  {s.value}
                </div>
                <div style={{ ...styles.statLabel, color: p.textMuted }}>{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div style={{ marginBottom: 48 }} variants={itemVariants}>
            <div style={{ ...styles.sectionTitle, color: p.textMuted }}>Quick Actions</div>
            <div style={styles.actionsGrid}>
              {QUICK_ACTIONS.map(a => (
                <motion.a
                  key={a.label}
                  href={a.href}
                  whileHover={{ borderColor: p.primary, x: 4 }}
                  style={{ ...styles.actionCard, background: p.cardBg, borderColor: p.border, textDecoration: "none" }}
                >
                  <span style={{ fontSize: 22, color: p.primary }}>{a.icon}</span>
                  <div>
                    <div style={{ ...styles.actionLabel, color: p.text }}>{a.label}</div>
                    <div style={{ ...styles.actionSub, color: p.textMuted }}>{a.sub}</div>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Recent Bookings */}
          <motion.div variants={itemVariants}>
            <div style={{ ...styles.sectionHeader }}>
              <div style={{ ...styles.sectionTitle, color: p.textMuted }}>Recent Bookings</div>
              <a href="/client/my-bookings" style={{ fontSize: 13, color: p.primary, textDecoration: "none" }}>
                View all →
              </a>
            </div>
            <div style={styles.bookingList}>
              {recentBookings.map(bk => {
                const s = getStatusStyle(bk.status);
                return (
                  <motion.div
                    key={bk.id}
                    whileHover={{ borderColor: p.primary, x: 5 }}
                    style={{ ...styles.bookingRow, background: p.cardBg, borderColor: p.border }}
                  >
                    <div style={styles.rowLeft}>
                      <div style={{ ...styles.ref, color: p.textMuted }}>{bk.id}</div>
                      <div>
                        <div style={{ ...styles.serviceName, color: p.text }}>{bk.service}</div>
                        <div style={{ ...styles.providerName, color: p.textMuted }}>with {bk.provider}</div>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: p.text }}>{bk.date}</div>
                      <div style={{ fontSize: 13, color: p.textMuted }}>{bk.time}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: p.text }}>${bk.price}</div>
                      <div style={{ ...styles.statusBadge, color: s.color, background: s.bg }}>{bk.status}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* Footer */}
      <footer style={{ ...styles.footer, background: theme === "dark" ? "#0a0a0a" : p.cardBg, borderTopColor: p.border }}>
        <div style={styles.footerGrid}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 20, color: p.primary }}>◈</span>
              <span style={{ fontSize: 20, fontWeight: 600, color: p.text }}>Servify</span>
            </div>
            <p style={{ fontSize: 14, color: p.textMuted, lineHeight: 1.6 }}>The premium platform for home services.</p>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: p.primary, marginBottom: 24, textTransform: "uppercase", letterSpacing: "1px" }}>Platform</h4>
            <a href="/client/browse" style={{ display: "block", fontSize: 14, color: p.textMuted, marginBottom: 12, textDecoration: "none" }}>Browse Services</a>
            <a href="#" style={{ display: "block", fontSize: 14, color: p.textMuted, marginBottom: 12, textDecoration: "none" }}>For Providers</a>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: p.primary, marginBottom: 24, textTransform: "uppercase", letterSpacing: "1px" }}>Account</h4>
            <a href="/client/profile"       style={{ display: "block", fontSize: 14, color: p.textMuted, marginBottom: 12, textDecoration: "none" }}>Profile</a>
            <a href="/client/my-bookings"   style={{ display: "block", fontSize: 14, color: p.textMuted, marginBottom: 12, textDecoration: "none" }}>My Bookings</a>
            <button onClick={logout} style={{ background: "none", border: "none", fontSize: 14, color: p.textMuted, cursor: "pointer", padding: 0, fontFamily: "'DM Sans', sans-serif" }}>Sign out</button>
          </div>
        </div>
        <div style={{ marginTop: 80, paddingTop: 32, borderTop: `1px solid ${p.border}`, maxWidth: 1000, margin: "80px auto 0" }}>
          <span style={{ fontSize: 13, color: p.textMuted }}>© 2026 Servify Inc. All rights reserved.</span>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        button:hover { opacity: 0.8; }
      `}</style>
    </div>
  );
}

const styles: any = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", position: "relative", transition: "background 0.3s ease, color 0.3s ease" },
  bgGrid: { position: "absolute", inset: 0, backgroundSize: "40px 40px", zIndex: 0, pointerEvents: "none" },
  glow: { position: "fixed", width: 600, height: 600, borderRadius: "50%", pointerEvents: "none", zIndex: 0, transition: "left 0.8s ease, top 0.8s ease" },

  container: { maxWidth: 1000, margin: "0 auto", padding: "80px 48px 120px", position: "relative", zIndex: 1 },
  header: { marginBottom: 44 },
  label: { fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },
  title: { fontFamily: "'Instrument Serif', serif", fontSize: 48, fontWeight: 400, letterSpacing: -1 },

  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 48 },
  statCard: { padding: "28px 32px", border: "1px solid", borderRadius: 20, display: "flex", flexDirection: "column", gap: 6 },
  statLabel: { fontSize: 12, letterSpacing: "1.5px", textTransform: "uppercase" },

  sectionTitle: { fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },

  actionsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 },
  actionCard: { display: "flex", alignItems: "center", gap: 20, padding: "24px 28px", border: "1px solid", borderRadius: 16, transition: "all 0.3s" },
  actionLabel: { fontSize: 15, fontWeight: 500, marginBottom: 4 },
  actionSub: { fontSize: 13 },

  bookingList: { display: "flex", flexDirection: "column", gap: 12 },
  bookingRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px", border: "1px solid", borderRadius: 16, transition: "all 0.3s" },
  rowLeft: { display: "flex", alignItems: "center", gap: 24, flex: 1.5 },
  ref: { fontSize: 12, fontFamily: "monospace" },
  serviceName: { fontSize: 16, fontWeight: 500, marginBottom: 4 },
  providerName: { fontSize: 13 },
  statusBadge: { padding: "6px 14px", borderRadius: 999, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", minWidth: 90, textAlign: "center" },

  footer: { padding: "100px 48px 60px", borderTop: "1px solid" },
  footerGrid: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 60, maxWidth: 1000, margin: "0 auto" },
};
