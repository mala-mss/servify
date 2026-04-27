// src/pages/client/MyBooking.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { useTheme } from "@/controllers/context/ThemeContext";
import { BOOKINGS, INITIAL_NOTIFICATIONS } from "@/controllers/utils/mockData";

import { useAuth } from "@/controllers/context/AuthContext";

type Notification = {
  id: string | number;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  type: string;
  bookingId?: number;
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "upcoming": return { color: "#6BC8B2", bg: "rgba(107,200,178,0.1)" };
    case "completed": return { color: "#2FB0BC", bg: "rgba(47,176,188,0.1)" };
    case "pending": return { color: "#F59E0B", bg: "rgba(245,158,11,0.1)" };
    case "cancelled": return { color: "#f87171", bg: "rgba(248,113,113,0.1)" };
    default: return { color: "#e8e6e0", bg: "rgba(255,255,255,0.1)" };
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9], staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const MouseGlow = ({ p }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handle = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle, { passive: true });
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  return (
    <div style={{ 
      ...styles.glow, 
      left: mousePos.x - 300, 
      top: mousePos.y - 300, 
      background: `radial-gradient(circle, ${p.glow} 0%, transparent 70%)` 
    }} />
  );
};

export default function MyBooking() {
  const { user } = useAuth();
  const { mode: theme, palette: p } = useTheme();
  const { toggle } = useOutletContext();
  const [showNotif, setShowNotif] = useState(false);
  const [bookings, setBookings] = useState(BOOKINGS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Modal states for Edit flow
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editData, setEditData] = useState({ date: "2026-03-26", time: "10:00" });

  const notifRef = useRef(null);

  // Update dynamic notifications based on booking status
  useEffect(() => {
    const paymentNotifs: Array<{id: string; title: string; desc: string; time: string; unread: boolean; type: string; bookingId: number}> = [];
    bookings.forEach(bk => {
      if (!bk.paidFirst) {
        paymentNotifs.push({
          id: `pay1-${bk.id}`,
          title: "Deposit Due",
          desc: `Initial 50% ($${bk.price/2}) for ${bk.service} is pending.`,
          time: "Action required",
          unread: true,
          type: "payment",
          bookingId: Number(bk.id)
        });
      }
      if (bk.status === "completed" && !bk.paidSecond) {
        paymentNotifs.push({
          id: `pay2-${bk.id}`,
          title: "Balance Due",
          desc: `Final 50% ($${bk.price/2}) for ${bk.service} is ready to pay.`,
          time: "Service completed",
          unread: true,
          type: "payment",
          bookingId: Number(bk.id)
        });
      }
    });

    setNotifications(prev => {
      const filtered = prev.filter(n => n.type !== "payment");
      return [...paymentNotifs, ...filtered];
    });
  }, [bookings]);

  const handleEdit = (bk) => {
    if (bk.status === "completed") return;
    setSelectedBooking(bk);
    setEditData({ date: bk.date, time: bk.time });
    setShowEditModal(true);
  };

  const handleDelete = (bk) => {
    if (bk.status === "completed") return;
    if (window.confirm(`Are you sure you want to cancel your ${bk.service} booking?`)) {
      setBookings(bookings.filter(item => item.id !== bk.id));
    }
  };

  const handlePayment = (bk) => {
    // Redirect or open notification side payment - for now we just show an alert
    // since the user wants payment in the notification side.
    setShowNotif(true);
  };

  const handleEditSubmit = () => {
    setShowEditModal(false);
    setShowConfirmModal(true);
  };

  const confirmReschedule = () => {
    alert(`Reschedule request for ${selectedBooking.service} sent to ${selectedBooking.provider}!`);
    setShowConfirmModal(false);
    setSelectedBooking(null);
  };

  const Modal = ({ title, children, onClose, footer }) => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ ...styles.modalOverlay, background: theme === "dark" ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.4)" }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        style={{ ...styles.modalContent, background: p.cardBg, borderColor: p.border }}
      >
        <div style={styles.modalHeader}>
          <h3 style={{ ...styles.modalTitle, color: p.text }}>{title}</h3>
          <button onClick={onClose} style={{ ...styles.modalClose, color: p.textMuted }}>✕</button>
        </div>
        <div style={styles.modalBody}>{children}</div>
        {footer && <div style={styles.modalFooter}>{footer}</div>}
      </motion.div>
    </motion.div>
  );

  const filteredBookings = bookings.filter(bk => 
    activeFilter === "all" ? true : bk.status === activeFilter
  );

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

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={{ ...styles.bgGrid, backgroundImage: theme === 'dark' ? `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)` : `radial-gradient(circle at 2px 2px, ${p.grid} 1px, transparent 0)` }} />
      <MouseGlow p={p} />


      <div style={styles.container}>
        <motion.section initial="hidden" animate="visible" variants={sectionVariants}>
          <motion.div style={styles.header} variants={itemVariants}>
            <div style={{ ...styles.label, color: p.textMuted }}>Your Schedule</div>
            <h1 style={{ ...styles.title, color: p.text }}>My bookings</h1>
          </motion.div>

          <motion.div style={styles.filterBar} variants={itemVariants}>
            {["all", "upcoming", "pending", "completed"].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  ...styles.filterBtn,
                  color: activeFilter === f ? p.primary : p.textMuted,
                  background: activeFilter === f ? (theme === 'dark' ? "rgba(47,176,188,0.1)" : "#D6FFF9") : "transparent",
                  borderColor: activeFilter === f ? p.primary : "transparent"
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </motion.div>

          <motion.div style={styles.bookingList} variants={itemVariants}>
            {filteredBookings.map(bk => {
              const s = getStatusStyle(bk.status);
              const isLocked = bk.status === "completed";
              
              return (
                <motion.div 
                  key={bk.id} 
                  whileHover={{ borderColor: p.primary, x: 5 }}
                  style={{ ...styles.bookingRow, background: p.cardBg, borderColor: p.border }}
                >
                  <div style={styles.rowLeft}>
                    <div style={{ ...styles.ref, color: p.textMuted }}>{bk.id}</div>
                    <div>
                      <div style={{ ...styles.serviceName, color: p.text }}>{bk.service}</div>
                      <div style={{ ...styles.providerName, color: p.textMuted }}>with {bk.provider}</div>
                    </div>
                  </div>
                  
                  <div style={styles.rowMid}>
                    <div style={{ ...styles.dateTime, color: p.text }}>{bk.date}</div>
                    <div style={{ ...styles.dateTime, color: p.textMuted }}>{bk.time}</div>
                  </div>

                  <div style={styles.rowRight}>
                    <div style={{ textAlign: 'right', marginRight: 24 }}>
                      <div style={{ ...styles.price, color: p.text }}>${bk.price}</div>
                    </div>

                    <div style={{ ...styles.statusBadge, color: s.color, background: s.bg }}>{bk.status}</div>
                    
                    <div style={styles.actions}>
                      {!isLocked && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            onClick={() => handleEdit(bk)}
                            style={{ ...styles.actionBtn, borderColor: p.border, color: p.text }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(bk)}
                            style={{ ...styles.actionBtn, borderColor: "rgba(248,113,113,0.2)", color: "#f87171" }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {filteredBookings.length === 0 && (
            <motion.div style={{ ...styles.empty, color: p.textMuted }}>
              No {activeFilter === "all" ? "" : activeFilter} bookings found.
            </motion.div>
          )}
        </motion.section>
      </div>

      <AnimatePresence>
        {showEditModal && (
          <Modal 
            title="Edit Booking" 
            onClose={() => setShowEditModal(false)}
            footer={
              <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                <button style={{ ...styles.modalBtn, flex: 1, background: 'transparent', border: `1px solid ${p.border}`, color: p.text }} onClick={() => setShowEditModal(false)}>Cancel</button>
                <button style={{ ...styles.modalBtn, flex: 1, background: p.primary, color: '#fff' }} onClick={handleEditSubmit}>Submit Changes</button>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ ...styles.inputLabel, color: p.textMuted }}>New Date</label>
                <input type="date" value={editData.date} onChange={(e) => setEditData({...editData, date: e.target.value})} style={{ ...styles.input, background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff', color: p.text, borderColor: p.border }} />
              </div>
              <div>
                <label style={{ ...styles.inputLabel, color: p.textMuted }}>New Time</label>
                <input type="time" value={editData.time} onChange={(e) => setEditData({...editData, time: e.target.value})} style={{ ...styles.input, background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff', color: p.text, borderColor: p.border }} />
              </div>
            </div>
          </Modal>
        )}

        {showConfirmModal && (
          <Modal 
            title="Confirm Changes" 
            onClose={() => setShowConfirmModal(false)}
            footer={
              <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                <button style={{ ...styles.modalBtn, flex: 1, background: 'transparent', border: `1px solid ${p.border}`, color: p.text }} onClick={() => setShowConfirmModal(false)}>Back</button>
                <button style={{ ...styles.modalBtn, flex: 1, background: p.primary, color: '#fff' }} onClick={confirmReschedule}>Send to Provider</button>
              </div>
            }
          >
            <div style={{ color: p.text, fontSize: 14 }}>
              <p>Are you sure you want to request a reschedule for <strong>{selectedBooking?.service}</strong>?</p>
              <div style={{ marginTop: 16, padding: 12, borderRadius: 8, border: `1px dashed ${p.border}` }}>
                <div style={{ fontSize: 12, color: p.textMuted }}>New Schedule:</div>
                <div style={{ fontWeight: 500, marginTop: 4 }}>{editData.date} at {editData.time}</div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https:/fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        button:hover { opacity: 0.8; }
      `}</style>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", position: "relative" },
  bgGrid: { position: "absolute", inset: 0, backgroundSize: "40px 40px", zIndex: 0, pointerEvents: "none" },
  glow: { position: "fixed", width: 600, height: 600, borderRadius: "50%", pointerEvents: "none", zIndex: 0 },
  nav: { position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 64, borderBottom: "1px solid", backdropFilter: "blur(12px)" },
  navLogo: { display: "flex", alignItems: "center", gap: 10 },
  logoMark: { fontSize: 20 },
  logoText: { fontSize: 17, fontWeight: 500 },
  navLinks: { display: "flex", gap: 32 },
  navLink: { fontSize: 14, fontWeight: 500 },
  navLinkBtn: { background: "none", border: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, position: "relative" },
  navNotifDot: { width: 6, height: 6, borderRadius: "50%", position: "absolute", top: -2, right: -8 },
  navRight: { display: "flex", alignItems: "center", gap: 16 },

  notifDropdown: { position: "absolute", top: "calc(100% + 12px)", right: -100, width: 320, borderRadius: 16, border: "1px solid", padding: "16px 0", zIndex: 1000, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" },
  notifDropHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 8 },
  notifDropList: { maxHeight: 300, overflowY: "auto" },
  notifDropItem: { padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s", cursor: "pointer" },
  notifDropTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  themeBtn: { width: 34, height: 34, borderRadius: "50%", border: "1px solid", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  avatarBtn: { width: 34, height: 34, borderRadius: "50%", border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500 },
  container: { maxWidth: 1000, margin: "0 auto", padding: "80px 48px 120px", position: "relative", zIndex: 1 },
  header: { marginBottom: 32 },
  label: { fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },
  title: { fontFamily: "'Instrument Serif', serif", fontSize: 48, fontWeight: 400 },
  filterBar: { display: "flex", gap: 12, marginBottom: 40 },
  filterBtn: { padding: "8px 20px", borderRadius: 99, border: "1px solid", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.3s" },
  bookingList: { display: "flex", flexDirection: "column", gap: 12 },
  bookingRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px", border: "1px solid", borderRadius: 16, transition: "all 0.3s" },
  rowLeft: { display: "flex", alignItems: "center", gap: 24, flex: 1.5 },
  ref: { fontSize: 12, fontFamily: "monospace" },
  serviceName: { fontSize: 17, fontWeight: 500, marginBottom: 4 },
  providerName: { fontSize: 13 },
  rowMid: { flex: 1 },
  dateTime: { fontSize: 14, marginBottom: 2 },
  rowRight: { display: "flex", alignItems: "center", gap: 24, flex: 2, justifyContent: "flex-end" },
  price: { fontSize: 16, fontWeight: 600 },
  statusBadge: { padding: "6px 14px", borderRadius: 999, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", minWidth: 90, textAlign: "center" },
  actions: { display: "flex", gap: 8 },
  actionBtn: { background: "none", border: "1px solid", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" },
  empty: { textAlign: "center", padding: "80px 0", fontSize: 16 },

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












