// src/pages/client/AuthorizedPeople.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/controllers/context/ThemeContext";

export default function AuthorizedPeople() {
  const { mode: theme, palette: p } = useTheme();
  const [authorized, setAuthorized] = useState([
    { id: 1, name: "Sarah", phone: "+213 555 000 111" }
  ]);
  const [showAdd, setShowAdd] = useState(false);

  const inputStyle = {
    width: "100%", 
    background: p.cardBg, 
    border: `1px solid ${p.border}`,
    borderRadius: 12, 
    padding: "14px 18px", 
    fontSize: 14, 
    color: p.text,
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div style={{ ...styles.container, background: p.bg }}>
      <div style={styles.header}>
        <h1 style={{ ...styles.title, color: p.text }}>Authorized People</h1>
        <button 
          onClick={() => setShowAdd(!showAdd)} 
          style={{ ...styles.primaryBtn, background: p.primary, color: "#fff" }}
        >
          {showAdd ? "Cancel" : "+ Add person"}
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ ...styles.formBox, background: p.cardBg, borderColor: p.border }}
          >
            <input style={inputStyle} placeholder="Full name" />
            <input style={inputStyle} placeholder="Phone number" />
            <button style={{ ...styles.primaryBtn, background: p.primary, color: "#fff", alignSelf: "flex-end" }}>Authorize Person</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={styles.list}>
        {authorized.map(a => (
          <div key={a.id} style={{ ...styles.card, background: p.cardBg, borderColor: p.border }}>
            <div>
              <div style={{ ...styles.name, color: p.text }}>{a.name}</div>
              <div style={{ ...styles.details, color: p.textMuted }}>{a.phone}</div>
            </div>
            <div style={styles.actions}>
              <button style={{ ...styles.actionBtn, color: p.primary }}>Edit</button>
              <button style={{ ...styles.actionBtn, color: "#f87171" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 800, margin: "0 auto", padding: "40px 20px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  title: { fontFamily: "'Instrument Serif', serif", fontSize: 32 },
  primaryBtn: { border: "none", padding: "12px 24px", borderRadius: 12, cursor: "pointer", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" },
  formBox: { border: "1px solid", padding: 24, borderRadius: 16, display: "flex", flexDirection: "column", gap: 16, marginBottom: 32, overflow: "hidden" },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: { border: "1px solid", padding: "16px 24px", borderRadius: 14, display: "flex", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 16, fontWeight: 500 },
  details: { fontSize: 14, marginTop: 4 },
  actions: { display: "flex", gap: 16 },
  actionBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500 }
};












