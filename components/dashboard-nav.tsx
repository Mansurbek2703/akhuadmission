"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  X,
  User,
  Camera,
  AlertTriangle,
} from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PROGRAM_LABELS } from "@/lib/types";
import type { Program } from "@/lib/types";

const applicantNav = [
  { href: "/dashboard", label: "Application", icon: FileText },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, mutate } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLeaveDialogOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Maximum file size is 5 MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "profile_photo");

      const res = await fetch("/api/profile/photo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Profile photo uploaded successfully");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const hasPhoto = !!user?.profile_photo_path;
  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : "U";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <div className="flex items-center gap-6">
            <a href="/" onClick={handleLogoClick} className="flex items-center gap-2.5 cursor-pointer">
              <Image
                src="/logoEdited.png"
                alt="Al-Khwarizmi University"
                width={200}
                height={150}
                className="h-18 w-40 rounded-lg object-contain"
              />
              <span className="hidden font-bold text-foreground sm:block">
                Admission Portal
              </span>
            </a>
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

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  {!hasPhoto && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-destructive">
                      <AlertTriangle className="h-2 w-2 text-destructive-foreground" />
                    </span>
                  )}
                  <Avatar className="h-9 w-9 border-2 border-border">
                    <AvatarImage src={hasPhoto ? `/api/files/${user.profile_photo_path}` : undefined} alt="Profile" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-3">
                <div className="flex items-center gap-3 pb-3">
                  <Avatar className="h-12 w-12 border-2 border-border">
                    <AvatarImage src={hasPhoto ? `/api/files/${user?.profile_photo_path}` : undefined} alt="Profile" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.email}</p>
                    {user?.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                    {user?.program && (
                      <p className="text-xs text-primary font-medium">
                        {PROGRAM_LABELS[user.program as Program] || user.program}
                      </p>
                    )}
                  </div>
                </div>

                {!hasPhoto && (
                  <div className="mb-2 rounded-md bg-destructive/10 border border-destructive/20 p-2">
                    <p className="text-xs font-medium text-destructive flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      Please upload a formal passport-style photo. This is required for your application.
                    </p>
                  </div>
                )}

                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Camera className="h-4 w-4" />
                  {uploading ? "Uploading..." : hasPhoto ? "Change Photo" : "Upload Photo"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={handlePhotoUpload}
            />

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

        {/* Photo warning banner */}
        {user && !hasPhoto && (
          <div className="bg-destructive/10 border-t border-destructive/20 px-4 py-2.5">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive font-medium">
                You must upload a formal passport-style photo to complete your application.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="mr-1.5 h-3.5 w-3.5" />
                Upload Now
              </Button>
            </div>
          </div>
        )}

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

      {/* Leave confirmation dialog */}
      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you leaving your account?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to leave your personal dashboard and go to the main page. Your session will remain active, but any unsaved changes may be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, stay here</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/")}>
              Yes, go to main page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
