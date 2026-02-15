"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { APPLICATION_STATUS_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusBtnColors: Record<string, string> = {
  "": "bg-primary text-primary-foreground",
  submitted: "bg-muted text-muted-foreground",
  pending_review: "bg-warning/15 text-warning border-warning/30",
  incomplete_document: "bg-destructive/15 text-destructive border-destructive/30",
  approved_to_attend_exam: "bg-primary/15 text-primary border-primary/30",
  passed_with_exemption: "bg-accent text-accent-foreground",
  application_approved: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
};

interface StatusSidebarProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

export function StatusSidebar({ currentStatus, onStatusChange }: StatusSidebarProps) {
  return (
    <div className="rounded-lg border-2 border-primary/30 bg-card p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-2.5 px-1">
        Status Filter
      </p>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onStatusChange("")}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium text-left transition-colors border",
            !currentStatus
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:bg-accent/50 hover:text-foreground"
          )}
        >
          All
        </button>
        {Object.entries(APPLICATION_STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onStatusChange(key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium text-left transition-colors border",
              currentStatus === key
                ? cn(statusBtnColors[key], "border-current")
                : "bg-card text-muted-foreground border-border hover:bg-accent/50 hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StatusSidebarMobile({ currentStatus, onStatusChange }: StatusSidebarProps) {
  return (
    <div className="rounded-lg border-2 border-primary/30 bg-card p-2.5 lg:hidden">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-2 px-1">
        Status Filter
      </p>
      <div className="flex flex-row flex-wrap gap-1.5">
        <button
          onClick={() => onStatusChange("")}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors border",
            !currentStatus
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:bg-accent/50 hover:text-foreground"
          )}
        >
          All
        </button>
        {Object.entries(APPLICATION_STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onStatusChange(key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors border",
              currentStatus === key
                ? cn(statusBtnColors[key], "border-current")
                : "bg-card text-muted-foreground border-border hover:bg-accent/50 hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
