"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { REGIONS_DISTRICTS, REGION_LIST, formatAddress } from "@/lib/address-data";
import {
  Save,
  Upload,
  Loader2,
  User,
  Phone,
  GraduationCap,
  Award,
  ShieldCheck,
  Trophy,
  Send,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  FileText,
  Menu,
  X,
  AlertCircle,
  ClipboardCheck,
} from "lucide-react";
import {
  EDUCATION_TYPE_LABELS,
  LANGUAGE_CERT_LABELS,
  CITIZENSHIP_LABELS,
  UZBEKISTAN_REGIONS,
} from "@/lib/types";
import type {
  Application,
  EducationType,
  LanguageCertType,
  Citizenship,
} from "@/lib/types";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STEPS = [
  { id: "personal", label: "Personal Information", icon: User },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "social", label: "Social Protection", icon: ShieldCheck },
  { id: "olympiad", label: "Olympiad", icon: Trophy },
  { id: "submit", label: "Submit", icon: Send },
  { id: "status", label: "Status", icon: ClipboardCheck },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const STEP_REQUIRED_FIELDS: Record<StepId, string[]> = {
  personal: [
    "surname", "given_name", "gender", "citizenship", "card_number",
    "date_of_birth", "date_of_issue", "date_of_expiry", "personal_number",
    "place_of_birth", "current_address", "passport_image_path",
  ],
  contact: ["personal_phone", "parent_phone", "friend_phone"],
  education: ["education_type", "institution_location", "institution_name"],
  certificates: [],
  social: [],
  olympiad: [],
  submit: [],
  status: [],
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  pending_review: { label: "Pending Review", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  incomplete_document: { label: "Incomplete Document", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  approved_to_attend_exam: { label: "Approved to Attend Exam", color: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" },
  passed_with_exemption: { label: "Passed with Exemption", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  application_approved: { label: "Application Approved", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
};

/* ------------------------------------------------------------------ */
/*  Validation helpers                                                 */
/* ------------------------------------------------------------------ */

const PASSPORT_REGEX = /^[A-Z]{2}\d{7}$/;
const JSHIR_REGEX = /^\d{14}$/;
const MAX_PHONE_LEN = 15; // +XXXXXXXXXXX (up to 14 digits + symbol)

function validatePassport(v: string): string | null {
  if (!v) return "Passport number is required";
  if (!PASSPORT_REGEX.test(v)) return "Format: 2 letters + 7 digits (e.g. AA1234567)";
  return null;
}

function validateJshir(v: string): string | null {
  if (!v) return "JSHIR is required";
  if (!JSHIR_REGEX.test(v)) return "Must be exactly 14 digits";
  return null;
}

function validatePhone(v: string): string | null {
  if (!v) return "Phone is required";
  const digits = v.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 14) return "Enter a valid phone number";
  return null;
}

function validateDateOfBirth(v: string): string | null {
  if (!v) return "Date of birth is required";
  const d = new Date(v);
  const now = new Date();
  const age = now.getFullYear() - d.getFullYear();
  if (age > 60) return "Date of birth cannot be more than 60 years ago";
  if (age < 15) return "You must be at least 15 years old";
  return null;
}

function validateDateOfIssue(v: string): string | null {
  if (!v) return "Date of issue is required";
  const d = new Date(v);
  const now = new Date();
  if (d > now) return "Issue date cannot be in the future";
  const yearsDiff = now.getFullYear() - d.getFullYear();
  if (yearsDiff > 12) return "Issue date cannot be more than 12 years ago";
  return null;
}

function validateDateOfExpiry(v: string): string | null {
  if (!v) return "Date of expiry is required";
  return null;
}

function formatPhone(raw: string): string {
  let v = raw;
  if (!v.startsWith("+")) {
    const digits = v.replace(/\D/g, "");
    v = "+" + digits;
  }
  // remove non-digit except leading +
  const clean = "+" + v.slice(1).replace(/\D/g, "");
  // limit length
  if (clean.length > MAX_PHONE_LEN) return clean.slice(0, MAX_PHONE_LEN);
  return clean;
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ApplicationFormProps {
  application: Application;
  onUpdate: () => void;
  highlightField?: string;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function ApplicationForm({
  application,
  onUpdate,
  highlightField,
}: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState<StepId>("personal");
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ofertaContent, setOfertaContent] = useState<string | null>(null);
  const [ofertaLoading, setOfertaLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [stepSaved, setStepSaved] = useState<Record<StepId, boolean>>({
    personal: false, contact: false, education: false,
    certificates: false, social: false, olympiad: false, submit: false, status: false,
  });
  // Track which certificate sections are open
  const [langCertOpen, setLangCertOpen] = useState(false);
  const [satOpen, setSatOpen] = useState(false);
  const [cefrOpen, setCefrOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Track first load to avoid overwriting stepSaved on every re-fetch
  const isFirstLoad = useRef(true);

  // Initialize
  useEffect(() => {
    if (application) {
      const data: Record<string, unknown> = {};
      const appRecord = application as unknown as Record<string, unknown>;
      for (const key of Object.keys(appRecord)) {
        if (appRecord[key] != null) {
          data[key] = appRecord[key];
        }
      }
      // Merge with existing formData so local edits are not wiped by stale server data
      setFormData((prev) => {
        const merged = { ...prev };
        for (const key of Object.keys(data)) {
          // Server value wins (it's the source of truth after save)
          merged[key] = data[key];
        }
        return merged;
      });

      // Only compute stepSaved on FIRST load — after that, Save button manages it
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        // Open cert sections if data exists
        if (data.language_cert_type) setLangCertOpen(true);
        if (data.sat_score || data.sat_id || data.sat_pdf_path) setSatOpen(true);
        if (data.cefr_score || data.cefr_id || data.cefr_pdf_path) setCefrOpen(true);

        // If user has already submitted (oferta_agreed), mark ALL steps as saved
        if (data.oferta_agreed) {
          setStepSaved({
            personal: true, contact: true, education: true,
            certificates: true, social: true, olympiad: true,
            submit: true, status: true,
          });
          setCurrentStep("status");
          return;
        }

        const newSaved: Record<string, boolean> = {};
        for (const [sid, fields] of Object.entries(STEP_REQUIRED_FIELDS)) {
          if (fields.length === 0) {
            if (sid === "certificates") {
              newSaved[sid] = !!(data.language_cert_type || data.sat_score || data.cefr_score);
            } else if (sid === "social") {
              newSaved[sid] = data.social_protection === true || !!data.social_protection_pdf_path;
            } else if (sid === "olympiad") {
              newSaved[sid] = !!(data.other_achievements_text || data.other_achievements_pdf_path);
            } else if (sid === "submit") {
              newSaved[sid] = !!data.oferta_agreed;
            } else {
              newSaved[sid] = false;
            }
          } else {
            newSaved[sid] = fields.every((f) => data[f] != null && data[f] !== "");
          }
        }
        setStepSaved(newSaved as Record<StepId, boolean>);
      }
    }
  }, [application]);

  // Load oferta
  useEffect(() => {
    if (currentStep === "submit" && !ofertaContent) {
      setOfertaLoading(true);
      fetch("/api/settings/oferta")
        .then((r) => r.json())
        .then((d) => {
          if (d.oferta && d.oferta.setting_value) {
            setOfertaContent(d.oferta.setting_value as string);
          }
        })
        .catch(() => {})
        .finally(() => setOfertaLoading(false));
    }
  }, [currentStep, ofertaContent]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const str = (key: string) => {
    const v = formData[key];
    if (v == null) return "";
    const s = String(v);
    // Dates come as ISO strings from DB - extract YYYY-MM-DD for date inputs
    if (key.startsWith("date_of_") && s.includes("T")) {
      return s.split("T")[0];
    }
    return s;
  };

  const setField = useCallback((key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: null }));
  }, []);

  /* ---- Validate current step ---- */
  const validateStep = useCallback((): boolean => {
    const newErrors: Record<string, string | null> = {};
    let valid = true;

    if (currentStep === "personal") {
      if (!str("surname").trim()) { newErrors.surname = "Required"; valid = false; }
      if (!str("given_name").trim()) { newErrors.given_name = "Required"; valid = false; }
      if (!str("gender")) { newErrors.gender = "Required"; valid = false; }
      if (!str("citizenship")) { newErrors.citizenship = "Required"; valid = false; }
      if (str("citizenship") === "other" && !str("citizenship_other").trim()) {
        newErrors.citizenship_other = "Required"; valid = false;
      }
      const passErr = validatePassport(str("card_number"));
      if (passErr) { newErrors.card_number = passErr; valid = false; }
      const jshirErr = validateJshir(str("personal_number"));
      if (jshirErr) { newErrors.personal_number = jshirErr; valid = false; }
      const dobErr = validateDateOfBirth(str("date_of_birth"));
      if (dobErr) { newErrors.date_of_birth = dobErr; valid = false; }
      const doiErr = validateDateOfIssue(str("date_of_issue"));
      if (doiErr) { newErrors.date_of_issue = doiErr; valid = false; }
      const doeErr = validateDateOfExpiry(str("date_of_expiry"));
      if (doeErr) { newErrors.date_of_expiry = doeErr; valid = false; }
      // Place of birth validation
      if (!str("birth_country")) {
        newErrors.place_of_birth = "Select a country"; valid = false;
      } else if (str("birth_country") === "uzbekistan") {
        if (!str("birth_region")) { newErrors.place_of_birth = "Select a region"; valid = false; }
        else if (!str("birth_district")) { newErrors.place_of_birth = "Select a district"; valid = false; }
        else if (!str("birth_street").trim()) { newErrors.place_of_birth = "Enter street/house"; valid = false; }
      } else if (!str("birth_street").trim()) {
        newErrors.place_of_birth = "Enter full address"; valid = false;
      }
      // Current address validation
      if (!str("address_country")) {
        newErrors.current_address = "Select a country"; valid = false;
      } else if (str("address_country") === "uzbekistan") {
        if (!str("address_region")) { newErrors.current_address = "Select a region"; valid = false; }
        else if (!str("address_district")) { newErrors.current_address = "Select a district"; valid = false; }
        else if (!str("address_street").trim()) { newErrors.current_address = "Enter street/house"; valid = false; }
      } else if (!str("address_street").trim()) {
        newErrors.current_address = "Enter full address"; valid = false;
      }
      if (!str("passport_image_path")) { newErrors.passport_image_path = "Passport photo required"; valid = false; }
    }

    if (currentStep === "contact") {
      const p1 = validatePhone(str("personal_phone"));
      if (p1) { newErrors.personal_phone = p1; valid = false; }
      const p2 = validatePhone(str("parent_phone"));
      if (p2) { newErrors.parent_phone = p2; valid = false; }
      const p3 = validatePhone(str("friend_phone"));
      if (p3) { newErrors.friend_phone = p3; valid = false; }
    }

    if (currentStep === "education") {
      if (!str("education_type")) { newErrors.education_type = "Required"; valid = false; }
      if (!str("institution_location")) { newErrors.institution_location = "Required"; valid = false; }
      if (!str("institution_name").trim()) { newErrors.institution_name = "Required"; valid = false; }
    }

    // Certificates: if a section is open, cert-specific fields become required
    if (currentStep === "certificates") {
      if (langCertOpen) {
        if (!str("language_cert_type")) { newErrors.language_cert_type = "Select type"; valid = false; }
        if (!str("language_cert_score").trim()) { newErrors.language_cert_score = "Required"; valid = false; }
        if (!str("language_cert_id").trim()) { newErrors.language_cert_id = "Required"; valid = false; }
        if (!str("language_cert_pdf_path")) { newErrors.language_cert_pdf_path = "PDF required"; valid = false; }
      }
      if (satOpen) {
        if (!str("sat_score").trim()) { newErrors.sat_score = "Required"; valid = false; }
        if (!str("sat_id").trim()) { newErrors.sat_id = "Required"; valid = false; }
        if (!str("sat_pdf_path")) { newErrors.sat_pdf_path = "PDF required"; valid = false; }
      }
      if (cefrOpen) {
        if (!str("cefr_score")) { newErrors.cefr_score = "Select level"; valid = false; }
        if (!str("cefr_id").trim()) { newErrors.cefr_id = "Required"; valid = false; }
        if (!str("cefr_pdf_path")) { newErrors.cefr_pdf_path = "PDF required"; valid = false; }
      }
    }

    if (currentStep === "social") {
      if (formData.social_protection && !str("social_protection_pdf_path")) {
        newErrors.social_protection_pdf_path = "Document required when selected"; valid = false;
      }
    }

    setErrors(newErrors);
    if (!valid) {
      const firstKey = Object.keys(newErrors).find((k) => newErrors[k]);
      if (firstKey) {
        toast.error(newErrors[firstKey] || "Please fix errors");
      }
    }
    return valid;
  }, [currentStep, formData, langCertOpen, satOpen, cefrOpen]);

  /* ---- Collect only the relevant fields for the current step ---- */
  const getStepFields = useCallback((): Record<string, unknown> => {
    const stepFieldMap: Record<StepId, string[]> = {
      personal: [
        "surname", "given_name", "gender", "citizenship", "citizenship_other",
        "card_number", "date_of_birth", "date_of_issue", "date_of_expiry",
        "personal_number", "place_of_birth", "current_address", "passport_image_path",
        "birth_country", "birth_region", "birth_district", "birth_street",
        "address_country", "address_region", "address_district", "address_street",
      ],
      contact: ["personal_phone", "parent_phone", "friend_phone"],
      education: [
        "education_type", "institution_type", "institution_location",
        "institution_name", "attestat_pdf_path",
      ],
      certificates: [
        "language_cert_type", "language_cert_pdf_path", "language_cert_score",
        "language_cert_id", "language_cert_date",
        "sat_score", "sat_id", "sat_pdf_path",
        "cefr_score", "cefr_id", "cefr_pdf_path",
      ],
      social: ["social_protection", "social_protection_pdf_path"],
      olympiad: ["other_achievements_text", "other_achievements_pdf_path"],
      submit: ["hear_about", "confirm_info_correct", "confirm_final_year", "confirm_fake_disqualify", "confirm_fake_cancel", "oferta_agreed"],
      status: [],
    };
    const keys = stepFieldMap[currentStep] || [];
    const result: Record<string, unknown> = {};
    for (const k of keys) {
      const val = formData[k];
      if (val !== undefined && val !== null && val !== "") {
        result[k] = val;
      }
    }
    // For social step: always include social_protection boolean (even false)
    if (currentStep === "social") {
      result.social_protection = !!formData.social_protection;
    }
    // Auto-compose legacy address fields from structured fields
    if (currentStep === "personal") {
      result.place_of_birth = formatAddress(
        formData.birth_country as string,
        formData.birth_region as string,
        formData.birth_district as string,
        formData.birth_street as string,
      );
      result.current_address = formatAddress(
        formData.address_country as string,
        formData.address_region as string,
        formData.address_district as string,
        formData.address_street as string,
      );
    }
    return result;
  }, [currentStep, formData]);

  /* ---- Save ---- */
  const saveFields = useCallback(
    async (fieldsToSave?: Record<string, unknown>) => {
      if (!fieldsToSave && !validateStep()) return false;
      setSaving(true);
      try {
        // Only send fields relevant to the current step
        const data = fieldsToSave || getStepFields();

        // For optional steps with no data to send, just mark as saved locally
        const hasFieldsToSend = Object.keys(data).length > 0;
        if (hasFieldsToSend) {
          const res = await fetch("/api/applications", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ applicationId: application.id, ...data }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Save failed");
          }
          onUpdate();
        }

        if (!fieldsToSave) {
          setStepSaved((prev) => ({ ...prev, [currentStep]: true }));
          toast.success("Saved successfully");
        }
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Save failed");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [formData, application.id, onUpdate, validateStep, currentStep, getStepFields]
  );

  /* ---- File upload ---- */
  const uploadFile = useCallback(
    async (file: File, docType: string, fieldName: string) => {
      setUploading(docType);
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("doc_type", docType);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }
        const { filePath } = await res.json();
        setField(fieldName, filePath);
        await saveFields({ [fieldName]: filePath });
        toast.success("File uploaded");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(null);
      }
    },
    [setField, saveFields]
  );

  /* ---- Step complete ---- */
  const isStepComplete = useCallback(
    (stepId: StepId): boolean => {
      // Only show checkmark if the step has actually been saved by user
      if (!stepSaved[stepId]) return false;
      const fields = STEP_REQUIRED_FIELDS[stepId];
      if (fields.length === 0) return true; // Optional steps just need stepSaved
      return fields.every((f) => {
        const val = formData[f];
        return val !== undefined && val !== null && val !== "";
      });
    },
    [formData, stepSaved]
  );

  /* ---- Completion ---- */
  const completionPct = (() => {
    const required = Object.values(STEP_REQUIRED_FIELDS).flat();
    if (required.length === 0) return 0;
    const filled = required.filter((f) => {
      const val = formData[f];
      return val !== undefined && val !== null && val !== "";
    });
    return Math.round((filled.length / required.length) * 100);
  })();

  /* ---- Navigate ---- */
  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const isFirstThreeStep = currentStep === "personal" || currentStep === "contact" || currentStep === "education";
  const isCertsStep = currentStep === "certificates";

  // Check if all required fields for current step are filled (for enabling Save)
  const areRequiredFieldsFilled = (() => {
    const fields = STEP_REQUIRED_FIELDS[currentStep];
    if (fields.length === 0 && !isCertsStep) return true;

    // For personal step, also check specific validation
    if (currentStep === "personal") {
      const hasAll = fields.every((f) => {
        const v = formData[f];
        return v !== undefined && v !== null && v !== "";
      });
      if (str("citizenship") === "other" && !str("citizenship_other").trim()) return false;
      return hasAll;
    }

    // For certificates step - always allow Save unless a cert section is open with incomplete data
    if (isCertsStep) {
      if (langCertOpen) {
        if (!str("language_cert_type") || !str("language_cert_score").trim() || !str("language_cert_id").trim() || !str("language_cert_pdf_path")) return false;
      }
      if (satOpen) {
        if (!str("sat_score").trim() || !str("sat_id").trim() || !str("sat_pdf_path")) return false;
      }
      if (cefrOpen) {
        if (!str("cefr_score") || !str("cefr_id").trim() || !str("cefr_pdf_path")) return false;
      }
      return true;
    }

    return fields.every((f) => {
      const v = formData[f];
      return v !== undefined && v !== null && v !== "";
    });
  })();

  const canSaveAndNext = isFirstThreeStep ? stepSaved[currentStep] : true;
  const isSubmitted = !!application.oferta_agreed;

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[stepIndex + 1].id);
      setSidebarOpen(false);
    }
  };
  const goPrev = () => {
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].id);
      setSidebarOpen(false);
    }
  };

  /* ---- Error display helper ---- */
  const FieldError = ({ field }: { field: string }) => {
    const err = errors[field];
    if (!err) return null;
    return (
      <p className="mt-0.5 flex items-center gap-1 text-xs text-red-500">
        <AlertCircle className="h-3 w-3" /> {err}
      </p>
    );
  };

  /* ---- File upload field ---- */
  const FileUploadField = ({
    label,
    fieldName,
    docType,
    accept = ".pdf",
  }: {
    label: string;
    fieldName: string;
    docType: string;
    accept?: string;
  }) => (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {formData[fieldName] ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-2.5 dark:border-green-800 dark:bg-green-950/30">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
          <span className="truncate text-sm text-green-700 dark:text-green-400">File uploaded</span>
          <label className="ml-auto cursor-pointer text-xs font-medium text-blue-600 hover:underline">
            Replace
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile(f, docType, fieldName);
              }}
            />
          </label>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-3 transition-colors hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20">
          {uploading === docType ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          ) : (
            <Upload className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {uploading === docType ? "Uploading..." : "Click to upload"}
          </span>
          <input
            type="file"
            className="hidden"
            accept={accept}
            disabled={uploading === docType}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f, docType, fieldName);
            }}
          />
        </label>
      )}
      <FieldError field={fieldName} />
    </div>
  );

  /* ================================================================ */
  /*  STEP RENDERERS                                                   */
  /* ================================================================ */

  const renderPersonalInfo = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your passport details and personal data
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Surname <span className="text-red-500">*</span></Label>
          <Input
            value={str("surname")}
            onChange={(e) => setField("surname", e.target.value.toUpperCase())}
            placeholder="LASTNAME"
            className={errors.surname ? "border-red-500" : ""}
          />
          <FieldError field="surname" />
        </div>
        <div className="space-y-1.5">
          <Label>Given Name <span className="text-red-500">*</span></Label>
          <Input
            value={str("given_name")}
            onChange={(e) => setField("given_name", e.target.value.toUpperCase())}
            placeholder="FIRSTNAME"
            className={errors.given_name ? "border-red-500" : ""}
          />
          <FieldError field="given_name" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Gender <span className="text-red-500">*</span></Label>
          <Select value={str("gender")} onValueChange={(v) => setField("gender", v)}>
            <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
          <FieldError field="gender" />
        </div>
        <div className="space-y-1.5">
          <Label>Citizenship <span className="text-red-500">*</span></Label>
          <Select
            value={str("citizenship")}
            onValueChange={(v) => {
              setField("citizenship", v);
              if (v !== "other") setField("citizenship_other", "");
            }}
          >
            <SelectTrigger className={errors.citizenship ? "border-red-500" : ""}>
              <SelectValue placeholder="Select citizenship" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CITIZENSHIP_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError field="citizenship" />
        </div>
      </div>

      {str("citizenship") === "other" && (
        <div className="space-y-1.5">
          <Label>Specify Country <span className="text-red-500">*</span></Label>
          <Input
            value={str("citizenship_other")}
            onChange={(e) => setField("citizenship_other", e.target.value)}
            placeholder="Enter country name"
            className={errors.citizenship_other ? "border-red-500" : ""}
          />
          <FieldError field="citizenship_other" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Passport Number <span className="text-red-500">*</span></Label>
          <Input
            value={str("card_number")}
            onChange={(e) => {
              const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 9);
              setField("card_number", v);
            }}
            placeholder="AA1234567"
            maxLength={9}
            className={errors.card_number ? "border-red-500" : ""}
          />
          <FieldError field="card_number" />
          <p className="text-xs text-muted-foreground">2 letters + 7 digits</p>
        </div>
        <div className="space-y-1.5">
          <Label>Personal Number (JSHSHIR) <span className="text-red-500">*</span></Label>
          <Input
            value={str("personal_number")}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 14);
              setField("personal_number", v);
            }}
            placeholder="12345678901234"
            maxLength={14}
            className={errors.personal_number ? "border-red-500" : ""}
          />
          <FieldError field="personal_number" />
          <p className="text-xs text-muted-foreground">Exactly 14 digits</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Date of Birth <span className="text-red-500">*</span></Label>
          <Input
            type="date"
            value={str("date_of_birth")}
            onChange={(e) => setField("date_of_birth", e.target.value)}
            className={errors.date_of_birth ? "border-red-500" : ""}
          />
          <FieldError field="date_of_birth" />
        </div>
        <div className="space-y-1.5">
          <Label>Date of Issue <span className="text-red-500">*</span></Label>
          <Input
            type="date"
            value={str("date_of_issue")}
            onChange={(e) => {
              const issueDate = e.target.value;
              setField("date_of_issue", issueDate);
              // Auto-set expiry to 10 years after issue
              if (issueDate) {
                const d = new Date(issueDate);
                d.setFullYear(d.getFullYear() + 10);
                const expiry = d.toISOString().split("T")[0];
                setField("date_of_expiry", expiry);
              }
            }}
            className={errors.date_of_issue ? "border-red-500" : ""}
          />
          <FieldError field="date_of_issue" />
        </div>
        <div className="space-y-1.5">
          <Label>Date of Expiry <span className="text-red-500">*</span></Label>
          <Input
            type="date"
            value={str("date_of_expiry")}
            onChange={(e) => setField("date_of_expiry", e.target.value)}
            className={errors.date_of_expiry ? "border-red-500" : ""}
            readOnly
          />
          <FieldError field="date_of_expiry" />
          <p className="text-xs text-muted-foreground">Auto-calculated: 10 years after issue date</p>
        </div>
      </div>

      {/* Place of Birth */}
      <div className="space-y-3 rounded-lg border border-border p-3">
        <Label className="text-sm font-semibold">Place of Birth <span className="text-red-500">*</span></Label>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Country</Label>
            <Select
              value={str("birth_country") || ""}
              onValueChange={(v) => {
                setField("birth_country", v);
                setField("birth_region", "");
                setField("birth_district", "");
                setField("birth_street", "");
                setField("place_of_birth", v === "uzbekistan" ? "Uzbekistan" : "");
              }}
            >
              <SelectTrigger className={errors.place_of_birth && !str("birth_country") ? "border-red-500" : ""}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uzbekistan">Uzbekistan</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {str("birth_country") === "uzbekistan" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Region (Viloyat)</Label>
              <Select
                value={str("birth_region") || ""}
                onValueChange={(v) => {
                  setField("birth_region", v);
                  setField("birth_district", "");
                  setField("birth_street", "");
                }}
              >
                <SelectTrigger className={errors.place_of_birth && !str("birth_region") ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {REGION_LIST.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {str("birth_country") === "uzbekistan" && str("birth_region") && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">District (Tuman)</Label>
              <Select
                value={str("birth_district") || ""}
                onValueChange={(v) => {
                  setField("birth_district", v);
                  setField("birth_street", "");
                }}
              >
                <SelectTrigger className={errors.place_of_birth && !str("birth_district") ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {(REGIONS_DISTRICTS[str("birth_region")] || []).map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {str("birth_country") === "uzbekistan" && str("birth_district") && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Street / House</Label>
              <Input
                value={str("birth_street")}
                onChange={(e) => {
                  setField("birth_street", e.target.value);
                  setField("place_of_birth", formatAddress("uzbekistan", str("birth_region"), str("birth_district"), e.target.value));
                }}
                placeholder="Street name, house number"
                className={errors.place_of_birth && !str("birth_street") ? "border-red-500" : ""}
              />
            </div>
          )}

          {str("birth_country") === "other" && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Full Address</Label>
              <Input
                value={str("birth_street")}
                onChange={(e) => {
                  setField("birth_street", e.target.value);
                  setField("place_of_birth", e.target.value);
                }}
                placeholder="Enter full place of birth"
                className={errors.place_of_birth && !str("birth_street") ? "border-red-500" : ""}
              />
            </div>
          )}
        </div>
        <FieldError field="place_of_birth" />
      </div>

      {/* Current Address */}
      <div className="space-y-3 rounded-lg border border-border p-3">
        <Label className="text-sm font-semibold">Current Address <span className="text-red-500">*</span></Label>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Country</Label>
            <Select
              value={str("address_country") || ""}
              onValueChange={(v) => {
                setField("address_country", v);
                setField("address_region", "");
                setField("address_district", "");
                setField("address_street", "");
                setField("current_address", v === "uzbekistan" ? "Uzbekistan" : "");
              }}
            >
              <SelectTrigger className={errors.current_address && !str("address_country") ? "border-red-500" : ""}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uzbekistan">Uzbekistan</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {str("address_country") === "uzbekistan" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Region (Viloyat)</Label>
              <Select
                value={str("address_region") || ""}
                onValueChange={(v) => {
                  setField("address_region", v);
                  setField("address_district", "");
                  setField("address_street", "");
                }}
              >
                <SelectTrigger className={errors.current_address && !str("address_region") ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {REGION_LIST.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {str("address_country") === "uzbekistan" && str("address_region") && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">District (Tuman)</Label>
              <Select
                value={str("address_district") || ""}
                onValueChange={(v) => {
                  setField("address_district", v);
                  setField("address_street", "");
                }}
              >
                <SelectTrigger className={errors.current_address && !str("address_district") ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {(REGIONS_DISTRICTS[str("address_region")] || []).map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {str("address_country") === "uzbekistan" && str("address_district") && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Street / House</Label>
              <Input
                value={str("address_street")}
                onChange={(e) => {
                  setField("address_street", e.target.value);
                  setField("current_address", formatAddress("uzbekistan", str("address_region"), str("address_district"), e.target.value));
                }}
                placeholder="Street name, house number"
                className={errors.current_address && !str("address_street") ? "border-red-500" : ""}
              />
            </div>
          )}

          {str("address_country") === "other" && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Full Address</Label>
              <Input
                value={str("address_street")}
                onChange={(e) => {
                  setField("address_street", e.target.value);
                  setField("current_address", e.target.value);
                }}
                placeholder="Enter full current address"
                className={errors.current_address && !str("address_street") ? "border-red-500" : ""}
              />
            </div>
          )}
        </div>
        <FieldError field="current_address" />
      </div>

      <FileUploadField
        label="Passport Photo (JPG/PNG) *"
        fieldName="passport_image_path"
        docType="passport_image"
        accept=".jpg,.jpeg,.png"
      />
    </div>
  );

  const renderContact = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide phone numbers. The + symbol is added automatically.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Personal Phone <span className="text-red-500">*</span></Label>
          <Input
            type="tel"
            value={str("personal_phone")}
            onChange={(e) => setField("personal_phone", formatPhone(e.target.value))}
            placeholder="+998901234567"
            className={errors.personal_phone ? "border-red-500" : ""}
          />
          <FieldError field="personal_phone" />
        </div>
        <div className="space-y-1.5">
          <Label>Parent / Guardian Phone <span className="text-red-500">*</span></Label>
          <Input
            type="tel"
            value={str("parent_phone")}
            onChange={(e) => setField("parent_phone", formatPhone(e.target.value))}
            placeholder="+998901234567"
            className={errors.parent_phone ? "border-red-500" : ""}
          />
          <FieldError field="parent_phone" />
        </div>
        <div className="space-y-1.5">
          <Label>Close Friend Phone <span className="text-red-500">*</span></Label>
          <Input
            type="tel"
            value={str("friend_phone")}
            onChange={(e) => setField("friend_phone", formatPhone(e.target.value))}
            placeholder="+998901234567"
            className={errors.friend_phone ? "border-red-500" : ""}
          />
          <FieldError field="friend_phone" />
        </div>
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Education</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Select your educational institution type and details
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Education Type <span className="text-red-500">*</span></Label>
        <Select
          value={str("education_type")}
          onValueChange={(v) => {
            setField("education_type", v);
            setField("institution_location", "");
            setField("institution_name", "");
          }}
        >
          <SelectTrigger className={errors.education_type ? "border-red-500" : ""}>
            <SelectValue placeholder="Select education type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EDUCATION_TYPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError field="education_type" />
      </div>

      {!!str("education_type") && (
        <>
          <div className="space-y-1.5">
            <Label>Institution Location <span className="text-red-500">*</span></Label>
            <Select
              value={str("institution_location")}
              onValueChange={(v) => {
                setField("institution_location", v);
                setField("institution_name", "");
              }}
            >
              <SelectTrigger className={errors.institution_location ? "border-red-500" : ""}>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {UZBEKISTAN_REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
                <SelectItem value="other_location">Other (outside Uzbekistan)</SelectItem>
              </SelectContent>
            </Select>
            <FieldError field="institution_location" />
          </div>

          <div className="space-y-1.5">
            <Label>
              {str("institution_location") === "other_location" ? "Specify Location & Institution" : "Institution Name"}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              value={str("institution_name")}
              onChange={(e) => setField("institution_name", e.target.value)}
              placeholder={
                str("institution_location") === "other_location"
                  ? "City, Country - Institution Name"
                  : "Enter institution name"
              }
              className={errors.institution_name ? "border-red-500" : ""}
            />
            <FieldError field="institution_name" />
          </div>
        </>
      )}

      <FileUploadField
        label="Attestat / Diploma (PDF) — optional"
        fieldName="attestat_pdf_path"
        docType="attestat_pdf"
      />
    </div>
  );

  const renderCertificates = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Certificates</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          All certificates are optional. If you have one, check the box and fill in details.
          Score, ID and PDF are required for each selected certificate.
        </p>
      </div>

      {/* Language Certificate */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="lang-cert-check"
            checked={langCertOpen}
            onCheckedChange={(checked) => {
              setLangCertOpen(!!checked);
              if (!checked) {
                setField("language_cert_type", "");
                setField("language_cert_score", "");
                setField("language_cert_id", "");
                setField("language_cert_pdf_path", "");
              }
            }}
          />
          <Label htmlFor="lang-cert-check" className="cursor-pointer font-medium">
            I have an International Language Certificate
          </Label>
        </div>

        {langCertOpen && (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <div className="space-y-1.5">
              <Label>Certificate Type <span className="text-red-500">*</span></Label>
              <Select
                value={str("language_cert_type")}
                onValueChange={(v) => setField("language_cert_type", v)}
              >
                <SelectTrigger className={errors.language_cert_type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGE_CERT_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError field="language_cert_type" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Score / Band <span className="text-red-500">*</span></Label>
                <Input
                  value={str("language_cert_score")}
                  onChange={(e) => setField("language_cert_score", e.target.value)}
                  placeholder="e.g. 7.0"
                  className={errors.language_cert_score ? "border-red-500" : ""}
                />
                <FieldError field="language_cert_score" />
              </div>
              <div className="space-y-1.5">
                <Label>Certificate ID <span className="text-red-500">*</span></Label>
                <Input
                  value={str("language_cert_id")}
                  onChange={(e) => setField("language_cert_id", e.target.value)}
                  placeholder="Unique certificate ID"
                  className={errors.language_cert_id ? "border-red-500" : ""}
                />
                <FieldError field="language_cert_id" />
              </div>
            </div>
            <FileUploadField label="Certificate PDF *" fieldName="language_cert_pdf_path" docType="language_cert_pdf" />
          </div>
        )}
      </div>

      {/* SAT */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="sat-check"
            checked={satOpen}
            onCheckedChange={(checked) => {
              setSatOpen(!!checked);
              if (!checked) {
                setField("sat_score", "");
                setField("sat_id", "");
                setField("sat_pdf_path", "");
              }
            }}
          />
          <Label htmlFor="sat-check" className="cursor-pointer font-medium">I have a SAT Certificate</Label>
        </div>

        {satOpen && (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>SAT Score <span className="text-red-500">*</span></Label>
                <Input
                  value={str("sat_score")}
                  onChange={(e) => setField("sat_score", e.target.value)}
                  placeholder="e.g. 1400"
                  className={errors.sat_score ? "border-red-500" : ""}
                />
                <FieldError field="sat_score" />
              </div>
              <div className="space-y-1.5">
                <Label>SAT ID <span className="text-red-500">*</span></Label>
                <Input
                  value={str("sat_id")}
                  onChange={(e) => setField("sat_id", e.target.value)}
                  placeholder="Registration number"
                  className={errors.sat_id ? "border-red-500" : ""}
                />
                <FieldError field="sat_id" />
              </div>
            </div>
            <FileUploadField label="SAT PDF *" fieldName="sat_pdf_path" docType="sat_pdf" />
          </div>
        )}
      </div>

      {/* CEFR */}
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="cefr-check"
            checked={cefrOpen}
            onCheckedChange={(checked) => {
              setCefrOpen(!!checked);
              if (!checked) {
                setField("cefr_score", "");
                setField("cefr_id", "");
                setField("cefr_pdf_path", "");
              }
            }}
          />
          <Label htmlFor="cefr-check" className="cursor-pointer font-medium">I have a CEFR Certificate</Label>
        </div>

        {cefrOpen && (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>CEFR Level <span className="text-red-500">*</span></Label>
                <Select
                  value={str("cefr_score")}
                  onValueChange={(v) => setField("cefr_score", v)}
                >
                  <SelectTrigger className={errors.cefr_score ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError field="cefr_score" />
              </div>
              <div className="space-y-1.5">
                <Label>CEFR Certificate ID <span className="text-red-500">*</span></Label>
                <Input
                  value={str("cefr_id")}
                  onChange={(e) => setField("cefr_id", e.target.value)}
                  placeholder="Certificate ID"
                  className={errors.cefr_id ? "border-red-500" : ""}
                />
                <FieldError field="cefr_id" />
              </div>
            </div>
            <FileUploadField label="CEFR PDF *" fieldName="cefr_pdf_path" docType="cefr_pdf" />
          </div>
        )}
      </div>
    </div>
  );

  const renderSocialProtection = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Social Protection</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Please indicate if you are registered in the social protection registry
        </p>
      </div>

      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="social-prot-check"
            checked={!!formData.social_protection}
            onCheckedChange={(checked) => {
              setField("social_protection", !!checked);
              if (!checked) setField("social_protection_pdf_path", "");
            }}
          />
          <Label htmlFor="social-prot-check" className="cursor-pointer font-medium">
            Are you registered in the social protection registry?
          </Label>
        </div>

        {!!formData.social_protection && (
          <div className="mt-4 border-t border-border pt-4">
            <FileUploadField
              label="Social Protection Document (PDF) *"
              fieldName="social_protection_pdf_path"
              docType="social_protection_pdf"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderOlympiad = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Olympiad & Achievements</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe any olympiad participations or other relevant achievements (optional)
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Achievements & Notes</Label>
        <Textarea
          rows={4}
          value={str("other_achievements_text")}
          onChange={(e) => setField("other_achievements_text", e.target.value)}
          placeholder="Describe your olympiad results, competitions, awards..."
        />
      </div>

      <FileUploadField
        label="Supporting Documents (PDF)"
        fieldName="other_achievements_pdf_path"
        docType="achievements_pdf"
      />
    </div>
  );

  const HEAR_ABOUT_OPTIONS = [
    "Social Media (Instagram, Telegram, etc.)",
    "Friends or Family",
    "School / Teacher recommendation",
    "University website",
    "Education fair / Exhibition",
    "News / Media",
    "Other",
  ];

  const SIBLING_OPTIONS = [
    "Yes",
    "No",
  ];

  const renderSubmit = () => {
    const allConfirmed = !!formData.confirm_info_correct && !!formData.confirm_final_year
      && !!formData.confirm_fake_disqualify && !!formData.confirm_fake_cancel;
    const allFieldsFilled = !!formData.hear_about && allConfirmed;

    const handleSubmit = async () => {
      // Check personal info is 100% filled
      const personalFields = STEP_REQUIRED_FIELDS.personal;
      const missingPersonal = personalFields.filter((f) => !formData[f] || formData[f] === "");
      if (missingPersonal.length > 0) {
        toast.error("Personal Information is not fully completed. Please go back and fill in all required fields.");
        return;
      }
      // Check contact is 100% filled
      const contactFields = STEP_REQUIRED_FIELDS.contact;
      const missingContact = contactFields.filter((f) => !formData[f] || formData[f] === "");
      if (missingContact.length > 0) {
        toast.error("Contact information is not fully completed. Please go back and fill in all required fields.");
        return;
      }
      if (!formData.hear_about) {
        toast.error("Please select how you heard about the university.");
        return;
      }

      if (!allConfirmed) {
        toast.error("You must check all confirmation checkboxes to submit.");
        return;
      }
  await saveFields({
  hear_about: formData.hear_about,
  confirm_info_correct: true,
        confirm_final_year: true,
        confirm_fake_disqualify: true,
        confirm_fake_cancel: true,
        oferta_agreed: true,
        status: "submitted",
        completion_percentage: completionPct,
      });
      toast.success("Application submitted successfully!");
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Review & Submit</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Answer the questions below and confirm your declarations before submitting.
          </p>
        </div>

        {/* How did you hear about us */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            How did you first hear about the university and the course you are applying for? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={str("hear_about")}
            onValueChange={(val) => setField("hear_about", val)}
          >
            <SelectTrigger className={cn(!formData.hear_about && "text-muted-foreground")}>
              <SelectValue placeholder="Select your response..." />
            </SelectTrigger>
            <SelectContent>
              {HEAR_ABOUT_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!formData.hear_about && (
            <p className="text-xs text-destructive">Question required</p>
          )}
        </div>

        {/* Confirmation checkboxes */}
        <div className="space-y-3 rounded-lg border border-border p-4">
          <Label className="text-sm font-medium">
            I hereby confirm that: <span className="text-destructive">*</span>
          </Label>

          <div className="flex items-start gap-2.5">
            <Checkbox
              id="confirm-info"
              checked={!!formData.confirm_info_correct}
              onCheckedChange={(checked) => setField("confirm_info_correct", !!checked)}
            />
            <Label htmlFor="confirm-info" className="cursor-pointer text-sm leading-relaxed font-normal">
              All information provided by me in this application is correct and accurate.
            </Label>
          </div>

          <div className="flex items-start gap-2.5">
            <Checkbox
              id="confirm-final"
              checked={!!formData.confirm_final_year}
              onCheckedChange={(checked) => setField("confirm_final_year", !!checked)}
            />
            <Label htmlFor="confirm-final" className="cursor-pointer text-sm leading-relaxed font-normal">
              I have completed, or am in my final year of, secondary school, academic lyceum, or college.
            </Label>
          </div>

          <div className="flex items-start gap-2.5">
            <Checkbox
              id="confirm-disqualify"
              checked={!!formData.confirm_fake_disqualify}
              onCheckedChange={(checked) => setField("confirm_fake_disqualify", !!checked)}
            />
            <Label htmlFor="confirm-disqualify" className="cursor-pointer text-sm leading-relaxed font-normal">
              If any information is found to be fake or incorrect at any stage of the admission process, my application will be rejected, and I will be disqualified from applying to any program.
            </Label>
          </div>

          <div className="flex items-start gap-2.5">
            <Checkbox
              id="confirm-cancel"
              checked={!!formData.confirm_fake_cancel}
              onCheckedChange={(checked) => setField("confirm_fake_cancel", !!checked)}
            />
            <Label htmlFor="confirm-cancel" className="cursor-pointer text-sm leading-relaxed font-normal">
              If fake information is found after exam results are announced, my results will be canceled.
            </Label>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!allFieldsFilled || saving}
          className="w-full"
          size="lg"
        >
          {saving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
          ) : (
            <><CheckCircle2 className="mr-2 h-4 w-4" /> Save changes and submit</>
          )}
        </Button>
      </div>
    );
  };

  const [editMode, setEditMode] = useState(false);

  const renderStatus = () => {
    // If not submitted yet, show blinking message
    if (!isSubmitted) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-amber-100 p-4 dark:bg-amber-900/30">
            <AlertCircle className="h-10 w-10 text-amber-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-foreground">You haven{"'"}t applied yet</h3>
          <p className="mb-4 max-w-sm text-sm text-muted-foreground">
            Complete all steps and submit your application to see your status here.
          </p>
          <span className="animate-pulse rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
            Application pending submission
          </span>
          <Button
            className="mt-6"
            variant="outline"
            onClick={() => setCurrentStep("personal")}
          >
            Go to Application Form
          </Button>
        </div>
      );
    }

    const statusKey = str("status") || application.status || "submitted";
    const statusInfo = STATUS_LABELS[statusKey] || STATUS_LABELS.submitted;

    const summaryRows = [
      { section: "Account", fields: [
        { label: "Email", value: application.user_email || "-" },
        { label: "Program", value: application.user_program || "-" },
      ]},
      { section: "Personal Information", fields: [
        { label: "Surname", value: str("surname") },
        { label: "Given Name", value: str("given_name") },
        { label: "Gender", value: str("gender") },
        { label: "Citizenship", value: str("citizenship") === "other" ? str("citizenship_other") : (CITIZENSHIP_LABELS[str("citizenship") as Citizenship] || str("citizenship")) },
        { label: "Passport Number", value: str("card_number") },
        { label: "Personal Number (JSHIR)", value: str("personal_number") },
        { label: "Date of Birth", value: str("date_of_birth") },
        { label: "Date of Issue", value: str("date_of_issue") },
        { label: "Date of Expiry", value: str("date_of_expiry") },
        { label: "Place of Birth", value: str("place_of_birth") },
        { label: "Current Address", value: str("current_address") },
        { label: "Passport Photo", value: str("passport_image_path") ? "Uploaded" : "Not uploaded" },
      ]},
      { section: "Contact", fields: [
        { label: "Personal Phone", value: str("personal_phone") },
        { label: "Parent / Guardian Phone", value: str("parent_phone") },
        { label: "Close Friend Phone", value: str("friend_phone") },
      ]},
      { section: "Education", fields: [
        { label: "Education Type", value: str("education_type") ? EDUCATION_TYPE_LABELS[str("education_type") as EducationType] : "-" },
        { label: "Institution Type", value: str("institution_type") || "-" },
        { label: "Institution Location", value: str("institution_location") },
        { label: "Institution Name", value: str("institution_name") },
        { label: "Attestat / Diploma", value: str("attestat_pdf_path") ? "Uploaded" : "Not uploaded" },
      ]},
      { section: "Certificates", fields: [
        { label: "Language Certificate", value: str("language_cert_type") ? LANGUAGE_CERT_LABELS[str("language_cert_type") as LanguageCertType] : "N/A" },
        { label: "Language Score", value: str("language_cert_score") || "N/A" },
        { label: "Language Cert ID", value: str("language_cert_id") || "N/A" },
        { label: "Language Cert Date", value: str("language_cert_date") || "N/A" },
        { label: "Language Cert PDF", value: str("language_cert_pdf_path") ? "Uploaded" : "N/A" },
        { label: "SAT Score", value: str("sat_score") || "N/A" },
        { label: "SAT ID", value: str("sat_id") || "N/A" },
        { label: "SAT PDF", value: str("sat_pdf_path") ? "Uploaded" : "N/A" },
        { label: "CEFR Level", value: str("cefr_score") || "N/A" },
        { label: "CEFR ID", value: str("cefr_id") || "N/A" },
        { label: "CEFR PDF", value: str("cefr_pdf_path") ? "Uploaded" : "N/A" },
      ]},
      { section: "Social Protection", fields: [
        { label: "Social Protection Registry", value: formData.social_protection ? "Yes" : "No" },
        { label: "Social Protection PDF", value: str("social_protection_pdf_path") ? "Uploaded" : "N/A" },
      ]},
      { section: "Olympiad & Achievements", fields: [
        { label: "Achievements", value: str("other_achievements_text") || "None" },
        { label: "Achievements PDF", value: str("other_achievements_pdf_path") ? "Uploaded" : "N/A" },
      ]},
      { section: "Submission Details", fields: [
        { label: "How did you hear about us", value: str("hear_about") || "-" },

        { label: "Info is correct", value: formData.confirm_info_correct ? "Confirmed" : "Not confirmed" },
        { label: "Final year completed", value: formData.confirm_final_year ? "Confirmed" : "Not confirmed" },
        { label: "Fake info = disqualification", value: formData.confirm_fake_disqualify ? "Confirmed" : "Not confirmed" },
        { label: "Fake info = cancellation", value: formData.confirm_fake_cancel ? "Confirmed" : "Not confirmed" },
      ]},
    ];

    return (
      <div className="space-y-6">
        {/* Status badge + Edit button */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 text-center sm:p-5">
          <p className="mb-2 text-sm text-muted-foreground">Application Status</p>
          <span className={cn("inline-block rounded-full px-5 py-2 text-base font-bold", statusInfo.color)}>
            {statusInfo.label}
          </span>
          <p className="mt-3 text-xs text-muted-foreground">
            Submitted on {application.updated_at ? new Date(application.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "-"}
          </p>
          {!editMode && (
            <Button
              className="mt-4"
              variant="outline"
              size="sm"
              onClick={() => setEditMode(true)}
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Edit Application
            </Button>
          )}
          {editMode && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  setSaving(true);
                  try {
                    const res = await fetch("/api/applications", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        applicationId: application.id,
                        oferta_agreed: true,
                        status: "submitted",
                      }),
                    });
                    if (!res.ok) throw new Error("Save failed");
                    onUpdate();
                    setEditMode(false);
                    toast.success("Application saved and resubmitted!");
                  } catch {
                    toast.error("Failed to resubmit");
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
                Save and Submit again
              </Button>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Edit mode is active. Select a section from the sidebar to make changes.
              </p>
            </div>
          )}
        </div>

        {/* Full readonly summary */}
        {summaryRows.map((section) => (
          <div key={section.section} className="rounded-lg border border-border overflow-hidden">
            <div className="bg-muted/50 px-3 py-2.5 border-b border-border sm:px-4">
              <h4 className="text-sm font-semibold text-foreground">{section.section}</h4>
            </div>
            <div className="divide-y divide-border">
              {section.fields.map((f) => (
                <div key={f.label} className="flex flex-col gap-0.5 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2.5">
                  <span className="text-xs text-muted-foreground sm:text-sm">{f.label}</span>
                  <span className="font-medium text-foreground sm:text-right sm:max-w-[60%] sm:truncate break-words">{f.value || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /* ---- Step content mapper ---- */
  const renderStep = () => {
    switch (currentStep) {
      case "personal": return renderPersonalInfo();
      case "contact": return renderContact();
      case "education": return renderEducation();
      case "certificates": return renderCertificates();
      case "social": return renderSocialProtection();
      case "olympiad": return renderOlympiad();
      case "submit": return renderSubmit();
      case "status": return renderStatus();
      default: return null;
    }
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="relative flex min-h-[600px] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-white shadow-lg md:hidden"
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "absolute inset-y-0 left-0 z-20 flex w-64 flex-col bg-slate-900 transition-transform duration-200 md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-2.5 border-b border-slate-700 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">My Application</span>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {STEPS.map((step) => {
            // Status always visible (shows "not applied yet" message if not submitted)

            const stepId: StepId = step.id;
            const isActive = currentStep === stepId;
            const isDone = isStepComplete(stepId);
            const isStatusStep = String(stepId) === "status";
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  // If submitted and NOT in edit mode, only allow clicking Status
                  if (isSubmitted && !editMode && !isStatusStep) return;
                  setCurrentStep(stepId);
                  setSidebarOpen(false);
                }}
                disabled={isSubmitted && !editMode && !isStatusStep}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150",
                  isSubmitted && !editMode && !isStatusStep && "opacity-50 cursor-not-allowed",
                  isStatusStep && isActive && isSubmitted
                    ? "bg-green-600/20 text-green-400"
                    : isStatusStep && isActive && !isSubmitted
                    ? "bg-amber-600/20 text-amber-400"
                    : isStatusStep && isSubmitted
                    ? "text-green-400 hover:bg-green-900/30"
                    : isStatusStep
                    ? "text-amber-400 hover:bg-amber-900/30"
                    : isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )}
              >
                <Icon className={cn("h-4 w-4 flex-shrink-0", isStatusStep && (isSubmitted ? "text-green-400" : "text-amber-400"))} />
                <span className="flex-1 truncate">{step.label}</span>
                {isStatusStep ? (
                  isSubmitted ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-400" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 flex-shrink-0 text-amber-400 animate-pulse" />
                  )
                ) : isDone ? (
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-400" />
                ) : (
                  <Circle className="h-3.5 w-3.5 flex-shrink-0 text-slate-600" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Progress */}
        <div className="border-t border-slate-700 px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Completion</span>
            <span className="font-medium text-white">{completionPct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <div className="flex items-center border-b border-border px-4 py-3 pl-14 md:pl-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Step {stepIndex + 1} of {STEPS.length}</span>
            <span className="font-medium text-foreground">{STEPS[stepIndex].label}</span>
          </div>
        </div>

        {/* Content area */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderStep()}
        </div>

        {/* Bottom navigation - show when form is active (not on status view, and either not submitted or in edit mode) */}
        {String(currentStep) !== "status" && (!isSubmitted || editMode) && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={goPrev}
              disabled={stepIndex === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <div className="flex items-center gap-2">
              {currentStep !== "submit" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveFields()}
                  disabled={saving || ((isFirstThreeStep || isCertsStep) && !areRequiredFieldsFilled)}
                >
                  {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                  Save
                </Button>
              )}
              {stepIndex < STEPS.length - 1 && currentStep !== "submit" && String(currentStep) !== "status" && (
                <Button
                  size="sm"
                  onClick={() => {
                    if (!stepSaved[currentStep]) {
                      toast.error("Please save this step before proceeding");
                      return;
                    }
                    goNext();
                  }}
                  disabled={!stepSaved[currentStep]}
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
