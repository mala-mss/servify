import { useState, useEffect, useRef, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/controllers/context/AuthContext";
import DiscordSearch from "../common/DiscordSearch";
import axiosInstance from "@/controllers/api/axiosInstance";

const PALETTES = {
  dark: {
    primary: "#2FB0BC",
    bg: "#0e0e0e",
    cardBg: "rgba(255,255,255,0.02)",
    text: "#e8e6e0",
    textMuted: "rgba(232,230,224,0.5)",
    border: "rgba(255,255,255,0.06)",
    navBg: "rgba(14,14,14,0.85)",
  },
  light: {
    primary: "#2FB0BC",
    bg: "#F8FBFB",
    cardBg: "#FFFFFF",
    text: "#2C3E50",
    textMuted: "rgba(44,62,80,0.5)",
    border: "#E0E7E7",
    navBg: "rgba(248,251,251,0.85)",
  }
} as const;

type Theme = keyof typeof PALETTES;

type Notification = {
  id: string | number;
  title: string;
  description: string;
  is_read: boolean;
};

export default function ClientNavbar({ theme = "dark", onThemeToggle, onSearch }: { theme?: Theme; onThemeToggle: () => void; onSearch: (query: string) => void; }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const p = PALETTES[theme];

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get("/notifications");
        if (response.data.success) {
          setNotifications(response.data.notifications);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <nav style={{ ...styles.nav, background: p.navBg, borderBottomColor: p.border }}>
      <div style={styles.navContainer}>
        {/* Logo */}
        <a href="/client/home" style={{ ...styles.navLogo, textDecoration: 'none' }}>
          <span style={{ ...styles.logoMark, color: p.primary }}>◈</span>
          <span style={{ ...styles.logoText, color: p.text }}>Servify</span>
        </a>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <DiscordSearch 
            theme={theme} 
            p={p} 
            compact={true}
            onSearch={onSearch} 
          />
        </div>

        {/* Links & Actions */}
        <div style={styles.navRight}>
          <div style={styles.navLinks}>
            <button
              onClick={() => navigate('/client/browse')}
              style={{ ...styles.navLink, color: p.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
            >
              Explore
            </button>
            <a href="/client/my-bookings" style={{ ...styles.navLink, color: p.textMuted }}>My Bookings</a>
            
            <div style={{ position: "relative" }} ref={notifRef}>
              <button 
                onClick={() => setShowNotif(!showNotif)} 
                style={{ ...styles.navLinkBtn, color: p.textMuted }}
              >
                Notifications
                {hasUnread && <span style={{ ...styles.navNotifDot, background: p.primary }} />}
              </button>
              
              <AnimatePresence>
                {showNotif && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{ ...styles.notifDropdown, background: p.cardBg, borderColor: p.border }}
                  >
                    <div style={styles.notifDropHeader}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: p.text }}>Notifications</span>
                      <a href="/client/notifications" style={{ fontSize: 11, color: p.primary, textDecoration: 'none' }}>View all</a>
                    </div>
                    <div style={styles.notifDropList}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', fontSize: 12, color: p.textMuted }}>
                          No notifications
                        </div>
                      ) : (
                        notifications.slice(0, 5).map(n => (
                          <div key={n.id} style={{ ...styles.notifItem, borderBottomColor: p.border }}>
                            <div style={{ fontWeight: 600, fontSize: 12, color: p.text }}>{n.title}</div>
                            <div style={{ fontSize: 11, color: p.textMuted, marginTop: 2 }}>{n.description}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div style={styles.actions}>
            <button onClick={onThemeToggle} style={{ ...styles.themeBtn, color: p.text, background: p.cardBg, borderColor: p.border }}>
              {theme === "dark" ? "☼" : "☾"}
            </button>
            <a href="/client/profile" style={{ ...styles.avatarBtn, background: theme === 'dark' ? "rgba(47,176,188,0.15)" : "#D6FFF9", color: p.primary, textDecoration: 'none', overflow: 'hidden' }}>
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt={user?.fname || user?.name || "User"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                user?.fname?.[0]?.toUpperCase() ?? "U"
              )}
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

const styles: Record<string, CSSProperties> = {
  nav: { 
    position: "sticky", 
    top: 0, 
    zIndex: 1000, 
    height: 80, 
    borderBottom: "1px solid", 
    backdropFilter: "blur(20px)",
    display: "flex",
    alignItems: "center"
  },
  navContainer: {
    maxWidth: 1400,
    width: "100%",
    margin: "0 auto",
    padding: "0 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 40
  },
  navLogo: { display: "flex", alignItems: "center", gap: 12 },
  logoMark: { fontSize: 24 },
  logoText: { fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" },
  
  searchContainer: { 
    flex: 1, 
    display: 'flex', 
    justifyContent: 'center',
    maxWidth: 600
  },

  navRight: { display: "flex", alignItems: "center", gap: 40 },
  navLinks: { display: "flex", alignItems: "center", gap: 32 },
  navLink: { fontSize: 14, fontWeight: 600, transition: "color 0.2s" },
  navLinkBtn: { background: "none", border: "none", fontSize: 14, fontWeight: 600, transition: "color 0.2s", cursor: "pointer", position: "relative" },
  navNotifDot: { width: 6, height: 6, borderRadius: "50%", position: "absolute", top: -4, right: -10 },
  
  actions: { display: "flex", alignItems: "center", gap: 16 },
  themeBtn: { width: 38, height: 38, borderRadius: 12, border: "1px solid", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, transition: "all 0.3s ease" },
  avatarBtn: { width: 40, height: 40, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 },

  notifDropdown: { position: "absolute", top: "calc(100% + 20px)", right: 0, width: 320, borderRadius: 24, border: "1px solid", padding: "12px 0", boxShadow: "0 30px 60px rgba(0,0,0,0.4)", backdropFilter: "blur(40px)", overflow: 'hidden' },
  notifDropHeader: { padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  notifDropList: { maxHeight: 400, overflowY: 'auto' },
  notifItem: { padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)' }
};












