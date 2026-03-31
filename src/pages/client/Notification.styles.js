// src/pages/client/Notification.styles.js

export const PALETTES = {
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

export const styles = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", position: "relative" },
  bgGrid: { position: "absolute", inset: 0, backgroundSize: "40px 40px", zIndex: 0, pointerEvents: "none" },
  glow: { position: "fixed", width: 600, height: 600, borderRadius: "50%", pointerEvents: "none", zIndex: 0 },
  nav: { position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 64, borderBottom: "1px solid", backdropFilter: "blur(12px)" },
  navLogo: { display: "flex", alignItems: "center", gap: 10 },
  logoMark: { fontSize: 20 },
  logoText: { fontSize: 17, fontWeight: 500 },
  navLinks: { display: "flex", gap: 32, alignItems: "center" },
  navLink: { fontSize: 14, fontWeight: 500 },
  navLinkBtn: { background: "none", border: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, position: "relative" },
  navNotifDot: { width: 6, height: 6, borderRadius: "50%", position: "absolute", top: -2, right: -8 },
  navRight: { display: "flex", alignItems: "center", gap: 16 },
  themeBtn: { width: 34, height: 34, borderRadius: "50%", border: "1px solid", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  avatarBtn: { width: 34, height: 34, borderRadius: "50%", border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500 },

  notifDropdown: { position: "absolute", top: "calc(100% + 12px)", right: -100, width: 320, borderRadius: 16, border: "1px solid", padding: "16px 0", zIndex: 1000, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" },
  notifDropHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 8 },
  notifDropList: { maxHeight: 300, overflowY: "auto" },
  notifDropItem: { padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s", cursor: "pointer" },
  notifDropTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },

  container: { maxWidth: 800, margin: "0 auto", padding: "80px 48px 120px", position: "relative", zIndex: 1 },
  header: { marginBottom: 44 },
  label: { fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },
  title: { fontFamily: "'Instrument Serif', serif", fontSize: 48, fontWeight: 400 },
  notifList: { display: "flex", flexDirection: "column", gap: 8 },
  notifRow: { display: "flex", alignItems: "flex-start", gap: 20, padding: "20px 24px", border: "1px solid", borderRadius: 16, transition: "all 0.3s", position: "relative" },
  notifIcon: { width: 40, height: 40, borderRadius: "50%", border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  notifContent: { flex: 1 },
  notifHeader: { display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "baseline" },
  notifTitle: { fontSize: 16, fontWeight: 500 },
  notifTime: { fontSize: 12 },
  notifDesc: { fontSize: 14, lineHeight: 1.5 },
  unreadDot: { width: 8, height: 8, borderRadius: "50%", position: "absolute", right: 12, top: 12 },
  empty: { textAlign: "center", padding: "80px 0", fontSize: 16 },

  // New styles for payment flow
  notifActions: { display: "flex", gap: 12, marginTop: 16 },
  actionBtn: { padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, border: "1px solid", cursor: "pointer", transition: "opacity 0.2s" },
  
  modalOverlay: { position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" },
  modalContent: { width: "100%", maxWidth: 440, borderRadius: 24, border: "1px solid", padding: 32, backdropFilter: "blur(20px)", boxShadow: "0 40px 80px rgba(0,0,0,0.4)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 500, fontFamily: "'Instrument Serif', serif" },
  modalClose: { background: "none", border: "none", fontSize: 18, cursor: "pointer" },
  modalBody: { marginBottom: 32 },
  modalFooter: { display: "flex", gap: 12 },
  modalBtn: { padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", transition: "transform 0.1s" },
  
  ruleCard: { display: "flex", alignItems: "center", padding: 16, borderRadius: 12, marginTop: 12, fontSize: 13, lineHeight: 1.4 },
  input: { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid", fontSize: 14, outline: "none" },
  inputLabel: { display: "block", fontSize: 12, marginBottom: 6 }
};
