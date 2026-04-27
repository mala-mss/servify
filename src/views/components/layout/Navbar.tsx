import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, LayoutDashboard } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="glass-card" style={{ margin: '1rem', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '1rem', zIndex: 100 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <Heart className="gradient-text" style={{ fill: 'currentColor' }} size={32} />
        <span className="gradient-text" style={{ fontSize: '1.5rem' }}>Family Care</span>
      </Link>
      
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <Link to="/" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <LayoutDashboard size={20} />
          Dashboard
        </Link>
        <Link to="/book" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <Calendar size={20} />
          Book Consultation
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;












