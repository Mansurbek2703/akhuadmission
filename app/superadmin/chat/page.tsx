"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/hooks/use-auth";
import { ChatPanel } from "@/components/chat-panel";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search, MessageSquare, ArrowLeft, User } from "lucide-react";
import { PROGRAM_LABELS } from "@/lib/types";
import type { Application, Program } from "@/lib/types";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SuperadminChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const appParam = searchParams.get("app");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(appParam);
  const [search, setSearch] = useState("");

  const goToProfile = (appId: string) => {
    const base = pathname.startsWith("/superadmin") ? "/superadmin" : "/admin";
    router.push(`${base}?app=${appId}`);
  };

  useEffect(() => {
    if (appParam) setSelectedAppId(appParam);
  }, [appParam]);

  const { data, isLoading } = useSWR("/api/applications", fetcher, {
    refreshInterval: 15000,
  });

  const { data: unreadData } = useSWR("/api/chat/unread", fetcher, {
    refreshInterval: 8000,
  });

  const applications: Application[] = data?.applications || [];
  const unreadMap = (unreadData?.allUnreadMap || {}) as Record<string, number>;

  const selectedApplication = applications.find((a) => a.id === selectedAppId);
  const selectedAppName = selectedApplication
    ? selectedApplication.surname && selectedApplication.given_name
      ? `${selectedApplication.surname} ${selectedApplication.given_name}`
      : selectedApplication.user_email || "Applicant"
    : "";

  const filtered = applications
    .filter((app) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        app.user_email?.toLowerCase().includes(q) ||
        app.surname?.toLowerCase().includes(q) ||
        app.given_name?.toLowerCase().includes(q)
      );
    })
    // Most recent conversation first.
    .sort((a, b) => {
      const aTime = new Date(a.last_message_at || a.updated_at || a.created_at).getTime();
      const bTime = new Date(b.last_message_at || b.updated_at || b.created_at).getTime();
      return bTime - aTime;
    });

  if (!user) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="md:block hidden">
        <h1 className="text-2xl font-bold text-foreground">Chat</h1>
        <p className="mt-1 text-muted-foreground">
          Communicate with applicants (Superadmin)
        </p>
      </div>
      {/* Mobile header: show applicant name + back button when chat is open */}
      <div className="md:hidden">
        {selectedAppId ? (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setSelectedAppId(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => selectedAppId && goToProfile(selectedAppId)}
                className="text-lg font-bold text-foreground truncate hover:text-primary hover:underline transition-colors text-left"
                title="View profile"
              >
                {selectedAppName}
              </button>
              <div className="flex items-center gap-2">
                {selectedApplication?.unikal_id && (
                  <span className="text-[10px] font-semibold text-primary">ID: #{selectedApplication.unikal_id}</span>
                )}
                <p className="text-xs text-muted-foreground truncate">{selectedApplication?.user_email}</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-foreground">Chat</h1>
            <p className="mt-1 text-muted-foreground">
              Communicate with applicants (Superadmin)
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 md:flex-row" style={{ height: "calc(100vh - 14rem)" }}>
        {/* Conversation List - hidden on mobile when chat is open */}
        <Card className={cn(
          "flex w-full flex-shrink-0 flex-col border-border bg-card shadow-sm md:w-80 md:flex",
          selectedAppId ? "hidden md:flex" : "flex"
        )}>
          <div className="border-b border-border px-3 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search applicants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-secondary/50 pl-10 text-foreground"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
                <MessageSquare className="mb-2 h-8 w-8" />
                No conversations found
              </div>
            ) : (
              <div className="flex flex-col">
                {filtered.map((app) => (
                  <div
                    key={app.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedAppId(app.id)}
                    onKeyDown={(e) => { if (e.key === "Enter") setSelectedAppId(app.id); }}
                    className={cn(
                      "flex flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors hover:bg-accent/50 cursor-pointer",
                      selectedAppId === app.id && "bg-accent"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        role="link"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); goToProfile(app.id); }}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); goToProfile(app.id); } }}
                        className="text-sm font-medium text-foreground hover:text-primary hover:underline transition-colors cursor-pointer"
                        title="View profile"
                      >
                        {app.surname && app.given_name
                          ? `${app.surname} ${app.given_name}`
                          : app.user_email}
                      </span>
                      {unreadMap[app.id] > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                          {unreadMap[app.id]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {app.unikal_id && (
                        <span className="text-[10px] font-semibold text-primary">ID: #{app.unikal_id}</span>
                      )}
                      <span className="text-xs text-muted-foreground truncate">
                        {app.user_email}
                      </span>
                    </div>
                    {app.user_program && (
                      <Badge
                        variant="outline"
                        className="mt-1 w-fit border-border text-xs text-muted-foreground"
                      >
                        {PROGRAM_LABELS[app.user_program as Program]}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
        {/* Chat Panel - always visible on desktop, shown on mobile only when selected */}
        <div className={cn(
          "flex-1",
          selectedAppId ? "flex md:flex" : "hidden md:flex"
        )}>
          {selectedAppId ? (
            <div className="flex w-full flex-col gap-3">
              {/* Desktop header: applicant name (clickable -> profile) + ID */}
              <div className="hidden md:flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => goToProfile(selectedAppId)}
                    className="text-base font-bold text-foreground truncate hover:text-primary hover:underline transition-colors text-left"
                    title="View profile"
                  >
                    {selectedAppName}
                  </button>
                  <div className="flex items-center gap-2">
                    {selectedApplication?.unikal_id && (
                      <span className="text-[10px] font-semibold text-primary">ID: #{selectedApplication.unikal_id}</span>
                    )}
                    <span className="text-xs text-muted-foreground truncate">{selectedApplication?.user_email}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToProfile(selectedAppId)}
                  className="shrink-0 gap-1.5 border-border bg-transparent text-foreground"
                >
                  <User className="h-4 w-4" /> View Profile
                </Button>
              </div>
              <ChatPanel applicationId={selectedAppId} user={user} />
            </div>
          ) : (
            <Card className="flex h-full w-full items-center justify-center border-border bg-card shadow-sm">
              <div className="text-center">
                <MessageSquare className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  Select a conversation from the left
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
