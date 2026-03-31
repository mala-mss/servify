// src/pages/client/Checkout.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const PALETTES = {
  dark: {
    primary: "#2FB0BC",
    bg: "#0e0e0e",
    cardBg: "rgba(255,255,255,0.02)",
    text: "#e8e6e0",
    textMuted: "rgba(232,230,224,0.5)",
    border: "rgba(255,255,255,0.06)"
  }
};

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const p = PALETTES.dark;

  const handlePay = () => {
    // Simulate payment process
    setTimeout(() => {
      navigate("/client/payment-success");
    }, 1500);
  };

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={styles.container}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ ...styles.card, background: p.cardBg, borderColor: p.border }}
        >
          <h1 style={styles.title}>Checkout</h1>
          
          <div style={styles.summary}>
            <h2 style={styles.sectionTitle}>Booking Summary</h2>
            <div style={{ ...styles.summaryItem, color: p.textMuted }}>
              <span>Service ID</span>
              <span style={{ color: p.text }}>{state?.bookingId || "N/A"}</span>
            </div>
            <div style={{ ...styles.summaryItem, color: p.textMuted }}>
              <span>Date & Time</span>
              <span style={{ color: p.text }}>{state?.date} at {state?.time}</span>
            </div>
            <div style={{ ...styles.summaryItem, color: p.textMuted }}>
              <span>Address</span>
              <span style={{ color: p.text }}>{state?.address}</span>
            </div>
          </div>

          <div style={{ ...styles.divider, borderColor: p.border }} />

          <div style={styles.payment}>
            <h2 style={styles.sectionTitle}>Payment Method</h2>
            <div style={{ ...styles.payMethod, background: "rgba(255,255,255,0.03)", borderColor: p.primary }}>
              <span>💳 Credit / Debit Card</span>
              <span style={{ fontSize: 12, color: p.primary }}>Selected</span>
            </div>
          </div>

          <div style={styles.totalBox}>
            <div style={styles.totalRow}>
              <span>Subtotal</span>
              <span>$30.00</span>
            </div>
            <div style={styles.totalRow}>
              <span>Service Fee</span>
              <span>$2.50</span>
            </div>
            <div style={{ ...styles.totalRow, fontSize: 20, fontWeight: 700, marginTop: 12 }}>
              <span>Total</span>
              <span style={{ color: p.primary }}>$32.50</span>
            </div>
          </div>

          <button onClick={handlePay} style={{ ...styles.payBtn, background: p.primary }}>
            Pay $32.50
          </button>
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", padding: 48 },
  container: { maxWidth: 500, margin: "0 auto" },
  card: { padding: 40, borderRadius: 24, border: "1px solid" },
  title: { fontSize: 28, fontWeight: 600, marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 600, marginBottom: 16 },
  summary: { display: "flex", flexDirection: "column", gap: 12 },
  summaryItem: { display: "flex", justifyContent: "space-between", fontSize: 14 },
  divider: { borderTop: "1px solid", margin: "24px 0" },
  payment: { marginBottom: 32 },
  payMethod: { padding: "16px 20px", borderRadius: 12, border: "1px solid", display: "flex", justifyContent: "space-between", alignItems: "center" },
  totalBox: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 },
  totalRow: { display: "flex", justifyContent: "space-between", fontSize: 15 },
  payBtn: { width: "100%", padding: 18, borderRadius: 12, border: "none", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer" }
};
