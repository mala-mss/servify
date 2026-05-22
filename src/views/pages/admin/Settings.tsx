import React, { useState } from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";
import { useAuth } from "@/controllers/context/AuthContext";
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Moon, 
  Sun,
  Shield,
  Save
} from 'lucide-react';
import { userService } from '@/controllers/services/userService';

const Settings = () => {
  const { palette: p, mode, toggle } = useTheme();
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    fname: user?.fname || "",
    lname: user?.lname || "",
    email: user?.email || "",
    phone: user?.phone_number || "",
    address: user?.address || ""
  });
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await userService.update({
        fname: formData.fname,
        lname: formData.lname,
        phone_number: formData.phone,
        address: formData.address
      });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update profile error:", err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    border: `1px solid ${p.border}`,
    borderRadius: 10,
    color: p.text,
    fontSize: 14,
    outline: 'none'
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both", maxWidth: 800 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400, color: p.text, marginBottom: 8 }}>
          Settings
        </h1>
        <p style={{ fontSize: 14, color: p.textMuted }}>
          Manage your account settings and platform preferences.
        </p>
      </div>

      {/* PROFILE SETTINGS */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <User size={20} color={p.primary} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: p.text }}>Profile Information</h2>
        </div>

        <form onSubmit={handleUpdateProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: p.textMuted, marginBottom: 6 }}>First Name</label>
              <input 
                type="text" 
                value={formData.fname}
                onChange={(e) => setFormData({...formData, fname: e.target.value})}
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: p.textMuted, marginBottom: 6 }}>Last Name</label>
              <input 
                type="text" 
                value={formData.lname}
                onChange={(e) => setFormData({...formData, lname: e.target.value})}
                style={inputStyle} 
              />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, color: p.textMuted, marginBottom: 6 }}>Email Address</label>
            <input 
              type="email" 
              disabled
              value={formData.email}
              style={{ ...inputStyle, background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', cursor: 'not-allowed' }} 
            />
          </div>
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontSize: 12, color: p.textMuted, marginBottom: 6 }}>Phone Number</label>
            <input 
              type="text" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              style={inputStyle} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', 
              background: p.primary, color: '#fff', border: 'none', borderRadius: 10, 
              fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 
            }}
          >
            <Save size={18} />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* APPEARANCE */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          {mode === 'dark' ? <Moon size={20} color={p.primary} /> : <Sun size={20} color={p.primary} />}
          <h2 style={{ fontSize: 18, fontWeight: 600, color: p.text }}>Appearance</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, color: p.text, fontWeight: 500 }}>Dark Mode</div>
            <div style={{ fontSize: 12, color: p.textMuted }}>Adjust the portal's visual theme</div>
          </div>
          <button 
            onClick={toggle}
            style={{ width: 50, height: 26, borderRadius: 20, background: mode === 'dark' ? p.primary : p.border, border: 'none', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
          >
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: mode === 'dark' ? 27 : 3, transition: '0.3s' }} />
          </button>
        </div>
      </div>

      {/* SECURITY */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Shield size={20} color={p.primary} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: p.text }}>Platform Security</h2>
        </div>
        <p style={{ fontSize: 13, color: p.textMuted, marginBottom: 24 }}>Your account is protected with administrative-level security protocols.</p>
        <button style={{ padding: '10px 20px', borderRadius: 10, background: 'transparent', border: `1px solid ${p.border}`, color: p.text, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          Change Password
        </button>
      </div>
    </div>
  );
};

export default Settings;
