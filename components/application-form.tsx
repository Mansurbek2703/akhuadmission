"use client";

import React from "react"

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Save,
  Upload,
  Loader2,
  User,
  FileText,
  Globe,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import {
  EDUCATION_TYPE_LABELS,
  LANGUAGE_CERT_LABELS,
} from "@/lib/types";
import type {
  Application,
  EducationType,
  LanguageCertType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface ApplicationFormProps {
  application: Application;
  onUpdate: () => void;
  highlightField?: string;
}

// Map each field to its section card id
const FIELD_TO_SECTION: Record<string, string> = {
  education_type: "section-education",
  surname: "section-passport",
  given_name: "section-passport",
  gender: "section-passport",
  citizenship: "section-passport",
  card_number: "section-passport",
  date_of_birth: "section-passport",
  date_of_issue: "section-passport",
  date_of_expiry: "section-passport",
  personal_number: "section-passport",
  place_of_birth: "section-passport",
  passport_image_path: "section-passport",
  attestat_pdf_path: "section-attestat",
  language_cert_type: "section-language",
  language_cert_pdf_path: "section-language",
  language_cert_score: "section-language",
  language_cert_date: "section-language",
  social_registry: "section-social",
  social_registry_pdf_path: "section-social",
  status: "section-education",
};

export function ApplicationForm({
  application,
  onUpdate,
  highlightField,
}: ApplicationFormProps) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const highlightedRef = useRef<HTMLDivElement>(null);
  const [flashField, setFlashField] = useState<string | null>(null);

  // Form state - synced with application prop (server data)
  const [educationType, setEducationType] = useState(application.education_type || "");
  const [surname, setSurname] = useState(application.surname || "");
  const [givenName, setGivenName] = useState(application.given_name || "");
  const [gender, setGender] = useState(application.gender || "");
  const [citizenship, setCitizenship] = useState(application.citizenship || "");
  const [cardNumber, setCardNumber] = useState(application.card_number || "");
  const [dateOfBirth, setDateOfBirth] = useState(application.date_of_birth?.split("T")[0] || "");
  const [dateOfIssue, setDateOfIssue] = useState(application.date_of_issue?.split("T")[0] || "");
  const [dateOfExpiry, setDateOfExpiry] = useState(application.date_of_expiry?.split("T")[0] || "");
  const [personalNumber, setPersonalNumber] = useState(application.personal_number || "");
  const [placeOfBirth, setPlaceOfBirth] = useState(application.place_of_birth || "");
  const [passportImage, setPassportImage] = useState(application.passport_image_path || "");
  const [attestatPdf, setAttestatPdf] = useState(application.attestat_pdf_path || "");
  const [langCertType, setLangCertType] = useState(application.language_cert_type || "");
  const [langCertPdf, setLangCertPdf] = useState(application.language_cert_pdf_path || "");
  const [langCertScore, setLangCertScore] = useState(application.language_cert_score || "");
  const [langCertDate, setLangCertDate] = useState(application.language_cert_date?.split("T")[0] || "");
  const [socialRegistry, setSocialRegistry] = useState(application.social_registry || false);
  const [socialRegistryPdf, setSocialRegistryPdf] = useState(application.social_registry_pdf_path || "");

  // Auto-sync form state when application data changes (real-time from SWR)
  useEffect(() => {
    setEducationType(application.education_type || "");
    setSurname(application.surname || "");
    setGivenName(application.given_name || "");
    setGender(application.gender || "");
    setCitizenship(application.citizenship || "");
    setCardNumber(application.card_number || "");
    setDateOfBirth(application.date_of_birth?.split("T")[0] || "");
    setDateOfIssue(application.date_of_issue?.split("T")[0] || "");
    setDateOfExpiry(application.date_of_expiry?.split("T")[0] || "");
    setPersonalNumber(application.personal_number || "");
    setPlaceOfBirth(application.place_of_birth || "");
    setPassportImage(application.passport_image_path || "");
    setAttestatPdf(application.attestat_pdf_path || "");
    setLangCertType(application.language_cert_type || "");
    setLangCertPdf(application.language_cert_pdf_path || "");
    setLangCertScore(application.language_cert_score || "");
    setLangCertDate(application.language_cert_date?.split("T")[0] || "");
    setSocialRegistry(application.social_registry || false);
    setSocialRegistryPdf(application.social_registry_pdf_path || "");
  }, [application]);

  // Scroll and highlight the field from notification
  useEffect(() => {
    if (!highlightField) return;
    setFlashField(highlightField);
    const timer = setTimeout(() => {
      if (highlightedRef.current) {
        highlightedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 300);
    const clearTimer = setTimeout(() => setFlashField(null), 6000);
    return () => { clearTimeout(timer); clearTimeout(clearTimer); };
  }, [highlightField]);

  // Passport ID auto-uppercase handler
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Auto uppercase first 2 characters (letters), rest stays as-is
    const upper = val.length <= 2 ? val.toUpperCase() : val.slice(0, 2).toUpperCase() + val.slice(2);
    setCardNumber(upper);
  };

  const calculateCompletion = useCallback(() => {
    let total = 0;
    let filled = 0;
    total += 1; if (educationType) filled += 1;
    const passportFields = [surname, givenName, gender, citizenship, cardNumber, dateOfBirth, dateOfIssue, dateOfExpiry, personalNumber, placeOfBirth];
    total += passportFields.length;
    filled += passportFields.filter((f) => f).length;
    total += 1; if (passportImage) filled += 1;
    total += 1; if (attestatPdf) filled += 1;
    total += 4;
    if (langCertType) filled += 1;
    if (langCertPdf) filled += 1;
    if (langCertScore) filled += 1;
    if (langCertDate) filled += 1;
    return Math.round((filled / total) * 100);
  }, [educationType, surname, givenName, gender, citizenship, cardNumber, dateOfBirth, dateOfIssue, dateOfExpiry, personalNumber, placeOfBirth, passportImage, attestatPdf, langCertType, langCertPdf, langCertScore, langCertDate]);

  const handleUpload = async (file: File, docType: string, setter: (path: string) => void) => {
    setUploading(docType);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("doc_type", docType);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setter(data.filePath);
      toast.success("File uploaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const completion = calculateCompletion();
      const res = await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          education_type: educationType || null,
          surname: surname || null,
          given_name: givenName || null,
          gender: gender || null,
          citizenship: citizenship || null,
          card_number: cardNumber || null,
          date_of_birth: dateOfBirth || null,
          date_of_issue: dateOfIssue || null,
          date_of_expiry: dateOfExpiry || null,
          personal_number: personalNumber || null,
          place_of_birth: placeOfBirth || null,
          passport_image_path: passportImage || null,
          attestat_pdf_path: attestatPdf || null,
          language_cert_type: langCertType || null,
          language_cert_pdf_path: langCertPdf || null,
          language_cert_score: langCertScore || null,
          language_cert_date: langCertDate || null,
          social_registry: socialRegistry,
          social_registry_pdf_path: socialRegistryPdf || null,
          completion_percentage: completion,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Application saved successfully");
      onUpdate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const isHighlighted = (fieldName: string) => flashField === fieldName;

  const fieldWrapper = (fieldName: string, children: React.ReactNode) => (
    <div
      ref={fieldName === flashField ? highlightedRef : undefined}
      className={cn(
        "rounded-lg transition-all duration-500",
        isHighlighted(fieldName) && "ring-2 ring-amber-400 bg-amber-50/50 p-2 animate-pulse"
      )}
    >
      {children}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Section 1: Education Type */}
      <Card className="border-border bg-card" id="section-education">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <GraduationCap className="h-5 w-5 text-primary" />
            Education Type
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Select your prior education type
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fieldWrapper("education_type",
            <Select value={educationType} onValueChange={(v) => setEducationType(v as EducationType)}>
              <SelectTrigger className="max-w-md bg-card text-foreground">
                <SelectValue placeholder="Select education type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EDUCATION_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Passport Data */}
      <Card className="border-border bg-card" id="section-passport">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5 text-primary" />
            Passport Information
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your passport details. Upload a JPG or PNG image of your passport.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {fieldWrapper("surname",
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Surname</Label>
                <Input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Enter your surname" className="bg-card text-foreground" />
              </div>
            )}
            {fieldWrapper("given_name",
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Given Name</Label>
                <Input value={givenName} onChange={(e) => setGivenName(e.target.value)} placeholder="Enter your given name" className="bg-card text-foreground" />
              </div>
            )}
            {fieldWrapper("gender",
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="bg-card text-foreground">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {fieldWrapper("citizenship",
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Citizenship</Label>
                <Input value={citizenship} onChange={(e) => setCitizenship(e.target.value)} placeholder="e.g. Uzbekistan" className="bg-card text-foreground" />
              </div>
            )}
            {fieldWrapper("card_number",
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Passport ID (Series & Number)</Label>
                <Input
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="e.g. AD0843786"
                  maxLength={9}
                  className="bg-card text-foreground uppercase"
                />
                <p className="text-xs text-muted-foreground">First two letters are auto-capitalized</p>
              </div>
            )}
            {fieldWrapper("date_of_birth",
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Date of Birth</Label>
                <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="bg-card text-foreground" />
              </div>
            )}
            {fieldWrapper("date_of_issue",
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Date of Issue</Label>
                <Input type="date" value={dateOfIssue} onChange={(e) => setDateOfIssue(e.target.value)} className="bg-card text-foreground" />
              </div>
            )}
            {fieldWrapper("date_of_expiry",
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Date of Expiry</Label>
                <Input type="date" value={dateOfExpiry} onChange={(e) => setDateOfExpiry(e.target.value)} className="bg-card text-foreground" />
              </div>
            )}
            {fieldWrapper("personal_number",
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Personal Number (JSHIR)</Label>
                <Input value={personalNumber} onChange={(e) => setPersonalNumber(e.target.value)} placeholder="Personal ID number" className="bg-card text-foreground" />
              </div>
            )}
            {fieldWrapper("place_of_birth",
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Place of Birth</Label>
                <Input value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} placeholder="City, Country" className="bg-card text-foreground" />
              </div>
            )}
          </div>
          {/* Passport Image Upload */}
          <div className="mt-6">
            {fieldWrapper("passport_image_path",
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Passport Image (JPG or PNG)</Label>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/80">
                    {uploading === "passport_image" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload Passport Image
                    <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file, "passport_image", setPassportImage); }} />
                  </label>
                  {passportImage && <span className="text-sm text-primary">Uploaded</span>}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Attestat / Diploma */}
      <Card className="border-border bg-card" id="section-attestat">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            Attestat or Diploma
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Upload your attestat or diploma in PDF format (max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fieldWrapper("attestat_pdf_path",
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/80">
                {uploading === "attestat_pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload PDF
                <input type="file" accept="application/pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file, "attestat_pdf", setAttestatPdf); }} />
              </label>
              {attestatPdf && <span className="text-sm text-primary">Uploaded</span>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Language Certificate */}
      <Card className="border-border bg-card" id="section-language">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Globe className="h-5 w-5 text-primary" />
            Language Certificate
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Select your certificate type and upload the PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {fieldWrapper("language_cert_type",
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Certificate Type</Label>
                <Select value={langCertType} onValueChange={(v) => setLangCertType(v as LanguageCertType)}>
                  <SelectTrigger className="max-w-md bg-card text-foreground">
                    <SelectValue placeholder="Select certificate type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LANGUAGE_CERT_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {langCertType && (
              <>
                {fieldWrapper("language_cert_score",
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Score</Label>
                    <Input value={langCertScore} onChange={(e) => setLangCertScore(e.target.value)} placeholder="Enter your score" className="max-w-md bg-card text-foreground" />
                  </div>
                )}
                {fieldWrapper("language_cert_date",
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Exam Date</Label>
                    <Input type="date" value={langCertDate} onChange={(e) => setLangCertDate(e.target.value)} className="max-w-md bg-card text-foreground" />
                  </div>
                )}
                {fieldWrapper("language_cert_pdf_path",
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/80">
                      {uploading === "language_cert_pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Upload Certificate PDF
                      <input type="file" accept="application/pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file, "language_cert_pdf", setLangCertPdf); }} />
                    </label>
                    {langCertPdf && <span className="text-sm text-primary">Uploaded</span>}
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Social Registry */}
      <Card className="border-border bg-card" id="section-social">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Social Protection Registry
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Are you registered in the social protection registry?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {fieldWrapper("social_registry",
              <div className="flex items-center gap-3">
                <Checkbox id="social-registry" checked={socialRegistry} onCheckedChange={(checked) => setSocialRegistry(checked === true)} />
                <Label htmlFor="social-registry" className="cursor-pointer text-foreground">
                  Yes, I am registered in the social protection registry
                </Label>
              </div>
            )}
            {socialRegistry && (
              fieldWrapper("social_registry_pdf_path",
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/80">
                    {uploading === "social_registry_pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload Registry PDF
                    <input type="file" accept="application/pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file, "social_registry_pdf", setSocialRegistryPdf); }} />
                  </label>
                  {socialRegistryPdf && <span className="text-sm text-primary">Uploaded</span>}
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="sticky bottom-0 border-t border-border bg-background/95 px-4 py-4 backdrop-blur-sm">
        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 md:w-auto">
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Application
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
