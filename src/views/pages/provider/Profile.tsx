import { useState, useEffect } from "react";
import { useTheme } from "@/controllers/context/ThemeContext";
import { useAuth } from "@/controllers/context/AuthContext";
import axiosInstance from "@/controllers/api/axiosInstance";
import { 
  User, 
  Star, 
  MessageSquare, 
  Award, 
  MapPin, 
  ShieldCheck, 
  Clock,
  Save,
  Moon,
  Sun,
  Shield,
  Briefcase,
  DollarSign
} from 'lucide-react';

export default function Profile() {
  const { palette: p, mode, toggle } = useTheme();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: "",
    bio: "",
    years_of_exp: 0,
    price_per_hour: 0,
    rating: 0,
    review_count: 0
  });

  useEffect(() => {
    const fetchProfileAndReviews = async () => {
      try {
        setLoading(true);
        const [profileRes, reviewsRes] = await Promise.all([
          axiosInstance.get("/providers/profile"),
          axiosInstance.get(`/feedback/provider/${user?.id}`)
        ]);

        if (profileRes.data.success) {
          const profile = profileRes.data.profile;
          setFormData({
            name: profile.name || "Provider",
            email: profile.email || "",
            phone_number: profile.phone_number || "",
            address: profile.address || "",
            bio: profile.bio || "",
            years_of_exp: profile.years_of_exp || 0,
            price_per_hour: parseFloat(profile.price_per_hour) || 0,
            rating: parseFloat(profile.rating) || 0,
            review_count: parseInt(profile.review_count) || 0
          });
        }

        if (reviewsRes.data.feedbacks) {
          setReviews(reviewsRes.data.feedbacks);
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchProfileAndReviews();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axiosInstance.put("/providers/profile", formData);
      
      updateUser({
        fname: formData.name.split(' ')[0],
        lname: formData.name.split(' ').slice(1).join(' '),
        email: formData.email
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const cardStyle: React.CSSProperties = {
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

  const labelStyle = {
    display: 'block', 
    fontSize: 12, 
    color: p.textMuted, 
    marginBottom: 6,
    fontWeight: 500
  };

  if (loading) return (
    <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.textMuted }}>
      <div className="animate-spin" style={{ width: 40, height: 40, border: `3px solid ${p.primary}20`, borderTopColor: p.primary, borderRadius: '50%' }} />
    </div>
  );

  return (
    <div style={{ animation: "fadeUp .4s ease both", maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400, color: p.text, marginBottom: 8 }}>
          Profile Settings
        </h1>
        <p style={{ fontSize: 14, color: p.textMuted }}>
          Manage your professional profile and platform preferences.
        </p>
      </div>

      {/* STATS OVERVIEW CARD */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 24, background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
        <div style={{ 
          width: 80, height: 80, borderRadius: 20, 
          background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})`, 
          color: "#fff", display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontSize: 32, fontWeight: 600, fontFamily: "'Instrument Serif', serif" 
        }}>
          {user?.fname?.[0] || 'P'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: p.text }}>{formData.name}</h2>
            <div style={{ background: '#4ade8015', color: '#4ade80', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase' }}>
              <ShieldCheck size={12} /> Verified
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, color: p.textMuted, fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={14} fill={p.primary} color={p.primary} /> <b>{Number(formData.rating).toFixed(1)}</b> ({formData.review_count} reviews)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Award size={14} /> {formData.years_of_exp}y Experience</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {formData.address || 'No address'}</div>
          </div>
        </div>
      </div>

      {/* PERSONAL INFO CARD */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <User size={20} color={p.primary} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: p.text }}>Personal Information</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input 
                type="email" 
                disabled
                value={formData.email}
                style={{ ...inputStyle, background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', cursor: 'not-allowed' }} 
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input 
                type="text" 
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Location / Address</label>
              <input 
                type="text" 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                style={inputStyle} 
              />
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${p.border}`, margin: '32px 0', paddingTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <Briefcase size={20} color={p.primary} />
              <h2 style={{ fontSize: 18, fontWeight: 600, color: p.text }}>Professional Details</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Hourly Rate (DZD)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    value={formData.price_per_hour}
                    onChange={(e) => setFormData({...formData, price_per_hour: parseFloat(e.target.value)})}
                    style={{ ...inputStyle, paddingLeft: 40 }} 
                  />
                  <DollarSign size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Years of Experience</label>
                <input 
                  type="number" 
                  value={formData.years_of_exp}
                  onChange={(e) => setFormData({...formData, years_of_exp: parseInt(e.target.value)})}
                  style={inputStyle} 
                />
              </div>
            </div>
            <div style={{ marginBottom: 32 }}>
              <label style={labelStyle}>Professional Bio</label>
              <textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={saving}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', 
              background: p.primary, color: '#fff', border: 'none', borderRadius: 10, 
              fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 
            }}
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Changes"}
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
        <p style={{ fontSize: 13, color: p.textMuted, marginBottom: 24 }}>Your account is protected with high-level encryption and security protocols.</p>
        <button style={{ padding: '10px 20px', borderRadius: 10, background: 'transparent', border: `1px solid ${p.border}`, color: p.text, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          Change Password
        </button>
      </div>

      {/* REVIEWS SECTION */}
      <div style={{ marginBottom: 32, marginTop: 48 }}>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, color: p.text, marginBottom: 8 }}>
          Client Reviews
        </h2>
        <p style={{ fontSize: 14, color: p.textMuted }}>
          What clients are saying about your services.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {reviews.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
            <MessageSquare size={48} color={p.primary + '30'} style={{ marginBottom: 16 }} />
            <div style={{ color: p.text, fontSize: 18, fontWeight: 500 }}>No reviews yet</div>
            <div style={{ color: p.textMuted, fontSize: 14 }}>Client experiences will appear here after your jobs.</div>
          </div>
        ) : (
          reviews.map((rev, idx) => (
            <div key={idx} style={{ ...cardStyle, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ 
                    width: 44, height: 44, borderRadius: '50%', 
                    background: p.primary + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: p.primary, fontWeight: 600 
                  }}>
                    {rev.client?.profile_picture ? <img src={rev.client.profile_picture} style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} /> : rev.client?.fname?.[0]}
                  </div>
                  <div>
                    <div style={{ color: p.text, fontWeight: 600, fontSize: 15 }}>{rev.client?.fname} {rev.client?.lname}</div>
                    <div style={{ color: p.textMuted, fontSize: 12 }}>{new Date(rev.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} size={14} 
                      fill={i < Math.floor(rev.overall_rating) ? p.primary : 'none'} 
                      color={i < Math.floor(rev.overall_rating) ? p.primary : p.border} 
                    />
                  ))}
                </div>
              </div>
              <div style={{ color: p.text, fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{rev.title}</div>
              <p style={{ color: p.text, fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}














