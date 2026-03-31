import React, { useState } from 'react';
import { useTheme } from "@/context/ThemeContext";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Ban, 
  CheckCircle, 
  Eye, 
  UserPlus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManageUsers = () => {
  const { palette: p, mode } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const cardStyle = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 24,
  };

  const [users, setUsers] = useState([
    { id: 1, name: "Sarah Johnson", email: "sarah.j@example.com", role: "Client", status: "Active", joined: "2024-01-15" },
    { id: 2, name: "Michael Chen", email: "m.chen@provider.com", role: "Provider", status: "Active", joined: "2024-02-10" },
    { id: 3, name: "Amine Rahmani", email: "amine.r@example.com", role: "Client", status: "Blocked", joined: "2023-11-20" },
    { id: 4, name: "Lydia Mansouri", email: "l.mansouri@provider.com", role: "Provider", status: "Active", joined: "2024-03-05" },
    { id: 5, name: "Omar Touati", email: "omar.t@example.com", role: "Client", status: "Active", joined: "2024-01-22" },
  ]);

  const toggleUserStatus = (id) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === "Active" ? "Blocked" : "Active" };
      }
      return u;
    }));
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400, color: p.text, marginBottom: 8 }}>
            User Management
          </h1>
          <p style={{ fontSize: 14, color: p.textMuted }}>
            View and manage all registered clients and service providers on the platform.
          </p>
        </div>
        <button style={{ 
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', 
          background: p.primary, color: '#fff', border: 'none', borderRadius: 10, 
          fontSize: 14, fontWeight: 600, cursor: 'pointer' 
        }}>
          <UserPlus size={18} />
          Add New User
        </button>
      </div>

      <div style={cardStyle}>
        {/* FILTERS */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', padding: '10px 12px 10px 40px', background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', 
                border: `1px solid ${p.border}`, borderRadius: 10, color: p.text, outline: 'none' 
              }} 
            />
          </div>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', 
            background: 'transparent', border: `1px solid ${p.border}`, borderRadius: 10, 
            color: p.textMuted, fontSize: 14, cursor: 'pointer' 
          }}>
            <Filter size={18} />
            Filter
          </button>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${p.border}` }}>
                <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Joined</th>
                <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: `1px solid ${p.border}`, transition: 'background 0.2s' }} className="table-row">
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${p.primary}15`, color: p.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>
                        {user.name[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: p.text }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: p.textMuted }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px', fontSize: 13, color: p.text }}>{user.role}</td>
                  <td style={{ padding: '16px 8px' }}>
                    <span style={{ 
                      fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                      color: user.status === 'Active' ? '#10b981' : '#f43f5e',
                      background: user.status === 'Active' ? '#10b98115' : '#f43f5e15'
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px', fontSize: 13, color: p.textMuted }}>{user.joined}</td>
                  <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button 
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        title="View Details"
                        style={{ padding: 8, background: 'transparent', border: 'none', color: p.textMuted, cursor: 'pointer' }}
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => toggleUserStatus(user.id)}
                        title={user.status === 'Active' ? "Block User" : "Reactivate User"}
                        style={{ padding: 8, background: 'transparent', border: 'none', color: user.status === 'Active' ? '#f43f5e' : '#10b981', cursor: 'pointer' }}
                      >
                        {user.status === 'Active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                      </button>
                      <button style={{ padding: 8, background: 'transparent', border: 'none', color: p.textMuted, cursor: 'pointer' }}>
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <div style={{ fontSize: 13, color: p.textMuted }}>Showing 1-5 of 124 users</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: 8, background: 'transparent', border: `1px solid ${p.border}`, borderRadius: 8, color: p.textMuted, cursor: 'pointer' }}>
              <ChevronLeft size={18} />
            </button>
            <button style={{ padding: 8, background: 'transparent', border: `1px solid ${p.border}`, borderRadius: 8, color: p.textMuted, cursor: 'pointer' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .table-row:hover {
          background: ${mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'} !important;
        }
      `}</style>
    </div>
  );
};

export default ManageUsers;
