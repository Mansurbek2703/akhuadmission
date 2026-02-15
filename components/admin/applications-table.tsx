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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, Loader2, ExternalLink, MessageSquare, Lock, ChevronLeft, ChevronRight, Check, X, ShieldCheck, ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  APPLICATION_STATUS_LABELS,
  PROGRAM_LABELS,
  EDUCATION_TYPE_LABELS,
  LANGUAGE_CERT_LABELS,
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
                        <ReadonlyRow label="Email" value={selectedApp.user_email || "-"} />
                        <ReadonlyRow label="Program" value={selectedApp.user_program ? PROGRAM_LABELS[selectedApp.user_program as Program] : "-"} />
                        <ReadonlyRow label="Completion" value={`${selectedApp.completion_percentage}%`} />
                        <ReadonlyRow label="Submitted" value={new Date(selectedApp.created_at).toLocaleDateString()} />
                      </SectionCard>

                      <SectionCard title="Personal Information">
                        <EditableRow label="Surname" fieldKey="surname" />
                        <EditableRow label="Given Name" fieldKey="given_name" />
                        <EditableRow label="Gender" fieldKey="gender" />
                        <EditableRow label="Citizenship" fieldKey="citizenship" displayValue={citizenshipDisplay} />
                        <EditableRow label="Passport Number" fieldKey="card_number" />
                        <EditableRow label="JSHIR" fieldKey="personal_number" />
                        <EditableRow label="Date of Birth" fieldKey="date_of_birth" displayValue={selectedApp.date_of_birth?.split("T")[0] || "-"} />
                        <EditableRow label="Date of Issue" fieldKey="date_of_issue" displayValue={selectedApp.date_of_issue?.split("T")[0] || "-"} />
                        <EditableRow label="Date of Expiry" fieldKey="date_of_expiry" displayValue={selectedApp.date_of_expiry?.split("T")[0] || "-"} />
                        <EditableRow label="Place of Birth" fieldKey="place_of_birth" />
                        <EditableRow label="Current Address" fieldKey="current_address" />
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

                      <SectionCard title="Certificates">
                        <ReadonlyRow label="Language Certificate" value={selectedApp.language_cert_type ? LANGUAGE_CERT_LABELS[selectedApp.language_cert_type as LanguageCertType] : "N/A"} />
                        <EditableRow label="Language Score" fieldKey="language_cert_score" />
                        <EditableRow label="Language Cert ID" fieldKey="language_cert_id" />
                        <DocRow label="Language Cert PDF" path={selectedApp.language_cert_pdf_path} verifiedField="language_cert_verified" invalidField="language_cert_invalid" />
                        <EditableRow label="SAT Score" fieldKey="sat_score" />
                        <EditableRow label="SAT ID" fieldKey="sat_id" />
                        <DocRow label="SAT PDF" path={(selectedApp as unknown as Record<string, string>).sat_pdf_path} verifiedField="sat_verified" invalidField="sat_invalid" />
                        <EditableRow label="CEFR Level" fieldKey="cefr_score" />
                        <EditableRow label="CEFR ID" fieldKey="cefr_id" />
                        <DocRow label="CEFR PDF" path={(selectedApp as unknown as Record<string, string>).cefr_pdf_path} verifiedField="cefr_verified" invalidField="cefr_invalid" />
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
                        <ReadonlyRow label="Sibling at university" value={String(appRec.sibling_study || "-")} />
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
