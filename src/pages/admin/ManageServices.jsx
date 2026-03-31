import React, { useState } from 'react';
import { useTheme } from "@/context/ThemeContext";
import { 
  Sparkles, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  PauseCircle, 
  PlayCircle,
  Filter,
  Layers
} from 'lucide-react';

const ManageServices = () => {
  const { palette: p, mode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  const cardStyle = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 24,
  };

  const [services, setServices] = useState([
    { id: 1, name: "Elderly Care", category: "Health", providers: 42, status: "Active", price: "4000 DZD/h" },
    { id: 2, name: "Baby Sitting", category: "Childcare", providers: 128, status: "Active", price: "2500 DZD/h" },
    { id: 3, name: "Home Cleaning", category: "Housework", providers: 85, status: "Suspended", price: "2000 DZD/h" },
    { id: 4, name: "Pet Walking", category: "Pets", providers: 34, status: "Active", price: "1500 DZD/h" },
    { id: 5, name: "Tutor Service", category: "Education", providers: 56, status: "Active", price: "3000 DZD/h" },
  ]);

  const toggleService = (id) => {
    setServices(services.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === "Active" ? "Suspended" : "Active" };
      }
      return s;
    }));
  };

  const deleteService = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this service?")) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400, color: p.text, marginBottom: 8 }}>
            Service Management
          </h1>
          <p style={{ fontSize: 14, color: p.textMuted }}>
            Configure and monitor available services across different categories.
          </p>
        </div>
        <button style={{ 
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', 
          background: p.primary, color: '#fff', border: 'none', borderRadius: 10, 
          fontSize: 14, fontWeight: 600, cursor: 'pointer' 
        }}>
          <Plus size={18} />
          Add Service
        </button>
      </div>

      <div style={cardStyle}>
        {/* SEARCH & FILTERS */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <input 
              type="text" 
              placeholder="Search services or categories..." 
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
            Categories
          </button>
        </div>

        {/* GRID OF SERVICES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filteredServices.map((service) => (
            <div key={service.id} style={{ 
              background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              border: `1px solid ${p.border}`, borderRadius: 12, padding: 20,
              transition: 'all 0.3s ease', opacity: service.status === 'Suspended' ? 0.7 : 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${p.primary}15`, color: p.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={20} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ padding: 6, background: 'transparent', border: 'none', color: p.textMuted, cursor: 'pointer' }} title="Edit">
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => toggleService(service.id)}
                    style={{ padding: 6, background: 'transparent', border: 'none', color: service.status === 'Active' ? '#f59e0b' : '#10b981', cursor: 'pointer' }} 
                    title={service.status === 'Active' ? "Suspend" : "Restore"}
                  >
                    {service.status === 'Active' ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                  </button>
                  <button 
                    onClick={() => deleteService(service.id)}
                    style={{ padding: 6, background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }} 
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 600, color: p.text, marginBottom: 4 }}>{service.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: p.textMuted, marginBottom: 16 }}>
                <Layers size={14} />
                {service.category}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: `1px solid ${p.border}` }}>
                <div>
                  <div style={{ fontSize: 11, color: p.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Avg. Price</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: p.text }}>{service.price}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: p.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Providers</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: p.text }}>{service.providers}</div>
                </div>
              </div>

              {service.status === 'Suspended' && (
                <div style={{ marginTop: 12, padding: '4px 8px', background: '#f43f5e15', color: '#f43f5e', borderRadius: 6, fontSize: 11, fontWeight: 600, textAlign: 'center' }}>
                  SERVICE SUSPENDED
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageServices;
