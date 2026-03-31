// src/pages/client/LeaveFeedback.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function LeaveFeedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your feedback!");
    navigate("/client/my-bookings");
  };

  return (
    <div style={styles.root}>
      <div style={styles.container}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.card}
        >
          <h1 style={styles.title}>How was your service?</h1>
          <p style={styles.subtitle}>Your feedback helps Maria improve and lets others know what to expect.</p>

          <div style={styles.starSection}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                style={{
                  ...styles.starBtn,
                  color: (hover || rating) >= star ? "#FFD700" : "rgba(255,255,255,0.1)"
                }}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                ★
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              style={styles.textarea}
              placeholder="What did you like? Anything we could do better?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            
            <div style={styles.actions}>
              <button type="button" onClick={() => navigate(-1)} style={styles.cancelBtn}>Maybe later</button>
              <button type="submit" style={styles.submitBtn}>Submit Review</button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#0e0e0e", color: "#e8e6e0", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  container: { width: "100%", maxWidth: 500 },
  card: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: 48, borderRadius: 32, textAlign: "center" },
  title: { fontSize: 28, fontWeight: 600, marginBottom: 12 },
  subtitle: { fontSize: 15, color: "rgba(232,230,224,0.4)", marginBottom: 40, lineHeight: "1.5" },
  starSection: { display: "flex", justifyContent: "center", gap: 8, marginBottom: 40 },
  starBtn: { background: "none", border: "none", fontSize: 48, cursor: "pointer", transition: "all 0.2s" },
  textarea: { width: "100%", minHeight: 150, padding: 20, borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 15, outline: "none", marginBottom: 32, resize: "none" },
  actions: { display: "flex", flexDirection: "column", gap: 12 },
  submitBtn: { padding: 16, borderRadius: 12, border: "none", background: "#2FB0BC", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer" },
  cancelBtn: { padding: 12, borderRadius: 12, border: "none", background: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }
};
