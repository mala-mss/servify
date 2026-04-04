// src/pages/client/Notification.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTES, styles } from "./Notification.styles";
import { BOOKINGS, INITIAL_NOTIFICATIONS } from "../../utils/mockData";

// Mock hooks
const useAuth = () => ({ user: { name: "malak" } });

const getTypeStyles = (type) => {
  switch (type) {
    case "success": return { color: "#6BC8B2", icon: "✓" };
    case "info": return { color: "#2FB0BC", icon: "◈" };
    case "reminder": return { color: "#facc15", icon: "◎" };
    case "payment": return { color: "#F59E0B", icon: "DA" };
    default: return { color: "#e8e6e0", icon: "●" };
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

const GlowBackground = ({ p }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handle = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle, { passive: true });
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  return (
    <div 
      style={{ 
        ...styles.glow, 
        left: mousePos.x - 300, 
        top: mousePos.y - 300, 
        background: `radial-gradient(circle, ${p.glow} 0%, transparent 70%)` 
      }} 
    />
  );
};

export default function Notification() {
  const { user } = useAuth();
  const [theme, setTheme] = useState("dark");
  const [showNotif, setShowNotif] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  const [bookings, setBookings] = useState(BOOKINGS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const notifRef = useRef(null);

  const p = PALETTES[theme];

  // Synchronize notifications with bookings state
  useEffect(() => {
    const paymentNotifs = [];
    bookings.forEach(bk => {
      if (!bk.paidFirst) {
        paymentNotifs.push({
          id: `pay1-${bk.id}`,
          title: "Deposit Due",
          desc: `Initial 50% ($${bk.price/2}) for ${bk.service} is pending.`,
          time: "Action required",
          unread: true,
          type: "payment",
          bookingId: bk.id,
          serviceName: bk.service
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
          bookingId: bk.id,
          serviceName: bk.service
        });
      }
    });

    setNotifications(prev => {
      const filtered = prev.filter(n => n.type !== "payment");
      return [...paymentNotifs, ...filtered];
    });
  }, [bookings]);

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

  const handleNotificationClick = (n) => {
    if (n.type === "payment") {
      const bk = bookings.find(b => b.id === n.bookingId);
      if (bk) {
        setSelectedBooking({ ...bk, serviceName: bk.service });
        setShowRuleModal(true);
      }
    }
  };

  const handleRuleAccept = () => {
    setShowRuleModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    const isFirst = !selectedBooking.paidFirst;
    const amount = selectedBooking.price / 2;
    
    const update = bookings.map(b => {
      if (b.id === selectedBooking.id) {
        return isFirst 
          ? { ...b, paidFirst: true, status: "upcoming" } 
          : { ...b, paidSecond: true };
      }
      return b;
    });

    setBookings(update);
    
    // Add success notification
    const newNotif = {
      id: Date.now(),
      title: "Payment Successful",
      desc: `Paid $${amount} for ${selectedBooking.service}.`,
      time: "Just now",
      unread: true,
      type: "success"
    };
    setNotifications(prev => [newNotif, ...prev]);

    setShowPaymentModal(false);
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

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={{ ...styles.bgGrid, backgroundImage: theme === 'dark' ? `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)` : `radial-gradient(circle at 2px 2px, ${p.grid} 1px, transparent 0)` }} />
      <GlowBackground p={p} />

      {/* <nav style={{ ...styles.nav, background: p.navBg, borderBottomColor: p.border }}>
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
              style={{ ...styles.navLinkBtn, color: p.primary }}
            >
              Notifications
              {notifications.some(n => n.unread) && <span style={{ ...styles.navNotifDot, background: p.primary }} />}
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
                    {notifications.length === 0 && (
                      <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: p.textMuted }}>No new notifications</div>
                    )}
                    {notifications.map(n => (
                      <div key={n.id} style={{ ...styles.notifDropItem, borderBottomColor: p.border }}>
                        <div style={styles.notifDropTitleRow}>
                          <span style={{ 
                            fontSize: 13, 
                            fontWeight: 600, 
                            color: n.type === 'payment' ? '#F59E0B' : (n.type === 'success' ? '#6BC8B2' : p.text) 
                          }}>
                            {n.title}
                          </span>
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
          <button onClick={toggleTheme} style={{ ...styles.themeBtn, color: p.text, background: p.cardBg, borderColor: p.border }}>{theme === "dark" ? "☼" : "☾"}</button>
          <a href="/client/profile" style={{ ...styles.avatarBtn, background: theme === 'dark' ? "rgba(47,176,188,0.15)" : "#D6FFF9", borderColor: p.accent, color: p.primary }}>{user?.name?.[0]?.toUpperCase()}</a>
        </div>
      </nav> */}

      <div style={styles.container}>
        <motion.section initial="hidden" animate="visible" variants={sectionVariants}>
          <motion.div style={styles.header} variants={itemVariants}>
            <div style={{ ...styles.label, color: p.textMuted }}>Stay Updated</div>
            <h1 style={{ ...styles.title, color: p.text }}>Notifications</h1>
          </motion.div>

          <motion.div style={styles.notifList} variants={itemVariants}>
            {notifications.map(n => {
              const s = getTypeStyles(n.type);
              return (
                <motion.div 
                  key={n.id} 
                  whileHover={{ x: 5, background: theme === 'dark' ? "rgba(255,255,255,0.04)" : "rgba(47,176,188,0.02)" }}
                  onClick={() => handleNotificationClick(n)}
                  style={{ ...styles.notifRow, background: p.cardBg, borderColor: p.border, cursor: n.type === 'payment' ? 'pointer' : 'default' }}
                >
                  <div style={{ ...styles.notifIcon, color: s.color, borderColor: `${s.color}33` }}>{s.icon}</div>
                  <div style={styles.notifContent}>
                    <div style={styles.notifHeader}>
                      <span style={{ ...styles.notifTitle, color: p.text }}>{n.title}</span>
                      <span style={{ ...styles.notifTime, color: p.textMuted }}>{n.time}</span>
                    </div>
                    <div style={{ ...styles.notifDesc, color: p.textMuted }}>{n.desc}</div>

                    {n.type === 'payment' && (
                      <div style={styles.notifActions}>
                        <button style={{ ...styles.actionBtn, background: p.primary, color: '#fff' }} onClick={(e) => { 
                          e.stopPropagation(); 
                          const bk = bookings.find(b => b.id === n.bookingId);
                          if (bk) {
                            setSelectedBooking({ ...bk, serviceName: bk.service });
                            setShowRuleModal(true);
                          }
                        }}>Pay Now</button>
                      </div>
                    )}
                  </div>
                  {n.unread && <div style={{ ...styles.unreadDot, background: p.primary }} />}
                </motion.div>
              );
            })}
          </motion.div>

          {notifications.length === 0 && (
            <motion.div style={{ ...styles.empty, color: p.textMuted }}>
              All caught up! No new notifications.
            </motion.div>
          )}
        </motion.section>
      </div>

      <AnimatePresence>
        {showRuleModal && (
          <Modal 
            title="Platform Protection Rule" 
            onClose={() => setShowRuleModal(false)}
            footer={
              <button style={{ ...styles.modalBtn, background: p.primary, color: '#fff', width: '100%' }} onClick={handleRuleAccept}>I Understand & Proceed</button>
            }
          >
            <div style={{ color: p.text, fontSize: 14, lineHeight: 1.6 }}>
              <p style={{ marginBottom: 12 }}>To ensure your safety, <strong>Servify</strong> holds your payment in escrow.</p>
              <div style={{ ...styles.ruleCard, background: theme === 'dark' ? 'rgba(47,176,188,0.1)' : 'rgba(47,176,188,0.05)' }}>
                <span style={{ color: p.primary, fontSize: 18, marginRight: 10 }}>🛡️</span>
                <span>If the service provider doesn't show up at the planned time, <strong>the platform will refund your deposit</strong>.</span>
              </div>
            </div>
          </Modal>
        )}

        {showPaymentModal && (
          <Modal 
            title="Secure Checkout" 
            onClose={() => setShowPaymentModal(false)}
            footer={
              <button style={{ ...styles.modalBtn, background: p.primary, color: '#fff', width: '100%' }} onClick={handlePaymentComplete}>Complete Payment</button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: 12, borderRadius: 12, background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${p.border}` }}>
                <div style={{ fontSize: 12, color: p.textMuted }}>Paying for:</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: p.text }}>{selectedBooking?.serviceName}</div>
              </div>
              <div>
                <label style={{ ...styles.inputLabel, color: p.textMuted }}>Card Number</label>
                <input placeholder="0000 0000 0000 0000" style={{ ...styles.input, background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff', color: p.text, borderColor: p.border }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...styles.inputLabel, color: p.textMuted }}>Expiry Date</label>
                  <input placeholder="MM/YY" style={{ ...styles.input, background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff', color: p.text, borderColor: p.border }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...styles.inputLabel, color: p.textMuted }}>CVV</label>
                  <input placeholder="000" style={{ ...styles.input, background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff', color: p.text, borderColor: p.border }} />
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
      `}</style>
    </div>
  );
}

