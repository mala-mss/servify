// src/pages/client/ServiceDetails.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const PALETTES = {
  dark: {
    primary: "#2FB0BC",
    secondary: "#6BC8B2",
    accent: "#7ED4CA",
    bg: "#0e0e0e",
    cardBg: "rgba(255,255,255,0.02)",
    text: "#e8e6e0",
    textMuted: "rgba(232,230,224,0.5)",
    border: "rgba(255,255,255,0.06)",
    glow: "rgba(47,176,188,0.04)"
  },
  light: {
    primary: "#2FB0BC",
    secondary: "#6BC8B2",
    accent: "#7ED4CA",
    bg: "#F8FBFB",
    cardBg: "#FFFFFF",
    text: "#2C3E50",
    textMuted: "rgba(44,62,80,0.5)",
    border: "#E0E7E7",
    glow: "rgba(47,176,188,0.06)"
  }
};

const SERVICE_DATA = {
  id: 1,
  name: "Premium Home Cleaning",
  provider: "Maria Garcia",
  rating: 4.9,
  reviews: 124,
  price: "$30/hr",
  description: "Experience a spotless home with our premium cleaning service. We use eco-friendly products and meticulous techniques to ensure every corner of your home sparkles. Our team is fully vetted and insured for your peace of mind.",
  features: [
    "Deep cleaning of all rooms",
    "Eco-friendly cleaning supplies",
    "Kitchen and bathroom sanitization",
    "Window cleaning (interior)",
    "Floor mopping and vacuuming"
  ],
  gallery: [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6954?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"
  ]
};

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theme] = useState("dark"); // Assuming dark theme for consistency
  const p = PALETTES[theme];

  const handleBookNow = () => {
    navigate(`/client/booking-request/${id}`);
  };

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={styles.container}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button onClick={() => navigate(-1)} style={{ ...styles.backBtn, color: p.primary }}>
            ← Back to Browse
          </button>

          <div style={styles.contentLayout}>
            <div style={styles.leftCol}>
              <div style={styles.gallery}>
                <img src={SERVICE_DATA.gallery[0]} alt="Service" style={{ ...styles.mainImg, borderColor: p.border }} />
                <div style={styles.thumbGrid}>
                  {SERVICE_DATA.gallery.slice(1).map((img, i) => (
                    <img key={i} src={img} alt="Thumb" style={{ ...styles.thumbImg, borderColor: p.border }} />
                  ))}
                </div>
              </div>

              <section style={styles.section}>
                <h2 style={{ ...styles.sectionTitle, color: p.text }}>About this service</h2>
                <p style={{ ...styles.description, color: p.textMuted }}>{SERVICE_DATA.description}</p>
              </section>

              <section style={styles.section}>
                <h2 style={{ ...styles.sectionTitle, color: p.text }}>What's included</h2>
                <ul style={styles.featureList}>
                  {SERVICE_DATA.features.map((f, i) => (
                    <li key={i} style={{ ...styles.featureItem, color: p.textMuted }}>
                      <span style={{ color: p.primary, marginRight: 10 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div style={styles.rightCol}>
              <div style={{ ...styles.stickyCard, background: p.cardBg, borderColor: p.border }}>
                <div style={styles.cardHeader}>
                  <h1 style={{ ...styles.title, color: p.text }}>{SERVICE_DATA.name}</h1>
                  <div style={styles.ratingRow}>
                    <span style={{ color: "#FFD700" }}>★</span>
                    <span style={{ fontWeight: 600, marginLeft: 4 }}>{SERVICE_DATA.rating}</span>
                    <span style={{ color: p.textMuted, marginLeft: 8 }}>({SERVICE_DATA.reviews} reviews)</span>
                  </div>
                </div>

                <div style={styles.priceRow}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: p.primary }}>{SERVICE_DATA.price}</span>
                  <span style={{ color: p.textMuted, fontSize: 14 }}>Starting price</span>
                </div>

                <div style={{ ...styles.providerBox, borderTopColor: p.border, borderBottomColor: p.border }}>
                  <div style={{ ...styles.avatar, background: p.primary }}>{SERVICE_DATA.provider[0]}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{SERVICE_DATA.provider}</div>
                    <div style={{ fontSize: 12, color: p.textMuted }}>Verified Provider</div>
                  </div>
                </div>

                <button onClick={handleBookNow} style={{ ...styles.bookBtn, background: p.primary }}>
                  Book Now
                </button>
                
                <p style={{ ...styles.guarantee, color: p.textMuted }}>
                  <span style={{ marginRight: 6 }}>🛡️</span> Servify Safety Guarantee
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", paddingBottom: 100 },
  container: { maxWidth: 1200, margin: "0 auto", padding: "40px 24px" },
  backBtn: { background: "none", border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer", marginBottom: 32 },
  contentLayout: { display: "grid", gridTemplateColumns: "1fr 400px", gap: 64 },
  leftCol: { display: "flex", flexDirection: "column", gap: 48 },
  gallery: { display: "flex", flexDirection: "column", gap: 16 },
  mainImg: { width: "100%", height: 450, objectFit: "cover", borderRadius: 24, border: "1px solid" },
  thumbGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  thumbImg: { width: "100%", height: 200, objectFit: "cover", borderRadius: 16, border: "1px solid" },
  section: {},
  sectionTitle: { fontSize: 24, fontWeight: 600, marginBottom: 16 },
  description: { fontSize: 16, lineHeight: "1.6" },
  featureList: { listStyle: "none" },
  featureItem: { fontSize: 15, marginBottom: 12, display: "flex", alignItems: "center" },
  rightCol: { position: "relative" },
  stickyCard: { position: "sticky", top: 100, padding: 32, borderRadius: 24, border: "1px solid", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" },
  cardHeader: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 600, marginBottom: 8, lineHeight: "1.2" },
  ratingRow: { display: "flex", alignItems: "center", fontSize: 14 },
  priceRow: { display: "flex", alignItems: "baseline", gap: 12, marginBottom: 32 },
  providerBox: { display: "flex", alignItems: "center", gap: 16, padding: "24px 0", borderTop: "1px solid", borderBottom: "1px solid", marginBottom: 32 },
  avatar: { width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600 },
  bookBtn: { width: "100%", padding: "18px", borderRadius: 12, border: "none", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: 20 },
  guarantee: { textAlign: "center", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }
};
