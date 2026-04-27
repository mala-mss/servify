// src/components/client/BookingFlow.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/controllers/api/axiosInstance";
import { useAuth } from "@/controllers/context/AuthContext";

const PALETTES = {
  dark: {
    primary: "#2FB0BC",
    secondary: "#6BC8B2",
    bg: "#0e0e0e",
    cardBg: "rgba(255,255,255,0.02)",
    text: "#e8e6e0",
    textMuted: "rgba(232,230,224,0.5)",
    border: "rgba(255,255,255,0.06)",
    inputBg: "rgba(255,255,255,0.03)",
    glow: "rgba(47,176,188,0.04)"
  },
  light: {
    primary: "#2FB0BC",
    secondary: "#6BC8B2",
    bg: "#F8FBFB",
    cardBg: "#FFFFFF",
    text: "#2C3E50",
    textMuted: "rgba(44,62,80,0.5)",
    border: "#E0E7E7",
    inputBg: "#F5F5F5",
    glow: "rgba(47,176,188,0.06)"
  }
};

const STEPS = {
  SERVICE_SELECT: 1,
  BOOKING_FORM: 2,
  PROVIDER_SEARCH: 3,
  PROVIDER_SELECT: 4,
  CONFIRMATION: 5
};

export default function BookingFlow({
  initialServiceId,
  initialServiceName,
  theme = "dark",
  onComplete,
  onClose
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const p = PALETTES[theme];

  // Step 1: Service Selection
  const [selectedService, setSelectedService] = useState({
    id: initialServiceId || null,
    name: initialServiceName || ""
  });
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("all");

  // Step 2: Booking Form
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    address: "",
    notes: ""
  });

  // Step 3 & 4: Provider Search & Selection
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Step 5: Validation & Submission
  const [submitting, setSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  // Current step
  const [currentStep, setCurrentStep] = useState(
    initialServiceId ? STEPS.BOOKING_FORM : STEPS.SERVICE_SELECT
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servRes, catRes] = await Promise.all([
          axiosInstance.get('/services'),
          axiosInstance.get('/controllers/services/categories')
        ]);
        setServices(servRes.data.services);
        setCategories([{ id_category: "all", name: "All Services" }, ...catRes.data.categories]);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      }
    };
    fetchData();
  }, []);

  const filteredServices = services.filter(s => {
    const matchesCat = activeCat === "all" || s.category_id_fk === parseInt(activeCat);
    return matchesCat;
  });

  const handleServiceSelect = (service) => {
    setSelectedService({ id: service.id_service, name: service.name });
    setCurrentStep(STEPS.BOOKING_FORM);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setCurrentStep(STEPS.PROVIDER_SEARCH);
    setLoadingProviders(true);

    try {
      const response = await axiosInstance.get('/providers/search', {
        params: { service: selectedService.name }
      });

      if (response.data.success) {
        const mapped = response.data.providers.map((p_item) => ({
          id: p_item.provider_id,
          name: p_item.name,
          service: (p_item.services && p_item.services.length > 0 && p_item.services[0]) || selectedService.name,
          rating: p_item.rating || 0,
          reviews: p_item.review_count || 0,
          location: p_item.location || "Local",
          price: p_item.price_per_hour || 0,
          img: p_item.name ? p_item.name[0] : "P",
          bio: p_item.bio || "",
          years_of_exp: p_item.years_of_exp || 0
        }));
        setProviders(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch providers:", error);
    } finally {
      setLoadingProviders(false);
      setCurrentStep(STEPS.PROVIDER_SELECT);
    }
  };

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    try {
      // Step 6 & 7: Record service request and notify provider
      const response = await axiosInstance.post('/bookings', {
        service_id: selectedService.id,
        provider_id: selectedProvider.id,
        date: formData.date,
        time: formData.time,
        address: formData.address,
        notes: formData.notes,
        status: "pending"
      });

      if (response.data.success) {
        // Step 8: Display success message
        setBookingComplete(true);
        setCurrentStep(STEPS.CONFIRMATION);
        if (onComplete) {
          onComplete(response.data.booking);
        }
      }
    } catch (error) {
      console.error("Failed to create booking:", error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Success Screen
  if (bookingComplete) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ marginBottom: 24 }}
        >
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            background: "rgba(47,176,188,0.1)",
            color: p.primary,
            fontSize: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px"
          }}>✓</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: p.text, marginBottom: 12 }}>
            Request Recorded!
          </h2>
          <p style={{ color: p.textMuted, fontSize: 16, marginBottom: 32 }}>
            Your booking has been sent to <strong style={{ color: p.primary }}>{selectedProvider?.name}</strong>
          </p>
        </motion.div>

        <div style={{
          background: p.cardBg,
          border: `1px solid ${p.border}`,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
          textAlign: "left"
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: p.textMuted, marginBottom: 16, textTransform: "uppercase" }}>
            Booking Details
          </h3>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: p.textMuted }}>Service</span>
              <span style={{ color: p.text, fontWeight: 600 }}>{selectedService.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: p.textMuted }}>Provider</span>
              <span style={{ color: p.text, fontWeight: 600 }}>{selectedProvider?.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: p.textMuted }}>Date</span>
              <span style={{ color: p.text, fontWeight: 600 }}>{formData.date}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: p.textMuted }}>Time</span>
              <span style={{ color: p.text, fontWeight: 600 }}>{formData.time}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: p.textMuted }}>Address</span>
              <span style={{ color: p.text, fontWeight: 600 }}>{formData.address}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => navigate(`/client/provider/${selectedProvider?.id}`)}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 12,
              border: `1px solid ${p.border}`,
              background: "transparent",
              color: p.text,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            View Profile
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 2,
              padding: 16,
              borderRadius: 12,
              border: "none",
              background: p.primary,
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 0 }}>
      {/* Progress Indicator */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "20px 28px",
        borderBottom: `1px solid ${p.border}`,
        background: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"
      }}>
        {[1, 2, 3, 4].map((step) => (
          <div key={step} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              background: currentStep >= step ? p.primary : p.inputBg,
              color: currentStep >= step ? "#fff" : p.textMuted,
              transition: "all 0.3s"
            }}>
              {step}
            </div>
            {step < 4 && (
              <div style={{
                width: 40,
                height: 2,
                background: currentStep > step ? p.primary : p.border
              }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: 28, maxHeight: "60vh", overflowY: "auto" }}>
        <AnimatePresence mode="wait">
          {/* Step 1: Service Selection */}
          {currentStep === STEPS.SERVICE_SELECT && (
            <motion.div
              key="service-select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 style={{ fontSize: 24, fontWeight: 700, color: p.text, marginBottom: 8 }}>
                Select a Service
              </h2>
              <p style={{ color: p.textMuted, marginBottom: 24 }}>
                Choose the service you need from our experts
              </p>

              <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                {categories.map(cat => (
                  <button
                    key={cat.id_category}
                    onClick={() => setActiveCat(cat.id_category.toString())}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 100,
                      border: `1px solid ${p.border}`,
                      background: activeCat === cat.id_category.toString() ? p.primary : "transparent",
                      color: activeCat === cat.id_category.toString() ? "#fff" : p.textMuted,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      transition: "all 0.2s"
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {filteredServices.map(service => (
                  <motion.button
                    key={service.id_service}
                    whileHover={{ y: -4, borderColor: p.primary }}
                    onClick={() => handleServiceSelect(service)}
                    style={{
                      padding: 20,
                      borderRadius: 16,
                      border: `1px solid ${p.border}`,
                      background: p.cardBg,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.3s"
                    }}
                  >
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: p.glow,
                      color: p.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 12
                    }}>
                      {service.name.charAt(0)}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: p.text, marginBottom: 4 }}>
                      {service.name}
                    </h3>
                    <p style={{ fontSize: 12, color: p.textMuted }}>
                      {service.category_name}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Booking Form */}
          {currentStep === STEPS.BOOKING_FORM && (
            <motion.div
              key="booking-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div style={{ marginBottom: 24 }}>
                <button
                  onClick={() => setCurrentStep(STEPS.SERVICE_SELECT)}
                  style={{
                    background: "none",
                    border: "none",
                    color: p.primary,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 16
                  }}
                >
                  ← Change Service
                </button>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: p.text, marginBottom: 8 }}>
                  Booking Details
                </h2>
                <p style={{ color: p.textMuted }}>
                  Service: <strong style={{ color: p.primary }}>{selectedService.name}</strong>
                </p>
              </div>

              <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: p.text, marginBottom: 8 }}>
                    When do you need the service?
                  </label>
                  <div style={{ display: "flex", gap: 12 }}>
                    <input
                      type="date"
                      required
                      style={{
                        flex: 2,
                        padding: 14,
                        borderRadius: 12,
                        border: `1px solid ${p.border}`,
                        background: p.inputBg,
                        color: p.text,
                        fontSize: 14,
                        outline: "none"
                      }}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                    <select
                      required
                      style={{
                        flex: 1,
                        padding: 14,
                        borderRadius: 12,
                        border: `1px solid ${p.border}`,
                        background: p.inputBg,
                        color: p.text,
                        fontSize: 14,
                        outline: "none"
                      }}
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    >
                      <option value="">Time</option>
                      <option value="08:00">08:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="18:00">06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: p.text, marginBottom: 8 }}>
                    Service Address
                  </label>
                  <input
                    type="text"
                    placeholder="Where should the provider come?"
                    required
                    style={{
                      width: "100%",
                      padding: 14,
                      borderRadius: 12,
                      border: `1px solid ${p.border}`,
                      background: p.inputBg,
                      color: p.text,
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: p.text, marginBottom: 8 }}>
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    placeholder="Anything the provider should know?"
                    style={{
                      width: "100%",
                      padding: 14,
                      borderRadius: 12,
                      border: `1px solid ${p.border}`,
                      background: p.inputBg,
                      color: p.text,
                      fontSize: 14,
                      outline: "none",
                      minHeight: 80,
                      resize: "vertical",
                      boxSizing: "border-box"
                    }}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: 16,
                    borderRadius: 12,
                    border: "none",
                    background: p.primary,
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                    marginTop: 8
                  }}
                >
                  Find Available Providers
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 3 & 4: Provider Selection */}
          {currentStep === STEPS.PROVIDER_SELECT && (
            <motion.div
              key="provider-select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: p.text, marginBottom: 8 }}>
                  Available Providers
                </h2>
                <p style={{ color: p.textMuted }}>
                  {loadingProviders ? "Finding experts..." : `Showing providers for ${selectedService.name}`}
                </p>
              </div>

              {loadingProviders ? (
                <div style={{ textAlign: "center", padding: 40, color: p.textMuted }}>
                  Discovering available experts...
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Filter by name..."
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: `1px solid ${p.border}`,
                      background: p.inputBg,
                      color: p.text,
                      fontSize: 14,
                      outline: "none",
                      marginBottom: 16,
                      boxSizing: "border-box"
                    }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                    {filteredProviders.map(provider => (
                      <motion.div
                        key={provider.id}
                        whileHover={{ y: -4, borderColor: selectedProvider?.id === provider.id ? p.primary : p.border }}
                        onClick={() => handleProviderSelect(provider)}
                        style={{
                          padding: 16,
                          borderRadius: 16,
                          border: `1px solid ${p.border}`,
                          background: selectedProvider?.id === provider.id ? p.glow : p.cardBg,
                          cursor: "pointer",
                          transition: "all 0.3s"
                        }}
                      >
                        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                          <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: "rgba(47,176,188,0.1)",
                            color: p.primary,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 18,
                            fontWeight: 700
                          }}>
                            {provider.img}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: p.text }}>
                              {provider.name}
                            </h3>
                            <p style={{ fontSize: 11, color: p.primary }}>
                              {provider.service}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: 12, color: p.textMuted }}>
                            ★ {provider.rating} ({provider.reviews})
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: p.primary }}>
                            ${provider.price}/hr
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {selectedProvider && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        marginTop: 20,
                        padding: 20,
                        borderRadius: 16,
                        border: `1px solid ${p.primary}`,
                        background: p.glow
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: p.text }}>
                            {selectedProvider.name}
                          </h3>
                          <p style={{ fontSize: 13, color: p.textMuted }}>
                            {selectedProvider.service} • ★ {selectedProvider.rating} ({selectedProvider.reviews} reviews)
                          </p>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: p.primary }}>
                          ${selectedProvider.price}/hr
                        </div>
                      </div>
                      <button
                        onClick={handleConfirmBooking}
                        disabled={submitting}
                        style={{
                          width: "100%",
                          padding: 16,
                          borderRadius: 12,
                          border: "none",
                          background: p.primary,
                          color: "#fff",
                          fontSize: 16,
                          fontWeight: 700,
                          cursor: submitting ? "not-allowed" : "pointer",
                          opacity: submitting ? 0.7 : 1
                        }}
                      >
                        {submitting ? "Processing..." : "Confirm & Book"}
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}












