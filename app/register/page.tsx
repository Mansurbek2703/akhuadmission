"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { PROGRAM_LABELS } from "@/lib/types";
import type { Program } from "@/lib/types";
import { PhoneInput } from "@/components/phone-input";
export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [program, setProgram] = useState<Program | "">("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!program) {
      toast.error("Please select a program");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, password, program }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(
        "Registration successful! Please check your email to verify your account."
      );
      router.push("/login?registered=true");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md border-border shadow-xl shadow-primary/5">
        <CardHeader className="text-center">
          <Image
            src="/logoEdited.png"
            alt="Al-Khwarizmi University"
            width={200}
            height={150}
            className="mx-auto mb-4 h-18 w-40 rounded-lg object-contain"
          />
          <CardTitle className="text-2xl font-bold text-foreground">
            Create Account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Apply for Bachelor programs at Al-Khwarizmi University
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-center text-sm font-medium text-amber-900 dark:text-amber-200">
            Notice: Bachelor admissions for the 2026–2027 academic year are closed.
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled
                className="bg-card text-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone" className="text-foreground">
                Phone Number
              </Label>
              <PhoneInput
                value={phone}
                onChange={setPhone}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-foreground">
                Password (min 8 characters)
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled
                  minLength={8}
                  className="bg-card pr-10 text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Bachelor Program</Label>
              <Select
                value={program}
                onValueChange={(v) => setProgram(v as Program)}
                disabled
              >
                <SelectTrigger className="bg-card text-foreground">
                  <SelectValue placeholder="Select your program" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROGRAM_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="mt-2 w-full bg-muted text-muted-foreground cursor-not-allowed opacity-70"
              disabled={true}
            >
              Admissions Closed
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
