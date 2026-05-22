// src/pages/client/ProviderDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "@/controllers/api/axiosInstance";
import { useTheme } from "@/controllers/context/ThemeContext";
import { useAuth } from "@/controllers/context/AuthContext";
import { startConversation } from "@/controllers/api/chatApi";
import LeaveFeedback from "./LeaveFeedback";

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { mode: theme, palette: p } = useTheme();
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState('recent');

  const handleSendMessage = async () => {
    try {
      const conversation = await startConversation(Number(id));
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

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

  useEffect(() => {
    fetchProvider();
  }, [id]);

  const sortedReviews = provider?.reviews ? [...provider.reviews].sort((a: any, b: any) => {
    if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'high') return b.overall_rating - a.overall_rating;
    if (sortBy === 'low') return a.overall_rating - b.overall_rating;
    return 0;
  }) : [];

  const calculatedRating = provider?.reviews?.length > 0
    ? (provider.reviews.reduce((acc: number, rev: any) => acc + Number(rev.overall_rating || 0), 0) / provider.reviews.length).toFixed(1)
    : "0.0";
  
  const reviewCount = provider?.reviews?.length || 0;

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
                  <h1 style={{ ...styles.title, color: p.text }}>{provider.name}</h1>
                  <p style={{ ...styles.subtitle, color: p.primary }}>{provider.services?.join(", ") || "General Provider"}</p>
                  <div style={styles.ratingRow}>
                    <span style={{ color: "#FFD700" }}>★</span>
                    <span style={{ fontWeight: 600, marginLeft: 4, color: p.text }}>{calculatedRating}</span>
                    <span style={{ color: p.textMuted, marginLeft: 8 }}>({reviewCount} reviews)</span>
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
                    <div style={{ fontSize: 12, color: p.textMuted }}>Experience</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: p.text }}>{provider.years_of_exp} Years</div>
                  </div>
                  <div style={{ ...styles.metaItem, background: p.cardBg, borderColor: p.border }}>
                    <div style={{ fontSize: 12, color: p.textMuted }}>Location</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: p.text }}>{provider.location}</div>
                  </div>
                </div>
              </section>

              <section style={styles.section}>
                <h2 style={{ ...styles.sectionTitle, color: p.text }}>Specialties</h2>
                <div style={styles.tagRow}>
                  {(provider.categories || []).map((cat: any) => (
                    <span key={cat} style={{ ...styles.tag, background: p.cardBg, borderColor: p.border, color: p.text }}>{cat}</span>
                  ))}
                </div>
              </section>

              <section style={styles.section}>
                <h2 style={{ ...styles.sectionTitle, color: p.text }}>Certifications & Documents</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {provider.documents?.filter((doc: any) => !doc.idU_CL).map((doc: any, idx: number) => (
                    <a 
                      key={idx} 
                      href={doc.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ padding: '12px 16px', borderRadius: '12px', background: p.cardBg, border: `1px solid ${p.border}`, display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: p.text }}
                    >
                      <span style={{ fontSize: '20px' }}>📄</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                        <div style={{ fontSize: '11px', color: p.textMuted }}>{doc.type?.toUpperCase()}</div>
                      </div>
                    </a>
                  ))}
                  {(!provider.documents || provider.documents.filter((doc: any) => !doc.idU_CL).length === 0) && (
                    <p style={{ color: p.textMuted, fontSize: '14px' }}>No public documents available.</p>
                  )}
                </div>
              </section>

              <section style={styles.section}>
                <div style={styles.reviewHeader}>
                  <h2 style={{ ...styles.sectionTitle, color: p.text }}>Client Reviews</h2>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {user?.role === 'client' && (
                      <button 
                        onClick={() => setShowFeedbackModal(true)}
                        style={{ 
                          background: 'rgba(47,176,188,0.1)', 
                          color: p.primary, 
                          border: `1px solid ${p.primary}`, 
                          borderRadius: '8px', 
                          padding: '6px 16px', 
                          fontSize: '13px', 
                          fontWeight: 600, 
                          cursor: 'pointer' 
                        }}
                      >
                        Write a Review
                      </button>
                    )}
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{ background: p.cardBg, color: p.text, border: `1px solid ${p.border}`, borderRadius: '8px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      <option value="recent">Most Recent</option>
                      <option value="high">Highest Rated</option>
                      <option value="low">Lowest Rated</option>
                    </select>
                    <div style={styles.ratingBadge}>
                      <span style={{ color: "#FFD700" }}>★</span> {calculatedRating}
                    </div>
                  </div>
                </div>
                
                <div style={styles.reviewsList}>
                  {sortedReviews.length > 0 ? (
                    sortedReviews.map((rev: any, idx: number) => (
                      <div key={idx} style={{ ...styles.reviewCard, background: p.cardBg, borderColor: p.border }}>
                        <div style={styles.reviewUser}>
                          <div style={{ ...styles.avatarSmall, background: theme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: p.text }}>{rev.user_name?.[0] || "C"}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: p.text }}>{rev.user_name || "Anonymous Client"}</div>
                            <div style={{ fontSize: 12, color: p.textMuted }}>{new Date(rev.created_at).toLocaleDateString()}</div>
                            {rev.is_verified_booking && (
                              <div style={{ fontSize: '10px', color: '#10B981', fontWeight: 800, background: '#10B98115', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', width: 'fit-content' }}>
                                ✓ Verified Booking
                              </div>
                            )}
                          </div>
                          <div style={{ marginLeft: "auto", color: "#FFD700" }}>
                            {"★".repeat(Math.round(rev.overall_rating || rev.rating))}{"☆".repeat(5 - Math.round(rev.overall_rating || rev.rating))}
                          </div>
                        </div>
                        <p style={{ ...styles.reviewText, color: p.text }}>{rev.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div style={{ ...styles.reviewCard, background: p.cardBg, borderColor: p.border, textAlign: 'center', padding: '40px' }}>
                      <p style={{ color: p.textMuted }}>No reviews yet for this provider.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div style={styles.rightCol}>
              <div style={{ ...styles.stickyCard, background: p.cardBg, borderColor: p.border, boxShadow: theme === 'dark' ? "0 20px 50px rgba(0,0,0,0.4)" : "0 20px 50px rgba(0,0,0,0.05)" }}>
                <div style={styles.priceHeader}>
                  <div style={{ fontSize: 14, color: p.textMuted }}>Rate</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: p.primary }}>${provider.price_per_hour}<span style={{ fontSize: 14, fontWeight: 400, color: p.textMuted }}>/hr</span></div>
                </div>

                <div style={styles.benefits}>
                  <div style={{ ...styles.benefitItem, color: p.text }}><span style={{ color: p.secondary }}>✓</span> Verified Identity</div>
                  <div style={{ ...styles.benefitItem, color: p.text }}><span style={{ color: p.secondary }}>✓</span> Background Checked</div>
                  <div style={{ ...styles.benefitItem, color: p.text }}><span style={{ color: p.secondary }}>✓</span> Servify Protected</div>
                </div>

                <button onClick={handleBookNow} style={{ ...styles.bookBtn, background: p.primary, color: "#fff" }}>
                  Book a Service
                </button>

                <button 
                  onClick={handleSendMessage} 
                  style={{ ...styles.bookBtn, background: 'transparent', color: p.primary, border: `2px solid ${p.primary}`, marginTop: -10 }}
                >
                  Send Message
                </button>
                
                <p style={{ ...styles.guarantee, color: p.textMuted }}>
                  Free cancellation up to 24h before.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showFeedbackModal && (
          <LeaveFeedback 
            providerId={Number(id)} 
            onClose={() => setShowFeedbackModal(false)} 
            onSuccess={() => {
              setShowFeedbackModal(false);
              fetchProvider();
            }}
          />
        )}
      </AnimatePresence>
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
  stickyCard: { position: "sticky", top: 120, padding: "32px", borderRadius: 28, border: "1px solid" },
  priceHeader: { marginBottom: 32 },
  benefits: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 },
  benefitItem: { fontSize: 14, fontWeight: 500, display: "flex", gap: 10 },
  bookBtn: { width: "100%", padding: "18px", borderRadius: 16, border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 20 },
  guarantee: { textAlign: "center", fontSize: 12 },
  reviewHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  ratingBadge: { padding: "8px 16px", borderRadius: 12, background: "rgba(255,215,0,0.1)", color: "#FFD700", fontWeight: 700, fontSize: 18 },
  reviewsList: { display: "flex", flexDirection: "column", gap: 16 },
  reviewCard: { padding: "24px", borderRadius: 20, border: "1px solid" },
  reviewUser: { display: "flex", gap: 12, alignItems: "center", marginBottom: 12 },
  avatarSmall: { width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 },
  reviewText: { fontSize: 15, lineHeight: "1.6" }
};
