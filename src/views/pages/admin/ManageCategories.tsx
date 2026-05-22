import React, { useState, useEffect } from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";
import { 
  FolderTree, 
  Plus, 
  Edit3, 
  Trash2, 
  Search,
  X,
  Check
} from 'lucide-react';
import { serviceService } from '@/controllers/services/serviceService';
import type { ServiceCategory } from '@/models';

const ManageCategories = () => {
  const { palette: p, mode } = useTheme();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal/Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await serviceService.getCategories();
      setCategories(data.categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category: ServiceCategory | null = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || "" });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await serviceService.updateCategory(editingCategory.id_c.toString(), formData);
      } else {
        await serviceService.createCategory(formData);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Failed to save category.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure? This may affect services in this category.")) {
      try {
        await serviceService.deleteCategory(id.toString());
        fetchCategories();
      } catch (err) {
        console.error("Error deleting category:", err);
        alert("Failed to delete category.");
      }
    }
  };

  const cardStyle = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 24,
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400, color: p.text, marginBottom: 8 }}>
            Manage Categories
          </h1>
          <p style={{ fontSize: 14, color: p.textMuted }}>
            Create and organize service categories.
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
          Add Category
        </button>
      </div>

      <div style={cardStyle}>
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '10px 12px 10px 40px', background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', 
              border: `1px solid ${p.border}`, borderRadius: 10, color: p.text, outline: 'none' 
            }} 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: p.textMuted }}>Loading categories...</div>
          ) : filteredCategories.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: p.textMuted }}>No categories found.</div>
          ) : filteredCategories.map((cat) => (
            <div key={cat.id_c} style={{ 
              background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              border: `1px solid ${p.border}`, borderRadius: 12, padding: 20,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: p.text, marginBottom: 4 }}>{cat.name}</h3>
                <p style={{ fontSize: 12, color: p.textMuted }}>{cat.description || "No description"}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => handleOpenModal(cat)}
                  style={{ padding: 8, background: 'transparent', border: 'none', color: p.textMuted, cursor: 'pointer' }}
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(cat.id_c)}
                  style={{ padding: 8, background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: p.cardBg, border: `1px solid ${p.border}`, borderRadius: 16, width: 400, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: p.text }}>{editingCategory ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: p.textMuted, cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: p.textMuted, marginBottom: 4 }}>Category Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '10px', background: 'transparent', border: `1px solid ${p.border}`, borderRadius: 8, color: p.text }}
                />
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

export default ManageCategories;












