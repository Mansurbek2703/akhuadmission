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
import { Search, X } from "lucide-react";
import { EDUCATION_TYPE_LABELS } from "@/lib/types";

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
      status: filters.status,
      education_type: "",
      date_from: "",
      date_to: "",
      search: "",
    });
  };

  const hasFilters =
    filters.education_type ||
    filters.date_from ||
    filters.date_to ||
    filters.search;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
          <Label className="text-xs text-muted-foreground">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or ID..."
              value={filters.search}
              onChange={(e) =>
                onChange({ ...filters, search: e.target.value })
              }
              className="bg-card pl-10 text-foreground h-9"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Education Type</Label>
          <Select
            value={filters.education_type || "all"}
            onValueChange={(v) =>
              onChange({ ...filters, education_type: v === "all" ? "" : v })
            }
          >
            <SelectTrigger className="bg-card text-foreground h-9">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(EDUCATION_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2">
          <Label className="text-xs text-muted-foreground">Date Range</Label>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) => onChange({ ...filters, date_from: e.target.value })}
              className="bg-card text-foreground h-9"
            />
            <span className="text-muted-foreground text-sm">-</span>
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => onChange({ ...filters, date_to: e.target.value })}
              className="bg-card text-foreground h-9"
            />
          </div>
        </div>
      </div>
      {hasFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1.5 text-muted-foreground hover:text-foreground h-7 text-xs"
          >
            <X className="h-3.5 w-3.5" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
