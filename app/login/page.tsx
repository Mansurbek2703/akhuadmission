"use client";

import React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      toast.success("Registration successful! You can now log in.");
    }
    if (searchParams.get("verified") === "true") {
      toast.success("Email verified successfully! You can now log in.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      if (user.role === "applicant") router.push("/dashboard");
      else if (user.role === "admin") router.push("/admin");
      else if (user.role === "superadmin") router.push("/superadmin");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success("Welcome back!");
      if (data.user.role === "applicant") router.push("/dashboard");
      else if (data.user.role === "admin") router.push("/admin");
      else if (data.user.role === "superadmin") router.push("/superadmin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md border-border shadow-xl shadow-primary/5">
        <CardHeader className="text-center">
          <Image
            src="/logo.png"
            alt="Al-Xorazmiy University"
            width={56}
            height={56}
            className="mx-auto mb-4 h-14 w-14 rounded-xl object-contain"
          />
          <CardTitle className="text-2xl font-bold text-foreground">
            Sign In
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Al-Xorazmiy University Admissions Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                className="bg-card text-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
            <Button
              type="submit"
              className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {"Don't have an account?"}{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Create account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
