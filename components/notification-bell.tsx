"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  Bell,
  Clock,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ArrowRight,
  MessageSquare,
  FileEdit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUS_LABELS } from "@/lib/types";
import type { ApplicationStatus } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ChangedField {
  old_value: string;
  new_value: string;
  label: string;
}

interface NotificationItem {
  id: string;
  application_id: string;
  message: string;
  notification_type?: string;
  changed_fields?: Record<string, ChangedField> | null;
  is_read: boolean;
  created_at: string;
  app_status?: string;
}

type SortMode = "time" | "unread";

const PREVIEW_COUNT = 3;
const PAGE_SIZE = 5;

export function NotificationBell() {
  const router = useRouter();
  const [sortMode, setSortMode] = useState<SortMode>("time");
  const [expanded, setExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedNotifId, setExpandedNotifId] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // When collapsed: fetch page 1 with limit=PREVIEW_COUNT
  // When expanded: fetch paginated with PAGE_SIZE
  const limit = expanded ? PAGE_SIZE : PREVIEW_COUNT;
  const page = expanded ? currentPage : 1;

  const { data, mutate } = useSWR(
    `/api/notifications?sort=${sortMode}&page=${page}&limit=${limit}`,
    fetcher,
    { refreshInterval: 8000 }
  );

  const unreadCount: number = data?.unreadCount || 0;
  const totalCount: number = data?.totalCount || 0;
  const totalPages: number = data?.totalPages || 1;
  const hasMore: boolean = data?.hasMore || false;
  const notifications: NotificationItem[] = data?.notifications || [];

  const markAsRead = useCallback(
    async (notificationId: string) => {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      mutate();
    },
    [mutate]
  );

  const markAllRead = useCallback(async () => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    mutate();
  }, [mutate]);

  const handleShowMore = useCallback(
    async (notification: NotificationItem) => {
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }
      setPopoverOpen(false);

      const type = notification.notification_type || "general";
      if (type === "chat_message") {
        router.push("/dashboard/chat");
      } else if (type === "field_change" || type === "status_change") {
        const changedFields = notification.changed_fields;
        const firstFieldKey = changedFields ? Object.keys(changedFields)[0] : null;
        const query = firstFieldKey
          ? `?highlight=${firstFieldKey}&notif_id=${notification.id}`
          : `?notif_id=${notification.id}`;
        router.push(`/dashboard${query}`);
      } else {
        router.push("/dashboard");
      }
    },
    [markAsRead, router]
  );

  const toggleSort = useCallback(() => {
    setSortMode((prev) => (prev === "time" ? "unread" : "time"));
    setCurrentPage(1);
  }, []);

  const getNotifIcon = (type?: string) => {
    switch (type) {
      case "chat_message":
        return <MessageSquare className="h-3.5 w-3.5 text-blue-500" />;
      case "field_change":
      case "status_change":
        return <FileEdit className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <Bell className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const label = APPLICATION_STATUS_LABELS[status as ApplicationStatus] || status;
    const colorMap: Record<string, string> = {
      submitted: "bg-slate-100 text-slate-800",
      pending_review: "bg-yellow-100 text-yellow-800",
      incomplete_document: "bg-red-100 text-red-800",
      approved_to_attend_exam: "bg-blue-100 text-blue-800",
      passed_with_exemption: "bg-emerald-100 text-emerald-800",
      application_approved: "bg-green-100 text-green-800",
    };
    return (
      <Badge variant="secondary" className={cn("mt-1 inline-flex text-[10px] font-medium", colorMap[status] || "")}>
        {label}
      </Badge>
    );
  };

  const renderChangedFields = (changedFields?: Record<string, ChangedField> | null) => {
    if (!changedFields || Object.keys(changedFields).length === 0) return null;
    return (
      <div className="mt-2 flex flex-col gap-1.5 rounded-md border border-border bg-muted/50 p-2">
        {Object.entries(changedFields).map(([key, field]) => (
          <div key={key} className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              {field.label}
            </span>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-destructive line-through">
                {field.old_value}
              </span>
              <ArrowRight className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
              <span className="rounded bg-green-100 px-1.5 py-0.5 font-medium text-green-700">
                {field.new_value}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderNotification = (n: NotificationItem) => {
    const isDetailExpanded = expandedNotifId === n.id;
    const hasChanges = n.changed_fields && Object.keys(n.changed_fields).length > 0;

    return (
      <div
        key={n.id}
        className={cn(
          "border-b border-border px-4 py-3 transition-colors",
          !n.is_read ? "bg-primary/5" : "bg-transparent"
        )}
      >
        <div className="flex gap-2">
          <div className="mt-0.5 flex-shrink-0">
            {!n.is_read ? (
              <span className="flex h-5 w-5 items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-primary" />
              </span>
            ) : (
              <span className="flex h-5 w-5 items-center justify-center">
                {getNotifIcon(n.notification_type)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("text-sm leading-snug", !n.is_read ? "font-medium text-foreground" : "text-muted-foreground")}>
              {n.message}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              {n.notification_type === "chat_message" && (
                <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-normal text-blue-600 border-blue-200 bg-blue-50">Chat</Badge>
              )}
              {n.notification_type === "status_change" && n.app_status && getStatusBadge(n.app_status)}
              {n.notification_type === "field_change" && (
                <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-normal text-amber-600 border-amber-200 bg-amber-50">Change</Badge>
              )}
            </div>
            {isDetailExpanded && hasChanges && renderChangedFields(n.changed_fields)}
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </p>
              <div className="flex items-center gap-1">
                {hasChanges && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 px-2 text-[11px] font-medium text-amber-600 hover:text-amber-700"
                    onClick={() => setExpandedNotifId(isDetailExpanded ? null : n.id)}
                  >
                    {isDetailExpanded ? "Close" : "Changes"}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 px-2 text-[11px] font-medium text-primary hover:text-primary/80"
                  onClick={() => handleShowMore(n)}
                >
                  <ExternalLink className="h-3 w-3" />
                  Show more
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Hidden count = total beyond the 3 shown in preview
  const hiddenCount = totalCount - PREVIEW_COUNT;

  return (
    <Popover
      open={popoverOpen}
      onOpenChange={(open) => {
        setPopoverOpen(open);
        if (!open) {
          setExpanded(false);
          setCurrentPage(1);
          setExpandedNotifId(null);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] bg-card p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">{unreadCount}</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSort}
              className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {sortMode === "time" ? <Clock className="h-3 w-3" /> : <Filter className="h-3 w-3" />}
              {sortMode === "time" ? "Time" : "Unread"}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllRead}
                className="h-7 px-2 text-xs text-primary hover:text-primary/80"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {totalCount === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : !expanded ? (
          // COLLAPSED VIEW: show first 3
          <>
            <div className="flex flex-col">
              {notifications.map(renderNotification)}
            </div>
            {hiddenCount > 0 && (
              <div className="border-t border-border px-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setExpanded(true);
                    setCurrentPage(1);
                  }}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show all {totalCount} notifications
                </Button>
              </div>
            )}
          </>
        ) : (
          // EXPANDED VIEW: paginated 5 per page
          <>
            <ScrollArea className="max-h-[420px]">
              <div className="flex flex-col">
                {notifications.map(renderNotification)}
              </div>
            </ScrollArea>

            {/* Pagination controls */}
            <div className="flex items-center justify-between border-t border-border px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-7 gap-1 px-2 text-xs"
              >
                <ChevronLeft className="h-3 w-3" />
                Prev
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasMore}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-7 gap-1 px-2 text-xs"
              >
                Next
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            {/* Collapse button */}
            <div className="border-t border-border px-4 py-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setExpanded(false);
                  setCurrentPage(1);
                }}
              >
                <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                Collapse
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
