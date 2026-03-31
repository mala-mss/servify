// src/pages/provider/Notifications.tsx
import { useTheme } from "@/context/ThemeContext";

export default function Notifications() {
  const { palette: p } = useTheme();

  const notifications = [
    { id: 1, type: "booking", title: "New Job Request", desc: "Leila H. requested 'Super Nanny' service for tomorrow.", time: "2 mins ago", isNew: true },
    { id: 2, type: "payment", title: "Payment Received", desc: "You received 4,500 DZD for your service with Amine B.", time: "4 hours ago", isNew: true },
    { id: 3, type: "review", title: "New Review", desc: "Sara M. left a 5-star review: 'Excellent service, highly recommend!'", time: "Yesterday", isNew: false },
    { id: 4, type: "system", title: "Profile Verified", desc: "Your identity documents have been successfully verified.", time: "2 days ago", isNew: false },
    { id: 5, type: "booking", title: "Booking Confirmed", desc: "Nadia K. confirmed the booking for Friday, Oct 25.", time: "3 days ago", isNew: false },
  ];

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
        <button style={{
          background: "none",
          border: `1px solid ${p.border}`,
          color: p.text,
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 13,
          cursor: "pointer"
        }}>
          Mark all as read
        </button>
      </div>

      <div style={cardStyle}>
        {notifications.map((n, idx) => {
          const info = getIcon(n.type);
          return (
            <div key={n.id} style={{
              display: "flex",
              gap: 16,
              padding: "20px 24px",
              borderBottom: idx === notifications.length - 1 ? "none" : `1px solid ${p.border}`,
              background: n.isNew ? "rgba(47,176,188,.03)" : "transparent",
              transition: "background .2s",
              cursor: "pointer",
              position: "relative"
            }}>
              {n.isNew && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: p.primary }} />}
              
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
                  <div style={{ fontSize: 11, color: p.textMuted }}>{n.time}</div>
                </div>
                <div style={{ fontSize: 13, color: p.textMuted, lineHeight: 1.5 }}>{n.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <button style={{ background: "none", border: "none", color: p.primary, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          Load older notifications
        </button>
      </div>
    </div>
  );
}
