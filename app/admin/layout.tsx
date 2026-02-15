"use client";

import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AdminNav } from "@/components/admin-nav";
import { StatusSidebar, StatusSidebarMobile } from "@/components/admin/status-sidebar";
import { StatusFilterProvider, useStatusFilter } from "@/hooks/use-status-filter";
import { Loader2 } from "lucide-react";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { statusFilter, setStatusFilter } = useStatusFilter();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <div className="mb-4 lg:hidden">
        <StatusSidebarMobile currentStatus={statusFilter} onStatusChange={setStatusFilter} />
      </div>
      <div className="flex gap-4">
        <div className="hidden lg:block w-[180px] shrink-0">
          <div className="sticky top-4">
            <StatusSidebar currentStatus={statusFilter} onStatusChange={setStatusFilter} />
          </div>
        </div>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
    if (!isLoading && user && user.role === "applicant") {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role === "applicant") return null;

  return (
    <StatusFilterProvider>
      <div className="min-h-screen bg-background">
        <AdminNav />
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </div>
    </StatusFilterProvider>
  );
}
