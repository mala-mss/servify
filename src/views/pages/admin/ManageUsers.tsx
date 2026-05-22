import React, { useState, useEffect } from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";
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
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService } from '@/controllers/services/userService';
import type { User } from '@/models';

const ManageUsers = () => {
  const { palette: p, mode } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data.users);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please check your permissions.");
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 24,
  };

  const toggleUserStatus = async (user: User) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    try {
      await userService.updateStatus(user.id, newStatus);
      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error("Error updating user status:", err);
      alert("Failed to update user status.");
    }
  };

  const warnUser = async (user: User) => {
    try {
      const resp = await userService.warn(user.id);
      setUsers(users.map(u => u.id === user.id ? { ...u, nbr_warning: resp.account.nbr_warning } : u));
      alert(`Warning issued to ${user.fname}. Total warnings: ${resp.account.nbr_warning}`);
    } catch (err) {
      console.error("Error warning user:", err);
      alert("Failed to issue warning.");
    }
  };

  const filteredUsers = users.filter(u => 
    `${u.fname} ${u.lname}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
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
          <button onClick={fetchUsers} style={{ 
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', 
            background: 'transparent', border: `1px solid ${p.border}`, borderRadius: 10, 
            color: p.textMuted, fontSize: 14, cursor: 'pointer' 
          }}>
            Refresh
          </button>
        </div>

        {error && (
          <div style={{ padding: 16, background: '#f43f5e15', color: '#f43f5e', borderRadius: 8, marginBottom: 24, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* TABLE */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${p.border}` }}>
                <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Warnings</th>
                <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Joined</th>
                <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: p.textMuted }}>Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: p.textMuted }}>No users found.</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: `1px solid ${p.border}`, transition: 'background 0.2s' }} className="table-row">
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${p.primary}15`, color: p.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>
                        {user.profile_picture ? <img src={user.profile_picture} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.fname[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: p.text }}>{user.fname} {user.lname}</div>
                        <div style={{ fontSize: 12, color: p.textMuted }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <span style={{ 
                      fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                      color: user.status === 'active' ? '#10b981' : '#f43f5e',
                      background: user.status === 'active' ? '#10b98115' : '#f43f5e15'
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px', fontSize: 13, color: p.text }}>
                    {user.nbr_warning > 0 ? (
                      <span style={{ color: user.nbr_warning >= 3 ? '#f43f5e' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AlertTriangle size={14} />
                        {user.nbr_warning}
                      </span>
                    ) : '0'}
                  </td>
                  <td style={{ padding: '16px 8px', fontSize: 13, color: p.textMuted }}>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
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
                        onClick={() => warnUser(user)}
                        title="Issue Warning"
                        style={{ padding: 8, background: 'transparent', border: 'none', color: '#f59e0b', cursor: 'pointer' }}
                      >
                        <AlertTriangle size={18} />
                      </button>
                      <button 
                        onClick={() => toggleUserStatus(user)}
                        title={user.status === 'active' ? "Suspend User" : "Reactivate User"}
                        style={{ padding: 8, background: 'transparent', border: 'none', color: user.status === 'active' ? '#f43f5e' : '#10b981', cursor: 'pointer' }}
                      >
                        {user.status === 'active' ? <Ban size={18} /> : <CheckCircle size={18} />}
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
          <div style={{ fontSize: 13, color: p.textMuted }}>Showing {filteredUsers.length} users</div>
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












