"use client";

import { createContext, useContext, useState } from "react";

interface StatusFilterContextType {
  statusFilter: string;
  setStatusFilter: (s: string) => void;
}

const StatusFilterContext = createContext<StatusFilterContextType>({
  statusFilter: "",
  setStatusFilter: () => {},
});

export function StatusFilterProvider({ children }: { children: React.ReactNode }) {
  const [statusFilter, setStatusFilter] = useState("");
  return (
    <StatusFilterContext.Provider value={{ statusFilter, setStatusFilter }}>
      {children}
    </StatusFilterContext.Provider>
  );
}

export function useStatusFilter() {
  return useContext(StatusFilterContext);
}
