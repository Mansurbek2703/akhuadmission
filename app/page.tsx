"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  BookOpen,
  Shield,
  Cpu,
  Code,
  Brain,
  Plane,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const programs = [
  {
    icon: Code,
    title: "Software Engineering",
    description: "Build the future with cutting-edge software development skills",
  },
  {
    icon: Brain,
    title: "Artificial Intelligence",
    description: "Master machine learning, deep learning, and AI systems",
  },
  {
    icon: Plane,
    title: "Engineering of Drone Technologies",
    description: "Design and develop next-generation autonomous systems",
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    description: "Protect digital infrastructure from modern threats",
  },
  {
    icon: Cpu,
    title: "Applied Mathematics",
    description: "Apply mathematical theory to solve real-world challenges",
  },
];

const steps = [
  { number: "01", title: "Register", description: "Create your account with email and select your program" },
  { number: "02", title: "Verify Email", description: "Confirm your email address via the verification link" },
  { number: "03", title: "Complete Application", description: "Fill in your details and upload required documents" },
  { number: "04", title: "Track Status", description: "Monitor your application progress in real-time" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">
              Al-Xorazmiy University
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#programs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Programs
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-border text-foreground bg-transparent">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Apply Now
              </Button>
            </Link>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-border text-foreground bg-transparent">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Apply
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/30" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                2025/2026 Admissions Open
              </span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground lg:text-6xl">
              Shape Your Future at Al-Xorazmiy University
            </h1>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
              Apply for our world-class Bachelor programs in technology and
              science. Start your journey towards innovation and excellence.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                >
                  Apply for Bachelor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#programs">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-border text-foreground sm:w-auto bg-transparent"
                >
                  Explore Programs
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-10 lg:grid-cols-4 lg:px-8">
          {[
            { value: "5", label: "Bachelor Programs" },
            { value: "100%", label: "Online Process" },
            { value: "24/7", label: "Application Support" },
            { value: "2025", label: "Intake Year" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground lg:text-4xl">
              Bachelor Programs
            </h2>
            <p className="mt-4 text-muted-foreground">
              Choose from our industry-leading programs designed for the future
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <div
                key={program.title}
                className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                  <program.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {program.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {program.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-card py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground lg:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-muted-foreground">
              Complete your application in four simple steps
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="text-5xl font-bold text-accent">
                  {step.number}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground lg:text-4xl">
              Why Apply Online?
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Real-Time Tracking",
                description: "Monitor your application status at every stage",
              },
              {
                title: "Direct Communication",
                description: "Chat directly with the Registrar Office",
              },
              {
                title: "Secure & Fast",
                description: "Your documents are safely stored and processed quickly",
              },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center lg:px-8">
          <h2 className="text-balance text-3xl font-bold text-primary-foreground lg:text-4xl">
            Ready to Begin?
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Start your application today and take the first step towards your future.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="mt-8 bg-card text-foreground hover:bg-card/90"
            >
              Apply Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">
                Al-Xorazmiy University
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              2025 Al-Xorazmiy University. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
