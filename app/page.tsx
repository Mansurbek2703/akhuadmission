"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Hero3DScene from "@/components/hero-3d-scene";
import {
  BookOpen,
  Shield,
  Cpu,
  Code,
  Brain,
  Plane,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
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
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logoEdited.png"
              alt="Al-Xorazmiy University"
              width={200}
              height={150}
              className="h-18 w-40 rounded-lg object-contain"
            />
            {/*<span className="text-lg font-bold text-foreground">*/}
            {/*  Al-Xorazmiy University*/}
            {/*</span>*/}
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

      {/* Hero Section with 3D Scene */}
      <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-b from-background via-accent/20 to-background">
        {/* Animated Background */}
        <Hero3DScene />

        {/* Content overlay */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-20 lg:px-8 lg:pb-24 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-4 py-1.5 shadow-lg shadow-primary/5 backdrop-blur-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                2026/2027 Admissions Open
              </span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground drop-shadow-sm lg:text-6xl">
              Shape Your Future at Al-Khwarizmi University
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
              Apply for our world-class Bachelor programs in technology and
              science. Start your journey towards innovation and excellence.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="w-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
                >
                  Apply for Bachelor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#programs">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-border bg-card/80 text-foreground backdrop-blur-sm hover:bg-card sm:w-auto"
                >
                  Explore Programs
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground/60">Scroll</span>
            <div className="h-8 w-5 rounded-full border-2 border-muted-foreground/30 p-1">
              <div className="mx-auto h-2 w-1 animate-bounce rounded-full bg-primary/50" />
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
            { value: "2026", label: "Intake Year" },
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
                className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-200 group-hover:bg-primary/20">
                  <program.icon className="h-6 w-6 text-primary" />
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
                <div className="text-5xl font-bold text-primary/15">
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
              <div
                key={feature.title}
                className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
          <h2 className="text-balance text-3xl font-bold text-primary-foreground lg:text-4xl">
            Ready to Begin?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Start your application today and take the first step towards your future.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="mt-8 bg-card text-foreground shadow-xl hover:bg-card/90"
            >
              Apply Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Logo & Description */}
            <div className="space-y-4 sm:col-span-2 lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-3">
                <Image
                  src="/logo1.png"
                  alt="Al-Xorazmiy University"
                  width={70}
                  height={70}
                  className="rounded-lg"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground sm:text-base">
                    Al-Khwarizmi University admission portal
                  </p>
                </div>
              </Link>

            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold sm:text-base">Useful links</h3>
              <nav className="flex flex-col gap-2">
                <Link
                  href="#programs"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Programs
                </Link>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Log in
                </Link>
                <a
                  href="https://akhu.uz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  University website
                </a>
              </nav>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold sm:text-base">Contact</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>195 Abulgazi Bahodirkhan Street, Urgench City, Khorezm Region</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <a
                    href="tel:+998556020002"
                    className="transition-colors hover:text-foreground"
                  >
                    +998 (55) 602-00-02
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <a
                    href="mailto:info@akhu.uz"
                    className="transition-colors hover:text-foreground"
                  >
                    info@akhu.uz
                  </a>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="space-y-4 sm:col-span-2 lg:col-span-1">
              <h3 className="text-sm font-semibold sm:text-base">Our location</h3>
              <div className="h-48 w-full overflow-hidden rounded-lg border border-border sm:h-56">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1527.8!2d60.6280694520137!3d41.560387468360716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDMzJzM3LjQiTiA2MMKwMzcnNDEuMSJF!5e0!3m2!1suz!2s!4v1704000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location of Al-Khwarizmi University"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2 border-t border-border pt-6 text-center sm:pt-8">
            <p className="text-xs text-muted-foreground sm:text-sm">
              &copy; {new Date().getFullYear()} Al-Khwarizmi University. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              This platform was developed by the IT department of Al-Khwarizmi University.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
