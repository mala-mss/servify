// src/pages/client/DependantsDetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export default function DependantsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mode: theme, palette: p } = useTheme();

  // Mock data
  const dependant = {
    id: id || 1,
    name: "Thomas Smith",
    relation: "Son",
    age: "12 years",
    allergies: ["Peanuts", "Dust"],
    medications: ["None"],
    notes: "Very active, enjoys basketball. Needs help with advanced math homework.",
    emergencyContact: "Yassine (Father) - +1 999 000 111"
  };

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={{ ...styles.backBtn, color: p.primary }}>← Back</button>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ ...styles.card, background: p.cardBg, borderColor: p.border }}
        >
          <div style={styles.header}>
            <div style={{ ...styles.avatar, background: p.primary, color: "#fff" }}>{dependant.name[0]}</div>
            <div>
              <h1 style={{ ...styles.title, color: p.text }}>{dependant.name}</h1>
              <p style={{ ...styles.subtitle, color: p.textMuted }}>{dependant.relation} • {dependant.age}</p>
            </div>
          </div>

          <div style={styles.grid}>
            <div style={styles.section}>
              <h3 style={{ ...styles.sectionTitle, color: p.textMuted }}>Medical Info</h3>
              <div style={styles.tagGroup}>
                {dependant.allergies.map(a => <span key={a} style={{ ...styles.tag, background: "rgba(248,113,113,0.1)", color: "#f87171" }}>{a}</span>)}
              </div>
              <p style={{ ...styles.infoText, color: p.text }}><strong>Medications:</strong> {dependant.medications.join(", ")}</p>
            </div>

            <div style={styles.section}>
              <h3 style={{ ...styles.sectionTitle, color: p.textMuted }}>Emergency Contact</h3>
              <p style={{ ...styles.infoText, color: p.text }}>{dependant.emergencyContact}</p>
            </div>

            <div style={{ ...styles.section, gridColumn: "1 / -1" }}>
              <h3 style={{ ...styles.sectionTitle, color: p.textMuted }}>Care Notes</h3>
              <p style={{ ...styles.infoText, color: p.text }}>{dependant.notes}</p>
            </div>
          </div>

          <div style={{ ...styles.actions, borderTopColor: p.border }}>
            <button style={{ ...styles.editBtn, background: p.primary, color: "#fff" }}>Edit Profile</button>
            <button style={{ ...styles.removeBtn, borderColor: "rgba(248,113,113,0.3)", color: "#f87171" }}>Remove Dependant</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", padding: "80px 24px" },
  container: { maxWidth: 800, margin: "0 auto" },
  backBtn: { background: "none", border: "none", cursor: "pointer", marginBottom: 32 },
  card: { padding: 48, borderRadius: 32, border: "1px solid" },
  header: { display: "flex", alignItems: "center", gap: 24, marginBottom: 48 },
  avatar: { width: 80, height: 80, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700 },
  title: { fontSize: 32, fontWeight: 600, marginBottom: 4 },
  subtitle: { fontSize: 16 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 48 },
  sectionTitle: { fontSize: 14, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  infoText: { fontSize: 16, lineHeight: "1.6" },
  tagGroup: { display: "flex", gap: 8, marginBottom: 12 },
  tag: { padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600 },
  actions: { display: "flex", gap: 16, borderTop: "1px solid", paddingTop: 40 },
  editBtn: { flex: 1, padding: "14px", borderRadius: 12, border: "none", fontWeight: 600, cursor: "pointer" },
  removeBtn: { padding: "14px 24px", borderRadius: 12, border: "1px solid", background: "none", cursor: "pointer" }
};
