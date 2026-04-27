import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { useTheme } from "@/controllers/context/ThemeContext";
import { BOOKINGS } from "@/controllers/utils/mockData";
import axiosInstance from "@/controllers/api/axiosInstance";
import BookingModal from "@/views/components/common/BookingModal";
import BookingFlow from "@/views/components/client/BookingFlow";

const SERVICES = ["super-nanny", "baby-sitting", "childcare", "elderly-care", "pick-up"];

const STATS = [
  { label: "Verified Pros", value: "1,200+" },
  { label: "Happy Clients", value: "45k" },
  { label: "Services Completed", value: "120k" },
  { label: "Avg. Rating", value: "4.9/5" },
];

const CATEGORIES = [
  { id: 1, name: "Home Cleaning", icon: "✦", desc: "Deep clean, regular upkeep", count: 48 },
  { id: 2, name: "Plumbing", icon: "◈", desc: "Repairs, installations", count: 31 },
  { id: 3, name: "Electrical", icon: "◉", desc: "Wiring, fixtures, safety", count: 27 },
  { id: 4, name: "Childcare", icon: "◎", desc: "Babysitting, nannying", count: 19 },
  { id: 5, name: "Gardening", icon: "✿", desc: "Landscaping, maintenance", count: 22 },
  { id: 6, name: "Tutoring", icon: "◆", desc: "Academic, music, languages", count: 35 },
];

const CITIES = ["Algiers", "Oran", "Constantine", "Annaba", "Sétif", "Mila", "ferdjioua"];

const FAQS = [
  { q: "How do I pay for a service?", a: "You can pay securely via credit card or digital wallet directly through our platform after the service is completed." },
  { q: "Are the providers background checked?", a: "Yes, every professional on Servify undergoes a multi-step verification process including identity and background checks." },
  { q: "Can I cancel a booking?", a: "Absolutely. You can cancel for free up to 24 hours before your scheduled appointment." },
];

const FEATURED_PROVIDERS = [
  {
    id: 1, name: "Alex Johnson", service: "Plumbing", rating: 4.9, reviews: 124, img: "A",
    location: "Algiers", price: 45, experience: "8 years", bio: "Expert in home plumbing repairs and installations.",
    availability: "Available Now", tags: ["Emergency", "Licensed"]
  },
  {
    id: 2, name: "Maria Garcia", service: "Cleaning", rating: 4.8, reviews: 89, img: "M",
    location: "Oran", price: 30, experience: "5 years", bio: "Eco-friendly deep cleaning specialist for modern homes.",
    availability: "Available Tomorrow", tags: ["Eco-friendly", "Detail-oriented"]
  },
  {
    id: 3, name: "David Chen", service: "Electrical", rating: 5.0, reviews: 56, img: "D",
    location: "Constantine", price: 55, experience: "12 years", bio: "Master electrician specializing in smart home wiring.",
    availability: "Available Now", tags: ["Expert", "Certified"]
  },
  {
    id: 4, name: "Sarah Miller", service: "Childcare", rating: 4.9, reviews: 210, img: "S",
    location: "Algiers", price: 25, experience: "6 years", bio: "Patient and creative childcare provider with CPR certification.",
    availability: "Available Now", tags: ["CPR Certified", "Multilingual"]
  },
  {
    id: 5, name: "Robert Wilson", service: "Gardening", rating: 4.7, reviews: 45, img: "R",
    location: "Sétif", price: 35, experience: "4 years", bio: "Passionate about landscaping and sustainable garden design.",
    availability: "Available Today", tags: ["Landscaping", "Sustainable"]
  },
  {
    id: 6, name: "Elena Petrova", service: "Tutoring", rating: 5.0, reviews: 78, img: "E",
    location: "Mila", price: 40, experience: "7 years", bio: "Experienced mathematics tutor focusing on high school students.",
    availability: "Available Now", tags: ["Math Expert", "Flexible Schedule"]
  },
  {
    id: 7, name: "Karim Brahimi", service: "Plumbing", rating: 4.6, reviews: 32, img: "K",
    location: "Ferdjioua", price: 40, experience: "10 years", bio: "Fast and reliable service for all types of plumbing issues.",
    availability: "Available Now", tags: ["Reliable", "Fast"]
  },
  {
    id: 8, name: "Lila Mansouri", service: "Cleaning", rating: 4.9, reviews: 156, img: "L",
    location: "Algiers", price: 35, experience: "6 years", bio: "Professional cleaning with attention to every corner.",
    availability: "Available Today", tags: ["Professional", "Thorough"]
  },
];

const TESTIMONIALS = [
  { id: 1, text: "The easiest way I've ever found a reliable electrician. Booked in minutes!", author: "Sarah K.", role: "Homeowner" },
  { id: 2, text: "Servify saved my weekend when our pipes burst. Truly professional service.", author: "James L.", role: "Tenant" },
];

const getStatusStyle = (status, theme) => {
  const isDark = theme === "dark";
  const colors = {
    upcoming:  { color: "#6BC8B2", bg: isDark ? "rgba(107,200,178,0.15)" : "rgba(107,200,178,0.1)" },
    completed: { color: "#2FB0BC", bg: isDark ? "rgba(47,176,188,0.15)" : "rgba(47,176,188,0.1)" },
    confirmed: { color: "#6BC8B2", bg: isDark ? "rgba(107,200,178,0.15)" : "rgba(107,200,178,0.1)" },
    pending:   { color: "#7ED4CA", bg: isDark ? "rgba(126,212,202,0.15)" : "rgba(126,212,202,0.1)" },
    cancelled: { color: "#f87171", bg: isDark ? "rgba(248,113,113,0.15)" : "rgba(248,113,113,0.1)" },
  };
  return colors[status] ?? { color: "#e8e6e0", bg: "rgba(255,255,255,0.1)" };
};

// ── ANIMATION VARIANTS ──
const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.21, 0.45, 0.32, 0.9],
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const viewportConfig = { once: false, amount: 0.2 };

function AccordionItem({ faq }) {
  const [isOpen, setIsOpen] = useState(false);
  const { palette: p } = useTheme();

  return (
    <div style={{ ...styles.faqItem, borderBottomColor: p.border }}>
      <div style={styles.faqHeader} onClick={() => setIsOpen(!isOpen)}>
        <span style={{ ...styles.faqQuestion, color: p.text }}>{faq.q}</span>
        <span style={{ ...styles.faqToggle, color: p.primary, transform: isOpen ? "rotate(45deg)" : "rotate(0)" }}>+</span>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ ...styles.faqAnswer, color: p.textMuted }}>{faq.a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const { mode: theme, palette: p } = useTheme();
  const { toggle } = useOutletContext();
  const [serviceIndex, setServiceIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState(BOOKINGS);
  const [filteredProviders, setFilteredProviders] = useState(FEATURED_PROVIDERS);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await axiosInstance.get("/users/providers/search");
        if (response.data.success) {
          const mapped = response.data.providers.map(p_item => ({
            id: p_item.provider_id,
            name: p_item.name,
            service: p_item.services?.[0] || "General Provider",
            rating: p_item.rating || 0,
            reviews: p_item.review_count || 0,
            img: p_item.name[0],
            location: p_item.location || "Unknown",
            price: p_item.price_per_hour || 0,
            experience: `${p_item.years_of_exp || 0} years`,
            bio: p_item.bio || "No bio available.",
            availability: "Available Now",
            tags: p_item.categories || []
          }));
          setFilteredProviders(mapped);
        }
      } catch (error) {
        console.error("Initial fetch failed:", error);
      }
    };
    fetchProviders();
  }, []);

  const handleSearch = async (query, results) => {
    setSearch(query);

    const params = {};
    const parts = query.split(" ");
    parts.forEach(part => {
      if (part.startsWith("location:")) params.location = part.split(":")[1];
      if (part.startsWith("service:")) params.service = part.split(":")[1];
      if (part.startsWith("category:")) params.category = part.split(":")[1];
    });

    const isGeneralSearch = !params.location && !params.service && !params.category && query.trim() !== "";

    try {
      const response = await axiosInstance.get("/users/providers/search", {
        params: isGeneralSearch ? { service: query } : params
      });

      if (response.data.success) {
        const mapped = response.data.providers.map(p => ({
          id: p.provider_id,
          name: p.name,
          service: p.services?.[0] || "General Provider",
          rating: p.rating || 0,
          reviews: p.review_count || 0,
          img: p.name[0],
          location: p.location || "Unknown",
          price: p.price_per_hour || 0,
          experience: `${p.years_of_exp || 0} years`,
          bio: p.bio || "No bio available.",
          availability: "Available Now",
          tags: p.categories || []
        }));
        setFilteredProviders(mapped);

        if (query.trim() !== "") {
          document.getElementById("caregivers-section")?.scrollIntoView({ behavior: "smooth" });
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
      setFilteredProviders(results.length > 0 ? results : FEATURED_PROVIDERS);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setServiceIndex((i) => (i + 1) % SERVICES.length);
        setFading(false);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      {/* Background Texture */}
      <div style={{
        ...styles.bgGrid,
        backgroundImage: theme === "dark"
          ? `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)`
          : `radial-gradient(circle at 2px 2px, ${p.grid} 1px, transparent 0)`
      }} />

      {/* ── HERO ── */}
      <motion.section
        style={styles.hero}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <motion.div style={{ ...styles.statusPill, background: p.cardBg, borderColor: p.border, color: p.textMuted }} variants={itemVariants}>
          <span style={{ ...styles.statusDot, background: p.secondary, boxShadow: `0 0 6px ${p.secondary}` }} />
          2 active bookings
        </motion.div>

        <motion.h1 style={{ ...styles.headline, color: p.text }} variants={itemVariants}>
          <span style={{ color: p.text }}>Book a </span>
          <span style={{ ...styles.headlineAccent, color: p.primary, opacity: fading ? 0 : 1, transform: fading ? "translateY(10px)" : "translateY(0)" }}>
            {SERVICES[serviceIndex]}
          </span>
          <br />
          <span style={{ color: p.text }}>service today.</span>
        </motion.h1>

        <motion.p style={{ ...styles.subline, color: p.textMuted }} variants={itemVariants}>
          Find trusted professionals in your area. Describe what you need, pick a time, and we handle the rest.
        </motion.p>

        {/* Search bar (from doc2, inside hero) */}
        <motion.form
          style={{ ...styles.searchRow, background: p.cardBg, borderColor: p.border }}
          variants={itemVariants}
          onSubmit={(e) => { e.preventDefault(); handleSearch(search, []); }}
        >
          <div style={styles.searchWrap}>
            <span style={{ ...styles.searchIcon, color: p.border }}>⌕</span>
            <input
              style={{ ...styles.searchInput, color: p.text }}
              placeholder="What service do you need?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" style={{ ...styles.searchBtn, background: p.primary }}>Find a provider</button>
        </motion.form>
      </motion.section>

      {/* ── STATS ── */}
      <motion.section
        style={{ ...styles.statsSection, borderColor: p.border }}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={sectionVariants}
      >
        {STATS.map((s, i) => (
          <motion.div key={i} style={styles.statItem} variants={itemVariants}>
            <div style={{ ...styles.statValue, color: p.primary }}>{s.value}</div>
            <div style={{ ...styles.statLabel, color: p.textMuted }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.section>

      {/* ── HOW IT WORKS ── */}
      <motion.section
        style={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={sectionVariants}
      >
        <motion.div style={{ ...styles.sectionHeader, borderBottomColor: p.border }} variants={itemVariants}>
          <h2 style={{ ...styles.sectionTitle, color: p.text }}>How it works</h2>
        </motion.div>
        <div style={styles.stepsGrid}>
          {[
            { step: "01", title: "Choose a service", desc: "Select from our range of verified professional services." },
            { step: "02", title: "Pick a provider", desc: "Compare profiles, ratings, and transparent pricing." },
            { step: "03", title: "Book & Relax", desc: "Schedule a time that works and get the job done right." }
          ].map((s, i) => (
            <motion.div key={i} style={{ ...styles.stepCard, background: p.cardBg, borderColor: p.border }} variants={itemVariants} whileHover={{ borderColor: p.primary }}>
              <div style={{ ...styles.stepNumber, color: p.secondary }}>{s.step}</div>
              <div style={{ ...styles.stepTitle, color: p.text }}>{s.title}</div>
              <div style={{ ...styles.stepDesc, color: p.textMuted }}>{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── CATEGORIES ── */}
      <motion.section
        style={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={sectionVariants}
      >
        <motion.div style={{ ...styles.sectionHeader, borderBottomColor: p.border }} variants={itemVariants}>
          <h2 style={{ ...styles.sectionTitle, color: p.text }}>Browse by category</h2>
          <a href="/client/browse" style={{ ...styles.sectionLink, color: p.primary }}>View all →</a>
        </motion.div>
        <div style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <motion.a
              href={`/client/browse?category=${cat.id}`}
              key={cat.id}
              variants={itemVariants}
              style={{ ...styles.categoryCard, background: p.cardBg, borderColor: p.border }}
              whileHover={{ y: -8, borderColor: p.primary, background: theme === "dark" ? "rgba(47,176,188,0.05)" : "rgba(47,176,188,0.03)" }}
            >
              <div style={{ ...styles.catIcon, color: p.primary }}>{cat.icon}</div>
              <div style={{ ...styles.catName, color: p.text }}>{cat.name}</div>
              <div style={{ ...styles.catDesc, color: p.textMuted }}>{cat.desc}</div>
              <div style={{ ...styles.catCount, color: p.secondary }}>{cat.count} providers</div>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* ── COVERAGE ── */}
      <motion.section
        style={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={sectionVariants}
      >
        <motion.div style={{ ...styles.sectionHeader, borderBottomColor: p.border }} variants={itemVariants}>
          <h2 style={{ ...styles.sectionTitle, color: p.text }}>Available in your city</h2>
        </motion.div>
        <motion.div style={styles.cityGrid} variants={itemVariants}>
          {CITIES.map((city, i) => (
            <motion.div key={i} style={{ ...styles.cityItem, color: p.textMuted }} whileHover={{ color: p.primary }}>
              ◈ {city}
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ── AVAILABLE CAREGIVERS (full rich cards from doc1) ── */}
      <motion.section
        style={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={sectionVariants}
        id="caregivers-section"
      >
        <motion.div style={{ ...styles.sectionHeader, borderBottomColor: p.border }} variants={itemVariants}>
          <h2 style={{ ...styles.sectionTitle, color: p.text }}>
            {search ? `Results for "${search}"` : "Available Caregivers"}
          </h2>
          <span style={{ fontSize: 13, color: p.textMuted }}>{filteredProviders.length} experts found</span>
        </motion.div>

        {filteredProviders.length > 0 ? (
          <div style={styles.providerGrid}>
            {filteredProviders.map((p_item) => (
              <motion.div
                key={p_item.id}
                style={{ ...styles.providerCard, background: p.cardBg, borderColor: p.border }}
                variants={itemVariants}
                whileHover={{ y: -8, borderColor: p.primary, boxShadow: `0 12px 30px ${theme === "dark" ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.05)"}` }}
              >
                <div style={styles.providerCardTop}>
                  <div style={{ ...styles.providerImg, background: theme === "dark" ? "rgba(47,176,188,0.15)" : "#D6FFF9", color: p.primary }}>
                    {p_item.img}
                  </div>
                  <div style={styles.providerBadgeRow}>
                    <span style={{
                      ...styles.availBadge,
                      background: p_item.availability.includes("Now") ? "rgba(107,200,178,0.15)" : "rgba(245,158,11,0.1)",
                      color: p_item.availability.includes("Now") ? "#6BC8B2" : "#F59E0B"
                    }}>
                      ● {p_item.availability}
                    </span>
                  </div>
                </div>

                <div style={styles.providerInfo}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ ...styles.providerName, color: p.text }}>{p_item.name}</div>
                      <div style={{ ...styles.providerService, color: p.primary }}>{p_item.service}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: p.text }}>${p_item.price}</div>
                      <div style={{ fontSize: 10, color: p.textMuted }}>per hour</div>
                    </div>
                  </div>

                  <div style={{ ...styles.providerMeta, color: p.textMuted }}>
                    <span>★ {p_item.rating} ({p_item.reviews})</span>
                    <span>•</span>
                    <span>{p_item.experience} exp.</span>
                    <span>•</span>
                    <span>{p_item.location}</span>
                  </div>

                  <p style={{ ...styles.providerBio, color: p.textMuted }}>{p_item.bio}</p>

                  <div style={styles.tagRow}>
                    {p_item.tags.map(tag => (
                      <span key={tag} style={{ ...styles.tag, background: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", color: p.textMuted }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div style={styles.providerActions}>
                    <button style={{ ...styles.actionBtnSecondary, color: p.text, borderColor: p.border }}>Profile</button>
                    <button style={{ ...styles.actionBtnPrimary, background: p.primary }}>Book Now</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div variants={itemVariants} style={{ textAlign: "center", padding: "60px 0", color: p.textMuted }}>
            <div style={{ fontSize: 40, marginBottom: 20 }}>☹</div>
            <h3>No caregivers found matching your search.</h3>
            <p>Try using different filters or search terms.</p>
            <button
              onClick={() => handleSearch("", FEATURED_PROVIDERS)}
              style={{ marginTop: 20, background: "none", border: `1px solid ${p.primary}`, color: p.primary, padding: "10px 24px", borderRadius: 8, cursor: "pointer" }}
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </motion.section>

      {/* ── APP PROMO ── */}
      <motion.section
        style={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={sectionVariants}
      >
        <motion.div style={{
          ...styles.appPromoCard,
          background: theme === "dark" ? "rgba(47,176,188,0.05)" : "#D6FFF9",
          borderColor: theme === "dark" ? p.border : "#A1E8DC"
        }} variants={itemVariants}>
          <div style={styles.appPromoText}>
            <h2 style={{ ...styles.appPromoTitle, color: p.text }}>Services at your fingertips.</h2>
            <p style={{ ...styles.appPromoSub, color: p.textMuted }}>Download the Servify app for faster bookings and real-time provider tracking.</p>
            <div style={styles.appBtns}>
              <div style={{ ...styles.appBtn, background: theme === "dark" ? "rgba(255,255,255,0.05)" : "#FFFFFF", borderColor: p.accent, color: p.text }}>App Store</div>
              <div style={{ ...styles.appBtn, background: theme === "dark" ? "rgba(255,255,255,0.05)" : "#FFFFFF", borderColor: p.accent, color: p.text }}>Google Play</div>
            </div>
          </div>
          <div style={styles.appPromoPhone}>
            <div style={{ ...styles.phoneMockup, borderColor: p.text, background: theme === "dark" ? "#000" : "#fff" }}>
              <div style={{ ...styles.phoneInner, background: p.border }} />
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ── TESTIMONIALS ── */}
      <motion.section
        style={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={sectionVariants}
      >
        <div style={styles.testimonialContainer}>
          {TESTIMONIALS.map((t) => (
            <motion.div key={t.id} style={{ ...styles.testimonialCard, background: p.cardBg, borderLeftColor: p.primary }} variants={itemVariants}>
              <p style={{ ...styles.testimonialText, color: p.text }}>"{t.text}"</p>
              <div style={{ ...styles.testimonialAuthor, color: p.text }}>— {t.author}, <span style={{ opacity: 0.5 }}>{t.role}</span></div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── RECENT ACTIVITY ── */}
      <motion.section
        style={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={sectionVariants}
      >
        <motion.div style={{ ...styles.sectionHeader, borderBottomColor: p.border }} variants={itemVariants}>
          <h2 style={{ ...styles.sectionTitle, color: p.text }}>Recent activity</h2>
        </motion.div>
        <div style={styles.bookingList}>
          {bookings.map((b) => {
            const s = getStatusStyle(b.status, theme);
            return (
              <motion.a key={b.id} href="/client/my-bookings" style={{ ...styles.bookingRow, background: p.cardBg, borderColor: p.border }} variants={itemVariants} whileHover={{ background: theme === "dark" ? "rgba(47,176,188,0.05)" : "rgba(47,176,188,0.03)" }}>
                <div style={styles.bookingLeft}>
                  <span style={{ ...styles.bookingRef, color: p.textMuted }}>{b.id}</span>
                  <span style={{ color: p.text }}>{b.service}</span>
                </div>
                <div style={styles.bookingRight}>
                  <span style={{ ...styles.bookingDate, color: p.textMuted }}>{b.date}</span>
                  <span style={{ ...styles.statusBadge, color: s.color, background: s.bg }}>{b.status}</span>
                </div>
              </motion.a>
            );
          })}
        </div>
      </motion.section>

      {/* ── FAQ ── */}
      <motion.section
        style={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={sectionVariants}
      >
        <motion.div style={{ ...styles.sectionHeader, borderBottomColor: p.border }} variants={itemVariants}>
          <h2 style={{ ...styles.sectionTitle, color: p.text }}>Common questions</h2>
        </motion.div>
        <motion.div style={styles.faqList} variants={itemVariants}>
          {FAQS.map((faq, i) => <AccordionItem key={i} faq={faq} theme={theme} />)}
        </motion.div>
      </motion.section>

      {/* ── NEWSLETTER ── */}
      <motion.section
        style={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={sectionVariants}
      >
        <motion.div style={{ ...styles.newsletterCard, background: p.cardBg, borderColor: p.border }} variants={itemVariants}>
          <h3 style={{ ...styles.newsletterTitle, color: p.text }}>Stay updated</h3>
          <p style={{ ...styles.newsletterSub, color: p.textMuted }}>Get the latest home care tips and exclusive professional discounts.</p>
          <div style={styles.newsletterForm}>
            <input style={{ ...styles.newsletterInput, background: theme === "dark" ? "rgba(255,255,255,0.03)" : p.bg, borderColor: p.border, color: p.text }} placeholder="your@email.com" />
            <button style={{ ...styles.newsletterBtn, background: p.primary }}>Join</button>
          </div>
        </motion.div>
      </motion.section>

      {/* ── CTA ── */}
      <motion.section
        style={styles.ctaSection}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={sectionVariants}
      >
        <motion.div style={{
          ...styles.ctaContent,
          background: theme === "dark" ? "linear-gradient(to bottom, rgba(47,176,188,0.08), transparent)" : "linear-gradient(to bottom, #D6FFF9, #F8FBFB)",
          borderColor: theme === "dark" ? "rgba(47,176,188,0.2)" : p.accent
        }} variants={itemVariants}>
          <h2 style={{ ...styles.ctaTitle, color: p.text }}>Ready to get started?</h2>
          <p style={{ ...styles.ctaSub, color: p.textMuted }}>Join thousands of homeowners who trust Servify for their daily needs.</p>
          <a href="/client/browse" style={{ ...styles.ctaBtn, background: p.primary, color: "#fff" }}>Explore Services</a>
        </motion.div>
      </motion.section>

      {/* ── FOOTER ── */}
      <footer style={{ ...styles.footer, background: theme === "dark" ? "#0a0a0a" : p.cardBg, borderTopColor: p.border }}>
        <div style={styles.footerGrid}>
          <div style={styles.footerBrandCol}>
            <div style={styles.footerLogo}>
              <span style={{ ...styles.logoMark, color: p.primary }}>◈</span>
              <span style={{ ...styles.footerBrandName, color: p.text }}>Servify</span>
            </div>
            <p style={{ ...styles.footerTagline, color: p.textMuted }}>The premium platform for home services.</p>
          </div>
          <div style={styles.footerLinksCol}>
            <h4 style={{ ...styles.footerColTitle, color: p.primary }}>Platform</h4>
            <a href="#" style={{ ...styles.footerLink, color: p.textMuted }}>Browse Services</a>
            <a href="#" style={{ ...styles.footerLink, color: p.textMuted }}>For Providers</a>
            <a href="#" style={{ ...styles.footerLink, color: p.textMuted }}>Cities</a>
          </div>
          <div style={styles.footerLinksCol}>
            <h4 style={{ ...styles.footerColTitle, color: p.primary }}>Company</h4>
            <a href="#" style={{ ...styles.footerLink, color: p.textMuted }}>About Us</a>
            <a href="#" style={{ ...styles.footerLink, color: p.textMuted }}>Careers</a>
            <a href="#" style={{ ...styles.footerLink, color: p.textMuted }}>Contact</a>
          </div>
          <div style={styles.footerLinksCol}>
            <h4 style={{ ...styles.footerColTitle, color: p.primary }}>Support</h4>
            <a href="#" style={{ ...styles.footerLink, color: p.textMuted }}>Help Center</a>
            <a href="#" style={{ ...styles.footerLink, color: p.textMuted }}>Safety</a>
            <a href="#" style={{ ...styles.footerLink, color: p.textMuted }}>Terms of Service</a>
          </div>
        </div>
        <div style={{ ...styles.footerBottom, borderTopColor: p.border }}>
          <span style={{ ...styles.footerText, color: p.textMuted }}>© 2026 Servify Inc. All rights reserved.</span>
          <div style={{ ...styles.footerSocials, color: p.textMuted }}>
            <span>Twitter</span>
            <span>Instagram</span>
            <span>LinkedIn</span>
          </div>
        </div>
      </footer>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => { setIsBookingModalOpen(false); setSelectedService(null); }}
        theme={theme}
        title="Book a Service"
      >
        <BookingFlow
          initialServiceId={selectedService?.id_service}
          initialServiceName={selectedService?.name}
          theme={theme}
          onComplete={(booking) => {
            console.log("Booking completed:", booking);
          }}
          onClose={() => { setIsBookingModalOpen(false); setSelectedService(null); }}
        />
      </BookingModal>

      <style>{`
        @import url('https:/fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { transition: background 0.3s ease; }
        a { text-decoration: none; color: inherit; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #E0E7E7; border-radius: 10px; }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", position: "relative", transition: "background 0.3s ease, color 0.3s ease" },
  bgGrid: { position: "absolute", inset: 0, backgroundSize: "40px 40px", zIndex: 0, pointerEvents: "none" },

  // ── HERO ──
  hero: { position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "140px 48px 100px", textAlign: "center" },
  statusPill: { display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", border: "1px solid", borderRadius: 999, fontSize: 13, marginBottom: 40 },
  statusDot: { width: 7, height: 7, borderRadius: "50%", animation: "pulse 2s infinite" },
  headline: { fontFamily: "'Instrument Serif', serif", fontSize: "clamp(52px, 8vw, 92px)", lineHeight: 1.0, letterSpacing: "-2px", marginBottom: 28 },
  headlineAccent: { display: "inline-block", transition: "opacity 0.3s ease, transform 0.3s ease" },
  subline: { fontSize: 18, lineHeight: 1.7, marginBottom: 48, maxWidth: 600, margin: "0 auto 48px" },
  searchRow: { display: "flex", maxWidth: 640, margin: "0 auto", border: "1px solid", borderRadius: 14, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" },
  searchWrap: { flex: 1, display: "flex", alignItems: "center", padding: "0 22px", gap: 12 },
  searchIcon: { fontSize: 20 },
  searchInput: { flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 16, padding: "20px 0", fontFamily: "'DM Sans', sans-serif" },
  searchBtn: { padding: "20px 32px", color: "#FFFFFF", border: "none", fontSize: 15, fontWeight: 500, cursor: "pointer" },

  statsSection: { display: "flex", justifyContent: "center", gap: 60, padding: "60px 48px", borderTop: "1px solid", borderBottom: "1px solid", maxWidth: 1040, margin: "0 auto" },
  statItem: { textAlign: "center" },
  statValue: { fontSize: 32, fontFamily: "'Instrument Serif', serif" },
  statLabel: { fontSize: 13, marginTop: 4 },

  section: { position: "relative", zIndex: 1, maxWidth: 1040, margin: "0 auto", padding: "80px 48px" },
  sectionHeader: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 32, borderBottom: "1px solid", paddingBottom: 16 },
  sectionTitle: { fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400 },
  sectionLink: { fontSize: 13, fontWeight: 500 },

  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 },
  stepCard: { padding: "32px", border: "1px solid", borderRadius: 16, transition: "all 0.3s" },
  stepNumber: { fontSize: 12, marginBottom: 16, fontWeight: 600, opacity: 0.8 },
  stepTitle: { fontSize: 18, fontWeight: 500, marginBottom: 10 },
  stepDesc: { fontSize: 14, lineHeight: 1.6 },

  categoryGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  categoryCard: { display: "block", padding: "28px", border: "1px solid", borderRadius: 16, transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" },
  catIcon: { fontSize: 24, marginBottom: 16 },
  catName: { fontSize: 17, fontWeight: 500, marginBottom: 6 },
  catDesc: { fontSize: 14, marginBottom: 16 },
  catCount: { fontSize: 12, fontWeight: 500 },

  cityGrid: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 },
  cityItem: { fontSize: 14, cursor: "pointer", transition: "color 0.2s" },

  // ── PROVIDER CARDS (rich layout from doc1) ──
  providerGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 },
  providerCard: { display: "flex", flexDirection: "column", padding: "24px", border: "1px solid", borderRadius: 24, transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)", overflow: "hidden" },
  providerCardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  providerImg: { width: 64, height: 64, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700 },
  providerBadgeRow: { display: "flex", gap: 8 },
  availBadge: { padding: "4px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" },
  providerInfo: {},
  providerName: { fontSize: 20, fontWeight: 700, marginBottom: 2 },
  providerService: { fontSize: 14, fontWeight: 600, marginBottom: 12 },
  providerMeta: { display: "flex", gap: 12, fontSize: 12, fontWeight: 500, marginBottom: 16 },
  providerBio: { fontSize: 13, lineHeight: 1.6, marginBottom: 20, display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 },
  tag: { padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 600 },
  providerActions: { display: "flex", gap: 12, marginTop: "auto" },
  actionBtnPrimary: { flex: 2, padding: "12px", borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" },
  actionBtnSecondary: { flex: 1, padding: "12px", borderRadius: 12, border: "1px solid", background: "transparent", fontWeight: 700, fontSize: 14, cursor: "pointer" },

  appPromoCard: { display: "flex", alignItems: "center", padding: "60px", border: "1px solid", borderRadius: 24, gap: 40 },
  appPromoText: { flex: 1 },
  appPromoTitle: { fontSize: 32, fontFamily: "'Instrument Serif', serif", marginBottom: 16 },
  appPromoSub: { marginBottom: 32, lineHeight: 1.6 },
  appBtns: { display: "flex", gap: 12 },
  appBtn: { padding: "12px 24px", border: "1px solid", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" },
  appPromoPhone: { flex: 1, display: "flex", justifyContent: "center" },
  phoneMockup: { width: 160, height: 320, border: "6px solid", borderRadius: 24, position: "relative" },
  phoneInner: { width: "80%", height: 4, borderRadius: 2, margin: "12px auto" },

  testimonialContainer: { display: "flex", gap: 24, padding: "20px 0" },
  testimonialCard: { flex: 1, padding: "40px", borderLeft: "3px solid", borderRadius: "0 16px 16px 0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" },
  testimonialText: { fontSize: 18, fontStyle: "italic", marginBottom: 20, lineHeight: 1.7 },
  testimonialAuthor: { fontSize: 15, fontWeight: 600 },

  bookingList: { display: "flex", flexDirection: "column", gap: 8 },
  bookingRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", border: "1px solid", borderRadius: 12, transition: "all 0.3s" },
  bookingLeft: { display: "flex", alignItems: "center", gap: 32 },
  bookingRef: { fontSize: 12, fontFamily: "monospace" },
  bookingDate: { fontSize: 13 },
  bookingRight: { display: "flex", alignItems: "center", gap: 20 },
  statusBadge: { fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 999, textTransform: "uppercase" },

  faqList: { display: "flex", flexDirection: "column", gap: 12 },
  faqItem: { borderBottom: "1px solid", padding: "10px 0" },
  faqHeader: { display: "flex", justifyContent: "space-between", padding: "20px 0", cursor: "pointer" },
  faqQuestion: { fontSize: 17, fontWeight: 500 },
  faqAnswer: { padding: "0 0 24px", lineHeight: 1.7, fontSize: 15 },
  faqToggle: { fontSize: 20, transition: "transform 0.3s" },

  newsletterCard: { padding: "60px", border: "1px solid", borderRadius: 24, textAlign: "center" },
  newsletterTitle: { fontSize: 28, fontFamily: "'Instrument Serif', serif", marginBottom: 12 },
  newsletterSub: { marginBottom: 32 },
  newsletterForm: { display: "flex", maxWidth: 400, margin: "0 auto", gap: 12 },
  newsletterInput: { flex: 1, border: "1px solid", borderRadius: 8, padding: "14px 20px", outline: "none" },
  newsletterBtn: { color: "#FFFFFF", border: "none", padding: "0 24px", borderRadius: 8, fontWeight: 500, cursor: "pointer" },

  ctaSection: { padding: "120px 48px", textAlign: "center" },
  ctaContent: { maxWidth: 840, margin: "0 auto", padding: "80px 40px", borderRadius: 32, border: "1px solid" },
  ctaTitle: { fontFamily: "'Instrument Serif', serif", fontSize: 48, marginBottom: 20 },
  ctaSub: { fontSize: 18, marginBottom: 40 },
  ctaBtn: { display: "inline-block", padding: "18px 48px", borderRadius: 10, fontWeight: 500 },

  footer: { padding: "100px 48px 60px", borderTop: "1px solid" },
  footerGrid: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 60, maxWidth: 1040, margin: "0 auto" },
  footerLogo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 20 },
  footerBrandCol: {},
  footerLinksCol: {},
  footerBrandName: { fontSize: 20, fontWeight: 600 },
  footerTagline: { fontSize: 14, lineHeight: 1.6 },
  footerColTitle: { fontSize: 14, fontWeight: 600, marginBottom: 24, textTransform: "uppercase", letterSpacing: "1px" },
  footerLink: { display: "block", fontSize: 14, marginBottom: 12, transition: "color 0.2s" },
  footerBottom: { marginTop: 80, paddingTop: 32, borderTop: "1px solid", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1040, margin: "80px auto 0" },
  footerText: { fontSize: 13 },
  footerSocials: { display: "flex", gap: 24, fontSize: 13 },
};












