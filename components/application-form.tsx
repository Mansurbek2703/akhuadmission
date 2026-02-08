"use client";

import { useState, useCallback } from "react";
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

interface ApplicationFormProps {
  application: Application;
  onUpdate: () => void;
}

export function ApplicationForm({
  application,
  onUpdate,
}: ApplicationFormProps) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  // Form state
  const [educationType, setEducationType] = useState(
    application.education_type || ""
  );
  const [surname, setSurname] = useState(application.surname || "");
  const [givenName, setGivenName] = useState(application.given_name || "");
  const [gender, setGender] = useState(application.gender || "");
  const [citizenship, setCitizenship] = useState(
    application.citizenship || ""
  );
  const [cardNumber, setCardNumber] = useState(
    application.card_number || ""
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    application.date_of_birth?.split("T")[0] || ""
  );
  const [dateOfIssue, setDateOfIssue] = useState(
    application.date_of_issue?.split("T")[0] || ""
  );
  const [dateOfExpiry, setDateOfExpiry] = useState(
    application.date_of_expiry?.split("T")[0] || ""
  );
  const [personalNumber, setPersonalNumber] = useState(
    application.personal_number || ""
  );
  const [placeOfBirth, setPlaceOfBirth] = useState(
    application.place_of_birth || ""
  );
  const [passportImage, setPassportImage] = useState(
    application.passport_image_path || ""
  );
  const [attestatPdf, setAttestatPdf] = useState(
    application.attestat_pdf_path || ""
  );
  const [langCertType, setLangCertType] = useState(
    application.language_cert_type || ""
  );
  const [langCertPdf, setLangCertPdf] = useState(
    application.language_cert_pdf_path || ""
  );
  const [langCertScore, setLangCertScore] = useState(
    application.language_cert_score || ""
  );
  const [langCertDate, setLangCertDate] = useState(
    application.language_cert_date?.split("T")[0] || ""
  );
  const [socialRegistry, setSocialRegistry] = useState(
    application.social_registry || false
  );
  const [socialRegistryPdf, setSocialRegistryPdf] = useState(
    application.social_registry_pdf_path || ""
  );

  const calculateCompletion = useCallback(() => {
    let total = 0;
    let filled = 0;

    // Education type: 1 field
    total += 1;
    if (educationType) filled += 1;

    // Passport fields: 10 fields
    const passportFields = [
      surname,
      givenName,
      gender,
      citizenship,
      cardNumber,
      dateOfBirth,
      dateOfIssue,
      dateOfExpiry,
      personalNumber,
      placeOfBirth,
    ];
    total += passportFields.length;
    filled += passportFields.filter((f) => f).length;

    // Passport image: 1
    total += 1;
    if (passportImage) filled += 1;

    // Attestat: 1
    total += 1;
    if (attestatPdf) filled += 1;

    // Language cert: 4 fields (type, pdf, score, date)
    total += 4;
    if (langCertType) filled += 1;
    if (langCertPdf) filled += 1;
    if (langCertScore) filled += 1;
    if (langCertDate) filled += 1;

    return Math.round((filled / total) * 100);
  }, [
    educationType,
    surname,
    givenName,
    gender,
    citizenship,
    cardNumber,
    dateOfBirth,
    dateOfIssue,
    dateOfExpiry,
    personalNumber,
    placeOfBirth,
    passportImage,
    attestatPdf,
    langCertType,
    langCertPdf,
    langCertScore,
    langCertDate,
  ]);

  const handleUpload = async (
    file: File,
    docType: string,
    setter: (path: string) => void
  ) => {
    setUploading(docType);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("doc_type", docType);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setter(data.filePath);
      toast.success("File uploaded successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Upload failed"
      );
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
      toast.error(
        err instanceof Error ? err.message : "Failed to save"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Section 1: Education Type */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <GraduationCap className="h-5 w-5 text-primary" />
            Initial Education Type
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Select your initial education type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={educationType}
            onValueChange={(v) => setEducationType(v as EducationType)}
          >
            <SelectTrigger className="max-w-md bg-card text-foreground">
              <SelectValue placeholder="Select your education type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(EDUCATION_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Section 2: Passport Data */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5 text-primary" />
            Passport Information
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your passport details manually. Upload a JPG or PNG of your passport.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Surname</Label>
              <Input
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="Enter your surname"
                className="bg-card text-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Given Name</Label>
              <Input
                value={givenName}
                onChange={(e) => setGivenName(e.target.value)}
                placeholder="Enter your given name"
                className="bg-card text-foreground"
              />
            </div>
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
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Citizenship</Label>
              <Input
                value={citizenship}
                onChange={(e) => setCitizenship(e.target.value)}
                placeholder="e.g. Uzbekistan"
                className="bg-card text-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Card Number</Label>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Passport card number"
                className="bg-card text-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Date of Birth</Label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="bg-card text-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Date of Issue</Label>
              <Input
                type="date"
                value={dateOfIssue}
                onChange={(e) => setDateOfIssue(e.target.value)}
                className="bg-card text-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Date of Expiry</Label>
              <Input
                type="date"
                value={dateOfExpiry}
                onChange={(e) => setDateOfExpiry(e.target.value)}
                className="bg-card text-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Personal Number</Label>
              <Input
                value={personalNumber}
                onChange={(e) => setPersonalNumber(e.target.value)}
                placeholder="Personal ID number"
                className="bg-card text-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Place of Birth</Label>
              <Input
                value={placeOfBirth}
                onChange={(e) => setPlaceOfBirth(e.target.value)}
                placeholder="City, Country"
                className="bg-card text-foreground"
              />
            </div>
          </div>
          {/* Passport Image Upload */}
          <div className="mt-6 flex flex-col gap-2">
            <Label className="text-foreground">
              Passport Image (JPG or PNG)
            </Label>
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/80">
                {uploading === "passport_image" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload Passport Image
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      handleUpload(file, "passport_image", setPassportImage);
                  }}
                />
              </label>
              {passportImage && (
                <span className="text-sm text-primary">Uploaded</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Attestat / Diploma */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            Attestat or Diploma
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Upload your attestat or diploma as PDF (max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/80">
              {uploading === "attestat_pdf" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload PDF
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file)
                    handleUpload(file, "attestat_pdf", setAttestatPdf);
                }}
              />
            </label>
            {attestatPdf && (
              <span className="text-sm text-primary">Uploaded</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Language Certificate */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Globe className="h-5 w-5 text-primary" />
            Language Certificate
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Select your certificate type, then upload the PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Certificate Type</Label>
              <Select
                value={langCertType}
                onValueChange={(v) => setLangCertType(v as LanguageCertType)}
              >
                <SelectTrigger className="max-w-md bg-card text-foreground">
                  <SelectValue placeholder="Select certificate type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGE_CERT_LABELS).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            {langCertType && (
              <>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Score</Label>
                  <Input
                    value={langCertScore}
                    onChange={(e) => setLangCertScore(e.target.value)}
                    placeholder="Enter your score"
                    className="max-w-md bg-card text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Exam Date</Label>
                  <Input
                    type="date"
                    value={langCertDate}
                    onChange={(e) => setLangCertDate(e.target.value)}
                    className="max-w-md bg-card text-foreground"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/80">
                    {uploading === "language_cert_pdf" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload Certificate PDF
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file)
                          handleUpload(
                            file,
                            "language_cert_pdf",
                            setLangCertPdf
                          );
                      }}
                    />
                  </label>
                  {langCertPdf && (
                    <span className="text-sm text-primary">Uploaded</span>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Social Registry */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Social Protection Registry
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Are you included in the social protection registry?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="social-registry"
                checked={socialRegistry}
                onCheckedChange={(checked) =>
                  setSocialRegistry(checked === true)
                }
              />
              <Label
                htmlFor="social-registry"
                className="cursor-pointer text-foreground"
              >
                Yes, I am included in the social protection registry
              </Label>
            </div>
            {socialRegistry && (
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/80">
                  {uploading === "social_registry_pdf" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload Social Registry PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file)
                        handleUpload(
                          file,
                          "social_registry_pdf",
                          setSocialRegistryPdf
                        );
                    }}
                  />
                </label>
                {socialRegistryPdf && (
                  <span className="text-sm text-primary">Uploaded</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="sticky bottom-0 border-t border-border bg-background/95 px-4 py-4 backdrop-blur-sm">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 md:w-auto"
        >
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
