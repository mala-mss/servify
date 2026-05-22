import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/controllers/context/ThemeContext";
import axiosInstance from "@/controllers/api/axiosInstance";
import { useAuth } from "@/controllers/context/AuthContext";

interface LeaveFeedbackProps {
  providerId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LeaveFeedback({ providerId, onClose, onSuccess }: LeaveFeedbackProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [punctuality, setPunctuality] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { mode: theme, palette: p } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/feedback', {
        rating,
        punctuality,
        title,
        comment,
        idu_cl: user.id,
        idu_sp: providerId,
        is_verified_booking: true
      });
      alert("Thank you for your feedback!");
      onSuccess();
    } catch (error: any) {
      console.error("Failed to submit feedback:", error);
      alert(error.response?.data?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => {
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
    <div style={styles.overlay}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{ ...styles.card, background: p.cardBg, borderColor: p.border }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ ...styles.title, color: p.text }}>How was your service?</h1>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: p.textMuted }}>×</button>
        </div>
        
        <p style={{ ...styles.subtitle, color: p.textMuted }}>Your feedback helps others know what to expect.</p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <StarRating value={rating} onChange={setRating} label="Overall Rating" />
            <StarRating value={punctuality} onChange={setPunctuality} label="Punctuality" />
          </div>

          <input
            style={{ ...styles.input, background: theme === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderColor: p.border, color: p.text }}
            placeholder="Review Title (e.g. Excellent service!)"
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
            <button type="submit" disabled={loading || !rating} style={{ ...styles.submitBtn, background: p.primary, color: "#fff", opacity: (loading || !rating) ? 0.5 : 1 }}>
              {loading ? "Submitting..." : "Submit Review"}
            </button>
            <button type="button" onClick={onClose} style={{ ...styles.cancelBtn, color: p.textMuted }}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: 24
  },
  card: { padding: 40, borderRadius: 32, width: "100%", maxWidth: 600, border: "1px solid", boxShadow: '0 20px 50px rgba(0,0,0,0.3)' },
  title: { fontSize: 24, fontWeight: 700, margin: 0 },
  subtitle: { fontSize: 15, marginBottom: 32, lineHeight: "1.5" },
  starSection: { display: "flex", gap: 4 },
  starBtn: { background: "none", border: "none", cursor: "pointer", transition: "all 0.2s", padding: 0 },
  input: { width: "100%", padding: '14px', borderRadius: '12px', border: '1px solid', fontSize: '15px', outline: 'none', marginBottom: '16px' },
  textarea: { width: "100%", minHeight: 100, padding: 16, borderRadius: 16, border: "1px solid", fontSize: 15, outline: "none", marginBottom: 24, resize: "none" as const },
  actions: { display: "flex", flexDirection: "column" as const, gap: 12 },
  submitBtn: { padding: 16, borderRadius: 12, border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer" },
  cancelBtn: { padding: 12, borderRadius: 12, border: "none", background: "none", cursor: "pointer" }
};
