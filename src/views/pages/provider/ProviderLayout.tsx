// src/pages/provider/ProviderLayout.tsx
// Wrap all provider pages with this layout
// Usage in AppRouter: <Route element={<ProviderLayout />}> ... </Route>

import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/controllers/context/ThemeContext";
import { useAuth } from "@/controllers/context/AuthContext";
import axiosInstance from "@/controllers/api/axiosInstance";

const NAV = [
  {
    section: "Overview",
    items: [
      { to: "/provider/dashboard",          icon: "▣", label: "Dashboard"          },
      { to: "/provider/incoming-requests",  icon: "◎", label: "Incoming Requests", badge: 3 },
      { to: "/provider/my-jobs",            icon: "◆", label: "My Jobs"            },
      { to: "/provider/schedule",           icon: "▦", label: "Schedule"           },
    ],
  },
  {
    section: "Business",
    items: [
      { to: "/provider/my-services", icon: "✦", label: "My Services" },
      { to: "/provider/earnings",    icon: "◈", label: "Earnings"    },
      { to: "/provider/reviews",     icon: "◉", label: "Reviews"     },
    ],
  },
  {
    section: "Account",
    items: [
      { to: "/provider/profile",       icon: "◎", label: "Profile"        },
      { to: "/provider/documents",     icon: "◻", label: "My Documents"   },
      { to: "/provider/notifications", icon: "◌", label: "Notifications"  },
    ],
  },
];

export default function ProviderLayout() {
  const { palette: p, mode, toggle } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const response = await axiosInstance.get("/notifications");
        if (response.data.success) {
          setHasUnread(response.data.unreadCount > 0);
        }
      } catch (error) {
        console.error("Failed to fetch unread notifications:", error);
      }
    };
    if (user) fetchUnread();
    
    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const sbStyle: React.CSSProperties = {
    width: 220, background: mode === "dark" ? "#111" : "#EDF4F4",
    borderRight: `1px solid ${p.border}`, display: "flex",
    flexDirection: "column", position: "fixed", top: 0, left: 0,
    height: "100vh", zIndex: 50, transition: "background .3s",
  };

  const location = useLocation();
  const currentNavItem = NAV.flatMap(g => g.items).find(i => i.to === location.pathname);
  const pageTitle = currentNavItem ? currentNavItem.label : "Provider Portal";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: p.bg, color: p.text, fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>

      {/* SIDEBAR */}
      <aside style={sbStyle}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 20px 18px", borderBottom: `1px solid ${p.border}` }}>
          <span style={{ fontSize: 19, color: p.primary }}>◈</span>
          <span style={{ fontSize: 16, fontWeight: 500 }}>Servify</span>
          <span style={{ fontSize: 10, background: "rgba(47,176,188,.15)", color: p.primary, border: "1px solid rgba(47,176,188,.25)", borderRadius: 4, padding: "2px 6px", marginLeft: 4 }}>Provider</span>
        </div>

        {/* Nav groups */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {NAV.map((group) => (
            <div key={group.section}>
              <div style={{ padding: "14px 20px 6px", fontSize: 10, color: p.textMuted, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                {group.section}
              </div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 7, margin: "1px 8px",
                    cursor: "pointer", fontSize: 13.5,
                    color: isActive ? p.primary : p.textMuted,
                    background: isActive ? "rgba(47,176,188,.12)" : "transparent",
                    fontWeight: isActive ? 500 : 400,
                    textDecoration: "none", transition: "background .15s, color .15s",
                  })}
                >
                  <span style={{ fontSize: 15, width: 18, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.label === "Notifications" && hasUnread ? (
                    <span style={{ background: p.primary, color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999 }}>
                      New
                    </span>
                  ) : item.badge ? (
                    <span style={{ background: p.primary, color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999 }}>
                      {item.badge}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom user row */}
        <div style={{ padding: "12px 8px", borderTop: `1px solid ${p.border}` }}>
          <div
            onClick={toggle}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 8, cursor: "pointer", transition: "background .15s" }}
          >
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(47,176,188,.15)", border: "1px solid rgba(47,176,188,.3)", color: p.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, flexShrink: 0 }}>
              {user?.name?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: p.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: p.textMuted }}>Service Provider</div>
            </div>
            <span style={{ fontSize: 13, color: p.textMuted }}>{mode === "dark" ? "☽" : "☀"}</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Topbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", height: 60, borderBottom: `1px solid ${p.border}`, background: p.navBg, backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 40 }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, fontWeight: 400 }}>
            {pageTitle}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => navigate("/provider/notifications")} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${p.border}`, background: p.cardBg, cursor: "pointer", fontSize: 14, color: p.textMuted, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              ◌
              {hasUnread && <span style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: p.primary, border: `1.5px solid ${p.bg}` }} />}
            </button>
            <button onClick={toggle} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${p.border}`, background: p.cardBg, cursor: "pointer", fontSize: 14, color: p.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {mode === "dark" ? "☽" : "☀"}
            </button>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: "28px 32px", flex: 1 }}>
          <Outlet />
        </div>
      </div>

      <style>{`
        @import url('https:/fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}












