"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Upload, FileCheck2, X, Loader2, CheckCircle2 } from "lucide-react";

const PROGRAMS = [
  "Software Engineering",
  "Artificial Intelligence",
  "Engineering of Drone Technologies",
];

interface FileFieldConfig {
  key: string;
  label: string;
  required: boolean;
}

const FILE_FIELDS: FileFieldConfig[] = [
  { key: "passport", label: "Passport / ID", required: true },
  { key: "transcript", label: "Academic Transcript", required: true },
  { key: "diploma", label: "High School Diploma", required: true },
  {
    key: "englishCert",
    label: "English Certificate (IELTS/TOEFL)",
    required: true,
  },
  { key: "motivationLetter", label: "Motivation Letter", required: false },
  { key: "achievements", label: "Additional Achievements", required: false },
];

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.doc,.docx";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function FileUpload({
  config,
  file,
  onSelect,
  onClear,
}: {
  config: FileFieldConfig;
  file: File | null;
  onSelect: (file: File | null) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {config.label}
        {config.required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] || null;
          if (f && f.size > MAX_FILE_SIZE) {
            toast.error(`${config.label} exceeds the 10 MB limit.`);
            return;
          }
          onSelect(f);
        }}
      />
      {file ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-success/40 bg-success/5 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <FileCheck2 className="h-4 w-4 shrink-0 text-success" />
            <span className="truncate text-sm text-foreground">{file.name}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClear();
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="shrink-0 rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label={`Remove ${config.label}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center gap-2 rounded-md border border-dashed border-input bg-card px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          <Upload className="h-4 w-4" />
          <span>Choose file</span>
        </button>
      )}
    </div>
  );
}

export function TransferForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [currentUniversity, setCurrentUniversity] = useState("");
  const [currentProgram, setCurrentProgram] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [program, setProgram] = useState("");
  const [completedFirstYear, setCompletedFirstYear] = useState(false);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setFile = (key: string, file: File | null) =>
    setFiles((prev) => ({ ...prev, [key]: file }));

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneDigits = (v: string) => v.replace(/\D/g, "").length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) return toast.error("Please enter your full name.");
    if (!isValidEmail) return toast.error("Please enter a valid email address.");
    if (phoneDigits(phone) < 7)
      return toast.error("Please enter a valid phone number.");
    if (phoneDigits(parentPhone) < 7)
      return toast.error("Please enter a valid parent's phone number.");
    if (!currentUniversity.trim())
      return toast.error("Please enter your current university.");
    if (!program) return toast.error("Please select a transfer program.");
    if (!completedFirstYear)
      return toast.error(
        "You must confirm that you have completed your first year."
      );

    for (const field of FILE_FIELDS) {
      if (field.required && !files[field.key]) {
        return toast.error(`${field.label} is required.`);
      }
    }

    const data = new FormData();
    data.append("fullName", fullName.trim());
    data.append("email", email.trim());
    data.append("phone", phone.trim());
    data.append("parentPhone", parentPhone.trim());
    data.append("currentUniversity", currentUniversity.trim());
    data.append("currentProgram", currentProgram.trim());
    data.append("currentYear", currentYear.trim());
    data.append("program", program);
    data.append("completedFirstYear", "yes");
    data.append("message", message.trim());
    for (const field of FILE_FIELDS) {
      const f = files[field.key];
      if (f) data.append(field.key, f);
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Submission failed. Please try again.");
      } else {
        setSubmitted(true);
        toast.success("Your transfer application was submitted successfully.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-success/40 bg-success/5 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h3 className="mt-4 text-xl font-semibold text-foreground">
          Application Received
        </h3>
        <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground">
          Thank you, {fullName.split(" ")[0]}. Your transfer application and
          documents have been submitted to the Admissions Office. We will review
          your file and contact you at{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact details */}
      <div>
        <h3 className="mb-4 text-base font-semibold text-foreground">
          Contact Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-sm">
              Full Name<span className="ml-0.5 text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Mansurbek Qazaqov"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm">
              Email<span className="ml-0.5 text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">
              Phone Number<span className="ml-0.5 text-destructive">*</span>
            </Label>
            <PhoneInput value={phone} onChange={setPhone} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">
              Parent&apos;s Phone Number
              <span className="ml-0.5 text-destructive">*</span>
            </Label>
            <PhoneInput value={parentPhone} onChange={setParentPhone} />
          </div>
        </div>
      </div>

      {/* Academic details */}
      <div>
        <h3 className="mb-4 text-base font-semibold text-foreground">
          Academic Background
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="currentUniversity" className="text-sm">
              Current University
              <span className="ml-0.5 text-destructive">*</span>
            </Label>
            <Input
              id="currentUniversity"
              value={currentUniversity}
              onChange={(e) => setCurrentUniversity(e.target.value)}
              placeholder="Your current university"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currentProgram" className="text-sm">
              Current Program / Major
            </Label>
            <Input
              id="currentProgram"
              value={currentProgram}
              onChange={(e) => setCurrentProgram(e.target.value)}
              placeholder="e.g. Computer Science"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currentYear" className="text-sm">
              Current Year of Study
            </Label>
            <Input
              id="currentYear"
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
              placeholder="e.g. 1st year"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">
              Transfer To (Program)
              <span className="ml-0.5 text-destructive">*</span>
            </Label>
            <Select value={program} onValueChange={setProgram}>
              <SelectTrigger>
                <SelectValue placeholder="Select a program" />
              </SelectTrigger>
              <SelectContent>
                {PROGRAMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div>
        <h3 className="mb-1 text-base font-semibold text-foreground">
          Required Documents
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Accepted formats: PDF, JPG, PNG, DOC. Max 10 MB per file.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {FILE_FIELDS.map((field) => (
            <FileUpload
              key={field.key}
              config={field}
              file={files[field.key] || null}
              onSelect={(f) => setFile(field.key, f)}
              onClear={() => setFile(field.key, null)}
            />
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <Label htmlFor="message" className="text-sm">
          Additional Message (optional)
        </Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Anything you'd like the admissions team to know..."
          rows={4}
        />
      </div>

      {/* Eligibility confirmation */}
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
          completedFirstYear
            ? "border-primary bg-accent"
            : "border-input bg-card"
        )}
      >
        <input
          type="checkbox"
          checked={completedFirstYear}
          onChange={(e) => setCompletedFirstYear(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
        />
        <span className="text-sm text-foreground">
          I confirm that I have completed my first year of undergraduate study.
          <span className="mt-1 block text-xs text-muted-foreground">
            Al-Khwarizmi University accepts transfers into the 2nd year only.
            3rd and 4th year admissions are not available.
          </span>
        </span>
      </label>

      <Button
        type="submit"
        size="lg"
        className="w-full btn-press"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Transfer Application"
        )}
      </Button>
    </form>
  );
}
