"use client";

import React from "react"

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  UserPlus,
  Trash2,
  Loader2,
  Shield,
  ClipboardList,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Admin {
  id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  created_at: string;
}

interface LogEntry {
  id: string;
  admin_email: string;
  action: string;
  details: string;
  created_at: string;
}

export default function SuperadminSettingsPage() {
  const [tab, setTab] = useState("admins");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [adminPosition, setAdminPosition] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    data: adminsData,
    isLoading: adminsLoading,
    mutate: mutateAdmins,
  } = useSWR("/api/admin/users", fetcher);

  const { data: logsData, isLoading: logsLoading } = useSWR(
    "/api/admin/logs",
    fetcher,
    { refreshInterval: 30000 }
  );

  const admins: Admin[] = adminsData?.admins || [];
  const logs: LogEntry[] = logsData?.logs || [];

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !adminPosition.trim()) {
      toast.error("First name, last name, and position are required");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, first_name: firstName, last_name: lastName, position: adminPosition }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${role === "superadmin" ? "Superadmin" : "Admin"} created successfully`);
      setEmail("");
      setPassword("");
      setRole("admin");
      setFirstName("");
      setLastName("");
      setAdminPosition("");
      setDialogOpen(false);
      mutateAdmins();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create admin");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    setDeleting(adminId);
    try {
      const res = await fetch(`/api/admin/users?id=${adminId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Admin removed successfully");
      mutateAdmins();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove admin");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage administrators and view system logs
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary">
          <TabsTrigger
            value="admins"
            className="gap-2 data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Users className="h-4 w-4" />
            Admin Management
          </TabsTrigger>
          <TabsTrigger
            value="logs"
            className="gap-2 data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <ClipboardList className="h-4 w-4" />
            System Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admins" className="mt-6">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shield className="h-5 w-5 text-primary" />
                  Administrators
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Add and manage admin users
                </CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    <UserPlus className="h-4 w-4" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">
                      Add New Administrator
                    </DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={handleCreateAdmin}
                    className="flex flex-col gap-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label className="text-foreground">First Name <span className="text-destructive">*</span></Label>
                        <Input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          required
                          className="bg-card text-foreground"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-foreground">Last Name <span className="text-destructive">*</span></Label>
                        <Input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          required
                          className="bg-card text-foreground"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Position <span className="text-destructive">*</span></Label>
                      <Input
                        value={adminPosition}
                        onChange={(e) => setAdminPosition(e.target.value)}
                        placeholder="Admissions Officer"
                        required
                        className="bg-card text-foreground"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Email</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@alxorazmiy.uz"
                        required
                        className="bg-card text-foreground"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">
                        Password (min 8 characters)
                      </Label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                        minLength={8}
                        className="bg-card text-foreground"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Role</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="bg-card text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="superadmin">
                            Superadmin
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="submit"
                      disabled={creating}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {creating ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </span>
                      ) : (
                        "Create Administrator"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {adminsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-muted-foreground">
                        Name
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Email
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Position
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Role
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Created
                      </TableHead>
                      <TableHead className="text-right text-muted-foreground">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id} className="hover:bg-accent/30">
                        <TableCell className="font-medium text-foreground">
                          {admin.first_name && admin.last_name
                            ? `${admin.first_name} ${admin.last_name}`
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {admin.email}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {admin.position || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              admin.role === "superadmin"
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "text-muted-foreground"
                            }
                          >
                            {admin.role === "superadmin"
                              ? "Superadmin"
                              : "Admin"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(admin.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAdmin(admin.id)}
                            disabled={deleting === admin.id}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            {deleting === admin.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <ClipboardList className="h-5 w-5 text-primary" />
                System Audit Logs
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Every admin action is recorded and logged
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : logs.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  No logs found
                </div>
              ) : (
                <ScrollArea className="max-h-[60vh]">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-muted-foreground">
                          Admin
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Action
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Details
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Time
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow
                          key={log.id}
                          className="hover:bg-accent/30"
                        >
                          <TableCell className="font-medium text-foreground">
                            {log.admin_email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-foreground"
                            >
                              {log.action.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {log.details}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(
                              new Date(log.created_at),
                              { addSuffix: true }
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
