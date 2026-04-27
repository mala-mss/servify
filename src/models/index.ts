// Core User Models
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profile_picture?: string;
  role: 'client' | 'provider' | 'admin' | 'authorized';
  created_at?: string;
  updated_at?: string;
}

export interface Account {
  email: string;
  password: string;
  status: 'active' | 'inactive' | 'suspended';
  warning_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface Admin {
  id: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceProvider {
  id: string;
  user_id: string;
  bio?: string;
  experience_years?: number;
  rating?: number;
  price_per_hour?: number;
  created_at?: string;
  updated_at?: string;
}

// Service Models
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category_id_fk: string;
  category?: ServiceCategory;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceProviderService {
  service_provider_id: string;
  service_id: string;
  custom_price?: number;
  created_at?: string;
}

// Booking Models
export interface BookingRequest {
  id: string;
  client_id_fk: string;
  service_provider_id_fk: string;
  service_id: string;
  document_id?: string;
  requested_date: string;
  requested_time: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: string;
  client_id: string;
  service_provider_id: string;
  service_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  total_price: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Payment Models
export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transaction_reference?: string;
  created_at?: string;
  updated_at?: string;
}

// Dependant Models
export interface Dependant {
  id: string;
  client_id_fk: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  relationship: string;
  created_at?: string;
  updated_at?: string;
}

export interface MedicalInfo {
  id: string;
  dependent_id: string;
  blood_type?: string;
  allergies?: string;
  medical_conditions?: string;
  medications?: string;
  emergency_contact?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthorizedPerson {
  id: string;
  client_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  relationship: string;
  created_at?: string;
  updated_at?: string;
}

// Task Models
export interface Task {
  id: string;
  client_id: string;
  service_provider_id: string;
  booking_id?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface File {
  id: string;
  task_id: string;
  name: string;
  path: string;
  mime_type?: string;
  size?: number;
  created_at?: string;
}

// Feedback Models
export interface Feedback {
  id: string;
  booking_id: string;
  client_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
  updated_at?: string;
}

// Notification Models
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'task' | 'system';
  is_read: boolean;
  created_at?: string;
}

// Document Models
export interface Document {
  id: string;
  service_provider_id?: string;
  client_id?: string;
  name: string;
  path: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface Specification {
  id: string;
  document_id: string;
  key: string;
  value: string;
  created_at?: string;
}

// Availability Models
export interface ProviderAvailability {
  id: string;
  service_provider_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at?: string;
  updated_at?: string;
}

// Report Models
export interface Report {
  id: string;
  reporter_email: string;
  reported_email: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at?: string;
  updated_at?: string;
}

// Inscription Request Models
export interface InscriptionRequest {
  id: string;
  service_provider_id: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}











