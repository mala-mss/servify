// src/pages/client/PaymentSuccess.jsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { mode: theme, palette: p } = useTheme();

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ ...styles.card, background: p.cardBg, borderColor: p.border }}
      >
        <div style={{ ...styles.iconBox, background: theme === 'dark' ? "rgba(47,176,188,0.1)" : "rgba(47,176,188,0.05)" }}>
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            style={{ ...styles.icon, color: p.primary }}
          >
            ✓
          </motion.span>
        </div>
        <h1 style={{ ...styles.title, color: p.text }}>Payment Successful</h1>
        <p style={{ ...styles.subtitle, color: p.textMuted }}>Your booking has been confirmed. You can track your request in the bookings section.</p>
        
        <div style={styles.actions}>
          <button 
            onClick={() => navigate("/client/my-bookings")} 
            style={{ ...styles.primaryBtn, background: p.primary, color: "#fff" }}
          >
            View My Bookings
          </button>
          <button 
            onClick={() => navigate("/client/home")} 
            style={{ ...styles.secondaryBtn, borderColor: p.primary, color: p.primary }}
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" },
  card: { border: "1px solid", padding: 48, borderRadius: 32, textAlign: "center", maxWidth: 500 },
  iconBox: { width: 80, height: 80, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px" },
  icon: { fontSize: 40 },
  title: { fontSize: 28, fontWeight: 600, marginBottom: 16 },
  subtitle: { fontSize: 16, lineHeight: "1.6", marginBottom: 40 },
  actions: { display: "flex", flexDirection: "column", gap: 12 },
  primaryBtn: { border: "none", padding: "16px", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" },
  secondaryBtn: { background: "transparent", padding: "16px", borderRadius: 12, fontSize: 16, fontWeight: 600, border: "1px solid", cursor: "pointer" }
};
