// src/pages/client/AuthorizedPeople.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PALETTE = {
  primary: "#2FB0BC",
  bg: "#0e0e0e",
  cardBg: "rgba(255,255,255,0.02)",
  text: "#e8e6e0",
  textMuted: "rgba(232,230,224,0.5)",
  border: "rgba(255,255,255,0.06)",
};

export default function AuthorizedPeople() {
  const [authorized, setAuthorized] = useState([
    { id: 1, name: "Sarah", phone: "+213 555 000 111" }
  ]);
  const [showAdd, setShowAdd] = useState(false);

  const inputStyle = {
    width: "100%", 
    background: PALETTE.cardBg, 
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 12, 
    padding: "14px 18px", 
    fontSize: 14, 
    color: PALETTE.text,
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Authorized People</h1>
        <button 
          onClick={() => setShowAdd(!showAdd)} 
          style={styles.primaryBtn}
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
            style={styles.formBox}
          >
            <input style={inputStyle} placeholder="Full name" />
            <input style={inputStyle} placeholder="Phone number" />
            <button style={{ ...styles.primaryBtn, alignSelf: "flex-end" }}>Authorize Person</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={styles.list}>
        {authorized.map(a => (
          <div key={a.id} style={styles.card}>
            <div>
              <div style={styles.name}>{a.name}</div>
              <div style={styles.details}>{a.phone}</div>
            </div>
            <div style={styles.actions}>
              <button style={styles.actionBtn}>Edit</button>
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
  title: { fontFamily: "'Instrument Serif', serif", fontSize: 32, color: PALETTE.text },
  primaryBtn: { background: PALETTE.primary, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 12, cursor: "pointer", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" },
  formBox: { background: PALETTE.cardBg, border: `1px solid ${PALETTE.border}`, padding: 24, borderRadius: 16, display: "flex", flexDirection: "column", gap: 16, marginBottom: 32, overflow: "hidden" },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: { background: PALETTE.cardBg, border: `1px solid ${PALETTE.border}`, padding: "16px 24px", borderRadius: 14, display: "flex", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 16, fontWeight: 500, color: PALETTE.text },
  details: { fontSize: 14, color: PALETTE.textMuted, marginTop: 4 },
  actions: { display: "flex", gap: 16 },
  actionBtn: { background: "none", border: "none", color: PALETTE.primary, cursor: "pointer", fontSize: 14, fontWeight: 500 }
};
