"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";
import {
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const applicantNav = [
  { href: "/dashboard", label: "Application", icon: FileText },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Al-Xorazmiy University"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-contain"
            />
            <span className="hidden font-bold text-foreground sm:block">
              Admissions Portal
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {applicantNav.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 text-muted-foreground hover:text-foreground",
                    pathname === item.href &&
                      "bg-accent text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <span className="hidden text-sm text-muted-foreground lg:block">
            {user?.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hidden gap-2 text-muted-foreground hover:text-foreground md:flex"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {applicantNav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 text-muted-foreground",
                    pathname === item.href &&
                      "bg-accent text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
