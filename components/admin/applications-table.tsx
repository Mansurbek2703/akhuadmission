"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Eye, Loader2, ExternalLink, MessageSquare, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  APPLICATION_STATUS_LABELS,
  PROGRAM_LABELS,
  EDUCATION_TYPE_LABELS,
} from "@/lib/types";
import type {
  Application,
  ApplicationStatus,
  Program,
  EducationType,
} from "@/lib/types";

interface ApplicationsTableProps {
  applications: Application[];
  onUpdate: () => void;
  unreadChatMap?: Record<string, number>;
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
}: ApplicationsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
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

  const openDetail = (app: Application) => {
    setSelectedApp(app);
    setEditValues({
      surname: app.surname || "",
      given_name: app.given_name || "",
      gender: app.gender || "",
      citizenship: app.citizenship || "",
      card_number: app.card_number || "",
      date_of_birth: app.date_of_birth?.split("T")[0] || "",
      date_of_issue: app.date_of_issue?.split("T")[0] || "",
      date_of_expiry: app.date_of_expiry?.split("T")[0] || "",
      personal_number: app.personal_number || "",
      place_of_birth: app.place_of_birth || "",
      language_cert_score: app.language_cert_score || "",
    });
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

  const handleSaveEdits = async () => {
    if (!selectedApp) return;
    setSaving(true);
    try {
      const res = await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          ...editValues,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Application updated");
      setSelectedApp(null);
      onUpdate();
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
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

  return (
    <>
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Phone</TableHead>
                <TableHead className="text-muted-foreground">
                  Program
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Education Type
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Completion
                </TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedApps.map((app) => {
                const isAssignedToOther = app.assigned_admin_id && user && app.assigned_admin_id !== user.id;
                return (
                  <TableRow key={app.id} className="hover:bg-accent/30">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => navigateToChat(app.id)}
                          className="group flex items-center gap-2 text-left font-medium text-foreground hover:text-primary transition-colors"
                        >
                          <span className="group-hover:underline">
                            {app.surname && app.given_name
                              ? `${app.surname} ${app.given_name}`
                              : "Not provided"}
                          </span>
                          {!app.assigned_admin_id && (
                            <span className="rounded bg-destructive px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-destructive-foreground">
                              New
                            </span>
                          )}
                          {unreadChatMap[app.id] > 0 && (
                            <span className="flex items-center gap-1 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground animate-pulse">
                              <MessageSquare className="h-2.5 w-2.5" />
                              {unreadChatMap[app.id] === 1
                                ? "1 new message"
                                : `${unreadChatMap[app.id]} new messages`}
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
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {app.user_email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {app.user_phone || "N/A"}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {app.user_program
                        ? PROGRAM_LABELS[app.user_program as Program]
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {app.education_type
                        ? EDUCATION_TYPE_LABELS[
                            app.education_type as EducationType
                          ]
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={app.status}
                        onValueChange={(v) =>
                          handleStatusChange(
                            app.id,
                            v as ApplicationStatus
                          )
                        }
                      >
                        <SelectTrigger className="h-8 w-[200px] border-0 bg-transparent p-0 text-foreground">
                          <Badge
                            variant="outline"
                            className={
                              statusColors[app.status as ApplicationStatus] ||
                              ""
                            }
                          >
                            {
                              APPLICATION_STATUS_LABELS[
                                app.status as ApplicationStatus
                              ]
                            }
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(APPLICATION_STATUS_LABELS).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${app.completion_percentage}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {app.completion_percentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(app.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetail(app)}
                        className="gap-1 text-primary hover:text-primary"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, applications.length)} of {applications.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="gap-1 bg-transparent border-border text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="gap-1 bg-transparent border-border text-foreground"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail / Edit Dialog */}
      <Dialog
        open={!!selectedApp}
        onOpenChange={(open) => !open && setSelectedApp(null)}
      >
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Application Details
            </DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <ScrollArea className="max-h-[70vh]">
              <div className="flex flex-col gap-6 pr-4">
                {/* Status */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Status
                  </Label>
                  <Select
                    value={selectedApp.status}
                    onValueChange={(v) => {
                      handleStatusChange(
                        selectedApp.id,
                        v as ApplicationStatus
                      );
                      setSelectedApp({ ...selectedApp, status: v as ApplicationStatus });
                    }}
                  >
                    <SelectTrigger className="bg-card text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(APPLICATION_STATUS_LABELS).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Info Row */}
                <div className="grid gap-4 rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Email: </span>
                      <span className="font-medium text-foreground">
                        {selectedApp.user_email}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone: </span>
                      <span className="font-medium text-foreground">
                        {selectedApp.user_phone || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Program: </span>
                      <span className="font-medium text-foreground">
                        {selectedApp.user_program
                          ? PROGRAM_LABELS[
                              selectedApp.user_program as Program
                            ]
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Education Type:{" "}
                      </span>
                      <span className="font-medium text-foreground">
                        {selectedApp.education_type
                          ? EDUCATION_TYPE_LABELS[
                              selectedApp.education_type as EducationType
                            ]
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Completion:{" "}
                      </span>
                      <span className="font-medium text-foreground">
                        {selectedApp.completion_percentage}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { key: "surname", label: "Surname" },
                    { key: "given_name", label: "Given Name" },
                    { key: "gender", label: "Gender" },
                    { key: "citizenship", label: "Citizenship" },
                    { key: "card_number", label: "Card Number" },
                    { key: "personal_number", label: "Personal Number" },
                    { key: "place_of_birth", label: "Place of Birth" },
                    {
                      key: "language_cert_score",
                      label: "Language Cert Score",
                    },
                  ].map((field) => (
                    <div key={field.key} className="flex flex-col gap-1">
                      <Label className="text-xs text-muted-foreground">
                        {field.label}
                      </Label>
                      <Input
                        value={editValues[field.key] || ""}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            [field.key]: e.target.value,
                          })
                        }
                        className="bg-card text-foreground"
                      />
                    </div>
                  ))}
                  {[
                    { key: "date_of_birth", label: "Date of Birth" },
                    { key: "date_of_issue", label: "Date of Issue" },
                    { key: "date_of_expiry", label: "Date of Expiry" },
                  ].map((field) => (
                    <div key={field.key} className="flex flex-col gap-1">
                      <Label className="text-xs text-muted-foreground">
                        {field.label}
                      </Label>
                      <Input
                        type="date"
                        value={editValues[field.key] || ""}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            [field.key]: e.target.value,
                          })
                        }
                        className="bg-card text-foreground"
                      />
                    </div>
                  ))}
                </div>

                {/* Other Achievements */}
                {(selectedApp.other_achievements_text || selectedApp.other_achievements_pdf_path) && (
                  <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/30 p-4">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Other Achievements
                    </Label>
                    {selectedApp.other_achievements_text && (
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {selectedApp.other_achievements_text}
                      </p>
                    )}
                    {selectedApp.other_achievements_pdf_path && (
                      <a
                        href={selectedApp.other_achievements_pdf_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        View Document <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Documents */}
                <div className="flex flex-col gap-3">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Documents
                  </Label>
                  <div className="grid gap-2 md:grid-cols-2">
                    {[
                      {
                        label: "Passport Image",
                        path: selectedApp.passport_image_path,
                      },
                      {
                        label: "Attestat/Diploma",
                        path: selectedApp.attestat_pdf_path,
                      },
                      {
                        label: "Language Certificate",
                        path: selectedApp.language_cert_pdf_path,
                      },
                      {
                        label: "Social Registry",
                        path: selectedApp.social_registry_pdf_path,
                      },
                      {
                        label: "Other Achievements",
                        path: selectedApp.other_achievements_pdf_path,
                      },
                    ].map((doc) => (
                      <div
                        key={doc.label}
                        className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2"
                      >
                        <span className="text-sm text-foreground">
                          {doc.label}
                        </span>
                        {doc.path ? (
                          <a
                            href={doc.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Not uploaded
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3 border-t border-border pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedApp(null)}
                    className="border-border text-foreground bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdits}
                    disabled={saving}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
