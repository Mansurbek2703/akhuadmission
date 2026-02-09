"use client";

import { useState } from "react";
import useSWR from "swr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationsTable } from "@/components/admin/applications-table";
import { ApplicationFilters } from "@/components/admin/application-filters";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UnreadChatMap } from "@/lib/types";

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

export default function AdminPage() {
  const [tab, setTab] = useState("all");
  const [filters, setFilters] = useState<Filters>({
    status: "",
    education_type: "",
    date_from: "",
    date_to: "",
    search: "",
  });
  const [exporting, setExporting] = useState(false);
  const { allUnread, forMeUnread } = useUnreadChatMaps();

  const allQuery = buildQuery(filters, false);
  const forMeQuery = buildQuery(filters, true);

  const { data: allData, isLoading: allLoading, mutate: mutateAll } = useSWR(
    allQuery,
    fetcher,
    { refreshInterval: 15000 }
  );
  const { data: forMeData, isLoading: forMeLoading, mutate: mutateForMe } = useSWR(
    forMeQuery,
    fetcher,
    { refreshInterval: 15000 }
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (tab === "forme") params.set("for_me", "true");
      if (filters.status) params.set("status", filters.status);
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

  const mutateData = () => {
    mutateAll();
    mutateForMe();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and review applicant submissions
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={exporting}
          variant="outline"
          className="gap-2 border-border text-foreground bg-transparent"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export to Excel
        </Button>
      </div>

      <ApplicationFilters filters={filters} onChange={setFilters} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="all" className="data-[state=active]:bg-card data-[state=active]:text-foreground">
            All Applications
            {allData?.applications && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {allData.applications.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="forme" className="data-[state=active]:bg-card data-[state=active]:text-foreground">
            For Me
            {forMeData?.applications && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {forMeData.applications.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {allLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ApplicationsTable
              applications={allData?.applications || []}
              onUpdate={mutateData}
              unreadChatMap={allUnread}
            />
          )}
        </TabsContent>
        <TabsContent value="forme">
          {forMeLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ApplicationsTable
              applications={forMeData?.applications || []}
              onUpdate={mutateData}
              unreadChatMap={forMeUnread}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
