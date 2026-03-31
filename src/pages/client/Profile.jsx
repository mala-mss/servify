// src/pages/client/Profile.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Mock hooks — replace with actual ones if available
const useAuth = () => ({
  user: { name: "malak mss", email: "malakMss@email.com" },
  logout: () => console.log("logged out"),
});

const PALETTES = {
  dark: {
    primary: "#2FB0BC",
    secondary: "#6BC8B2",
    accent: "#7ED4CA",
    bg: "#0e0e0e",
    cardBg: "rgba(255,255,255,0.02)",
    text: "#e8e6e0",
    textMuted: "rgba(232,230,224,0.5)",
    border: "rgba(255,255,255,0.06)",
    navBg: "rgba(14,14,14,0.85)",
    glow: "rgba(47,176,188,0.04)",
    grid: "rgba(255,255,255,0.02)"
  },
  light: {
    primary: "#2FB0BC",
    secondary: "#6BC8B2",
    accent: "#7ED4CA",
    bg: "#F8FBFB",
    cardBg: "#FFFFFF",
    text: "#2C3E50",
    textMuted: "rgba(44,62,80,0.5)",
    border: "#E0E7E7",
    navBg: "rgba(248,251,251,0.85)",
    glow: "rgba(47,176,188,0.06)",
    grid: "#E0E7E7"
  }
};

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

const NOTIFICATIONS = [
  { id: 1, title: "Booking Confirmed", desc: "Your cleaning with Maria is set.", time: "2h ago", unread: true },
  { id: 2, title: "New Message", desc: "Alex: I'll be there at 10.", time: "5h ago", unread: true },
  { id: 3, title: "Reminder", desc: "Tutoring tomorrow at 4 PM.", time: "1d ago", unread: false },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState("dark");
  const [tab, setTab] = useState("info");
  const [name, setName] = useState(user?.name ?? "");
  const [address, setAddr] = useState("123 Main Street, Sétif, Algeria");
  const [phone, setPhone] = useState("+213 555 123 456");
  const [toast, setToast] = useState(false);
  const [currentPw, setCPw] = useState("");
  const [newPw, setNPw] = useState("");
  const [confirmPw, setRPw] = useState("");
  const [show, setShow] = useState({ c: false, n: false, r: false });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  // States for Dependants & Authorized People
  const [dependants, setDependants] = useState([
    { id: 1, name: "Lina", relation: "Daughter", age: 8 },
    { id: 2, name: "Adam", relation: "Son", age: 12 }
  ]);
  const [authorized, setAuthorized] = useState([
    { id: 1, name: "Sarah", phone: "+213 555 000 111" }
  ]);
  
  // Form visibility
  const [showAddDep, setShowAddDep] = useState(false);
  const [showAddAuth, setShowAddAuth] = useState(false);

  // Form inputs
  const [depForm, setDepForm] = useState({ name: "", age: "", relation: "" });
  const [authForm, setAuthForm] = useState({ name: "", phone: "" });

  const p = PALETTES[theme];
  const strength = getStrength(newPw);

  useEffect(() => {
    const handle = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleSave = () => {
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  // Logic Handlers
  const handleAddDep = () => {
    if (!depForm.name || !depForm.age || !depForm.relation) return;
    setDependants([...dependants, { id: Date.now(), ...depForm }]);
    setDepForm({ name: "", age: "", relation: "" });
    setShowAddDep(false);
  };

  const handleAddAuth = () => {
    if (!authForm.name || !authForm.phone) return;
    setAuthorized([...authorized, { id: Date.now(), ...authForm }]);
    setAuthForm({ name: "", phone: "" });
    setShowAddAuth(false);
  };

  const handleDeleteDep = (id) => setDependants(dependants.filter(d => d.id !== id));
  const handleDeleteAuth = (id) => setAuthorized(authorized.filter(a => a.id !== id));

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
      {/* Background Texture */}
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

      {/* ── NAV ── */}
      <nav style={{ ...styles.nav, background: p.navBg, borderBottomColor: p.border }}>
        <a href="/client/home" style={{ ...styles.navLogo, textDecoration: 'none' }}>
          <span style={{ ...styles.logoMark, color: p.primary }}>◈</span>
          <span style={{ ...styles.logoText, color: p.text }}>Servify</span>
        </a>
        <div style={styles.navLinks}>
          <a href="/client/browse" style={{ ...styles.navLink, color: p.textMuted }}>Browse</a>
          <a href="/client/my-bookings" style={{ ...styles.navLink, color: p.textMuted }}>My bookings</a>
          
          <div style={{ position: "relative" }} ref={notifRef}>
            <button 
              onClick={() => setShowNotif(!showNotif)} 
              style={{ ...styles.navLinkBtn, color: p.textMuted }}
            >
              Notifications
              {NOTIFICATIONS.some(n => n.unread) && <span style={{ ...styles.navNotifDot, background: p.primary }} />}
            </button>
            
            <AnimatePresence>
              {showNotif && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{ ...styles.notifDropdown, background: p.cardBg, borderColor: p.border, backdropFilter: "blur(20px)" }}
                >
                  <div style={styles.notifDropHeader}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Notifications</span>
                    <a href="/client/notifications" style={{ fontSize: 11, color: p.primary }}>View all</a>
                  </div>
                  <div style={styles.notifDropList}>
                    {NOTIFICATIONS.map(n => (
                      <div key={n.id} style={{ ...styles.notifDropItem, borderBottomColor: p.border }}>
                        <div style={styles.notifDropTitleRow}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{n.title}</span>
                          <span style={{ fontSize: 10, opacity: 0.5 }}>{n.time}</span>
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>{n.desc}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div style={styles.navRight}>
          <button onClick={toggleTheme} style={{ ...styles.themeBtn, color: p.text, background: p.cardBg, borderColor: p.border }}>
            {theme === "dark" ? "☼" : "☾"}
          </button>
          <div style={{ ...styles.avatarBtn, background: theme === 'dark' ? "rgba(47,176,188,0.15)" : "#D6FFF9", borderColor: p.accent, color: p.primary }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div style={styles.container}>
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          {/* Header */}
          <motion.div style={styles.header} variants={itemVariants}>
            <div style={{ ...styles.label, color: p.textMuted }}>Account Settings</div>
            <h1 style={{ ...styles.title, color: p.text }}>Your profile</h1>
          </motion.div>

          {/* Profile Card */}
          <motion.div style={{ ...styles.profileCard, background: p.cardBg, borderColor: p.border }} variants={itemVariants}>
            <div style={{ ...styles.avatarLarge, background: "rgba(47,176,188,0.1)", border: `1.5px solid ${p.primary}33`, color: p.primary }}>
              {user?.name?.[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...styles.profileName, color: p.text }}>{user?.name}</div>
              <div style={{ ...styles.profileEmail, color: p.textMuted }}>{user?.email} · Client account</div>
            </div>
            <div style={{ ...styles.activeBadge, background: "rgba(74,222,128,0.06)", borderColor: "rgba(74,222,128,0.2)", color: "#4ade80" }}>
              <span style={styles.activeDot} /> Active
            </div>
          </motion.div>

          {/* Tabs */}
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

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              style={styles.content}
            >
              {tab === "info" && (
                <div style={styles.form}>
                  <div style={styles.gridRow}>
                    <div style={styles.inputGroup}>
                      <div style={{ ...styles.fieldLabel, color: p.textMuted }}>Full name</div>
                      <input 
                        style={inputStyle} 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        onFocus={(e) => e.target.style.borderColor = p.primary}
                        onBlur={(e) => e.target.style.borderColor = p.border}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <div style={{ ...styles.fieldLabel, color: p.textMuted }}>Email address</div>
                      <div style={styles.relative}>
                        <input 
                          style={{ ...inputStyle, color: p.textMuted, cursor: "not-allowed" }} 
                          value={user?.email} 
                          readOnly 
                        />
                        <span style={{ ...styles.readOnlyTag, color: p.textMuted }}>READ ONLY</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <div style={{ ...styles.fieldLabel, color: p.textMuted }}>Address</div>
                    <textarea 
                      style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }} 
                      rows={2} 
                      value={address} 
                      onChange={(e) => setAddr(e.target.value)} 
                      onFocus={(e) => e.target.style.borderColor = p.primary}
                      onBlur={(e) => e.target.style.borderColor = p.border}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <div style={{ ...styles.fieldLabel, color: p.textMuted }}>Phone number</div>
                    <input 
                      style={inputStyle} 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      onFocus={(e) => e.target.style.borderColor = p.primary}
                      onBlur={(e) => e.target.style.borderColor = p.border}
                    />
                  </div>

                  <div style={styles.formFooter}>
                    <button onClick={logout} style={{ ...styles.secondaryBtn, borderColor: p.border, color: p.textMuted }}>Sign out</button>
                    <button onClick={handleSave} style={{ ...styles.primaryBtn, background: p.primary }}>Save changes</button>
                  </div>
                </div>
              )}

              {tab === "security" && (
                <div style={styles.form}>
                  <div style={{ ...styles.infoBox, background: p.cardBg, borderColor: p.border, color: p.textMuted }}>
                    Last password change: <span style={{ color: p.text }}>March 10, 2026</span>
                  </div>

                  <div style={styles.inputGroup}>
                    <div style={{ ...styles.fieldLabel, color: p.textMuted }}>Current password</div>
                    <div style={styles.relative}>
                      <input 
                        type={show.c ? "text" : "password"} 
                        value={currentPw} 
                        onChange={(e) => setCPw(e.target.value)} 
                        placeholder="Enter current password" 
                        style={{ ...inputStyle, paddingRight: 44 }}
                        onFocus={(e) => e.target.style.borderColor = p.primary}
                        onBlur={(e) => e.target.style.borderColor = p.border}
                      />
                      <button type="button" onClick={() => setShow(s => ({ ...s, c: !s.c }))} style={{ ...styles.eyeBtn, color: show.c ? p.primary : p.textMuted }}>
                        {show.c ? "●" : "◎"}
                      </button>
                    </div>
                  </div>

                  <div style={styles.gridRow}>
                    <div style={styles.inputGroup}>
                      <div style={{ ...styles.fieldLabel, color: p.textMuted }}>New password</div>
                      <div style={styles.relative}>
                        <input 
                          type={show.n ? "text" : "password"} 
                          value={newPw} 
                          onChange={(e) => setNPw(e.target.value)} 
                          placeholder="Min 8 characters" 
                          style={{ ...inputStyle, paddingRight: 44 }}
                          onFocus={(e) => e.target.style.borderColor = p.primary}
                          onBlur={(e) => e.target.style.borderColor = p.border}
                        />
                        <button type="button" onClick={() => setShow(s => ({ ...s, n: !s.n }))} style={{ ...styles.eyeBtn, color: show.n ? p.primary : p.textMuted }}>
                          {show.n ? "●" : "◎"}
                        </button>
                      </div>
                      {/* Strength Bar */}
                      <div style={{ ...styles.strengthWrap, background: p.border }}>
                        <div style={{ ...styles.strengthBar, width: strength?.w ?? "0%", background: strength?.color ?? p.primary }} />
                      </div>
                      {strength && <div style={{ ...styles.strengthText, color: strength.color }}>{strength.label}</div>}
                    </div>
                    
                    <div style={styles.inputGroup}>
                      <div style={{ ...styles.fieldLabel, color: p.textMuted }}>Confirm new password</div>
                      <div style={styles.relative}>
                        <input 
                          type={show.r ? "text" : "password"} 
                          value={confirmPw} 
                          onChange={(e) => setRPw(e.target.value)} 
                          placeholder="Repeat new password" 
                          style={{ ...inputStyle, paddingRight: 44 }}
                          onFocus={(e) => e.target.style.borderColor = p.primary}
                          onBlur={(e) => e.target.style.borderColor = p.border}
                        />
                        <button type="button" onClick={() => setShow(s => ({ ...s, r: !s.r }))} style={{ ...styles.eyeBtn, color: show.r ? p.primary : p.textMuted }}>
                          {show.r ? "●" : "◎"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={styles.rightAlign}>
                    <button onClick={() => alert("Password updated!")} style={{ ...styles.primaryBtn, background: p.primary }}>Update password</button>
                  </div>

                  <div style={{ ...styles.dangerZone, background: "rgba(248,113,113,0.03)", borderColor: "rgba(248,113,113,0.15)" }}>
                    <div style={styles.dangerTitle}>Danger zone</div>
                    <div style={{ ...styles.dangerDesc, color: p.textMuted }}>Permanently delete your account and all associated data. This cannot be undone.</div>
                    <button style={styles.deleteBtn}>Delete my account</button>
                  </div>
                </div>
              )}

              {tab === "dependants" && (
                <div style={styles.form}>
                  <div style={styles.sectionHeader}>
                    <div style={{ color: p.textMuted, fontSize: 13 }}>Manage your family members or dependants.</div>
                    <button 
                      onClick={() => setShowAddDep(!showAddDep)} 
                      style={{ ...styles.primaryBtn, background: p.primary, padding: "10px 20px", fontSize: 13 }}
                    >
                      {showAddDep ? "Cancel" : "+ Add dependant"}
                    </button>
                  </div>

                  {showAddDep && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      style={{ ...styles.formBox, background: theme === 'dark' ? "rgba(255,255,255,0.02)" : "rgba(47,176,188,0.04)", borderColor: p.border }}
                    >
                      <div style={styles.gridRow}>
                        <input 
                          style={inputStyle} 
                          placeholder="Full name" 
                          value={depForm.name} 
                          onChange={(e) => setDepForm({...depForm, name: e.target.value})}
                        />
                        <input 
                          style={inputStyle} 
                          placeholder="Age" 
                          value={depForm.age} 
                          onChange={(e) => setDepForm({...depForm, age: e.target.value})}
                        />
                      </div>
                      <input 
                        style={inputStyle} 
                        placeholder="Relation (e.g. Daughter, Mother)" 
                        value={depForm.relation} 
                        onChange={(e) => setDepForm({...depForm, relation: e.target.value})}
                      />
                      <button 
                        onClick={handleAddDep}
                        style={{ ...styles.primaryBtn, background: p.primary, alignSelf: "flex-end" }}
                      >
                        Add member
                      </button>
                    </motion.div>
                  )}

                  <div style={styles.listGrid}>
                    {dependants.length === 0 ? (
                      <div style={{ ...styles.emptyState, color: p.textMuted }}>No dependants added yet.</div>
                    ) : (
                      dependants.map(d => (
                        <div key={d.id} style={{ ...styles.itemCard, background: p.cardBg, borderColor: p.border }}>
                          <div style={styles.cardInfo}>
                            <div style={{ ...styles.cardName, color: p.text }}>{d.name}</div>
                            <div style={{ ...styles.cardDetails, color: p.textMuted }}>{d.relation} • {d.age} yrs</div>
                          </div>
                          <div style={styles.cardActions}>
                            <button style={{ ...styles.actionBtn, color: p.primary }}>Edit</button>
                            <button onClick={() => handleDeleteDep(d.id)} style={{ ...styles.actionBtn, color: "#f87171" }}>Delete</button>
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
                    <button 
                      onClick={() => setShowAddAuth(!showAddAuth)} 
                      style={{ ...styles.primaryBtn, background: p.primary, padding: "10px 20px", fontSize: 13 }}
                    >
                      {showAddAuth ? "Cancel" : "+ Add person"}
                    </button>
                  </div>

                  {showAddAuth && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      style={{ ...styles.formBox, background: theme === 'dark' ? "rgba(255,255,255,0.02)" : "rgba(47,176,188,0.04)", borderColor: p.border }}
                    >
                      <input 
                        style={inputStyle} 
                        placeholder="Full name" 
                        value={authForm.name}
                        onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                      />
                      <input 
                        style={inputStyle} 
                        placeholder="Phone number" 
                        value={authForm.phone}
                        onChange={(e) => setAuthForm({...authForm, phone: e.target.value})}
                      />
                      <button 
                        onClick={handleAddAuth}
                        style={{ ...styles.primaryBtn, background: p.primary, alignSelf: "flex-end" }}
                      >
                        Authorize person
                      </button>
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
                            <div style={{ ...styles.cardDetails, color: p.textMuted }}>{a.phone}</div>
                          </div>
                          <div style={styles.cardActions}>
                            <button style={{ ...styles.actionBtn, color: p.primary }}>Edit</button>
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

      {/* Footer */}
      <footer style={{ ...styles.footer, background: theme === 'dark' ? "#0a0a0a" : p.cardBg, borderTopColor: p.border }}>
        <div style={styles.footerGrid}>
          <div style={styles.footerBrandCol}>
             <div style={styles.footerLogo}>
                <span style={{ ...styles.logoMark, color: p.primary }}>◈</span>
                <span style={{ ...styles.footerBrandName, color: p.text }}>Servify</span>
             </div>
             <p style={{ ...styles.footerTagline, color: p.textMuted }}>The premium platform for home services.</p>
          </div>
          <div style={styles.footerLinksCol}>
            <h4 style={{ ...styles.footerColTitle, color: p.primary }}>Platform</h4>
            <a href="#" style={{ ...styles.footerLink, color: p.textMuted }}>Browse Services</a>
            <a href="#" style={{ ...styles.footerLink, color: p.textMuted }}>For Providers</a>
            <a href="#" style={{ ...styles.footerLink, color: p.textMuted }}>Cities</a>
          </div>
          <div style={styles.footerLinksCol}>
            <h4 style={{ ...styles.footerColTitle, color: p.primary }}>Company</h4>
            <a href="#" style={{ ...styles.footerLink, color: p.textMuted }}>About Us</a>
            <a href="#" style={{ ...styles.footerLink, color: p.textMuted }}>Careers</a>
            <a href="#" style={{ ...styles.footerLink, color: p.textMuted }}>Contact</a>
          </div>
        </div>
        <div style={{ ...styles.footerBottom, borderTopColor: p.border }}>
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
  
  nav: { position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 64, borderBottom: "1px solid", backdropFilter: "blur(12px)", transition: "all 0.3s ease" },
  navLogo: { display: "flex", alignItems: "center", gap: 10 },
  logoMark: { fontSize: 20 },
  logoText: { fontSize: 17, fontWeight: 500, letterSpacing: "-0.3px" },
  navLinks: { display: "flex", gap: 32, alignItems: "center" },
  navLink: { fontSize: 14, fontWeight: 500, transition: "color 0.2s" },
  navLinkBtn: { background: "none", border: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, position: "relative" },
  navNotifDot: { width: 6, height: 6, borderRadius: "50%", position: "absolute", top: -2, right: -8 },
  navRight: { display: "flex", alignItems: "center", gap: 16 },
  themeBtn: { width: 34, height: 34, borderRadius: "50%", border: "1px solid", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "all 0.3s ease" },
  avatarBtn: { width: 34, height: 34, borderRadius: "50%", border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500 },

  notifDropdown: { position: "absolute", top: "calc(100% + 12px)", right: -100, width: 320, borderRadius: 16, border: "1px solid", padding: "16px 0", zIndex: 1000, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" },
  notifDropHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 8 },
  notifDropList: { maxHeight: 300, overflowY: "auto" },
  notifDropItem: { padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s", cursor: "pointer" },
  notifDropTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },

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
  primaryBtn: { padding: "14px 32px", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 500, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  secondaryBtn: { padding: "14px 24px", background: "transparent", border: "1px solid", borderRadius: 12, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  
  infoBox: { padding: "16px 20px", border: "1px solid", borderRadius: 12, fontSize: 14 },
  eyeBtn: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14 },
  
  strengthWrap: { height: 4, borderRadius: 2, marginTop: 10, overflow: "hidden" },
  strengthBar: { height: "100%", borderRadius: 2, transition: "all 0.3s" },
  strengthText: { fontSize: 11, marginTop: 6, fontWeight: 500 },
  
  rightAlign: { display: "flex", justifyContent: "flex-end" },
  
  dangerZone: { marginTop: 40, padding: 30, border: "1px solid", borderRadius: 16 },
  dangerTitle: { fontSize: 15, fontWeight: 600, color: "#f87171", marginBottom: 8 },
  dangerDesc: { fontSize: 14, marginBottom: 20, lineHeight: 1.6 },
  deleteBtn: { padding: "10px 20px", background: "transparent", border: "1px solid rgba(248,113,113,0.03)", borderRadius: 10, fontSize: 13, color: "#f87171", cursor: "pointer", fontWeight: 500 },

  // New styles for Dependants/Authorized sections
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  formBox: { padding: 24, borderRadius: 16, border: "1px solid", display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 },
  listGrid: { display: "flex", flexDirection: "column", gap: 12 },
  itemCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderRadius: 14, border: "1px solid", transition: "transform 0.2s" },
  cardInfo: { display: "flex", flexDirection: "column", gap: 4 },
  cardName: { fontSize: 15, fontWeight: 500 },
  cardDetails: { fontSize: 13 },
  cardActions: { display: "flex", gap: 16 },
  actionBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, padding: "4px 8px" },
  emptyState: { padding: "40px 0", textAlign: "center", fontSize: 14, opacity: 0.6 },

  footer: { padding: "100px 48px 60px", borderTop: "1px solid" },
  footerGrid: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 60, maxWidth: 860, margin: "0 auto" },
  footerLogo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 20 },
  footerBrandName: { fontSize: 20, fontWeight: 600 },
  footerTagline: { fontSize: 14, lineHeight: 1.6 },
  footerColTitle: { fontSize: 14, fontWeight: 600, marginBottom: 24, textTransform: "uppercase", letterSpacing: "1px" },
  footerLink: { display: "block", fontSize: 14, marginBottom: 12, transition: "color 0.2s" },
  footerBottom: { marginTop: 80, paddingTop: 32, borderTop: "1px solid", maxWidth: 860, margin: "80px auto 0" },
  footerText: { fontSize: 13 },

  toast: { position: "fixed", bottom: 40, left: "50%", padding: "14px 28px", border: "1px solid", borderRadius: 999, fontSize: 14, color: "#4ade80", zIndex: 999, pointerEvents: "none", transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" },
};
