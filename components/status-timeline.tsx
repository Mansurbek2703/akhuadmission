"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APPLICATION_STATUS_LABELS } from "@/lib/types";
import type { Application, ApplicationStatus } from "@/lib/types";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const statusOrder: ApplicationStatus[] = [
  "pending_review",
  "incomplete_document",
  "approved_to_attend_exam",
  "passed_with_exemption",
  "application_approved",
];

export function StatusTimeline({
  application,
}: {
  application: Application;
}) {
  const currentIndex = statusOrder.indexOf(
    application.status as ApplicationStatus
  );

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <Clock className="h-4 w-4 text-primary" />
          Application Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {statusOrder.map((status, index) => {
            const isActive = status === application.status;
            const isPast = index < currentIndex;

            return (
              <div key={status} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  {isPast ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : isActive ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 text-border" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    isActive
                      ? "font-semibold text-foreground"
                      : isPast
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                  )}
                >
                  {APPLICATION_STATUS_LABELS[status]}
                </span>
                {isActive && (
                  <span className="rounded bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {application.updated_at && (
          <p className="mt-4 text-xs text-muted-foreground">
            Last updated:{" "}
            {new Date(application.updated_at).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
