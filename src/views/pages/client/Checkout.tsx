// src/pages/client/Checkout.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import axiosInstance from "@/controllers/api/axiosInstance";
import { useTheme } from "@/controllers/context/ThemeContext";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { mode: theme, palette: p } = useTheme();

  const handlePay = async () => {
    setLoading(true);
    const subtotal = state?.price || 0;
    const serviceFee = 2.50;
    const total = subtotal + serviceFee;
    
    try {
      const bookingData = {
        service_id: state?.serviceId || 1, 
        service_provider_id: state?.providerId || 1, 
        date: state?.date,
        time: state?.time,
        address: state?.address,
        amount: total
      };

      const response = await axiosInstance.post("/bookings", bookingData);
      
      if (response.data) {
        navigate("/client/payment-success");
      }
    } catch (error) {
      console.error("Payment/Booking failed:", error);
      alert("Failed to process booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = state?.price || 0;
  const serviceFee = 2.50;
  const total = subtotal + serviceFee;

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={styles.container}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ ...styles.card, background: p.cardBg, borderColor: p.border }}
        >
          <h1 style={{ ...styles.title, color: p.text }}>Checkout</h1>
          
          <div style={styles.summary}>
            <h2 style={{ ...styles.sectionTitle, color: p.textMuted }}>Booking Summary</h2>
            <div style={{ ...styles.summaryItem, color: p.textMuted }}>
              <span>Provider</span>
              <span style={{ color: p.text }}>{state?.providerName || "N/A"}</span>
            </div>
            <div style={{ ...styles.summaryItem, color: p.textMuted }}>
              <span>Service</span>
              <span style={{ color: p.text }}>{state?.serviceName || "N/A"}</span>
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
            <h2 style={{ ...styles.sectionTitle, color: p.textMuted }}>Payment Method</h2>
            <div style={{ ...styles.payMethod, background: theme === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderColor: p.primary }}>
              <span>💳 Credit / Debit Card</span>
              <span style={{ fontSize: 12, color: p.primary }}>Selected</span>
            </div>
          </div>

          <div style={styles.totalBox}>
            <div style={{ ...styles.totalRow, color: p.text }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ ...styles.totalRow, color: p.text }}>
              <span>Service Fee</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <div style={{ ...styles.totalRow, fontSize: 20, fontWeight: 700, marginTop: 12, color: p.text }}>
              <span>Total</span>
              <span style={{ color: p.primary }}>${total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            disabled={loading}
            onClick={handlePay} 
            style={{ 
              ...styles.payBtn, 
              background: p.primary,
              color: "#fff",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", padding: "48px 24px" },
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
  payBtn: { width: "100%", padding: 18, borderRadius: 12, border: "none", fontSize: 16, fontWeight: 600 }
};












