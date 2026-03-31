// src/pages/client/Dependants.jsx
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

export default function Dependants() {
  const [dependants, setDependants] = useState([
    { id: 1, name: "Lina", relation: "Daughter", age: 8 },
    { id: 2, name: "Adam", relation: "Son", age: 12 }
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
        <h1 style={styles.title}>Dependants</h1>
        <button 
          onClick={() => setShowAdd(!showAdd)} 
          style={styles.primaryBtn}
        >
          {showAdd ? "Cancel" : "+ Add dependant"}
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
            <div style={styles.grid}>
              <input style={inputStyle} placeholder="Full name" />
              <input style={inputStyle} placeholder="Age" />
            </div>
            <input style={inputStyle} placeholder="Relation" />
            <button style={{ ...styles.primaryBtn, alignSelf: "flex-end" }}>Save Dependant</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={styles.list}>
        {dependants.map(d => (
          <div key={d.id} style={styles.card}>
            <div>
              <div style={styles.name}>{d.name}</div>
              <div style={styles.details}>{d.relation} • {d.age} yrs</div>
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
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: { background: PALETTE.cardBg, border: `1px solid ${PALETTE.border}`, padding: "16px 24px", borderRadius: 14, display: "flex", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 16, fontWeight: 500, color: PALETTE.text },
  details: { fontSize: 14, color: PALETTE.textMuted, marginTop: 4 },
  actions: { display: "flex", gap: 16 },
  actionBtn: { background: "none", border: "none", color: PALETTE.primary, cursor: "pointer", fontSize: 14, fontWeight: 500 }
};
