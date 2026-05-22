import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/controllers/context/ThemeContext";
import { useAuth } from "@/controllers/context/AuthContext";
import axiosInstance from "@/controllers/api/axiosInstance";
import ChatInboxDropdown from "@/views/components/chat/ChatInboxDropdown";
import { 
  LayoutDashboard, 
  UserPlus, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  TrendingUp, 
  Star, 
  User, 
  FileText, 
  Bell,
  Moon,
  Sun,
  Search,
  LogOut,
  Package
} from 'lucide-react';

const NAV = [
  {
    section: "Overview",
    items: [
      { to: "/provider/dashboard",          icon: LayoutDashboard, label: "Dashboard"          },
      { to: "/provider/incoming-requests",  icon: UserPlus,         label: "Incoming Requests", badge: 0 },
      { to: "/provider/my-jobs",            icon: Briefcase,       label: "My Jobs"            },
      { to: "/provider/schedule",           icon: Calendar,        label: "Schedule"           },
      { to: "/chat/inbox",                  icon: MessageSquare,   label: "Messages"           },
    ],
  },
  {
    section: "Business",
    items: [
      { to: "/provider/my-services", icon: Sparkles,   label: "My Services" },
      { to: "/provider/earnings",    icon: TrendingUp,   label: "Earnings"    },
      { to: "/provider/reviews",     icon: Star,         label: "Reviews"     },
    ],
  },
  {
    section: "Account",
    items: [
      { to: "/provider/profile",       icon: User,         label: "Profile"        },
      { to: "/provider/documents",     icon: FileText,     label: "My Documents"   },
      { to: "/provider/notifications", icon: Bell,         label: "Notifications"  },
    ],
  },
];

export default function ProviderLayout() {
  const { palette: p, mode, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const response = await axiosInstance.get("/notifications");
        if (response.data.success) {
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Failed to fetch unread notifications:", error);
      }
    };
    if (user) fetchUnread();
    
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sbStyle: React.CSSProperties = {
    width: 260, 
    background: mode === "dark" ? "#111" : "#EDF4F4",
    borderRight: `1px solid ${p.border}`, 
    display: "flex",
    flexDirection: "column", 
    position: "fixed", 
    top: 0, 
    left: 0,
    height: "100vh", 
    zIndex: 50, 
    transition: "background .3s",
  };

  const currentNavItem = NAV.flatMap(g => g.items).find(i => i.to === location.pathname);
  const pageTitle = currentNavItem ? currentNavItem.label : "Provider Portal";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: p.bg, color: p.text, fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>

      {/* SIDEBAR */}
      <aside style={sbStyle}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "24px 20px", borderBottom: `1px solid ${p.border}` }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Package size={20} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.5 }}>Family Care</span>
          <span style={{ fontSize: 10, background: "rgba(47,176,188,.15)", color: p.primary, border: "1px solid rgba(47,176,188,.25)", borderRadius: 4, padding: "2px 6px", marginLeft: 4 }}>Provider</span>
        </div>

        {/* Nav groups */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
          {NAV.map((group) => (
            <div key={group.section} style={{ marginBottom: 16 }}>
              <div style={{ padding: "0 24px 8px", fontSize: 11, color: p.textMuted, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 500 }}>
                {group.section}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    style={{ textDecoration: "none" }}
                  >
                    {({ isActive }) => (
                      <div style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 16px", borderRadius: 8, margin: "2px 12px",
                        cursor: "pointer", fontSize: 14,
                        color: isActive ? p.primary : p.textMuted,
                        background: isActive ? "rgba(47,176,188,.12)" : "transparent",
                        fontWeight: isActive ? 500 : 400,
                        transition: "all .2s ease",
                      }}>
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.label === "Notifications" && unreadCount > 0 ? (
                          <span style={{ background: p.primary, color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999 }}>
                            {unreadCount}
                          </span>
                        ) : item.badge ? (
                          <span style={{ background: p.primary, color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999 }}>
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom user row */}
        <div style={{ padding: "16px", borderTop: `1px solid ${p.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            onClick={() => navigate('/provider/profile')}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px", borderRadius: 12, cursor: "pointer", transition: "background .15s", background: mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
          >
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
              {user?.fname?.[0] || 'P'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: p.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.fname} {user?.lname}</div>
              <div style={{ fontSize: 11, color: p.textMuted }}>Service Provider</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', 
              background: 'transparent', border: 'none', borderRadius: 8, color: '#f43f5e', 
              fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
              textAlign: 'left', width: '100%'
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: 260, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Topbar */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 72, borderBottom: `1px solid ${p.border}`, background: p.navBg, backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 40 }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, fontWeight: 400 }}>
            {pageTitle}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ChatInboxDropdown theme={mode} />
            <div style={{ position: 'relative' }}>
               <input 
                type="text" 
                placeholder="Search jobs..." 
                style={{ background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1px solid ${p.border}`, borderRadius: 10, padding: '8px 12px 8px 36px', fontSize: 13, color: p.text, outline: 'none', width: 240 }}
               />
               <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            </div>
            <button onClick={toggle} style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${p.border}`, background: p.cardBg, cursor: "pointer", fontSize: 16, color: p.textMuted, display: "flex", alignItems: "center", justifyContent: "center", transition: 'all 0.2s' }}>
              {mode === "dark" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: "32px 40px", flex: 1 }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @import url('https:/fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}













