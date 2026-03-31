// src/pages/client/BookingConfirm.jsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function BookingConfirm() {
  const navigate = useNavigate();

  return (
    <div style={styles.root}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.card}
      >
        <h1 style={styles.title}>Final Confirmation</h1>
        <p style={styles.subtitle}>Please review your booking details before finalizing.</p>

        <div style={styles.details}>
          <div style={styles.detailRow}>
            <span>Service</span>
            <span>Home Cleaning</span>
          </div>
          <div style={styles.detailRow}>
            <span>Date</span>
            <span>March 28, 2026</span>
          </div>
          <div style={styles.detailRow}>
            <span>Total</span>
            <span style={{ color: "#2FB0BC", fontWeight: 700 }}>$32.50</span>
          </div>
        </div>

        <div style={styles.actions}>
          <button onClick={() => navigate("/client/payment-success")} style={styles.confirmBtn}>Confirm Booking</button>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>Go Back</button>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#0e0e0e", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" },
  card: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: 48, borderRadius: 32, maxWidth: 500, width: "100%" },
  title: { color: "#e8e6e0", fontSize: 28, fontWeight: 600, marginBottom: 12 },
  subtitle: { color: "rgba(232,230,224,0.4)", fontSize: 16, marginBottom: 32 },
  details: { background: "rgba(255,255,255,0.03)", padding: 24, borderRadius: 16, marginBottom: 40, display: "flex", flexDirection: "column", gap: 16 },
  detailRow: { display: "flex", justifyContent: "space-between", color: "#e8e6e0", fontSize: 14 },
  actions: { display: "flex", flexDirection: "column", gap: 12 },
  confirmBtn: { background: "#2FB0BC", color: "#fff", border: "none", padding: "16px", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" },
  backBtn: { background: "none", color: "rgba(255,255,255,0.3)", border: "none", padding: "12px", fontSize: 14, cursor: "pointer" }
};
