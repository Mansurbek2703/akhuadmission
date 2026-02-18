export type UserRole = "applicant" | "admin" | "superadmin";

export type ApplicationStatus =
  | "submitted"
  | "pending_review"
  | "incomplete_document"
  | "approved_to_attend_exam"
  | "passed_with_exemption"
  | "application_approved";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  pending_review: "Pending Review",
  incomplete_document: "Incomplete Document",
  approved_to_attend_exam: "Approved to Attend Exam",
  passed_with_exemption: "Passed with Exemption",
  application_approved: "Application Approved",
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
  | "specialized_agency"
  | "public_private"
  | "art_schools";

export const EDUCATION_TYPE_LABELS: Record<EducationType, string> = {
  specialized_agency:
    "Specialized schools under the Agency of specialized educational institutions",
  public_private:
    "Public or Private Schools / Academic Lyceums / Colleges / Technikums / Universities / Others",
  art_schools:
    "Art schools under the Agency of specialized educational institutions",
};

export type LanguageCertType =
  | "ielts"
  | "toefl"
  | "duolingo"
  | "cambridge"
  | "pearson"
  | "other_lang";

export const LANGUAGE_CERT_LABELS: Record<LanguageCertType, string> = {
  ielts: "IELTS",
  toefl: "TOEFL iBT",
  duolingo: "Duolingo English Test",
  cambridge: "Cambridge (FCE/CAE/CPE)",
  pearson: "Pearson PTE Academic",
  other_lang: "Other",
};

export type Citizenship =
  | "uzbekistan"
  | "kazakhstan"
  | "tajikistan"
  | "kyrgyzstan"
  | "turkmenistan"
  | "other";

export const CITIZENSHIP_LABELS: Record<Citizenship, string> = {
  uzbekistan: "Uzbekistan",
  kazakhstan: "Kazakhstan",
  tajikistan: "Tajikistan",
  kyrgyzstan: "Kyrgyzstan",
  turkmenistan: "Turkmenistan",
  other: "Other",
};

export const UZBEKISTAN_REGIONS = [
  "Tashkent City",
  "Tashkent Region",
  "Samarkand Region",
  "Bukhara Region",
  "Fergana Region",
  "Andijan Region",
  "Namangan Region",
  "Kashkadarya Region",
  "Surkhandarya Region",
  "Khorezm Region",
  "Navoi Region",
  "Jizzakh Region",
  "Syrdarya Region",
  "Republic of Karakalpakstan",
] as const;

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
  unikal_id?: number;
  status: ApplicationStatus;
  // Personal info
  surname?: string;
  given_name?: string;
  middle_name?: string;
  gender?: string;
  citizenship?: string;
  citizenship_other?: string;
  card_number?: string;
  date_of_birth?: string;
  date_of_issue?: string;
  date_of_expiry?: string;
  personal_number?: string;
  place_of_birth?: string;
  current_address?: string;
  // Structured address fields
  birth_country?: string;
  birth_region?: string;
  birth_district?: string;
  birth_street?: string;
  address_country?: string;
  address_region?: string;
  address_district?: string;
  address_street?: string;
  passport_image_path?: string;
  // Contact
  personal_phone?: string;
  parent_phone?: string;
  friend_phone?: string;
  // Education
  education_type?: EducationType;
  institution_type?: string;
  institution_location?: string;
  institution_name?: string;
  attestat_pdf_path?: string;
  // Language certificates
  language_cert_type?: LanguageCertType;
  language_cert_pdf_path?: string;
  language_cert_score?: string;
  language_cert_id?: string;
  language_cert_date?: string;
  // SAT
  sat_score?: string;
  sat_id?: string;
  sat_pdf_path?: string;
  // CEFR
  cefr_score?: string;
  cefr_id?: string;
  cefr_pdf_path?: string;
  // Social protection
  social_protection?: boolean;
  social_protection_pdf_path?: string;
  social_registry: boolean;
  social_registry_pdf_path?: string;
  // Olympiad
  other_achievements_text?: string;
  other_achievements_pdf_path?: string;
  // Submit
  hear_about?: string;
  sibling_study?: string;
  confirm_info_correct?: boolean;
  confirm_final_year?: boolean;
  confirm_fake_disqualify?: boolean;
  confirm_fake_cancel?: boolean;
  oferta_agreed?: boolean;
  // Verification (admin)
  language_cert_verified?: boolean;
  language_cert_invalid?: boolean;
  sat_verified?: boolean;
  sat_invalid?: boolean;
  cefr_verified?: boolean;
  cefr_invalid?: boolean;
  attestat_verified?: boolean;
  attestat_invalid?: boolean;
  // Admin
  assigned_admin_id?: string;
  assigned_admin_email?: string;
  assigned_admin_name?: string;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_phone?: string;
  user_program?: Program;
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

export type UnreadChatMap = Record<string, number>;

export interface AdminLog {
  id: string;
  admin_id: string;
  application_id: string;
  action: string;
  details?: string;
  created_at: string;
  admin_email?: string;
}
