// src/pages/client/AllProviders.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate, useOutletContext } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import BookingModal from "../../components/common/BookingModal";
import BookingFlow from "../../components/client/BookingFlow";

export default function AllProviders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mode: theme, palette: p } = useTheme();
  const { toggle } = useOutletContext();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedService, setSelectedService] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Booking modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);

  useEffect(() => {
    const handle = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [providersRes, categoriesRes] = await Promise.all([
          axiosInstance.get('/users/providers/search'),
          axiosInstance.get('/services/categories')
        ]);

        if (providersRes.data.success) {
          const mapped = providersRes.data.providers.map((p_item) => ({
            id: p_item.provider_id,
            name: p_item.name,
            service: (p_item.services && p_item.services[0]) || "General Provider",
            rating: p_item.rating || 0,
            reviews: p_item.review_count || 0,
            location: p_item.location || "Unknown",
            price: p_item.price_per_hour || 0,
            img: p_item.name ? p_item.name[0] : "P",
            bio: p_item.bio || "",
            years_of_exp: p_item.years_of_exp || 0,
            categories: p_item.categories || []
          }));
          setProviders(mapped);
        }

        if (categoriesRes.data.success) {
          setCategories([{ id_category: "all", name: "All Categories" }, ...categoriesRes.data.categories]);
        }
      } catch (error) {
        console.error("Failed to fetch providers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProviders = providers.filter((prov) => {
    const matchesSearch = prov.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prov.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "All" || prov.location === selectedCity;
    const matchesService = selectedService === "All" || prov.service === selectedService;
    const matchesCategory = selectedCategory === "all" ||
                           (prov.categories && prov.categories.some(c => c.toString() === selectedCategory.toString()));
    return matchesSearch && matchesCity && matchesService && matchesCategory;
  });

  const handleBookNow = (provider) => {
    setSelectedServiceForBooking({ name: provider.service });
    setIsBookingModalOpen(true);
  };

  const handleViewProfile = (providerId) => {
    navigate(`/client/provider/${providerId}`);
  };

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={{ ...styles.bgGrid, backgroundImage: theme === 'dark' ? `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)` : `radial-gradient(circle at 2px 2px, ${p.grid} 1px, transparent 0)` }} />
      <div style={{ ...styles.glow, left: mousePos.x - 300, top: mousePos.y - 300, background: `radial-gradient(circle, ${p.glow} 0%, transparent 70%)` }} />

      <main style={styles.main}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.header}
        >
          <h1 style={{ ...styles.title, color: p.text }}>
            All <span style={{ color: p.primary }}>Service Providers</span>
          </h1>
          <p style={{ ...styles.subtitle, color: p.textMuted }}>
            Browse our complete network of verified professionals
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.filters}
        >
          {/* Search Input */}
          <div style={{ ...styles.searchBox, background: p.cardBg, borderColor: p.border }}>
            <span style={{ fontSize: 18, color: p.textMuted }}>⌕</span>
            <input
              type="text"
              placeholder="Search by name or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: p.text,
                fontSize: 14
              }}
            />
          </div>

          {/* Location Filter */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{
              ...styles.filterBtn,
              background: p.cardBg,
              borderColor: p.border,
              color: p.text
            }}
          >
            {CITIES.map(city => (
              <option key={city} value={city}>{city === "All" ? "All Locations" : city}</option>
            ))}
          </select>

          {/* Service Type Filter */}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            style={{
              ...styles.filterBtn,
              background: p.cardBg,
              borderColor: p.border,
              color: p.text
            }}
          >
            {SERVICE_TYPES.map(service => (
              <option key={service} value={service}>{service === "All" ? "All Services" : service}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              ...styles.filterBtn,
              background: p.cardBg,
              borderColor: p.border,
              color: p.text
            }}
          >
            {categories.map(cat => (
              <option key={cat.id_category} value={cat.id_category}>{cat.name}</option>
            ))}
          </select>
        </motion.div>

        {/* Results Count */}
        <div style={{ marginBottom: 24, color: p.textMuted, fontSize: 14 }}>
          Showing <strong style={{ color: p.text }}>{filteredProviders.length}</strong> of {providers.length} providers
        </div>

        {/* Providers Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: p.textMuted }}>
            Loading providers...
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredProviders.map((provider) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, borderColor: p.primary }}
                style={{ ...styles.card, background: p.cardBg, borderColor: p.border }}
              >
                <div style={styles.cardHeader}>
                  <div style={{ ...styles.avatar, background: "rgba(47,176,188,0.1)", color: p.primary }}>
                    {provider.img}
                  </div>
                  <div style={{
                    ...styles.badge,
                    background: provider.rating >= 4.5 ? "rgba(107,200,178,0.1)" : "rgba(255,255,255,0.05)",
                    color: provider.rating >= 4.5 ? "#6BC8B2" : p.textMuted
                  }}>
                    {provider.rating >= 4.5 ? "Top Rated" : `${provider.rating}★`}
                  </div>
                </div>

                <div style={styles.cardBody}>
                  <h3 style={styles.cardName}>{provider.name}</h3>
                  <p style={{ ...styles.cardService, color: p.primary }}>{provider.service}</p>

                  <div style={styles.meta}>
                    <span>★ {provider.rating} ({provider.reviews} reviews)</span>
                    <span>•</span>
                    <span>{provider.location}</span>
                    <span>•</span>
                    <span>{provider.years_of_exp} yrs exp</span>
                  </div>

                  {provider.bio && (
                    <p style={{ ...styles.bio, color: p.textMuted, fontSize: 13, marginTop: 12 }}>
                      {provider.bio.length > 80 ? `${provider.bio.substring(0, 80)}...` : provider.bio}
                    </p>
                  )}
                </div>

                <div style={styles.cardFooter}>
                  <div style={styles.price}>
                    <span style={styles.priceValue}>${provider.price}</span>
                    <span style={{ fontSize: 10, opacity: 0.5 }}>/hr</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleViewProfile(provider.id)}
                      style={{
                        ...styles.actionBtn,
                        borderColor: p.border,
                        color: p.text,
                        background: 'transparent'
                      }}
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => handleBookNow(provider)}
                      style={{ ...styles.bookBtn, background: p.primary }}
                    >
                      Book
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredProviders.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: p.textMuted }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🔍</div>
            <p style={{ fontSize: 16 }}>No providers match your filters</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>Try adjusting your search criteria</p>
          </div>
        )}
      </main>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => { setIsBookingModalOpen(false); setSelectedServiceForBooking(null); }}
        theme={theme}
        title="Book a Service"
      >
        <BookingFlow
          initialServiceName={selectedServiceForBooking?.name}
          theme={theme}
          onComplete={(booking) => {
            console.log("Booking completed:", booking);
          }}
          onClose={() => { setIsBookingModalOpen(false); setSelectedServiceForBooking(null); }}
        />
      </BookingModal>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", position: "relative", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" },
  bgGrid: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4, pointerEvents: "none" },
  glow: { position: "fixed", width: 600, height: 600, borderRadius: "50%", pointerEvents: "none", zIndex: 0, opacity: 0.6, filter: "blur(80px)" },
  main: { position: "relative", zIndex: 1, maxWidth: 1400, margin: "0 auto", padding: "120px 40px 100px" },
  header: { textAlign: "center", marginBottom: 40 },
  title: { fontFamily: "'Instrument Serif', serif", fontSize: "clamp(40px, 5vw, 56px)", lineHeight: 1, marginBottom: 12 },
  subtitle: { fontSize: 16, opacity: 0.7 },
  filters: { display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap", alignItems: "center" },
  searchBox: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14, border: "1px solid", minWidth: 250, flex: 1, maxWidth: 400 },
  filterBtn: { padding: "12px 20px", borderRadius: 14, border: "1px solid", cursor: "pointer", fontSize: 14, fontWeight: 500, outline: "none", minWidth: 150 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 },
  card: { padding: 24, borderRadius: 24, border: "1px solid", transition: "all 0.3s ease", display: "flex", flexDirection: "column", gap: 16 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  avatar: { width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 },
  badge: { padding: "6px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: "uppercase" },
  cardName: { fontSize: 19, fontWeight: 700 },
  cardService: { fontSize: 14, fontWeight: 600, marginTop: 4 },
  meta: { display: "flex", gap: 8, fontSize: 12, opacity: 0.7, marginTop: 8, flexWrap: "wrap" },
  bio: { lineHeight: 1.5 },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.03)" },
  price: { display: "flex", alignItems: "baseline", gap: 2 },
  priceValue: { fontSize: 18, fontWeight: 700 },
  actionBtn: { padding: "10px 16px", borderRadius: 12, border: "1px solid", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s" },
  bookBtn: { padding: "10px 16px", borderRadius: 12, border: "none", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.2s" }
};
