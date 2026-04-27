// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axiosInstance from "@/controllers/api/axiosInstance";
import { useAuth } from "@/controllers/context/AuthContext";

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

const getStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case "confirmed":  return { color: "#6BC8B2", bg: "rgba(107,200,178,0.1)" };
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
    transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] as any, staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } }
};

const QUICK_ACTIONS = [
  { label: "Browse Services", sub: "Find a professional", icon: "◈", href: "/client/browse" },
  { label: "Book a Service",  sub: "Schedule a new job",  icon: "◎", href: "/client/browse" },
  { label: "My Dependants",   sub: "Manage family members", icon: "◆", href: "/client/dependants" },
  { label: "My Profile",      sub: "Edit your account",   icon: "✦", href: "/client/profile" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ confirmed: 0, pending: 0, completed: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const p = PALETTES["dark"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          axiosInstance.get('/bookings/stats'),
          axiosInstance.get('/bookings')
        ]);
        setStats(statsRes.data.stats);
        setRecentBookings(bookingsRes.data.bookings.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const handle = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle, { passive: true });
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  const STATS = [
    { label: "Upcoming",  value: stats.confirmed,  color: "#6BC8B2" },
    { label: "Pending",   value: stats.pending,   color: "#F59E0B" },
    { label: "Completed", value: stats.completed, color: "#2FB0BC" },
  ];

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={{ ...styles.bgGrid, backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)` }} />
      <div style={{ ...styles.glow, left: mousePos.x - 300, top: mousePos.y - 300, background: `radial-gradient(circle, ${p.glow} 0%, transparent 70%)` }} />

      <main style={styles.main}>
        <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
          <header style={styles.header}>
            <motion.div variants={itemVariants}>
              <h1 style={styles.welcome}>Welcome back, <span style={{ color: p.primary }}>{user?.name}</span></h1>
              <p style={{ color: p.textMuted }}>Here's what's happening with your care services today.</p>
            </motion.div>
          </header>

          <div style={styles.statsGrid}>
            {STATS.map((stat, i) => (
              <motion.div key={i} variants={itemVariants} style={{ ...styles.statCard, background: p.cardBg, borderColor: p.border }}>
                <div style={{ ...styles.statLabel, color: p.textMuted }}>{stat.label}</div>
                <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
              </motion.div>
            ))}
          </div>

          <div style={styles.contentGrid}>
            <section style={styles.recentSection}>
              <motion.div variants={itemVariants} style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Recent Bookings</h2>
                <a href="/client/my-bookings" style={{ color: p.primary, fontSize: 14, textDecoration: 'none' }}>View all</a>
              </motion.div>
              
              <div style={styles.bookingList}>
                {loading ? (
                   <div style={{ color: p.textMuted }}>Loading bookings...</div>
                ) : recentBookings.length === 0 ? (
                  <div style={{ color: p.textMuted }}>No bookings found.</div>
                ) : (
                  recentBookings.map((b: any, i) => (
                    <motion.div key={i} variants={itemVariants} style={{ ...styles.bookingItem, background: p.cardBg, borderColor: p.border }}>
                      <div style={styles.bookingInfo}>
                        <div style={styles.bookingName}>{b.service_name}</div>
                        <div style={{ ...styles.bookingDate, color: p.textMuted }}>{new Date(b.date).toLocaleDateString()} at {b.time}</div>
                      </div>
                      <div style={{ ...styles.statusBadge, ...getStatusStyle(b.status) }}>
                        {b.status}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            <aside style={styles.actionsSection}>
              <h2 style={styles.sectionTitle}>Quick Actions</h2>
              <div style={styles.actionsGrid}>
                {QUICK_ACTIONS.map((action, i) => (
                  <motion.a 
                    key={i} 
                    href={action.href}
                    variants={itemVariants} 
                    whileHover={{ scale: 1.02 }}
                    style={{ ...styles.actionCard, background: p.cardBg, borderColor: p.border, textDecoration: 'none' }}
                  >
                    <div style={{ ...styles.actionIcon, background: p.glow, color: p.primary }}>{action.icon}</div>
                    <div>
                      <div style={{ ...styles.actionLabel, color: p.text }}>{action.label}</div>
                      <div style={{ ...styles.actionSub, color: p.textMuted }}>{action.sub}</div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </aside>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

const styles: any = {
  root: { minHeight: "100vh", position: "relative", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" },
  bgGrid: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4, pointerEvents: "none" },
  glow: { position: "fixed", width: 600, height: 600, borderRadius: "50%", pointerEvents: "none", zIndex: 0, opacity: 0.6, filter: "blur(80px)" },
  main: { position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "100px 40px" },
  header: { marginBottom: 60 },
  welcome: { fontFamily: "'Instrument Serif', serif", fontSize: 48, marginBottom: 12 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 60 },
  statCard: { padding: 32, borderRadius: 24, border: "1px solid" },
  statLabel: { fontSize: 14, fontWeight: 500, marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" },
  statValue: { fontSize: 40, fontWeight: 700 },
  contentGrid: { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 40 },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  sectionTitle: { fontSize: 24, fontWeight: 600, marginBottom: 24 },
  bookingList: { display: "flex", flexDirection: "column", gap: 16 },
  bookingItem: { padding: "20px 24px", borderRadius: 20, border: "1px solid", display: "flex", justifyContent: "space-between", alignItems: "center" },
  bookingName: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
  bookingDate: { fontSize: 13 },
  statusBadge: { padding: "6px 12px", borderRadius: "100px", fontSize: 12, fontWeight: 600, textTransform: "capitalize" },
  actionsGrid: { display: "flex", flexDirection: "column", gap: 16 },
  actionCard: { padding: 20, borderRadius: 20, border: "1px solid", display: "flex", alignItems: "center", gap: 20 },
  actionIcon: { width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },
  actionLabel: { fontSize: 16, fontWeight: 600 },
  actionSub: { fontSize: 13 }
};












