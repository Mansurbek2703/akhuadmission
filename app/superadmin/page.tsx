"use client";

import { useState } from "react";
import useSWR from "swr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationsTable } from "@/components/admin/applications-table";
import { ApplicationFilters } from "@/components/admin/application-filters";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useStatusFilter } from "@/hooks/use-status-filter";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Filters {
  status: string;
  education_type: string;
  date_from: string;
  date_to: string;
  search: string;
}

function useUnreadChatMaps() {
  const { data } = useSWR("/api/chat/unread", fetcher, { refreshInterval: 8000 });
  return {
    allUnread: (data?.allUnreadMap || {}) as Record<string, number>,
    forMeUnread: (data?.forMeUnreadMap || {}) as Record<string, number>,
  };
}

function buildQuery(filters: Filters, forMe: boolean) {
  const params = new URLSearchParams();
  if (forMe) params.set("for_me", "true");
  if (filters.status) params.set("status", filters.status);
  if (filters.education_type) params.set("education_type", filters.education_type);
  if (filters.date_from) params.set("date_from", filters.date_from);
  if (filters.date_to) params.set("date_to", filters.date_to);
  if (filters.search) params.set("search", filters.search);
  return `/api/applications?${params.toString()}`;
}

export default function SuperadminPage() {
  const { statusFilter } = useStatusFilter();
  const [tab, setTab] = useState("all");
  const [filters, setFilters] = useState<Filters>({
    status: "",
    education_type: "",
    date_from: "",
    date_to: "",
    search: "",
  });
  const [exporting, setExporting] = useState(false);
  const [selectedApp, setSelectedApp] = useState<import("@/lib/types").Application | null>(null);
  const { allUnread, forMeUnread } = useUnreadChatMaps();

  const mergedFilters = { ...filters, status: statusFilter };

  const allQuery = buildQuery(mergedFilters, false);
  const forMeQuery = buildQuery(mergedFilters, true);

  const { data: allData, isLoading: allLoading, mutate: mutateAll } = useSWR(
    allQuery, fetcher, { refreshInterval: 15000 }
  );
  const { data: forMeData, isLoading: forMeLoading, mutate: mutateForMe } = useSWR(
    forMeQuery, fetcher, { refreshInterval: 15000 }
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (tab === "forme") params.set("for_me", "true");
      if (statusFilter) params.set("status", statusFilter);
      if (filters.education_type) params.set("education_type", filters.education_type);
      if (filters.date_from) params.set("date_from", filters.date_from);
      if (filters.date_to) params.set("date_to", filters.date_to);

      const res = await fetch(`/api/export?${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `applications_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Excel exported successfully");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const mutateData = () => { mutateAll(); mutateForMe(); };

  const renderContent = (apps: { applications?: unknown[] } | undefined, loading: boolean, unread: Record<string, number>) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    return (
      <ApplicationsTable
        applications={(apps?.applications || []) as import("@/lib/types").Application[]}
        onUpdate={mutateData}
        unreadChatMap={unread}
        selectedApp={selectedApp}
        onSelectApp={setSelectedApp}
      />
    );
  };

  // When detail is open, show ONLY the detail (replace entire page content)
  if (selectedApp) {
    const currentApps = tab === "forme"
      ? ((forMeData?.applications || []) as import("@/lib/types").Application[])
      : ((allData?.applications || []) as import("@/lib/types").Application[]);
    return (
      <ApplicationsTable
        applications={currentApps}
        onUpdate={mutateData}
        unreadChatMap={tab === "forme" ? forMeUnread : allUnread}
        selectedApp={selectedApp}
        onSelectApp={setSelectedApp}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage and review all applicant submissions (Superadmin)</p>
        </div>
        <Button
          onClick={handleExport}
          disabled={exporting}
          variant="outline"
          size="sm"
          className="gap-2 border-border text-foreground bg-transparent"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export to Excel
        </Button>
      </div>

      <ApplicationFilters filters={filters} onChange={setFilters} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="all" className="data-[state=active]:bg-card data-[state=active]:text-foreground">
            All
            {allData?.applications && (
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {(allData.applications as unknown[]).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="forme" className="data-[state=active]:bg-card data-[state=active]:text-foreground">
            For Me
            {forMeData?.applications && (
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {(forMeData.applications as unknown[]).length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">{renderContent(allData, allLoading, allUnread)}</TabsContent>
        <TabsContent value="forme">{renderContent(forMeData, forMeLoading, forMeUnread)}</TabsContent>
      </Tabs>
    </div>
  );
}
