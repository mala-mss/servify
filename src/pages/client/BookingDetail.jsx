// src/pages/client/BookingDetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mode: theme, palette: p } = useTheme();

  // Mock booking data
  const booking = {
    id: id || "BK-7821",
    service: "Home Cleaning",
    status: "Upcoming",
    date: "March 28, 2026",
    time: "10:00 AM",
    provider: {
      name: "Maria Garcia",
      phone: "+1 234 567 890",
      rating: 4.9
    },
    address: "123 Serenity Lane, Apt 4B",
    price: "$30.00"
  };

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={{ ...styles.backBtn, color: p.primary }}>← Back</button>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ ...styles.card, background: p.cardBg, borderColor: p.border }}
        >
          <div style={styles.header}>
            <div>
              <div style={{ ...styles.statusBadge, background: theme === 'dark' ? "rgba(107,200,178,0.15)" : "rgba(107,200,178,0.1)", color: "#6BC8B2" }}>{booking.status}</div>
              <h1 style={{ ...styles.title, color: p.text }}>{booking.service}</h1>
              <p style={{ ...styles.ref, color: p.textMuted }}>Ref: {booking.id}</p>
            </div>
            <button onClick={() => navigate(`/client/booking-tracker/${booking.id}`)} style={{ ...styles.trackBtn, background: p.primary, color: "#fff" }}>Track Live</button>
          </div>

          <div style={{ ...styles.section, borderTopColor: p.border }}>
            <h2 style={{ ...styles.sectionTitle, color: p.textMuted }}>Provider Info</h2>
            <div style={styles.providerRow}>
              <div style={{ ...styles.avatar, background: p.primary, color: "#fff" }}>{booking.provider.name[0]}</div>
              <div>
                <div style={{ fontWeight: 600, color: p.text }}>{booking.provider.name}</div>
                <div style={{ fontSize: 13, color: p.textMuted }}>Rating: {booking.provider.rating} ★</div>
              </div>
              <button style={{ ...styles.contactBtn, borderColor: p.border, color: p.text }}>Message</button>
            </div>
          </div>

          <div style={{ ...styles.section, borderTopColor: p.border }}>
            <h2 style={{ ...styles.sectionTitle, color: p.textMuted }}>Service Details</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={{ color: p.textMuted }}>Date</span>
                <span style={{ color: p.text }}>{booking.date}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={{ color: p.textMuted }}>Time</span>
                <span style={{ color: p.text }}>{booking.time}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={{ color: p.textMuted, gridColumn: "span 2" }}>Address</span>
                <span style={{ color: p.text, gridColumn: "span 2" }}>{booking.address}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={{ color: p.textMuted }}>Price Paid</span>
                <span style={{ color: p.text }}>{booking.price}</span>
              </div>
            </div>
          </div>

          <div style={styles.footer}>
            <button style={{ ...styles.cancelBtn, color: "#f87171" }}>Cancel Booking</button>
            <button style={{ ...styles.helpBtn, color: p.textMuted }}>Need Help?</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", padding: "40px 24px" },
  container: { maxWidth: 700, margin: "0 auto" },
  backBtn: { background: "none", border: "none", cursor: "pointer", marginBottom: 24, fontSize: 14 },
  card: { padding: 40, borderRadius: 24, border: "1px solid" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  statusBadge: { padding: "6px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: "uppercase", display: "inline-block", marginBottom: 12 },
  title: { fontSize: 32, fontWeight: 600, marginBottom: 4 },
  ref: { fontSize: 14, fontFamily: "monospace" },
  trackBtn: { padding: "12px 24px", borderRadius: 12, border: "none", fontWeight: 600, cursor: "pointer" },
  section: { padding: "32px 0", borderTop: "1px solid" },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 20 },
  providerRow: { display: "flex", alignItems: "center", gap: 16 },
  avatar: { width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 },
  contactBtn: { marginLeft: "auto", padding: "8px 16px", borderRadius: 8, border: "1px solid", background: "none", cursor: "pointer" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  infoItem: { display: "flex", flexDirection: "column", gap: 4, fontSize: 14 },
  footer: { display: "flex", justifyContent: "space-between", marginTop: 24 },
  cancelBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14 },
  helpBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14 }
};
