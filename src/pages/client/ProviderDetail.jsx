// src/pages/client/ProviderDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axiosInstance from "../../api/axiosInstance";

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

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme] = useState("dark");
  const p = PALETTES[theme];

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/users/providers/${id}`);
        if (res.data.success) {
          setProvider(res.data.provider);
        }
      } catch (error) {
        console.error("Failed to fetch provider:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [id]);

  const handleBookNow = () => {
    if (location.state && location.state.serviceName) {
      navigate("/client/checkout", { state: location.state });
    } else {
      navigate(`/client/booking-request/${id}`);
    }
  };

  if (loading) return <div style={{ color: p.text, textAlign: 'center', padding: '100px' }}>Loading provider details...</div>;
  if (!provider) return <div style={{ color: p.text, textAlign: 'center', padding: '100px' }}>Provider not found.</div>;

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={styles.container}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button onClick={() => navigate(-1)} style={{ ...styles.backBtn, color: p.primary }}>
            ← Back to Explore
          </button>

          <div style={styles.contentLayout}>
            <div style={styles.leftCol}>
              <div style={styles.headerHero}>
                <div style={{ ...styles.avatarLarge, background: "rgba(47,176,188,0.1)", color: p.primary }}>
                  {provider.name[0]}
                </div>
                <div style={styles.headerInfo}>
                  <h1 style={styles.title}>{provider.name}</h1>
                  <p style={{ ...styles.subtitle, color: p.primary }}>{provider.services?.join(", ") || "General Provider"}</p>
                  <div style={styles.ratingRow}>
                    <span style={{ color: "#FFD700" }}>★</span>
                    <span style={{ fontWeight: 600, marginLeft: 4 }}>{provider.rating}</span>
                    <span style={{ color: p.textMuted, marginLeft: 8 }}>({provider.review_count} reviews)</span>
                  </div>
                </div>
              </div>

              <section style={styles.section}>
                <h2 style={{ ...styles.sectionTitle, color: p.text }}>About Me</h2>
                <p style={{ ...styles.description, color: p.textMuted }}>{provider.bio || "No bio available."}</p>
              </section>

              <section style={styles.section}>
                <h2 style={{ ...styles.sectionTitle, color: p.text }}>Experience & Expertise</h2>
                <div style={styles.metaGrid}>
                  <div style={{ ...styles.metaItem, background: p.cardBg, borderColor: p.border }}>
                    <div style={{ fontSize: 12, opacity: 0.5 }}>Experience</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{provider.years_of_exp} Years</div>
                  </div>
                  <div style={{ ...styles.metaItem, background: p.cardBg, borderColor: p.border }}>
                    <div style={{ fontSize: 12, opacity: 0.5 }}>Location</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{provider.location}</div>
                  </div>
                </div>
              </section>

              <section style={styles.section}>
                <h2 style={{ ...styles.sectionTitle, color: p.text }}>Specialties</h2>
                <div style={styles.tagRow}>
                  {(provider.categories || []).map(cat => (
                    <span key={cat} style={{ ...styles.tag, background: p.cardBg, borderColor: p.border }}>{cat}</span>
                  ))}
                </div>
              </section>

              <section style={styles.section}>
                <div style={styles.reviewHeader}>
                  <h2 style={{ ...styles.sectionTitle, color: p.text }}>Client Reviews</h2>
                  <div style={styles.ratingBadge}>
                    <span style={{ color: "#FFD700" }}>★</span> {provider.rating}
                  </div>
                </div>
                
                <div style={styles.reviewsList}>
                  {(provider.reviews && provider.reviews.length > 0) ? (
                    provider.reviews.map((rev, idx) => (
                      <div key={idx} style={{ ...styles.reviewCard, background: p.cardBg, borderColor: p.border }}>
                        <div style={styles.reviewUser}>
                          <div style={{ ...styles.avatarSmall, background: "rgba(255,255,255,0.05)" }}>{rev.user_name?.[0] || "C"}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{rev.user_name || "Anonymous Client"}</div>
                            <div style={{ fontSize: 12, opacity: 0.5 }}>{new Date(rev.created_at).toLocaleDateString()}</div>
                          </div>
                          <div style={{ marginLeft: "auto", color: "#FFD700" }}>
                            {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                          </div>
                        </div>
                        <p style={{ ...styles.reviewText, color: p.text }}>{rev.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div style={{ ...styles.reviewCard, background: p.cardBg, borderColor: p.border, textAlign: 'center', padding: '40px' }}>
                      <p style={{ opacity: 0.5 }}>No reviews yet for this provider.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div style={styles.rightCol}>
              <div style={{ ...styles.stickyCard, background: p.cardBg, borderColor: p.border }}>
                <div style={styles.priceHeader}>
                  <div style={{ fontSize: 14, opacity: 0.6 }}>Rate</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: p.primary }}>${provider.price_per_hour}<span style={{ fontSize: 14, fontWeight: 400, color: p.textMuted }}>/hr</span></div>
                </div>

                <div style={styles.benefits}>
                  <div style={styles.benefitItem}><span style={{ color: p.secondary }}>✓</span> Verified Identity</div>
                  <div style={styles.benefitItem}><span style={{ color: p.secondary }}>✓</span> Background Checked</div>
                  <div style={styles.benefitItem}><span style={{ color: p.secondary }}>✓</span> Servify Protected</div>
                </div>

                <button onClick={handleBookNow} style={{ ...styles.bookBtn, background: p.primary }}>
                  Book a Service
                </button>
                
                <p style={{ ...styles.guarantee, color: p.textMuted }}>
                  Free cancellation up to 24h before.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", paddingBottom: 100 },
  container: { maxWidth: 1100, margin: "0 auto", padding: "40px 24px" },
  backBtn: { background: "none", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 40 },
  contentLayout: { display: "grid", gridTemplateColumns: "1fr 360px", gap: 60 },
  leftCol: { display: "flex", flexDirection: "column", gap: 48 },
  headerHero: { display: "flex", gap: 32, alignItems: "center" },
  avatarLarge: { width: 100, height: 100, borderRadius: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 800 },
  headerInfo: { flex: 1 },
  title: { fontSize: 36, fontWeight: 800, marginBottom: 8 },
  subtitle: { fontSize: 18, fontWeight: 600, marginBottom: 12 },
  ratingRow: { display: "flex", alignItems: "center", fontSize: 15 },
  section: {},
  sectionTitle: { fontSize: 22, fontWeight: 700, marginBottom: 20 },
  description: { fontSize: 16, lineHeight: "1.8" },
  metaGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  metaItem: { padding: "24px", borderRadius: 20, border: "1px solid" },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 10 },
  tag: { padding: "8px 16px", borderRadius: 12, border: "1px solid", fontSize: 14, fontWeight: 500 },
  rightCol: { position: "relative" },
  stickyCard: { position: "sticky", top: 120, padding: "32px", borderRadius: 28, border: "1px solid", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" },
  priceHeader: { marginBottom: 32 },
  benefits: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 },
  benefitItem: { fontSize: 14, fontWeight: 500, display: "flex", gap: 10 },
  bookBtn: { width: "100%", padding: "18px", borderRadius: 16, border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 20, transition: "transform 0.2s" },
  guarantee: { textAlign: "center", fontSize: 12, opacity: 0.6 },
  reviewHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  ratingBadge: { padding: "8px 16px", borderRadius: 12, background: "rgba(255,215,0,0.1)", color: "#FFD700", fontWeight: 700, fontSize: 18 },
  reviewsList: { display: "flex", flexDirection: "column", gap: 16 },
  reviewCard: { padding: "24px", borderRadius: 20, border: "1px solid" },
  reviewUser: { display: "flex", gap: 12, alignItems: "center", marginBottom: 12 },
  avatarSmall: { width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 },
  reviewText: { fontSize: 15, lineHeight: "1.6", opacity: 0.9 }
};
