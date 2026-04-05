// src/pages/provider/Notifications.tsx
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import axiosInstance from "../../api/axiosInstance";

export default function Notifications() {
  const { palette: p } = useTheme();
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

  const handleNotificationClick = async (id: number) => {
    try {
      await axiosInstance.put(`/notifications/${id}/mark-as-read`);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)} mins ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)} hours ago`;
    return date.toLocaleDateString();
  };

  const cardStyle: React.CSSProperties = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 12,
    padding: 0,
    overflow: "hidden",
    animation: "fadeUp .4s ease both",
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "booking": return { icon: "◎", color: "#fb923c" };
      case "payment": return { icon: "◈", color: "#4ade80" };
      case "review":  return { icon: "◉", color: "#a78bfa" };
      default:        return { icon: "◌", color: p.primary };
    }
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both", maxWidth: 800 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: p.text, fontWeight: 400, marginBottom: 8 }}>Notifications</h1>
          <p style={{ color: p.textMuted, fontSize: 14 }}>Stay updated with your latest activities and requests.</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={markAllAsRead}
            style={{
              background: "none",
              border: `1px solid ${p.border}`,
              color: p.text,
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: p.textMuted }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: p.textMuted }}>No notifications</div>
        ) : (
          notifications.map((n: any, idx) => {
            const info = getIcon(n.type);
            return (
              <div key={n.id} 
                onClick={() => handleNotificationClick(n.id)}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "20px 24px",
                  borderBottom: idx === notifications.length - 1 ? "none" : `1px solid ${p.border}`,
                  background: !n.is_read ? "rgba(47,176,188,.03)" : "transparent",
                  transition: "background .2s",
                  cursor: "pointer",
                  position: "relative",
                  opacity: n.is_read ? 0.7 : 1
                }}
              >
                {!n.is_read && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: p.primary }} />}
                
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${info.color}15`,
                  color: info.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0
                }}>
                  {info.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: p.text }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: p.textMuted }}>{formatDate(n.created_at)}</div>
                  </div>
                  <div style={{ fontSize: 13, color: p.textMuted, lineHeight: 1.5 }}>{n.description}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
