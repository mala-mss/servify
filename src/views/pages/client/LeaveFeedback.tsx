import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/controllers/context/ThemeContext";
import axiosInstance from "@/controllers/api/axiosInstance";
import { useAuth } from "@/controllers/context/AuthContext";

export default function LeaveFeedback() {
  const { id } = useParams(); // providerId
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [punctuality, setPunctuality] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { mode: theme, palette: p } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/feedback', {
        overall_rating: rating,
        punctuality,
        title,
        comment,
        idU_cl: user.id,
        idU_SP: Number(id),
        is_verified_booking: true
      });
      alert("Thank you for your feedback!");
      navigate("/client/my-bookings");
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange, label }) => {
    const [hover, setHover] = useState(0);
    return (
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: p.text }}>{label}</p>
        <div style={styles.starSection}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              style={{
                ...styles.starBtn,
                fontSize: 32,
                color: (hover || value) >= star ? "#FFD700" : (theme === 'dark' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")
              }}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              ★
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={styles.container}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ ...styles.card, background: p.cardBg, borderColor: p.border }}
        >
          <h1 style={{ ...styles.title, color: p.text }}>How was your service?</h1>
          <p style={{ ...styles.subtitle, color: p.textMuted }}>Your feedback helps others know what to expect.</p>

          <form onSubmit={handleSubmit}>
            <StarRating value={rating} onChange={setRating} label="Overall Rating" />
            <StarRating value={punctuality} onChange={setPunctuality} label="Punctuality" />

            <input
              style={{ ...styles.input, background: theme === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderColor: p.border, color: p.text }}
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />

            <textarea
              style={{ ...styles.textarea, background: theme === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderColor: p.border, color: p.text }}
              placeholder="What did you like? Anything we could do better?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              maxLength={500}
            />
            
            <div style={styles.actions}>
              <button type="button" onClick={() => navigate(-1)} style={{ ...styles.cancelBtn, color: p.textMuted }}>Maybe later</button>
              <button type="submit" disabled={loading || !rating} style={{ ...styles.submitBtn, background: p.primary, color: "#fff", opacity: (loading || !rating) ? 0.5 : 1 }}>
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  container: { width: "100%", maxWidth: 500 },
  card: { padding: 48, borderRadius: 32, textAlign: "center", border: "1px solid" },
  title: { fontSize: 28, fontWeight: 600, marginBottom: 12 },
  subtitle: { fontSize: 15, marginBottom: 40, lineHeight: "1.5" },
  starSection: { display: "flex", justifyContent: "center", gap: 8 },
  starBtn: { background: "none", border: "none", cursor: "pointer", transition: "all 0.2s" },
  input: { width: "100%", padding: '16px', borderRadius: '12px', border: '1px solid', fontSize: '15px', outline: 'none', marginBottom: '16px' },
  textarea: { width: "100%", minHeight: 120, padding: 20, borderRadius: 16, border: "1px solid", fontSize: 15, outline: "none", marginBottom: 32, resize: "none" },
  actions: { display: "flex", flexDirection: "column", gap: 12 },
  submitBtn: { padding: 16, borderRadius: 12, border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer" },
  cancelBtn: { padding: 12, borderRadius: 12, border: "none", background: "none", cursor: "pointer" }
};
