-- Al-Xorazmiy University Admissions Platform
-- Database Setup Script
-- Run: psql -U postgres -d admissions -f scripts/setup-db.sql

-- Create database (run separately if needed):
-- CREATE DATABASE admissions;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'applicant' CHECK (role IN ('applicant', 'admin', 'superadmin')),
  phone VARCHAR(20),
  program VARCHAR(50),
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'pending_review', 'incomplete_document', 'approved_to_attend_exam',
    'passed_with_exemption', 'application_approved'
  )),
  education_type VARCHAR(50),
  surname VARCHAR(100),
  given_name VARCHAR(100),
  gender VARCHAR(20),
  citizenship VARCHAR(100),
  card_number VARCHAR(50),
  date_of_birth DATE,
  date_of_issue DATE,
  date_of_expiry DATE,
  personal_number VARCHAR(50),
  place_of_birth VARCHAR(200),
  passport_image_path VARCHAR(500),
  attestat_pdf_path VARCHAR(500),
  language_cert_type VARCHAR(20),
  language_cert_pdf_path VARCHAR(500),
  language_cert_score VARCHAR(20),
  language_cert_date DATE,
  social_registry BOOLEAN DEFAULT FALSE,
  social_registry_pdf_path VARCHAR(500),
  other_achievements_text TEXT,
  other_achievements_pdf_path VARCHAR(500),
  assigned_admin_id UUID REFERENCES users(id),
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- DOCUMENTS TABLE (file metadata)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  doc_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  sender_role VARCHAR(20) NOT NULL,
  message TEXT,
  file_path VARCHAR(500),
  file_name VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) DEFAULT 'general',
  changed_fields JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ADMIN LOGS TABLE (Audit)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id),
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_assigned_admin ON applications(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_application ON chat_messages(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
