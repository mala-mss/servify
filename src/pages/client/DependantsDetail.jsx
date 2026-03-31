// src/pages/client/DependantsDetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function DependantsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

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
    <div style={styles.root}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.card}
        >
          <div style={styles.header}>
            <div style={styles.avatar}>{dependant.name[0]}</div>
            <div>
              <h1 style={styles.title}>{dependant.name}</h1>
              <p style={styles.subtitle}>{dependant.relation} • {dependant.age}</p>
            </div>
          </div>

          <div style={styles.grid}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Medical Info</h3>
              <div style={styles.tagGroup}>
                {dependant.allergies.map(a => <span key={a} style={styles.tag}>{a}</span>)}
              </div>
              <p style={styles.infoText}><strong>Medications:</strong> {dependant.medications.join(", ")}</p>
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Emergency Contact</h3>
              <p style={styles.infoText}>{dependant.emergencyContact}</p>
            </div>

            <div style={{ ...styles.section, gridColumn: "1 / -1" }}>
              <h3 style={styles.sectionTitle}>Care Notes</h3>
              <p style={styles.infoText}>{dependant.notes}</p>
            </div>
          </div>

          <div style={styles.actions}>
            <button style={styles.editBtn}>Edit Profile</button>
            <button style={styles.removeBtn}>Remove Dependant</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#0e0e0e", color: "#e8e6e0", fontFamily: "'DM Sans', sans-serif", padding: "80px 24px" },
  container: { maxWidth: 800, margin: "0 auto" },
  backBtn: { background: "none", border: "none", color: "#2FB0BC", cursor: "pointer", marginBottom: 32 },
  card: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: 48, borderRadius: 32 },
  header: { display: "flex", alignItems: "center", gap: 24, marginBottom: 48 },
  avatar: { width: 80, height: 80, borderRadius: 24, background: "#2FB0BC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#fff" },
  title: { fontSize: 32, fontWeight: 600, marginBottom: 4 },
  subtitle: { fontSize: 16, color: "rgba(232,230,224,0.4)" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 48 },
  sectionTitle: { fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "rgba(232,230,224,0.3)", marginBottom: 16 },
  infoText: { fontSize: 16, lineHeight: "1.6" },
  tagGroup: { display: "flex", gap: 8, marginBottom: 12 },
  tag: { padding: "4px 12px", borderRadius: 6, background: "rgba(248,113,113,0.1)", color: "#f87171", fontSize: 12, fontWeight: 600 },
  actions: { display: "flex", gap: 16, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 40 },
  editBtn: { flex: 1, padding: "14px", borderRadius: 12, border: "none", background: "#2FB0BC", color: "#fff", fontWeight: 600, cursor: "pointer" },
  removeBtn: { padding: "14px 24px", borderRadius: 12, border: "1px solid rgba(248,113,113,0.3)", background: "none", color: "#f87171", cursor: "pointer" }
};
