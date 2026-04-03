-- Database Schema for Family Care Application

-- User account table for authentication and roles
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'client', 'provider')),
  phone_number VARCHAR(20),
  address TEXT,
  profile_picture TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Separate account table if still needed, but can be linked 1:1 with user
CREATE TABLE account (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES "user"(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE report (
  id SERIAL PRIMARY KEY,
  reason TEXT,
  description TEXT,
  account_id INT REFERENCES account(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  overall_rating NUMERIC(3,2),
  punctuality NUMERIC(3,2),
  comment TEXT,
  account_id INT REFERENCES account(id) ON DELETE CASCADE,
  booking_id INT, -- To link feedback to a specific booking
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE client (
  id_client SERIAL PRIMARY KEY,
  user_id INT REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE authorized_person (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100), -- Missing in original SQL
  phone_number VARCHAR(20),
  national_id VARCHAR(50)
);

-- Link table for clients and their authorized persons
CREATE TABLE client_authorized_person (
  client_id INT REFERENCES client(id_client) ON DELETE CASCADE,
  authorized_person_id INT REFERENCES authorized_person(id) ON DELETE CASCADE,
  PRIMARY KEY (client_id, authorized_person_id)
);

CREATE TABLE dependant (
  id_dependant SERIAL PRIMARY KEY,
  name VARCHAR(100), -- Missing
  date_of_birth DATE, -- Missing
  relationship VARCHAR(50), -- Missing
  client_id_fk INT REFERENCES client(id_client) ON DELETE CASCADE
);

CREATE TABLE medical_info (
  id SERIAL PRIMARY KEY,
  blood_type VARCHAR(10),
  allergies TEXT,
  medications TEXT,
  conditions TEXT,
  dependent_id INT REFERENCES dependant(id_dependant) ON DELETE CASCADE
);

CREATE TABLE dependant_file (
  id SERIAL PRIMARY KEY,
  link TEXT,
  type VARCHAR(50),
  dependant_id INT REFERENCES dependant(id_dependant) ON DELETE CASCADE
);

CREATE TABLE service_category (
  id_category SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  target_demographics TEXT,
  policies TEXT,
  icon TEXT
);

CREATE TABLE service (
  id_service SERIAL PRIMARY KEY,
  category_id_fk INT REFERENCES service_category(id_category) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2)
);

CREATE TABLE service_provider (
  id SERIAL PRIMARY KEY,
  bio TEXT,
  years_of_exp INT DEFAULT 0,
  work_outside_city BOOLEAN DEFAULT FALSE,
  work_late BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  price_per_hour NUMERIC(10,2),
  user_id INT REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE service_provider_service (
  service_provider_id INT REFERENCES service_provider(id) ON DELETE CASCADE,
  service_id INT REFERENCES service(id_service) ON DELETE CASCADE,
  PRIMARY KEY (service_provider_id, service_id)
);

CREATE TABLE provider_availability (
  id SERIAL PRIMARY KEY,
  service_provider_id INT REFERENCES service_provider(id) ON DELETE CASCADE,
  day_of_week VARCHAR(10), -- e.g., 'Mon', 'Tue'
  start_time TIME,
  end_time TIME
);

CREATE TABLE document (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  link TEXT,
  type VARCHAR(50),
  service_provider_id INT REFERENCES service_provider(id) ON DELETE CASCADE
);

CREATE TABLE booking_request (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTERVAL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  client_id_fk INT REFERENCES client(id_client) ON DELETE CASCADE,
  service_provider_id_fk INT REFERENCES service_provider(id) ON DELETE CASCADE,
  service_id INT REFERENCES service(id_service),
  document_id INT REFERENCES document(id)
);

CREATE TABLE booking (
  id_booking SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time TIME NOT NULL,
  address TEXT,
  status VARCHAR(20) DEFAULT 'confirmed', -- 'confirmed', 'completed', 'cancelled'
  client_id INT REFERENCES client(id_client) ON DELETE CASCADE,
  service_provider_id INT REFERENCES service_provider(id) ON DELETE CASCADE,
  service_id INT REFERENCES service(id_service)
);

CREATE TABLE payment (
  id_payment SERIAL PRIMARY KEY,
  booking_id INT REFERENCES booking(id_booking) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'DZD',
  status VARCHAR(20) DEFAULT 'unpaid', -- 'unpaid', 'paid', 'refunded'
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE information_progress (
  id SERIAL PRIMARY KEY,
  booking_id_fk INT REFERENCES booking(id_booking) ON DELETE CASCADE,
  status VARCHAR(50), -- 'not_started', 'in_progress', 'completed'
  start_time TIMESTAMP,
  end_time TIMESTAMP
);

CREATE TABLE booking_file (
  id SERIAL PRIMARY KEY,
  booking_id INT REFERENCES booking(id_booking) ON DELETE CASCADE,
  attachment TEXT,
  type VARCHAR(50)
);

-- Notifications table
CREATE TABLE notification (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES "user"(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20), -- 'booking', 'message', 'system'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
