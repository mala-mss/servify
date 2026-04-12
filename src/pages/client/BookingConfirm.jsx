// src/pages/client/BookingConfirm.jsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export default function BookingConfirm() {
  const navigate = useNavigate();
  const { mode: theme, palette: p } = useTheme();

  return (
    <div style={{ ...styles.root, background: p.bg }}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ ...styles.card, background: p.cardBg, borderColor: p.border }}
      >
        <h1 style={{ ...styles.title, color: p.text }}>Final Confirmation</h1>
        <p style={{ ...styles.subtitle, color: p.textMuted }}>Please review your booking details before finalizing.</p>

        <div style={{ ...styles.details, background: theme === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
          <div style={{ ...styles.detailRow, color: p.text }}>
            <span>Service</span>
            <span>Home Cleaning</span>
          </div>
          <div style={{ ...styles.detailRow, color: p.text }}>
            <span>Date</span>
            <span>March 28, 2026</span>
          </div>
          <div style={{ ...styles.detailRow, color: p.text }}>
            <span>Total</span>
            <span style={{ color: p.primary, fontWeight: 700 }}>$32.50</span>
          </div>
        </div>

        <div style={styles.actions}>
          <button 
            onClick={() => navigate("/client/payment-success")} 
            style={{ ...styles.confirmBtn, background: p.primary, color: "#fff" }}
          >
            Confirm Booking
          </button>
          <button 
            onClick={() => navigate(-1)} 
            style={{ ...styles.backBtn, color: p.textMuted }}
          >
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" },
  card: { border: "1px solid", padding: 48, borderRadius: 32, maxWidth: 500, width: "100%" },
  title: { fontSize: 28, fontWeight: 600, marginBottom: 12 },
  subtitle: { fontSize: 16, marginBottom: 32 },
  details: { padding: 24, borderRadius: 16, marginBottom: 40, display: "flex", flexDirection: "column", gap: 16 },
  detailRow: { display: "flex", justifyContent: "space-between", fontSize: 14 },
  actions: { display: "flex", flexDirection: "column", gap: 12 },
  confirmBtn: { border: "none", padding: "16px", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" },
  backBtn: { background: "none", border: "none", padding: "12px", fontSize: 14, cursor: "pointer" }
};
