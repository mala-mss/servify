import React, { useState, useEffect } from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";
import { 
  Sparkles, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  PauseCircle, 
  PlayCircle,
  Filter,
  Layers,
  X
} from 'lucide-react';
import { serviceService } from '@/controllers/services/serviceService';
import type { Service, ServiceCategory } from '@/models';

const ManageServices = () => {
  const { palette: p, mode } = useTheme();
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", base_price: 0, id_c: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesData, categoriesData] = await Promise.all([
        serviceService.getAll(),
        serviceService.getCategories()
      ]);
      setServices(servicesData.services);
      setCategories(categoriesData.categories);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service: any = null) => {
    if (service) {
      setEditingService(service);
      setFormData({ 
        name: service.name, 
        description: service.description || "", 
        base_price: service.base_price, 
        id_c: service.id_c?.toString() || "" 
      });
    } else {
      setEditingService(null);
      setFormData({ name: "", description: "", base_price: 0, id_c: categories[0]?.id_c.toString() || "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await serviceService.update(editingService.id_service.toString(), {
          ...formData,
          base_price: Number(formData.base_price),
          category_id_fk: formData.id_c
        } as any);
      } else {
        await serviceService.create({
          ...formData,
          base_price: Number(formData.base_price),
          category_id_fk: formData.id_c
        } as any);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error saving service:", err);
      alert("Failed to save service.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to permanently delete this service?")) {
      try {
        await serviceService.delete(id.toString());
        fetchData();
      } catch (err) {
        console.error("Error deleting service:", err);
        alert("Failed to delete service.");
      }
    }
  };

  const cardStyle = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 24,
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <button 
          onClick={() => handleOpenModal()}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', 
            background: p.primary, color: '#fff', border: 'none', borderRadius: 10, 
            fontSize: 14, fontWeight: 600, cursor: 'pointer' 
          }}
        >
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
          <button onClick={fetchData} style={{ 
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', 
            background: 'transparent', border: `1px solid ${p.border}`, borderRadius: 10, 
            color: p.textMuted, fontSize: 14, cursor: 'pointer' 
          }}>
            Refresh
          </button>
        </div>

        {/* GRID OF SERVICES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: p.textMuted }}>Loading services...</div>
          ) : filteredServices.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: p.textMuted }}>No services found.</div>
          ) : filteredServices.map((service) => (
            <div key={service.id_service} style={{ 
              background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              border: `1px solid ${p.border}`, borderRadius: 12, padding: 20,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${p.primary}15`, color: p.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={20} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => handleOpenModal(service)}
                    style={{ padding: 6, background: 'transparent', border: 'none', color: p.textMuted, cursor: 'pointer' }} title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(service.id_service)}
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
                {service.category_name}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: `1px solid ${p.border}` }}>
                <div>
                  <div style={{ fontSize: 11, color: p.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Base Price</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: p.text }}>{service.base_price} DZD</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: p.cardBg, border: `1px solid ${p.border}`, borderRadius: 16, width: 500, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: p.text }}>{editingService ? "Edit Service" : "Add Service"}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: p.textMuted, cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: p.textMuted, marginBottom: 4 }}>Service Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '10px', background: 'transparent', border: `1px solid ${p.border}`, borderRadius: 8, color: p.text }}
                />
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, color: p.textMuted, marginBottom: 4 }}>Category</label>
                  <select 
                    required
                    value={formData.id_c}
                    onChange={(e) => setFormData({...formData, id_c: e.target.value})}
                    style={{ width: '100%', padding: '10px', background: 'transparent', border: `1px solid ${p.border}`, borderRadius: 8, color: p.text }}
                  >
                    {categories.map(cat => (
                      <option key={cat.id_c} value={cat.id_c} style={{ background: p.cardBg }}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, color: p.textMuted, marginBottom: 4 }}>Base Price (DZD)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.base_price}
                    onChange={(e) => setFormData({...formData, base_price: Number(e.target.value)})}
                    style={{ width: '100%', padding: '10px', background: 'transparent', border: `1px solid ${p.border}`, borderRadius: 8, color: p.text }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, color: p.textMuted, marginBottom: 4 }}>Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{ width: '100%', padding: '10px', background: 'transparent', border: `1px solid ${p.border}`, borderRadius: 8, color: p.text, minHeight: 80 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: `1px solid ${p.border}`, borderRadius: 8, color: p.text, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', background: p.primary, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageServices;












