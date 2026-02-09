"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import {
  APPLICATION_STATUS_LABELS,
  EDUCATION_TYPE_LABELS,
} from "@/lib/types";

interface Filters {
  status: string;
  education_type: string;
  date_from: string;
  date_to: string;
  search: string;
}

interface ApplicationFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function ApplicationFilters({
  filters,
  onChange,
}: ApplicationFiltersProps) {
  const clearFilters = () => {
    onChange({
      status: "",
      education_type: "",
      date_from: "",
      date_to: "",
      search: "",
    });
  };

  const hasFilters =
    filters.status ||
    filters.education_type ||
    filters.date_from ||
    filters.date_to ||
    filters.search;

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="pt-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_0.8fr_1fr_1fr] items-start">
          <div className="flex flex-col gap-2 lg:col-span-1">
            <Label className="text-xs text-muted-foreground">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) =>
                  onChange({ ...filters, search: e.target.value })
                }
                className="bg-card pl-10 text-foreground"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(v) =>
                onChange({ ...filters, status: v === "all" ? "" : v })
              }
            >
              <SelectTrigger className="bg-card text-foreground">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(APPLICATION_STATUS_LABELS).map(
                  ([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              Education Type
            </Label>
            <Select
              value={filters.education_type || "all"}
              onValueChange={(v) =>
                onChange({
                  ...filters,
                  education_type: v === "all" ? "" : v,
                })
              }
            >
              <SelectTrigger className="bg-card text-foreground">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(EDUCATION_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Date Range</Label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  onChange({ ...filters, date_from: e.target.value })
                }
                className="bg-card text-foreground"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) =>
                  onChange({ ...filters, date_to: e.target.value })
                }
                className="bg-card text-foreground"
              />
            </div>
          </div>
        </div>
        {hasFilters && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
