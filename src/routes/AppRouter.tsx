import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRedirect from './RoleRedirect';
import { useAuth } from '../context/AuthContext';
// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Client Pages
import Home from '../pages/client/Home';
import BrowseServices from '../pages/client/BrowseServices';
import ServiceDetails from '../pages/client/ServiceDetails'; 
import BookingRequest from '../pages/client/BookingRequest';
import BookingConfirm from '../pages/client/BookingConfirm';
import MyBooking from '../pages/client/MyBooking';
import BookingDetail from '../pages/client/BookingDetail';
import BookingTracker from '../pages/client/BookingTracker';
import Checkout from '../pages/client/Checkout';
import PaymentSuccess from '../pages/client/PaymentSuccess';
import LeaveFeedback from '../pages/client/LeaveFeedback';
import MyDependants from '../pages/client/MyDependants';
import DependantsDetail from '../pages/client/DependantsDetail';
import ClientProfile from '../pages/client/Profile';
import ClientNotification from '../pages/client/Notification';

// Provider Pages
import ProviderLayout from '../pages/provider/ProviderLayout';
import ProviderDashboard from '../pages/provider/Dashboard';
import IncomingRequests from '../pages/provider/IncomingRequests';
import MyJobs from '../pages/provider/MyJobs';
import JobDetail from '../pages/provider/JobDetail';
import MyServices from '../pages/provider/MyServices';
import AddService from '../pages/provider/AddService';
import EditService from '../pages/provider/EditService';
import Schedule from '../pages/provider/Schedule';
import Earning from '../pages/provider/Earning';
import MyDocuments from '../pages/provider/MyDocuments';
import Reviews from '../pages/provider/Reviews';
import ProviderProfile from '../pages/provider/Profile';
import ProviderNotifications from '../pages/provider/Notifications';

// Admin Pages
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import UserDetail from '../pages/admin/UserDetail';
import ManageBookings from '../pages/admin/ManageBookings';
import AdminBookingDetail from '../pages/admin/BookingDetail';
import ManageServices from '../pages/admin/ManageServices';
import ManageCategories from '../pages/admin/ManageCategories';
import Reports from '../pages/admin/Reports';
import ReportDetail from '../pages/admin/ReportDetail';
import Analytics from '../pages/admin/Analytics';
import Settings from '../pages/admin/Settings';

// Authorized Pages
import PendingApprovals from '../pages/authorized/PendingApprovals';
import ProviderReview from '../pages/authorized/ProviderReview';
import ApprovalHistory from '../pages/authorized/ApprovalHistory';

// Family Care Pages
import Dashboard from '../pages/Dashboard';
import Booking from '../pages/Booking';

import ClientNavbar from '../components/layout/ClientNavbar';
import axiosInstance from '../api/axiosInstance';

const ClientLayout: React.FC = () => {
  const [theme, setTheme] = React.useState("dark");
  
  const handleSearch = async (query: string) => {
    // If we are not on home, we might want to redirect to home with query or just log
    console.log("Global search:", query);
    if (window.location.pathname !== '/client/home') {
        window.location.href = `/client/home?search=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div style={{ background: theme === 'dark' ? '#0e0e0e' : '#F8FBFB', minHeight: '100vh' }}>
      <ClientNavbar 
        theme={theme} 
        onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        onSearch={handleSearch}
      />
      <Outlet context={{ theme }} />
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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

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
          <Route path="/client/services/:id" element={<ServiceDetails />} />
          <Route path="/client/booking-request" element={<BookingRequest />} />
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

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/approvals" element={<PendingApprovals />} />
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
      </Route>

      {/* Protected Authorized Routes */}
      <Route element={<ProtectedRoute allowedRoles={['authorized']} />}>
        <Route path="/authorized/approvals" element={<PendingApprovals />} />
        <Route path="/authorized/provider-review/:id" element={<ProviderReview />} />
        <Route path="/authorized/approval-history" element={<ApprovalHistory />} />
      </Route>

      {/* Root & Fallback */}
      <Route path="/" element={user ? <RoleRedirect /> : <Login />} />
      <Route path="/unauthorized" element={<div className="p-8 text-center">Unauthorized Access</div>} />
      <Route path="*" element={<div className="p-8 text-center">404 - Not Found</div>} />
    </Routes>
  );
};

export default AppRouter;
