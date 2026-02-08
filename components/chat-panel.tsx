"use client";

import React from "react"

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Send,
  Loader2,
  Paperclip,
  FileText,
  ImageIcon,
  CheckCheck,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/hooks/use-auth";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ChatMessage {
  id: string;
  application_id: string;
  sender_id: string;
  sender_role: string;
  sender_email?: string;
  sender_first_name?: string;
  sender_last_name?: string;
  sender_position?: string;
  message?: string;
  file_path?: string;
  file_name?: string;
  is_read: boolean;
  created_at: string;
}

interface ChatPanelProps {
  applicationId: string;
  user: AuthUser;
}

export function ChatPanel({ applicationId, user }: ChatPanelProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, mutate } = useSWR(
    applicationId
      ? `/api/chat?application_id=${applicationId}`
      : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  const messages: ChatMessage[] = data?.messages || [];
  const assignedToOther: boolean = data?.assignedToOther || false;
  const assignedAdminName: string = data?.assignedAdminName || "";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!message.trim() || !applicationId) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          message: message.trim(),
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to send");
      }
      setMessage("");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !applicationId) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be less than 10MB");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("doc_type", "chat_file");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          filePath: uploadData.filePath,
          fileName: file.name,
        }),
      });
      if (!chatRes.ok) throw new Error("Failed to send file");
      mutate();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload file"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!applicationId) {
    return (
      <Card className="flex flex-1 items-center justify-center border-border bg-card p-8">
        <p className="text-muted-foreground">
          Select a conversation to start chatting
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex h-[calc(100vh-12rem)] flex-col border-border bg-card">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="font-semibold text-foreground">
            {user.role === "applicant"
              ? "Registrar Office"
              : "Applicant Chat"}
          </h3>
          <p className="text-xs text-muted-foreground">
            Messages are immutable and stored permanently
          </p>
        </div>
      </div>

      {/* Assigned to another admin warning */}
      {assignedToOther && assignedAdminName && (
        <div className="border-b border-warning/30 bg-warning/10 px-4 py-2.5">
          <p className="text-sm font-medium text-warning">
            This applicant is in communication with {assignedAdminName}
          </p>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="flex flex-col gap-3 py-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender_id === user.id;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex max-w-[80%] flex-col gap-1",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                {/* Show admin name/position for non-applicant senders */}
                {!isMe && msg.sender_role !== "applicant" && (msg.sender_first_name || msg.sender_last_name) && (
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="text-xs font-semibold text-foreground">
                      {[msg.sender_first_name, msg.sender_last_name].filter(Boolean).join(" ")}
                    </span>
                    {msg.sender_position && (
                      <span className="text-[10px] text-muted-foreground">
                        {msg.sender_position}
                      </span>
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-xl px-4 py-2.5",
                    isMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  )}
                >
                  {msg.message && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  )}
                  {msg.file_path && (
                    <a
                      href={msg.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center gap-2 text-sm underline",
                        isMe
                          ? "text-primary-foreground/90"
                          : "text-primary"
                      )}
                    >
                      {msg.file_name?.endsWith(".pdf") ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <ImageIcon className="h-4 w-4" />
                      )}
                      {msg.file_name || "Attachment"}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(msg.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                  {isMe && (
                    msg.is_read ? (
                      <CheckCheck className="h-3 w-3 text-primary" />
                    ) : (
                      <Check className="h-3 w-3 text-muted-foreground" />
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border px-4 py-3">
        {assignedToOther ? (
          <p className="text-center text-sm text-muted-foreground py-1">
            You cannot send messages to this applicant
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <Paperclip className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              )}
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 bg-secondary/50 text-foreground"
              disabled={sending}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
