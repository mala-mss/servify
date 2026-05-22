import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import axiosInstance from "@/controllers/api/axiosInstance";
import { useTheme } from "@/controllers/context/ThemeContext";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const stage = searchParams.get("stage");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<any>(state);
  const [agreed, setAgreed] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const { mode: theme, palette: p } = useTheme();

  useEffect(() => {
    if (bookingId && !booking) {
      const fetchBooking = async () => {
        try {
          const res = await axiosInstance.get(`/bookings/${bookingId}`);
          if (res.data.booking) {
            setBooking(res.data.booking);
          } else {
            setError("Booking details not found in response.");
          }
        } catch (err: any) {
          console.error("Failed to fetch booking for checkout:", err);
          setError(err.response?.data?.message || "Failed to load booking details. Please try again.");
        }
      };
      fetchBooking();
    }
  }, [bookingId, booking]);

  const handlePay = async () => {
    setShowAgreementModal(false);
    setLoading(true);
    
    const baseAmount = parseFloat(booking?.amount || booking?.price || 0);
    // If it's a booking-linked payment, it's always half per stage
    const subtotal = (bookingId || stage) ? baseAmount / 2 : baseAmount;
    const serviceFee = 2.50;
    const total = subtotal + serviceFee;
    
    try {
      if (bookingId) {
        // Handle payment for existing booking
        await axiosInstance.post(`/payments`, {
          bookingId: bookingId,
          amount: total,
          payment_method: 'credit_card',
          status: 'paid',
          stage: stage // Pass stage here
        });
        navigate("/client/payment-success");
      } else {
        // Original logic for new booking (if still used)
        const bookingData = {
          service_id: booking?.serviceId || 1, 
          service_provider_id: booking?.providerId || 1, 
          date: booking?.date,
          time: booking?.time,
          address: booking?.address,
          id_dep: booking?.dependantId,
          amount: total
        };

        const response = await axiosInstance.post("/bookings", bookingData);
        if (response.data) {
          navigate("/client/payment-success");
        }
      }
    } catch (err: any) {
      console.error("Payment/Booking failed:", err);
      alert(err.response?.data?.message || "Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const baseAmount = parseFloat(booking?.amount || booking?.price || 0);
  const subtotal = (bookingId || stage) ? baseAmount / 2 : baseAmount;
  const serviceFee = 2.50;
  const total = subtotal + serviceFee;

  if (error) return (
    <div style={{ padding: 60, textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h3 style={{ color: '#f87171', marginBottom: 16, fontSize: 24 }}>Oops!</h3>
      <p style={{ color: p.textMuted, marginBottom: 24, fontSize: 16 }}>{error}</p>
      <button onClick={() => navigate(-1)} style={{ padding: '12px 24px', borderRadius: 12, background: p.primary, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Go Back</button>
    </div>
  );

  if (bookingId && !booking) return (
    <div style={{ padding: 100, textAlign: 'center', color: p.textMuted, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <div className="loader"></div>
      <p>Loading checkout details...</p>
      <style>{`.loader { border: 3px solid ${p.border}; border-top: 3px solid ${p.primary}; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={styles.container}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ ...styles.card, background: p.cardBg, borderColor: p.border }}
        >
          <h1 style={{ ...styles.title, color: p.text }}>Checkout {bookingId ? `(${stage === 'second' ? '2nd Half' : '1st Half'})` : ''}</h1>
          
          <div style={styles.summary}>
            <h2 style={{ ...styles.sectionTitle, color: p.textMuted }}>Booking Summary</h2>
            <div style={{ ...styles.summaryItem, color: p.textMuted }}>
              <span>Provider</span>
              <span style={{ color: p.text }}>{booking?.provider_name || booking?.providerName || "N/A"}</span>
            </div>
            <div style={{ ...styles.summaryItem, color: p.textMuted }}>
              <span>Service</span>
              <span style={{ color: p.text }}>{booking?.service_name || booking?.serviceName || "N/A"}</span>
            </div>
            <div style={{ ...styles.summaryItem, color: p.textMuted }}>
              <span>Date & Time</span>
              <span style={{ color: p.text }}>{booking?.date ? new Date(booking.date).toLocaleDateString() : 'N/A'} at {booking?.time}</span>
            </div>
            <div style={{ ...styles.summaryItem, color: p.textMuted }}>
              <span>Address</span>
              <span style={{ color: p.text }}>{booking?.address}</span>
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
              <span>Subtotal {bookingId ? (stage === 'second' ? '(Final 50%)' : '(Initial 50%)') : ''}</span>
              <span>{subtotal.toFixed(2)} DZD</span>
            </div>
            <div style={{ ...styles.totalRow, color: p.text }}>
              <span>Service Fee</span>
              <span>{serviceFee.toFixed(2)} DZD</span>
            </div>
            <div style={{ ...styles.totalRow, fontSize: 20, fontWeight: 700, marginTop: 12, color: p.text }}>
              <span>Total</span>
              <span style={{ color: p.primary }}>{total.toFixed(2)} DZD</span>
            </div>
          </div>

          <button 
            disabled={loading}
            onClick={() => setShowAgreementModal(true)} 
            style={{ 
              ...styles.payBtn, 
              background: p.primary,
              color: "#fff",
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Processing..." : `Proceed to Payment`}
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showAgreementModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{
                background: p.cardBg, border: `1px solid ${p.border}`, borderRadius: 24, padding: 32,
                maxWidth: 450, width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                position: 'relative', zIndex: 10000
              }}
            >
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, marginBottom: 16, color: p.text }}>Trust & Safety Agreement</h2>
              <div style={{ fontSize: 14, color: p.textMuted, lineHeight: 1.6, marginBottom: 24 }}>
                <p style={{ marginBottom: 12 }}>By proceeding, you agree to our terms of service.</p>
                <div style={{ padding: 16, background: 'rgba(47,176,188,0.05)', borderRadius: 12, border: `1px solid rgba(47,176,188,0.1)` }}>
                  <strong style={{ color: p.text, display: 'block', marginBottom: 4 }}>Family Care Refund Guarantee:</strong>
                  If the service provider fails to show up or if the job is not completed as agreed, 
                  <strong> we will give you back your money.</strong>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 32 }}>
                <input 
                  type="checkbox" 
                  id="modalAgreed" 
                  checked={agreed} 
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ marginTop: 4, width: 20, height: 20, cursor: 'pointer', accentColor: p.primary }}
                />
                <label htmlFor="modalAgreed" style={{ fontSize: 14, color: p.text, lineHeight: 1.4, cursor: 'pointer' }}>
                  I understand and agree to the terms, including the refund assurance policy.
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  onClick={() => setShowAgreementModal(false)}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 12, border: `1px solid ${p.border}`,
                    background: 'transparent', color: p.textMuted, fontSize: 14, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  disabled={!agreed || loading}
                  onClick={handlePay}
                  style={{
                    flex: 2, padding: '14px', borderRadius: 12, border: 'none',
                    background: p.primary, color: '#fff', fontSize: 14, fontWeight: 600,
                    cursor: (agreed && !loading) ? 'pointer' : 'not-allowed', opacity: (agreed && !loading) ? 1 : 0.6
                  }}
                >
                  {loading ? "Processing..." : `Agree & Pay ${total.toFixed(2)} DZD`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles: any = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", padding: "48px 24px", position: "relative" as const },
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
