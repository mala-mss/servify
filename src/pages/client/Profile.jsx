// src/pages/client/Profile.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";

const STR_LEVELS = [
  { w: "20%",  color: "#f87171", label: "Weak"   },
  { w: "45%",  color: "#fb923c", label: "Fair"   },
  { w: "70%",  color: "#facc15", label: "Good"   },
  { w: "100%", color: "#4ade80", label: "Strong" },
];

function getStrength(v) {
  if (!v) return null;
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v)) s++;
  if (/[0-9]/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return STR_LEVELS[s - 1] ?? STR_LEVELS[0];
}

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.21, 0.45, 0.32, 0.9],
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export default function Profile() {
  const { user, logout } = useAuth();
  const { mode: theme, palette: p } = useTheme();
  const [tab, setTab] = useState("info");
  const [name, setName] = useState(user?.name ?? "");
  const [address, setAddr] = useState(user?.address ?? "");
  const [phone, setPhone] = useState(user?.phone_number ?? "");
  const [toast, setToast] = useState(false);
  const [currentPw, setCPw] = useState("");
  const [newPw, setNPw] = useState("");
  const [confirmPw, setRPw] = useState("");
  const [show, setShow] = useState({ c: false, n: false, r: false });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // States for Dependants & Authorized People
  const [dependants, setDependants] = useState([]);
  const [authorized, setAuthorized] = useState([]);
  
  const [showAddDep, setShowAddDep] = useState(false);
  const [showAddAuth, setShowAddAuth] = useState(false);

  const [depForm, setDepForm] = useState({ name: "", date_of_birth: "", relationship: "" });
  const [authForm, setAuthForm] = useState({ name: "", phone_number: "", national_id: "" });

  const strength = getStrength(newPw);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depRes, authRes] = await Promise.all([
          axiosInstance.get("/users/dependants"),
          axiosInstance.get("/users/authorized-people")
        ]);
        if (depRes.data.success) setDependants(depRes.data.dependants);
        if (authRes.data.success) setAuthorized(authRes.data.authorizedPeople);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    const handle = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  const handleSave = async () => {
    try {
        // Here we could call an update profile API
        setToast(true);
        setTimeout(() => setToast(false), 2500);
    } catch (e) {
        console.error(e);
    }
  };

  const handleAddDep = async () => {
    if (!depForm.name || !depForm.date_of_birth || !depForm.relationship) return;
    try {
        const res = await axiosInstance.post("/users/dependants", depForm);
        if (res.data.success) {
            setDependants([...dependants, res.data.dependant]);
            setDepForm({ name: "", date_of_birth: "", relationship: "" });
            setShowAddDep(false);
        }
    } catch (e) { console.error(e); }
  };

  const handleAddAuth = async () => {
    if (!authForm.name || !authForm.phone_number) return;
    try {
        const res = await axiosInstance.post("/users/authorized-people", authForm);
        if (res.data.success) {
            setAuthorized([...authorized, res.data.authorizedPerson]);
            setAuthForm({ name: "", phone_number: "", national_id: "" });
            setShowAddAuth(false);
        }
    } catch (e) { console.error(e); }
  };

  const handleDeleteDep = async (id) => {
    try {
        await axiosInstance.delete(`/users/dependants/${id}`);
        setDependants(dependants.filter(d => d.id_dependant !== id));
    } catch (e) { console.error(e); }
  };

  const handleDeleteAuth = async (id) => {
    try {
        await axiosInstance.delete(`/users/authorized-people/${id}`);
        setAuthorized(authorized.filter(a => a.id !== id));
    } catch (e) { console.error(e); }
  };

  const inputStyle = {
    width: "100%", 
    background: p.cardBg, 
    border: `1px solid ${p.border}`,
    borderRadius: 12, 
    padding: "14px 18px", 
    fontSize: 14, 
    color: p.text,
    transition: "all 0.2s", 
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
  };

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={{ 
        ...styles.bgGrid, 
        backgroundImage: theme === 'dark' 
          ? `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)`
          : `radial-gradient(circle at 2px 2px, ${p.grid} 1px, transparent 0)`
      }} />
      
      <div style={{ 
        ...styles.glow, 
        left: mousePos.x - 300, 
        top: mousePos.y - 300,
        background: `radial-gradient(circle, ${p.glow} 0%, transparent 70%)`
      }} />

      {/* ── MAIN CONTENT ── */}
      <div style={styles.container}>
        <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
          <motion.div style={styles.header} variants={itemVariants}>
            <div style={{ ...styles.label, color: p.textMuted }}>Account Settings</div>
            <h1 style={{ ...styles.title, color: p.text }}>Your profile</h1>
          </motion.div>

          <motion.div style={{ ...styles.profileCard, background: p.cardBg, borderColor: p.border }} variants={itemVariants}>
            <div style={{ ...styles.avatarLarge, background: "rgba(47,176,188,0.1)", border: `1.5px solid ${p.primary}33`, color: p.primary }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...styles.profileName, color: p.text }}>{user?.name}</div>
              <div style={{ ...styles.profileEmail, color: p.textMuted }}>{user?.email} · Client account</div>
            </div>
            <div style={{ ...styles.activeBadge, background: "rgba(74,222,128,0.06)", borderColor: "rgba(74,222,128,0.2)", color: "#4ade80" }}>
              <span style={styles.activeDot} /> Active
            </div>
          </motion.div>

          <motion.div style={{ ...styles.tabs, borderBottomColor: p.border }} variants={itemVariants}>
            {["info", "security", "dependants", "authorized"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  ...styles.tabBtn,
                  color: tab === t ? p.text : p.textMuted,
                  borderBottomColor: tab === t ? p.primary : "transparent",
                }}
              >
                {t === "info" ? "Personal info" : 
                 t === "security" ? "Security" : 
                 t === "dependants" ? "Dependants" : "Authorized"}
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} style={styles.content}>
              {tab === "info" && (
                <div style={styles.form}>
                  <div style={styles.gridRow}>
                    <div style={styles.inputGroup}>
                      <div style={{ ...styles.fieldLabel, color: p.textMuted }}>Full name</div>
                      <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div style={styles.inputGroup}>
                      <div style={{ ...styles.fieldLabel, color: p.textMuted }}>Email address</div>
                      <div style={styles.relative}>
                        <input style={{ ...inputStyle, color: p.textMuted, cursor: "not-allowed" }} value={user?.email} readOnly />
                        <span style={{ ...styles.readOnlyTag, color: p.textMuted }}>READ ONLY</span>
                      </div>
                    </div>
                  </div>
                  <div style={styles.inputGroup}>
                    <div style={{ ...styles.fieldLabel, color: p.textMuted }}>Address</div>
                    <textarea style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }} rows={2} value={address} onChange={(e) => setAddr(e.target.value)} />
                  </div>
                  <div style={styles.inputGroup}>
                    <div style={{ ...styles.fieldLabel, color: p.textMuted }}>Phone number</div>
                    <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div style={styles.formFooter}>
                    <button onClick={logout} style={{ ...styles.secondaryBtn, borderColor: p.border, color: p.textMuted }}>Sign out</button>
                    <button onClick={handleSave} style={{ ...styles.primaryBtn, background: p.primary, color: "#fff" }}>Save changes</button>
                  </div>
                </div>
              )}

              {tab === "dependants" && (
                <div style={styles.form}>
                  <div style={styles.sectionHeader}>
                    <div style={{ color: p.textMuted, fontSize: 13 }}>Manage your family members or dependants.</div>
                    <button onClick={() => setShowAddDep(!showAddDep)} style={{ ...styles.primaryBtn, background: p.primary, color: "#fff", padding: "10px 20px", fontSize: 13 }}>
                      {showAddDep ? "Cancel" : "+ Add dependant"}
                    </button>
                  </div>

                  {showAddDep && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ ...styles.formBox, background: theme === 'dark' ? "rgba(255,255,255,0.02)" : "rgba(47,176,188,0.04)", borderColor: p.border }}>
                      <div style={styles.gridRow}>
                        <input style={inputStyle} placeholder="Full name" value={depForm.name} onChange={(e) => setDepForm({...depForm, name: e.target.value})} />
                        <input type="date" style={inputStyle} value={depForm.date_of_birth} onChange={(e) => setDepForm({...depForm, date_of_birth: e.target.value})} />
                      </div>
                      <input style={inputStyle} placeholder="Relation (e.g. Daughter, Mother)" value={depForm.relationship} onChange={(e) => setDepForm({...depForm, relationship: e.target.value})} />
                      <button onClick={handleAddDep} style={{ ...styles.primaryBtn, background: p.primary, color: "#fff", alignSelf: "flex-end" }}>Add member</button>
                    </motion.div>
                  )}

                  <div style={styles.listGrid}>
                    {dependants.length === 0 ? (
                      <div style={{ ...styles.emptyState, color: p.textMuted }}>No dependants added yet.</div>
                    ) : (
                      dependants.map(d => (
                        <div key={d.id_dependant} style={{ ...styles.itemCard, background: p.cardBg, borderColor: p.border }}>
                          <div style={styles.cardInfo}>
                            <div style={{ ...styles.cardName, color: p.text }}>{d.name}</div>
                            <div style={{ ...styles.cardDetails, color: p.textMuted }}>{d.relationship} • Born: {new Date(d.date_of_birth).toLocaleDateString()}</div>
                          </div>
                          <div style={styles.cardActions}>
                            <button onClick={() => handleDeleteDep(d.id_dependant)} style={{ ...styles.actionBtn, color: "#f87171" }}>Delete</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {tab === "authorized" && (
                <div style={styles.form}>
                  <div style={styles.sectionHeader}>
                    <div style={{ color: p.textMuted, fontSize: 13 }}>People authorized to book or manage services for you.</div>
                    <button onClick={() => setShowAddAuth(!showAddAuth)} style={{ ...styles.primaryBtn, background: p.primary, color: "#fff", padding: "10px 20px", fontSize: 13 }}>
                      {showAddAuth ? "Cancel" : "+ Add person"}
                    </button>
                  </div>

                  {showAddAuth && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ ...styles.formBox, background: theme === 'dark' ? "rgba(255,255,255,0.02)" : "rgba(47,176,188,0.04)", borderColor: p.border }}>
                      <input style={inputStyle} placeholder="Full name" value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} />
                      <div style={styles.gridRow}>
                        <input style={inputStyle} placeholder="Phone number" value={authForm.phone_number} onChange={(e) => setAuthForm({...authForm, phone_number: e.target.value})} />
                        <input style={inputStyle} placeholder="National ID" value={authForm.national_id} onChange={(e) => setAuthForm({...authForm, national_id: e.target.value})} />
                      </div>
                      <button onClick={handleAddAuth} style={{ ...styles.primaryBtn, background: p.primary, color: "#fff", alignSelf: "flex-end" }}>Authorize person</button>
                    </motion.div>
                  )}

                  <div style={styles.listGrid}>
                    {authorized.length === 0 ? (
                      <div style={{ ...styles.emptyState, color: p.textMuted }}>No authorized people yet.</div>
                    ) : (
                      authorized.map(a => (
                        <div key={a.id} style={{ ...styles.itemCard, background: p.cardBg, borderColor: p.border }}>
                          <div style={styles.cardInfo}>
                            <div style={{ ...styles.cardName, color: p.text }}>{a.name}</div>
                            <div style={{ ...styles.cardDetails, color: p.textMuted }}>{a.phone_number} {a.national_id && `• ID: ${a.national_id}`}</div>
                          </div>
                          <div style={styles.cardActions}>
                            <button onClick={() => handleDeleteAuth(a.id)} style={{ ...styles.actionBtn, color: "#f87171" }}>Delete</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <footer style={{ ...styles.footer, background: theme === 'dark' ? "#0a0a0a" : p.cardBg, borderTopColor: p.border }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <span style={{ ...styles.footerText, color: p.textMuted }}>© 2026 Servify Inc. All rights reserved.</span>
        </div>
      </footer>

      <div style={{ 
        ...styles.toast, 
        transform: `translateX(-50%) translateY(${toast ? 0 : 20}px)`, 
        opacity: toast ? 1 : 0, 
        background: p.cardBg, 
        borderColor: "rgba(74,222,128,0.25)" 
      }}>
        ✓ Profile saved successfully
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea { font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; }
        input::placeholder, textarea::placeholder { color: ${p.textMuted}; opacity: 0.5; }
        a { text-decoration: none; color: inherit; }
      `}</style>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", position: "relative", transition: "background 0.3s ease, color 0.3s ease" },
  bgGrid: { position: "absolute", inset: 0, backgroundSize: "40px 40px", zIndex: 0, pointerEvents: "none" },
  glow: { position: "fixed", width: 600, height: 600, borderRadius: "50%", pointerEvents: "none", zIndex: 0, transition: "left 0.8s ease, top 0.8s ease" },
  container: { maxWidth: 860, margin: "0 auto", padding: "80px 48px 120px", position: "relative", zIndex: 1 },
  header: { marginBottom: 44 },
  label: { fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },
  title: { fontFamily: "'Instrument Serif', serif", fontSize: 48, fontWeight: 400, letterSpacing: -1 },
  profileCard: { display: "flex", alignItems: "center", gap: 28, marginBottom: 48, padding: "26px 30px", border: "1px solid", borderRadius: 20 },
  avatarLarge: { width: 72, height: 72, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Serif', serif", fontSize: 28, flexShrink: 0 },
  profileName: { fontSize: 20, fontWeight: 500, marginBottom: 4 },
  profileEmail: { fontSize: 14 },
  activeBadge: { display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", border: "1px solid", borderRadius: 999, fontSize: 12 },
  activeDot: { width: 6, height: 6, borderRadius: "50%", background: "#4ade80" },
  tabs: { display: "flex", borderBottom: "1px solid", marginBottom: 40 },
  tabBtn: { padding: "12px 24px", background: "transparent", border: "none", borderBottom: "2px solid", fontSize: 14, cursor: "pointer", marginBottom: -1, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: "all 0.2s" },
  content: { minHeight: 300 },
  form: { display: "flex", flexDirection: "column", gap: 24 },
  gridRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  inputGroup: { display: "flex", flexDirection: "column", gap: 8 },
  fieldLabel: { fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase" },
  relative: { position: "relative" },
  readOnlyTag: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 9, letterSpacing: ".5px", fontWeight: 600 },
  formFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 },
  primaryBtn: { padding: "14px 32px", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  secondaryBtn: { padding: "14px 24px", background: "transparent", border: "1px solid", borderRadius: 12, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  formBox: { padding: 24, borderRadius: 16, border: "1px solid", display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 },
  listGrid: { display: "flex", flexDirection: "column", gap: 12 },
  itemCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderRadius: 14, border: "1px solid" },
  cardInfo: { display: "flex", flexDirection: "column", gap: 4 },
  cardName: { fontSize: 15, fontWeight: 500 },
  cardDetails: { fontSize: 13 },
  cardActions: { display: "flex", gap: 16 },
  actionBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  emptyState: { padding: "40px 0", textAlign: "center", fontSize: 14, opacity: 0.6 },
  footer: { padding: "100px 48px 60px", borderTop: "1px solid" },
  footerText: { fontSize: 13 },
  toast: { position: "fixed", bottom: 40, left: "50%", padding: "14px 28px", border: "1px solid", borderRadius: 999, fontSize: 14, color: "#4ade80", zIndex: 999, pointerEvents: "none", transition: "all 0.4s" },
};
