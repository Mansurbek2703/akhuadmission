"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/hooks/use-auth";
import { ApplicationForm } from "@/components/application-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Phone,
  User as UserIcon,
  AlertTriangle,
} from "lucide-react";
import {
  APPLICATION_STATUS_LABELS,
  PROGRAM_LABELS,
} from "@/lib/types";
import type { Application, ApplicationStatus, Program } from "@/lib/types";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-slate-100 text-slate-800 border-slate-200",
  pending_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  incomplete_document: "bg-red-100 text-red-800 border-red-200",
  approved_to_attend_exam: "bg-blue-100 text-blue-800 border-blue-200",
  passed_with_exemption: "bg-emerald-100 text-emerald-800 border-emerald-200",
  application_approved: "bg-green-100 text-green-800 border-green-200",
};

/**
 * Check if the applicant has actually filled out any data in the application.
 * If all key fields are empty, they haven't applied yet.
 */
function hasApplicantFilledForm(app: Application): boolean {
  // Only show status badge after user has actually submitted (agreed to oferta)
  return !!app.oferta_agreed;
}

function DashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const highlightField = searchParams.get("highlight") || undefined;

  const { data, isLoading, mutate } = useSWR("/api/applications", fetcher, {
    refreshInterval: 5000,
  });

  const application: Application | null = data?.application || null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Determine if user has actually submitted the form
  const hasFilled = application ? hasApplicantFilledForm(application) : false;

  return (
    <div className="flex flex-col gap-6">
      {/* Header with status */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Application</h1>
          <p className="mt-1 text-muted-foreground">
            {user?.program
              ? PROGRAM_LABELS[user.program as Program]
              : "Bachelor program application"}
          </p>
          {application?.unikal_id && (
            <p className="mt-1.5 text-sm font-semibold text-primary">
              Your Applicant ID: #{application.unikal_id}
            </p>
          )}
        </div>

        {/* Application Status */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Application Status:</span>
          {application && hasFilled ? (
            <Badge
              variant="outline"
              className={cn(
                "px-3 py-1.5 text-sm font-semibold",
                STATUS_COLORS[application.status] || ""
              )}
            >
              {APPLICATION_STATUS_LABELS[application.status as ApplicationStatus]}
            </Badge>
          ) : (
            <span className="inline-flex animate-pulse items-center gap-1.5 rounded-md bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-700 ring-1 ring-red-200">
              <AlertTriangle className="h-3.5 w-3.5" />
              {"You haven't applied yet!"}
            </span>
          )}
        </div>
      </div>

      {/* Admin Contact Info Card - shown when an admin is assigned */}
      {application && application.assigned_admin_id && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Registrar Office - Your application is being reviewed
                </p>
                <p className="text-xs text-muted-foreground">
                  Your application is under review. If you have questions, please contact us.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 sm:items-end">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3.5 w-3.5 text-primary" />
                <a href="tel:+998622277171" className="font-medium text-foreground hover:text-primary transition-colors">
                  +998 62 227 71 71
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded bg-primary/20 text-[9px] font-bold text-primary">
                  #
                </span>
                <span className="text-muted-foreground">
                  Extension: <span className="font-medium text-foreground">333</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Form */}
      {application && (
        <ApplicationForm
          application={application}
          onUpdate={mutate}
          highlightField={highlightField}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
