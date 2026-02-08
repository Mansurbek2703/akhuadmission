"use client";

import { useEffect, useRef } from "react";
import useSWR from "swr";
import { useAuth } from "@/hooks/use-auth";
import { ChatPanel } from "@/components/chat-panel";
import { Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ApplicantChatPage() {
  const { user } = useAuth();
  const { data, isLoading } = useSWR("/api/applications", fetcher);
  const markedRef = useRef(false);

  const applicationId = data?.application?.id;

  // Auto-mark all chat notifications as read when applicant opens chat page
  useEffect(() => {
    if (markedRef.current) return;
    markedRef.current = true;
    fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markChatRead: true }),
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!applicationId) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">
          No application found. Please complete your application first.
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Chat with Registrar Office</h1>
        <p className="mt-1 text-muted-foreground">
          Send messages and share documents with the admissions team
        </p>
      </div>
      <ChatPanel applicationId={applicationId} user={user} />
    </div>
  );
}
