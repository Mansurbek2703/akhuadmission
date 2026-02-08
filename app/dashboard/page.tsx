"use client";

import useSWR from "swr";
import { useAuth } from "@/hooks/use-auth";
import { ApplicationForm } from "@/components/application-form";
import { StatusTimeline } from "@/components/status-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText, Clock, CheckCircle2 } from "lucide-react";
import {
  APPLICATION_STATUS_LABELS,
  PROGRAM_LABELS,
} from "@/lib/types";
import type { Application, ApplicationStatus, Program } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, mutate } = useSWR("/api/applications", fetcher, {
    refreshInterval: 15000,
  });

  const application: Application | null = data?.application || null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Overview */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            My Application
          </h1>
          <p className="mt-1 text-muted-foreground">
            {user?.program
              ? PROGRAM_LABELS[user.program as Program]
              : "Bachelor Program Application"}
          </p>
        </div>
        {application && (
          <div className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2">
            <Clock className="h-4 w-4 text-accent-foreground" />
            <span className="text-sm font-medium text-accent-foreground">
              {
                APPLICATION_STATUS_LABELS[
                  application.status as ApplicationStatus
                ]
              }
            </span>
          </div>
        )}
      </div>

      {/* Progress Card */}
      {application && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              Application Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress
                value={application.completion_percentage}
                className="flex-1"
              />
              <span className="text-sm font-semibold text-foreground">
                {application.completion_percentage}%
              </span>
            </div>
            {application.completion_percentage === 100 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" />
                Application is complete
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Timeline */}
      {application && <StatusTimeline application={application} />}

      {/* Application Form */}
      {application && (
        <ApplicationForm application={application} onUpdate={mutate} />
      )}
    </div>
  );
}
