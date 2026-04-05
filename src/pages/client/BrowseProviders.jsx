// src/pages/client/BrowseProviders.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

const PALETTES = {
  dark: {
    primary: "#2FB0BC",
    secondary: "#6BC8B2",
    bg: "#0e0e0e",
    cardBg: "rgba(255,255,255,0.02)",
    text: "#e8e6e0",
    textMuted: "rgba(232,230,224,0.5)",
    border: "rgba(255,255,255,0.06)",
    glow: "rgba(47,176,188,0.04)",
    grid: "rgba(255,255,255,0.02)"
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9], staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function BrowseProviders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Search Criteria from Step 2
  const serviceId = searchParams.get("serviceId");
  const serviceName = searchParams.get("serviceName");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const address = searchParams.get("address");
  const notes = searchParams.get("notes");

  const [search, setSearch] = useState("");
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const p = PALETTES.dark;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Correct endpoint: /api/providers/search
        const response = await axiosInstance.get('/providers/search', {
            params: { service: serviceName }
        });
        
        if (response.data.success) {
            const mapped = response.data.providers.map((p_item) => ({
                id: p_item.provider_id,
                name: p_item.name,
                service: (p_item.services && p_item.services.length > 0 && p_item.services[0]) || serviceName || "Care Provider",
                rating: p_item.rating || 0,
                reviews: p_item.review_count || 0,
                location: p_item.location || "Local",
                price: p_item.price_per_hour || 0,
                img: p_item.name ? p_item.name[0] : "P"
            }));
            setProviders(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch providers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [serviceName]);

  const handleSelectProvider = (provider) => {
    // Step 5: Client selects a service provider and validates
    navigate("/client/checkout", { 
        state: { 
            serviceId, 
            serviceName, 
            providerId: provider.id, 
            providerName: provider.name,
            date, 
            time, 
            address, 
            notes,
            price: provider.price
        } 
    });
  };

  const filteredProviders = providers.filter((prov) => 
    prov.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={{ ...styles.bgGrid, backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)` }} />
      
      <main style={styles.main}>
        <motion.div initial="hidden" animate="visible" variants={sectionVariants} style={styles.hero}>
          <div style={styles.stepIndicator}>Step 3 of 4</div>
          <motion.h1 variants={itemVariants} style={{ ...styles.heroTitle, color: p.text }}>
            Available <span style={{ color: p.primary }}>{serviceName || "Providers"}</span>
          </motion.h1>
          <p style={{ ...styles.criteria, color: p.textMuted }}>
            Showing experts for <strong>{date}</strong> at <strong>{time}</strong>
          </p>
          <motion.div variants={itemVariants} style={styles.searchWrapper}>
            <input 
              style={{ ...styles.searchInput, background: p.cardBg, borderColor: p.border, color: p.text }}
              placeholder="Filter by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </motion.div>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 40, opacity: 0.5 }}>Discovering experts...</div>
        ) : (
          <div style={styles.grid}>
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider) => (
                <motion.div 
                  key={provider.id}
                  variants={itemVariants}
                  whileHover={{ y: -8, borderColor: p.primary }}
                  style={{ ...styles.card, background: p.cardBg, borderColor: p.border }}
                >
                  <div style={styles.cardHeader}>
                    <div style={{ ...styles.avatar, background: "rgba(47,176,188,0.1)", color: p.primary }}>
                      {provider.img}
                    </div>
                    <div style={styles.badge}>Available</div>
                  </div>
                  
                  <div style={styles.cardBody}>
                    <h3 style={styles.cardName}>{provider.name}</h3>
                    <p style={{ ...styles.cardService, color: p.primary }}>{provider.service}</p>
                    
                    <div style={styles.meta}>
                      <span>★ {provider.rating} ({provider.reviews})</span>
                      <span>•</span>
                      <span>{provider.location}</span>
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <div style={styles.price}>
                      <span style={styles.priceValue}>${provider.price}</span>
                      <span style={{ fontSize: 10, opacity: 0.5 }}>/hr</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button 
                          onClick={() => navigate(`/client/provider/${provider.id}`, { 
                              state: { 
                                  serviceId, 
                                  serviceName, 
                                  date, 
                                  time, 
                                  address, 
                                  notes, 
                                  price: provider.price,
                                  providerId: provider.id,
                                  providerName: provider.name
                              } 
                          })}
                          style={{ ...styles.profileBtn, borderColor: p.border, color: p.text }}
                      >
                        View Profile
                      </button>
                      <button 
                          onClick={() => handleSelectProvider(provider)}
                          style={{ ...styles.viewBtn, background: p.primary }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', opacity: 0.5 }}>
                No providers found.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", position: "relative", overflow: "hidden", fontFamily: "'DM Sans', sans-serif", background: "#0e0e0e" },
  bgGrid: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4, pointerEvents: "none" },
  main: { position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "80px 40px 100px" },
  hero: { textAlign: "center", marginBottom: 60 },
  stepIndicator: { fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#2FB0BC", marginBottom: 16 },
  heroTitle: { fontFamily: "'Instrument Serif', serif", fontSize: "clamp(48px, 6vw, 72px)", lineHeight: 1, marginBottom: 12 },
  criteria: { fontSize: 16, marginBottom: 32 },
  searchWrapper: { maxWidth: 500, margin: "0 auto" },
  searchInput: { width: "100%", padding: "18px 28px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.06)", outline: "none", fontSize: 15, transition: "all 0.3s ease" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 },
  card: { padding: 28, borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)", display: "flex", flexDirection: "column", gap: 20 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  avatar: { width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 },
  badge: { padding: "4px 10px", background: "rgba(107,200,178,0.1)", color: "#6BC8B2", borderRadius: 99, fontSize: 10, fontWeight: 700, textTransform: "uppercase" },
  cardName: { fontSize: 19, fontWeight: 700 },
  cardService: { fontSize: 14, fontWeight: 600, marginTop: 4 },
  meta: { display: "flex", gap: 12, fontSize: 12, opacity: 0.6, marginTop: 12, fontWeight: 500 },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.03)" },
  price: { display: "flex", alignItems: "baseline", gap: 2 },
  priceValue: { fontSize: 18, fontWeight: 700 },
  viewBtn: { padding: "10px 20px", borderRadius: "12px", border: "none", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "transform 0.2s" },
  profileBtn: { padding: "10px 20px", borderRadius: "12px", border: "1px solid", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "transform 0.2s" }
};
