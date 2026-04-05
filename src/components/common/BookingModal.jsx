// src/components/common/BookingModal.jsx
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PALETTES = {
  dark: {
    primary: "#2FB0BC",
    bg: "#0e0e0e",
    cardBg: "rgba(20,20,20,0.95)",
    text: "#e8e6e0",
    textMuted: "rgba(232,230,224,0.5)",
    border: "rgba(255,255,255,0.08)"
  },
  light: {
    primary: "#2FB0BC",
    bg: "#F8FBFB",
    cardBg: "rgba(255,255,255,0.95)",
    text: "#2C3E50",
    textMuted: "rgba(44,62,80,0.5)",
    border: "#E0E7E7"
  }
};

export default function BookingModal({ isOpen, onClose, children, theme = "dark", title }) {
  const modalRef = useRef(null);
  const p = PALETTES[theme];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px"
            }}
            onClick={handleBackdropClick}
          >
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                background: p.cardBg,
                borderRadius: 28,
                border: `1px solid ${p.border}`,
                boxShadow: "0 40px 120px rgba(0,0,0,0.5)",
                width: "100%",
                maxWidth: 900,
                maxHeight: "90vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 28px",
                borderBottom: `1px solid ${p.border}`,
                background: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"
              }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: p.text }}>{title || "Booking"}</h2>
                <button
                  onClick={onClose}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 24,
                    color: p.textMuted,
                    cursor: "pointer",
                    padding: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.background = theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                  onMouseLeave={(e) => e.target.style.background = "none"}
                >
                  ✕
                </button>
              </div>
              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: 0
              }}>
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
