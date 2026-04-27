// src/pages/client/Notification.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { styles } from "./Notification.styles";
import axiosInstance from "@/controllers/api/axiosInstance";
import { useAuth } from "@/controllers/context/AuthContext";
import { useTheme } from "@/controllers/context/ThemeContext";

const getTypeStyles = (type) => {
  switch (type) {
    case "success": return { color: "#6BC8B2", icon: "✓" };
    case "booking": return { color: "#2FB0BC", icon: "◈" };
    case "reminder": return { color: "#facc15", icon: "◎" };
    case "payment": return { color: "#F59E0B", icon: "DA" };
    default: return { color: "#2FB0BC", icon: "◈" };
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

const GlowBackground = ({ p }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handle = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle, { passive: true });
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  return (
    <div 
      style={{ 
        ...styles.glow, 
        left: mousePos.x - 300, 
        top: mousePos.y - 300, 
        background: `radial-gradient(circle, ${p.glow} 0%, transparent 70%)` 
      }} 
    />
  );
};

export default function Notification() {
  const { user } = useAuth();
  const { mode: theme, palette: p } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get("/notifications");
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put("/notifications/mark-all-as-read");
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleNotificationClick = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/mark-as-read`);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={{ ...styles.bgGrid, backgroundImage: theme === 'dark' ? `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)` : `radial-gradient(circle at 2px 2px, ${p.grid} 1px, transparent 0)` }} />
      <GlowBackground p={p} />

      <div style={styles.container}>
        <motion.section initial="hidden" animate="visible" variants={sectionVariants}>
          <motion.div style={styles.header} variants={itemVariants}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div>
                <div style={{ ...styles.label, color: p.textMuted }}>Stay Updated</div>
                <h1 style={{ ...styles.title, color: p.text }}>Notifications</h1>
              </div>
              {notifications.length > 0 && (
                <button 
                  onClick={markAllAsRead}
                  style={{ 
                    background: 'none', 
                    border: `1px solid ${p.border}`, 
                    color: p.text, 
                    padding: '8px 16px', 
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Mark all as read
                </button>
              )}
            </div>
          </motion.div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: p.textMuted }}>Loading...</div>
          ) : (
            <motion.div style={styles.notifList} variants={itemVariants}>
              {notifications.map(n => {
                const s = getTypeStyles(n.type);
                return (
                  <motion.div 
                    key={n.id} 
                    whileHover={{ x: 5, background: theme === 'dark' ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)" }}
                    onClick={() => handleNotificationClick(n.id)}
                    style={{ 
                      ...styles.notifRow, 
                      background: p.cardBg, 
                      borderColor: p.border, 
                      cursor: 'pointer',
                      opacity: n.is_read ? 0.7 : 1
                    }}
                  >
                    <div style={{ ...styles.notifIcon, color: s.color, borderColor: `${s.color}33` }}>{s.icon}</div>
                    <div style={styles.notifContent}>
                      <div style={styles.notifHeader}>
                        <span style={{ ...styles.notifTitle, color: p.text }}>{n.title}</span>
                        <span style={{ ...styles.notifTime, color: p.textMuted }}>{formatDate(n.created_at)}</span>
                      </div>
                      <div style={{ ...styles.notifDesc, color: p.textMuted }}>{n.description}</div>
                    </div>
                    {!n.is_read && <div style={{ ...styles.unreadDot, background: p.primary }} />}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {!loading && notifications.length === 0 && (
            <motion.div style={{ ...styles.empty, color: p.textMuted }}>
              All caught up! No new notifications.
            </motion.div>
          )}
        </motion.section>
      </div>

      <style>{`
        @import url('https:/fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
      `}</style>
    </div>
  );
}












