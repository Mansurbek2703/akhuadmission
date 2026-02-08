"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/hooks/use-auth";
import { ChatPanel } from "@/components/chat-panel";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, MessageSquare } from "lucide-react";
import { PROGRAM_LABELS } from "@/lib/types";
import type { Application, Program } from "@/lib/types";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminChatPage() {
  const { user } = useAuth();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useSWR("/api/applications", fetcher, {
    refreshInterval: 15000,
  });

  const applications: Application[] = data?.applications || [];

  const filtered = applications.filter((app) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      app.user_email?.toLowerCase().includes(q) ||
      app.surname?.toLowerCase().includes(q) ||
      app.given_name?.toLowerCase().includes(q)
    );
  });

  if (!user) return null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Chat</h1>
        <p className="mt-1 text-muted-foreground">
          Communicate with applicants
        </p>
      </div>
      <div className="flex gap-4" style={{ height: "calc(100vh - 14rem)" }}>
        {/* Conversation List */}
        <Card className="flex w-80 flex-shrink-0 flex-col border-border bg-card">
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
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedAppId(app.id)}
                    className={cn(
                      "flex flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors hover:bg-accent/50",
                      selectedAppId === app.id && "bg-accent"
                    )}
                  >
                    <span className="text-sm font-medium text-foreground">
                      {app.surname && app.given_name
                        ? `${app.surname} ${app.given_name}`
                        : app.user_email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {app.user_email}
                    </span>
                    {app.user_program && (
                      <Badge
                        variant="outline"
                        className="mt-1 w-fit border-border text-xs text-muted-foreground"
                      >
                        {PROGRAM_LABELS[app.user_program as Program]}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Chat Panel */}
        <div className="flex-1">
          {selectedAppId ? (
            <ChatPanel applicationId={selectedAppId} user={user} />
          ) : (
            <Card className="flex h-full items-center justify-center border-border bg-card">
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
