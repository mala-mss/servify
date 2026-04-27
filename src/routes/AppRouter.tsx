import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRedirect from './RoleRedirect';
import { useAuth } from '@/controllers/context/AuthContext';
// Auth Pages
import Login from '@/views/pages/auth/Login';
import Register from '@/views/pages/auth/Register';

// Client Pages
import Home from '@/views/pages/client/Home';
import BrowseServices from '@/views/pages/client/BrowseServices';
import BrowseProviders from '@/views/pages/client/BrowseProviders';
import ServiceDetails from '@/views/pages/client/ServiceDetails';
import BookingRequest from '@/views/pages/client/BookingRequest';
import ProviderDetail from '@/views/pages/client/ProviderDetail';
import AllProviders from '@/views/pages/client/AllProviders';
import BookingConfirm from '@/views/pages/client/BookingConfirm';
import MyBooking from '@/views/pages/client/MyBooking';
import BookingDetail from '@/views/pages/client/BookingDetail';
import BookingTracker from '@/views/pages/client/BookingTracker';
import Checkout from '@/views/pages/client/Checkout';
import PaymentSuccess from '@/views/pages/client/PaymentSuccess';
import LeaveFeedback from '@/views/pages/client/LeaveFeedback';
import MyDependants from '@/views/pages/client/MyDependants';
import DependantsDetail from '@/views/pages/client/DependantsDetail';
import ClientProfile from '@/views/pages/client/Profile';
import ClientNotification from '@/views/pages/client/Notification';

// Provider Pages
import ProviderLayout from '@/views/pages/provider/ProviderLayout';
import ProviderDashboard from '@/views/pages/provider/Dashboard';
import IncomingRequests from '@/views/pages/provider/IncomingRequests';
import MyJobs from '@/views/pages/provider/MyJobs';
import JobDetail from '@/views/pages/provider/JobDetail';
import MyServices from '@/views/pages/provider/MyServices';
import AddService from '@/views/pages/provider/AddService';
import EditService from '@/views/pages/provider/EditService';
import Schedule from '@/views/pages/provider/Schedule';
import Earning from '@/views/pages/provider/Earning';
import MyDocuments from '@/views/pages/provider/MyDocuments';
import Reviews from '@/views/pages/provider/Reviews';
import ProviderProfile from '@/views/pages/provider/Profile';
import ProviderNotifications from '@/views/pages/provider/Notifications';

// Admin Pages
import AdminLayout from '@/views/pages/admin/AdminLayout';
import AdminDashboard from '@/views/pages/admin/Dashboard';
import ManageUsers from '@/views/pages/admin/ManageUsers';
import UserDetail from '@/views/pages/admin/UserDetail';
import ManageBookings from '@/views/pages/admin/ManageBookings';
import AdminBookingDetail from '@/views/pages/admin/BookingDetail';
import ManageServices from '@/views/pages/admin/ManageServices';
import ManageCategories from '@/views/pages/admin/ManageCategories';
import Reports from '@/views/pages/admin/Reports';
import ReportDetail from '@/views/pages/admin/ReportDetail';
import Analytics from '@/views/pages/admin/Analytics';
import Settings from '@/views/pages/admin/Settings';

// Family Care Pages
import Dashboard from '@/views/pages/Dashboard';
import Booking from '@/views/pages/Booking';

import ClientNavbar from '@/views/components/layout/ClientNavbar';
import { useTheme } from '@/controllers/context/ThemeContext';
import axiosInstance from '@/controllers/api/axiosInstance';

const ClientLayout: React.FC = () => {
  const { mode: theme, toggle, palette } = useTheme();

  const handleSearch = async (query: string) => {
    console.log("Global search:", query);
    if (window.location.pathname !== '/client/home') {
        window.location.href = `/client/home?search=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div style={{ background: palette.bg, minHeight: '100vh' }}>
      <ClientNavbar
        theme={theme}
        onThemeToggle={toggle}
        onSearch={(query: string) => handleSearch(query)}
      />
      <Outlet context={{ theme, toggle, palette }} />
    </div>
  );
};

const AppRouter: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Family Care Specific Routes */}
      <Route element={<ProtectedRoute allowedRoles={['client']} />}>
        <Route element={<ClientLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/book" element={<Booking />} />
        </Route>
      </Route>

      {/* Protected Client Routes */}
      <Route element={<ProtectedRoute allowedRoles={['client']} />}>
        <Route element={<ClientLayout />}>
          <Route path="/client/home" element={<Home />} />
          <Route path="/client/browse" element={<BrowseServices />} />
          <Route path="/client/browse-providers" element={<BrowseProviders />} />
          <Route path="/client/providers" element={<AllProviders />} />
          <Route path="/client/services/:id" element={<ServiceDetails />} />
          <Route path="/client/booking-request" element={<BookingRequest />} />
          <Route path="/client/provider/:id" element={<ProviderDetail />} />
          <Route path="/client/booking-confirm" element={<BookingConfirm />} />
          <Route path="/client/my-bookings" element={<MyBooking />} />
          <Route path="/client/bookings/:id" element={<BookingDetail />} />
          <Route path="/client/booking-tracker/:id" element={<BookingTracker />} />
          <Route path="/client/checkout" element={<Checkout />} />
          <Route path="/client/payment-success" element={<PaymentSuccess />} />
          <Route path="/client/leave-feedback/:id" element={<LeaveFeedback />} />
          <Route path="/client/dependants" element={<MyDependants />} />
          <Route path="/client/dependants/:id" element={<DependantsDetail />} />
          <Route path="/client/profile" element={<ClientProfile />} />
          <Route path="/client/notifications" element={<ClientNotification />} />
        </Route>
      </Route>

      {/* Protected Provider Routes */}
      <Route element={<ProtectedRoute allowedRoles={['provider']} />}>
        <Route element={<ProviderLayout />}>
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/provider/incoming-requests" element={<IncomingRequests />} />
          <Route path="/provider/my-jobs" element={<MyJobs />} />
          <Route path="/provider/jobs/:id" element={<JobDetail />} />
          <Route path="/provider/my-services" element={<MyServices />} />
          <Route path="/provider/add-service" element={<AddService />} />
          <Route path="/provider/edit-service/:id" element={<EditService />} />
          <Route path="/provider/schedule" element={<Schedule />} />
          <Route path="/provider/earnings" element={<Earning />} />
          <Route path="/provider/documents" element={<MyDocuments />} />
          <Route path="/provider/reviews" element={<Reviews />} />
          <Route path="/provider/profile" element={<ProviderProfile />} />
          <Route path="/provider/notifications" element={<ProviderNotifications />} />
        </Route>
      </Route>
    {/* Admin Routes - No Auth Required */}
      <Route element={<AdminLayout />}>
  <Route path="/admin/dashboard" element={<AdminDashboard />} />
  <Route path="/admin/users" element={<ManageUsers />} />
  <Route path="/admin/users/:id" element={<UserDetail />} />
  <Route path="/admin/bookings" element={<ManageBookings />} />
  <Route path="/admin/bookings/:id" element={<AdminBookingDetail />} />
  <Route path="/admin/services" element={<ManageServices />} />
  <Route path="/admin/categories" element={<ManageCategories />} />
  <Route path="/admin/reports" element={<Reports />} />
  <Route path="/admin/reports/:id" element={<ReportDetail />} />
  <Route path="/admin/analytics" element={<Analytics />} />
  <Route path="/admin/settings" element={<Settings />} />
</Route>

      {/* Root & Fallback */}
      <Route path="/" element={user ? <RoleRedirect /> : <Login />} />
      <Route path="/unauthorized" element={<div className="p-8 text-center">Unauthorized Access</div>} />
      <Route path="*" element={<div className="p-8 text-center">404 - Not Found</div>} />
    </Routes>
  );
};

export default AppRouter;








