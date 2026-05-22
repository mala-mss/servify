
export interface User {
  IdU: number;
  fname: string;
  lname: string;
  address?: string;
  phone_number?: string;
  profile_picture?: string;
  email: string;
}

export interface Account {
  email: string;
  password: string;
  status?: string;
  nbr_warning?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Admin {
  idU_A: number;
}

export interface Client {
  idU_CL: number;
}

export interface ServiceProvider {
  idU_SP: number;
  bio?: string;
  years_of_exp?: number;
  work_outside_city?: boolean;
  work_late?: boolean;
  rating?: number;
  review_count?: number;
  price_per_hour?: number;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
}

export interface InscriptionRequest {
  id_R: number;
  status?: string;
  submitted_at?: Date;
  idU_A?: number;
}

export interface DocCv {
  id: number;
  type?: string;
  link?: string;
  id_R?: number;
  idU_SP?: number;
}

export interface AuthorizedPerson {
  idU_AP: number;
  name?: string;
  relationship?: string;
  idU_CL?: number;
}

export interface Dependant {
  id_dep: number;
  name?: string;
  date_of_birth?: string;
  relationship?: string;
  idU_CL?: number;
}

export interface ServiceCategory {
  id_C: number;
  name: string;
  target_demographics?: string;
  policies?: string;
  icon?: string;
}

export interface Service {
  id_S: number;
  name: string;
  description?: string;
  base_price?: number;
  id_C?: number;
}

export interface Providing {
  idU_SP: number;
  id_S: number;
}

export interface DocumentRequest {
  id_DOC: number;
  name?: string;
  link?: string;
  type?: string;
  description?: string;
  idU_CL?: number;
  idU_SP?: number;
  date?: string;
}

export interface SpecificationsMedicalStat {
  id_SPEC: number;
  type?: string;
  url?: string;
  description?: string;
  id_dep?: number;
}

export interface BookingRequest {
  idU_CL: number;
  idU_SP: number;
  date: string;
  time: string;
  duration?: string;
  status?: string;
  id_S?: number;
}

export interface Booking {
  idU_CL: number;
  idU_SP: number;
  date: string;
  time: string;
  address?: string;
  status?: string;
  id_S?: number;
}

export interface Concerns {
  id_dep: number;
  idU_CL: number;
  idU_SP: number;
  date: string;
  time: string;
}

export interface Payment {
  id_P: number;
  amount: number;
  currency?: string;
  status?: string;
  payment_method?: string;
  created_at?: Date;
  idU_CL?: number;
  idU_SP?: number;
  date?: string;
  time?: string;
}

export interface Task {
  idT: number;
  name?: string;
  start_time?: string;
  end_time?: string;
  duration?: string;
  status?: string;
  idU_CL?: number;
  idU_SP?: number;
  date?: string;
  time?: string;
}

export interface File {
  idF: number;
  url?: string;
  type?: string;
  idT?: number;
}

export interface Report {
  email1: string;
  email2: string;
  reason?: string;
  description?: string;
  created_at?: Date;
}

export interface Feedback {
  email1: string;
  email2: string;
  overall_rating?: number;
  punctuality?: number;
  comment?: string;
  created_at?: Date;
}

export interface Notification {
  id: number;
  user_id?: number;
  title: string;
  description?: string;
  type?: string;
  is_read?: boolean;
  created_at?: Date;
}
