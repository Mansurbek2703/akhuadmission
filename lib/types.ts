export type UserRole = "applicant" | "admin" | "superadmin";

export type ApplicationStatus =
  | "pending_review"
  | "incomplete_document"
  | "approved_to_attend_exam"
  | "passed_with_exemption"
  | "application_approved";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending_review: "Pending Review",
  incomplete_document: "Incomplete Document",
  approved_to_attend_exam: "Approved to Attend Exam",
  passed_with_exemption: "Passed with Exemption",
  application_approved: "Application is Approved",
};

export type Program =
  | "software_engineering"
  | "artificial_intelligence"
  | "drone_technologies"
  | "cybersecurity"
  | "applied_mathematics";

export const PROGRAM_LABELS: Record<Program, string> = {
  software_engineering: "Software Engineering",
  artificial_intelligence: "Artificial Intelligence",
  drone_technologies: "Engineering of Drone Technologies",
  cybersecurity: "Cybersecurity",
  applied_mathematics: "Applied Mathematics",
};

export type EducationType =
  | "general_school"
  | "specialized_school"
  | "presidential_school";

export const EDUCATION_TYPE_LABELS: Record<EducationType, string> = {
  general_school: "General school or college",
  specialized_school: "Specialized or creative school",
  presidential_school: "Presidential school",
};

export type LanguageCertType = "ielts" | "sat" | "national_cefr";

export const LANGUAGE_CERT_LABELS: Record<LanguageCertType, string> = {
  ielts: "IELTS",
  sat: "SAT",
  national_cefr: "National CEFR",
};

export interface User {
  id: string;
  email: string;
  role: UserRole;
  program?: Program;
  email_verified: boolean;
  created_at: string;
  locked_until?: string;
  failed_login_attempts: number;
}

export interface Application {
  id: string;
  user_id: string;
  status: ApplicationStatus;
  education_type?: EducationType;
  surname?: string;
  given_name?: string;
  gender?: string;
  citizenship?: string;
  card_number?: string;
  date_of_birth?: string;
  date_of_issue?: string;
  date_of_expiry?: string;
  personal_number?: string;
  place_of_birth?: string;
  passport_image_path?: string;
  attestat_pdf_path?: string;
  language_cert_type?: LanguageCertType;
  language_cert_pdf_path?: string;
  language_cert_score?: string;
  language_cert_date?: string;
  social_registry: boolean;
  social_registry_pdf_path?: string;
  assigned_admin_id?: string;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_program?: Program;
  assigned_admin_email?: string;
}

export interface ChatMessage {
  id: string;
  application_id: string;
  sender_id: string;
  sender_role: UserRole;
  message?: string;
  file_path?: string;
  file_name?: string;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  application_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  application_id: string;
  action: string;
  details?: string;
  created_at: string;
  admin_email?: string;
}
