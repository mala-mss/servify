// src/pages/client/PaymentSuccess.jsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div style={styles.root}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={styles.card}
      >
        <div style={styles.iconBox}>
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            style={styles.icon}
          >
            ✓
          </motion.span>
        </div>
        <h1 style={styles.title}>Payment Successful</h1>
        <p style={styles.subtitle}>Your booking has been confirmed. You can track your request in the bookings section.</p>
        
        <div style={styles.actions}>
          <button onClick={() => navigate("/client/my-bookings")} style={styles.primaryBtn}>View My Bookings</button>
          <button onClick={() => navigate("/client/home")} style={styles.secondaryBtn}>Back to Home</button>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#0e0e0e", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" },
  card: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: 48, borderRadius: 32, textAlign: "center", maxWidth: 500 },
  iconBox: { width: 80, height: 80, borderRadius: "50%", background: "rgba(47,176,188,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px" },
  icon: { fontSize: 40, color: "#2FB0BC" },
  title: { color: "#e8e6e0", fontSize: 28, fontWeight: 600, marginBottom: 16 },
  subtitle: { color: "rgba(232,230,224,0.5)", fontSize: 16, lineHeight: "1.6", marginBottom: 40 },
  actions: { display: "flex", flexDirection: "column", gap: 12 },
  primaryBtn: { background: "#2FB0BC", color: "#fff", border: "none", padding: "16px", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" },
  secondaryBtn: { background: "transparent", color: "#2FB0BC", border: "1px solid #2FB0BC", padding: "16px", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" }
};
