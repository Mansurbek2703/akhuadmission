"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatAddress } from "@/lib/address-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Loader2, ExternalLink, MessageSquare, Lock, ChevronLeft, ChevronRight, Check, X, ShieldCheck, ShieldAlert, ArrowLeft, User, Download, Upload, ZoomIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  APPLICATION_STATUS_LABELS,
  PROGRAM_LABELS,
  EDUCATION_TYPE_LABELS,
  LANGUAGE_CERT_LABELS,
  INTL_CERT_LABELS,
  CITIZENSHIP_LABELS,
  } from "@/lib/types";
import type {
  Application,
  ApplicationStatus,
  Program,
  EducationType,
  LanguageCertType,
  Citizenship,
} from "@/lib/types";

interface ApplicationsTableProps {
  applications: Application[];
  onUpdate: () => void;
  unreadChatMap?: Record<string, number>;
  selectedApp?: Application | null;
  onSelectApp?: (app: Application | null) => void;
}

const statusColors: Record<ApplicationStatus, string> = {
  submitted: "bg-muted text-muted-foreground border-border",
  pending_review: "bg-warning/10 text-warning border-warning/20",
  incomplete_document: "bg-destructive/10 text-destructive border-destructive/20",
  approved_to_attend_exam: "bg-primary/10 text-primary border-primary/20",
  passed_with_exemption: "bg-accent text-accent-foreground border-accent",
  application_approved: "bg-success/10 text-success border-success/20",
};

export function ApplicationsTable({
  applications,
  onUpdate,
  unreadChatMap = {},
  selectedApp: selectedAppProp = null,
  onSelectApp,
}: ApplicationsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [selectedAppLocal, setSelectedAppLocal] = useState<Application | null>(null);

  const selectedApp = onSelectApp ? selectedAppProp : selectedAppLocal;
  const setSelectedApp = onSelectApp ? onSelectApp : setSelectedAppLocal;

  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const totalPages = Math.ceil(applications.length / PAGE_SIZE);
  const paginatedApps = applications.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const navigateToChat = (appId: string) => {
    const basePath = pathname.startsWith("/superadmin") ? "/superadmin/chat" : "/admin/chat";
    router.push(`${basePath}?app=${appId}`);
  };

  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [verifyLoading, setVerifyLoading] = useState<string | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const openDetail = (app: Application) => {
    setSelectedApp(app);
    setEditingCell(null);
  };

  const startEdit = (fieldKey: string, currentValue: string) => {
    setEditingCell(fieldKey);
    setEditingValue(currentValue);
  };

  const saveInlineEdit = useCallback(async (fieldKey: string) => {
    if (!selectedApp) return;
    setSaving(true);
    try {
      const res = await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: selectedApp.id, [fieldKey]: editingValue }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success(`${fieldKey} updated`);
      setSelectedApp({ ...selectedApp, [fieldKey]: editingValue } as Application);
      setEditingCell(null);
      onUpdate();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }, [selectedApp, editingValue, onUpdate]);

  const cancelEdit = () => { setEditingCell(null); };

  const handleVerifyToggle = async (field: string, value: boolean) => {
    if (!selectedApp) return;
    setVerifyLoading(field);
    try {
      const res = await fetch("/api/applications/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: selectedApp.id, field, value }),
      });
      if (!res.ok) throw new Error("Failed");
      setSelectedApp({ ...selectedApp, [field]: value } as Application);
      toast.success(value ? "Marked" : "Unmarked");
      onUpdate();
    } catch {
      toast.error("Failed to update verification");
    } finally {
      setVerifyLoading(null);
    }
  };

  const handleAdminPhotoUpload = async (file: File) => {
    if (!selectedApp) return;
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", selectedApp.user_id);
      const res = await fetch("/api/profile/photo", {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload");
      const data = await res.json();
      setSelectedApp({ ...selectedApp, user_profile_photo: data.profile_photo_path } as Application);
      toast.success("Profile photo updated");
      onUpdate();
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePhotoDownload = () => {
    if (!selectedApp?.user_profile_photo) return;
    const url = `/api/files/${selectedApp.user_profile_photo}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `profile_${selectedApp.surname || "applicant"}_${selectedApp.given_name || ""}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleStatusChange = async (
    applicationId: string,
    newStatus: ApplicationStatus
  ) => {
    try {
      const res = await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
        }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success("Status updated");
      onUpdate();
    } catch {
      toast.error("Failed to update status");
    }
  };



  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
        <p className="text-lg font-medium text-muted-foreground">
          No applications found
        </p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  const renderNameCell = (app: Application) => {
    const isAssignedToOther = app.assigned_admin_id && user && app.assigned_admin_id !== user.id;
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => navigateToChat(app.id)}
          className="group flex flex-wrap items-center gap-1.5 text-left font-medium text-foreground hover:text-primary transition-colors"
        >
          <span className="group-hover:underline">
            {app.surname && app.given_name ? `${app.surname} ${app.given_name}` : "Not provided"}
          </span>
          {!app.assigned_admin_id && (
            <span className="rounded bg-destructive px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-destructive-foreground">New</span>
          )}
          {unreadChatMap[app.id] > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground animate-pulse">
              <MessageSquare className="h-2.5 w-2.5" />
              {unreadChatMap[app.id]}
            </span>
          )}
        </button>
        {isAssignedToOther && (
          <span className="flex items-center gap-1 text-[10px] text-warning">
            <Lock className="h-2.5 w-2.5" />
            {(app as Application & { assigned_admin_name?: string }).assigned_admin_name?.trim()
              ? `${(app as Application & { assigned_admin_name?: string }).assigned_admin_name} bilan muloqotda`
              : "Boshqa admin bilan muloqotda"}
          </span>
        )}
      </div>
    );
  };

  const renderStatusSelect = (app: Application) => (
    <Select
      value={app.status}
      onValueChange={(v) => handleStatusChange(app.id, v as ApplicationStatus)}
    >
      <SelectTrigger className="h-7 w-full max-w-[180px] border-0 bg-transparent p-0 text-foreground">
        <Badge variant="outline" className={statusColors[app.status as ApplicationStatus] || ""}>
          {APPLICATION_STATUS_LABELS[app.status as ApplicationStatus]}
        </Badge>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(APPLICATION_STATUS_LABELS).map(([key, label]) => (
          <SelectItem key={key} value={key}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (selectedApp) {
    return (
      <>
        <div className="rounded-lg border border-border bg-card shadow-sm">
          {/* Header with name and back button */}
          <div className="border-b border-border px-4 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setSelectedApp(null); setEditingCell(null); }}
                className="shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground mt-0.5"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 min-w-0">
                {selectedApp.unikal_id && (
                  <p className="text-xs font-semibold text-primary mb-0.5">
                    Applicant ID: #{selectedApp.unikal_id}
                  </p>
                )}
                <h2 className="text-xl font-bold text-foreground sm:text-2xl text-balance">
                  {selectedApp.surname && selectedApp.given_name
                    ? `${selectedApp.surname} ${selectedApp.given_name}`
                    : "Applicant"}
                </h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{selectedApp.user_email}</span>
                  {selectedApp.user_program && (
                    <>
                      <span className="text-border">|</span>
                      <span>{PROGRAM_LABELS[selectedApp.user_program as Program]}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <Select
                  value={selectedApp.status}
                  onValueChange={(v) => {
                    handleStatusChange(selectedApp.id, v as ApplicationStatus);
                    setSelectedApp({ ...selectedApp, status: v as ApplicationStatus });
                  }}
                >
                  <SelectTrigger className="h-8 w-[180px] bg-card text-foreground text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(APPLICATION_STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Detail content */}
          <div className="p-4 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-2">
              {(() => {
                const appRec = selectedApp as unknown as Record<string, unknown>;

                const EditableRow = ({ label, fieldKey, displayValue }: { label: string; fieldKey: string; displayValue?: string }) => {
                  const rawVal = String(appRec[fieldKey] ?? "");
                  const display = displayValue || rawVal || "-";
                  const isEditing = editingCell === fieldKey;

                  if (isEditing) {
                    return (
                      <div className="flex items-center justify-between gap-2 px-3 py-2">
                        <span className="text-sm text-muted-foreground shrink-0">{label}</span>
                        <div className="flex items-center gap-1.5">
                          <Input
                            autoFocus
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") saveInlineEdit(fieldKey); if (e.key === "Escape") cancelEdit(); }}
                            className="h-7 text-sm bg-card max-w-[200px]"
                          />
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => saveInlineEdit(fieldKey)} disabled={saving}>
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={cancelEdit}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      className="flex items-center justify-between gap-2 px-3 py-2 cursor-pointer hover:bg-accent/40 transition-colors"
                      onDoubleClick={() => startEdit(fieldKey, rawVal)}
                      title="Double-click to edit"
                    >
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="font-medium text-foreground text-sm text-right max-w-[60%] break-words">{display}</span>
                    </div>
                  );
                };

                const ReadonlyRow = ({ label, value }: { label: string; value: string }) => (
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground text-sm text-right max-w-[60%] break-words">{value || "-"}</span>
                  </div>
                );

                const DocRow = ({ label, path, verifiedField, invalidField }: { label: string; path?: string; verifiedField?: string; invalidField?: string }) => (
                  <div className="flex flex-col gap-2 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      {path ? (
                        <a href={path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not uploaded</span>
                      )}
                    </div>
                    {path && verifiedField && invalidField && (
                      <div className="flex flex-wrap gap-4 pl-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={!!appRec[verifiedField]}
                            disabled={verifyLoading === verifiedField}
                            onCheckedChange={(checked) => handleVerifyToggle(verifiedField, !!checked)}
                          />
                          <span className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                            <ShieldCheck className="h-3.5 w-3.5" /> Verified
                          </span>
                          {verifyLoading === verifiedField && <Loader2 className="h-3 w-3 animate-spin" />}
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={!!appRec[invalidField]}
                            disabled={verifyLoading === invalidField}
                            onCheckedChange={(checked) => handleVerifyToggle(invalidField, !!checked)}
                          />
                          <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                            <ShieldAlert className="h-3.5 w-3.5" /> Invalid
                          </span>
                          {verifyLoading === invalidField && <Loader2 className="h-3 w-3 animate-spin" />}
                        </label>
                      </div>
                    )}
                  </div>
                );

                const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="bg-muted/50 px-3 py-2 border-b border-border">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">{title}</h4>
                    </div>
                    <div className="divide-y divide-border">{children}</div>
                  </div>
                );

                const citizenshipDisplay = selectedApp.citizenship === "other"
                  ? (selectedApp as unknown as Record<string, string>).citizenship_other || selectedApp.citizenship
                  : CITIZENSHIP_LABELS[selectedApp.citizenship as Citizenship] || selectedApp.citizenship || "-";

                return (
                  <>
                    {/* Left column */}
                    <div className="flex flex-col gap-4">
                      <SectionCard title="Account">
                        <div className="flex items-center gap-3 px-3 py-2">
                          <button
                            type="button"
                            onClick={() => selectedApp.user_profile_photo && setPhotoModalOpen(true)}
                            className="relative group shrink-0"
                            disabled={!selectedApp.user_profile_photo}
                          >
                            <Avatar className="h-14 w-14 border-2 border-border">
                              <AvatarImage
                                src={selectedApp.user_profile_photo ? `/api/files/${selectedApp.user_profile_photo}` : undefined}
                                alt="Applicant photo"
                              />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                <User className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            {selectedApp.user_profile_photo && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ZoomIn className="h-5 w-5 text-white" />
                              </div>
                            )}
                          </button>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-foreground">
                              {selectedApp.surname && selectedApp.given_name
                                ? `${selectedApp.surname} ${selectedApp.given_name}`
                                : selectedApp.user_email || "Applicant"}
                            </span>
                            {!selectedApp.user_profile_photo && (
                              <span className="text-xs text-destructive">No profile photo uploaded</span>
                            )}
                            <div className="flex items-center gap-1.5">
                              {selectedApp.user_profile_photo && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs gap-1"
                                  onClick={handlePhotoDownload}
                                >
                                  <Download className="h-3 w-3" /> Download
                                </Button>
                              )}
                              <label
                                className="inline-flex items-center gap-1 h-6 px-2 text-xs font-medium rounded-md border border-input bg-background hover:bg-accent cursor-pointer"
                              >
                                {photoUploading ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Upload className="h-3 w-3" />
                                )}
                                {selectedApp.user_profile_photo ? "Change" : "Upload"}
                                <input
                                  type="file"
                                  className="sr-only"
                                  accept="image/jpeg,image/png"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleAdminPhotoUpload(f);
                                    e.target.value = "";
                                  }}
                                  disabled={photoUploading}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                        <ReadonlyRow label="Email" value={selectedApp.user_email || "-"} />
                        <ReadonlyRow label="Program" value={selectedApp.user_program ? PROGRAM_LABELS[selectedApp.user_program as Program] : "-"} />
                        <ReadonlyRow label="Completion" value={`${selectedApp.completion_percentage}%`} />
                        <ReadonlyRow label="Submitted" value={new Date(selectedApp.created_at).toLocaleDateString()} />
                      </SectionCard>

                      <SectionCard title="Personal Information">
                        <EditableRow label="Surname" fieldKey="surname" />
                        <EditableRow label="Given Name" fieldKey="given_name" />
                        <EditableRow label="Middle Name" fieldKey="middle_name" />
                        <EditableRow label="Gender" fieldKey="gender" />
                        <EditableRow label="Citizenship" fieldKey="citizenship" displayValue={citizenshipDisplay} />
                        <EditableRow label="Passport Number" fieldKey="card_number" />
                        <EditableRow label="JSHIR" fieldKey="personal_number" />
                        <EditableRow label="Date of Birth" fieldKey="date_of_birth" displayValue={selectedApp.date_of_birth?.split("T")[0] || "-"} />
                        <EditableRow label="Date of Issue" fieldKey="date_of_issue" displayValue={selectedApp.date_of_issue?.split("T")[0] || "-"} />
                        <EditableRow label="Date of Expiry" fieldKey="date_of_expiry" displayValue={selectedApp.date_of_expiry?.split("T")[0] || "-"} />
                        <EditableRow
                          label="Place of Birth"
                          fieldKey="place_of_birth"
                          displayValue={
                            selectedApp.birth_country
                              ? formatAddress(selectedApp.birth_country, selectedApp.birth_region, selectedApp.birth_district, selectedApp.birth_street)
                              : selectedApp.place_of_birth || "-"
                          }
                        />
                        <EditableRow
                          label="Current Address"
                          fieldKey="current_address"
                          displayValue={
                            selectedApp.address_country
                              ? formatAddress(selectedApp.address_country, selectedApp.address_region, selectedApp.address_district, selectedApp.address_street)
                              : selectedApp.current_address || "-"
                          }
                        />
                        <DocRow label="Passport Photo" path={selectedApp.passport_image_path} />
                      </SectionCard>

                      <SectionCard title="Contact">
                        <EditableRow label="Personal Phone" fieldKey="personal_phone" />
                        <EditableRow label="Parent Phone" fieldKey="parent_phone" />
                        <EditableRow label="Friend Phone" fieldKey="friend_phone" />
                      </SectionCard>
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col gap-4">
                      <SectionCard title="Education">
                        <ReadonlyRow label="Education Type" value={selectedApp.education_type ? EDUCATION_TYPE_LABELS[selectedApp.education_type as EducationType] : "-"} />
                        <EditableRow label="Institution Type" fieldKey="institution_type" />
                        <EditableRow label="Institution Location" fieldKey="institution_location" />
                        <EditableRow label="Institution Name" fieldKey="institution_name" />
                        <DocRow label="Attestat / Diploma" path={selectedApp.attestat_pdf_path} verifiedField="attestat_verified" invalidField="attestat_invalid" />
                      </SectionCard>

                      <SectionCard title="English Proficiency Certificate">
                        <ReadonlyRow label="Certificate Type" value={selectedApp.language_cert_type ? LANGUAGE_CERT_LABELS[selectedApp.language_cert_type as LanguageCertType] : "N/A"} />
                        <EditableRow label="Score / Band" fieldKey="language_cert_score" />
                        <EditableRow label="Certificate ID" fieldKey="language_cert_id" />
                        <DocRow label="Certificate PDF" path={selectedApp.language_cert_pdf_path} verifiedField="language_cert_verified" invalidField="language_cert_invalid" />
                      </SectionCard>

                      <SectionCard title="International Certificate">
                        <ReadonlyRow label="Certificate Type" value={(selectedApp as unknown as Record<string, string>).intl_cert_type ? (INTL_CERT_LABELS as Record<string, string>)[(selectedApp as unknown as Record<string, string>).intl_cert_type] || (selectedApp as unknown as Record<string, string>).intl_cert_type : "N/A"} />
                        {((selectedApp as unknown as Record<string, string>).intl_cert_type === "sat" || (selectedApp as unknown as Record<string, string>).sat_score) && (<>
                          <EditableRow label="SAT Score" fieldKey="sat_score" />
                          <EditableRow label="SAT ID" fieldKey="sat_id" />
                          <ReadonlyRow label="College Board Email" value={(selectedApp as unknown as Record<string, string>).sat_email || "N/A"} />
                          <ReadonlyRow label="College Board Password" value={(selectedApp as unknown as Record<string, string>).sat_password || "N/A"} />
                          <DocRow label="SAT PDF" path={(selectedApp as unknown as Record<string, string>).sat_pdf_path} verifiedField="sat_verified" invalidField="sat_invalid" />
                        </>)}
                        {(selectedApp as unknown as Record<string, string>).intl_cert_type === "ib" && (<>
                          <EditableRow label="IB Score" fieldKey="ib_score" />
                          <EditableRow label="IB Candidate No." fieldKey="ib_id" />
                          <DocRow label="IB PDF" path={(selectedApp as unknown as Record<string, string>).ib_pdf_path} verifiedField="ib_verified" invalidField="ib_invalid" />
                        </>)}
                        {(selectedApp as unknown as Record<string, string>).intl_cert_type === "a_levels" && (<>
                          <EditableRow label="A-Levels Score" fieldKey="alevel_score" />
                          <EditableRow label="A-Levels Candidate No." fieldKey="alevel_id" />
                          <DocRow label="A-Levels PDF" path={(selectedApp as unknown as Record<string, string>).alevel_pdf_path} verifiedField="alevel_verified" invalidField="alevel_invalid" />
                        </>)}
                      </SectionCard>

                      <SectionCard title="Social Protection">
                        <ReadonlyRow label="Social Protection" value={selectedApp.social_protection ? "Yes" : "No"} />
                        <DocRow label="Social Protection PDF" path={selectedApp.social_protection_pdf_path} />
                      </SectionCard>

                      <SectionCard title="Achievements">
                        <EditableRow label="Achievements" fieldKey="other_achievements_text" />
                        <DocRow label="Achievements PDF" path={selectedApp.other_achievements_pdf_path} />
                      </SectionCard>

                      <SectionCard title="Submission Details">
                        <ReadonlyRow label="How did you hear about us" value={String(appRec.hear_about || "-")} />

                        <ReadonlyRow label="Info is correct" value={appRec.confirm_info_correct ? "Confirmed" : "Not confirmed"} />
                        <ReadonlyRow label="Final year completed" value={appRec.confirm_final_year ? "Confirmed" : "Not confirmed"} />
                        <ReadonlyRow label="Fake info = disqualification" value={appRec.confirm_fake_disqualify ? "Confirmed" : "Not confirmed"} />
                        <ReadonlyRow label="Fake info = cancellation" value={appRec.confirm_fake_cancel ? "Confirmed" : "Not confirmed"} />
                      </SectionCard>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Photo Preview Modal */}
        {photoModalOpen && selectedApp.user_profile_photo && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setPhotoModalOpen(false)}
          >
            <div
              className="relative max-w-[90vw] max-h-[90vh] rounded-xl overflow-hidden bg-card shadow-2xl border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
                <span className="text-sm font-semibold text-foreground">
                  {selectedApp.surname && selectedApp.given_name
                    ? `${selectedApp.surname} ${selectedApp.given_name} - Profile Photo`
                    : "Applicant Profile Photo"}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={handlePhotoDownload}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                  <label
                    className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border border-input bg-background hover:bg-accent cursor-pointer"
                  >
                    {photoUploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    Replace
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/png"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleAdminPhotoUpload(f);
                        e.target.value = "";
                      }}
                      disabled={photoUploading}
                    />
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setPhotoModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center p-4 bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/files/${selectedApp.user_profile_photo}`}
                  alt="Applicant profile photo"
                  className="max-w-[80vw] max-h-[75vh] object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-muted-foreground min-w-[50px]">ID</TableHead>
                <TableHead className="text-muted-foreground min-w-[180px]">Name</TableHead>
                <TableHead className="text-muted-foreground min-w-[180px]">Email</TableHead>
                <TableHead className="text-muted-foreground min-w-[120px]">Program</TableHead>
                <TableHead className="text-muted-foreground min-w-[160px]">Status</TableHead>
                <TableHead className="text-muted-foreground min-w-[100px]">Completion</TableHead>
                <TableHead className="text-muted-foreground min-w-[90px]">Date</TableHead>
                <TableHead className="text-right text-muted-foreground min-w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedApps.map((app) => (
                <TableRow key={app.id} className="hover:bg-accent/30">
                  <TableCell className="text-xs font-semibold text-primary">{app.unikal_id ? `#${app.unikal_id}` : "-"}</TableCell>
                  <TableCell>{renderNameCell(app)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm truncate max-w-[200px]">{app.user_email}</TableCell>
                  <TableCell className="text-foreground text-sm">
                    {app.user_program ? PROGRAM_LABELS[app.user_program as Program] : "N/A"}
                  </TableCell>
                  <TableCell>{renderStatusSelect(app)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-14 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${app.completion_percentage}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{app.completion_percentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openDetail(app)} className="gap-1 text-primary hover:text-primary">
                      <Eye className="h-4 w-4" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, applications.length)} of {applications.length}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="gap-1 bg-transparent border-border text-foreground">
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <span className="text-sm text-muted-foreground">{currentPage} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="gap-1 bg-transparent border-border text-foreground">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card List */}
      <div className="flex flex-col gap-3 lg:hidden">
        {paginatedApps.map((app) => (
          <div key={app.id} className="rounded-lg border border-border bg-card p-3 shadow-sm">
            {app.unikal_id && (
              <span className="text-[10px] font-semibold text-primary">ID: #{app.unikal_id}</span>
            )}
            <div className="flex items-start justify-between gap-2">
              {renderNameCell(app)}
              <Button variant="ghost" size="icon" onClick={() => openDetail(app)} className="shrink-0 text-primary h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground truncate">{app.user_email}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {renderStatusSelect(app)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{app.user_program ? PROGRAM_LABELS[app.user_program as Program] : "N/A"}</span>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-12 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${app.completion_percentage}%` }} />
                </div>
                <span>{app.completion_percentage}%</span>
              </div>
              <span>{new Date(app.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="text-foreground">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, applications.length)} of {applications.length}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="text-foreground">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
