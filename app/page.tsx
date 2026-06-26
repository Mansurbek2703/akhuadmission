"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Hero3DScene from "@/components/hero-3d-scene";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Cpu,
  Code,
  Brain,
  Plane,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Shield,
  Briefcase,
  Languages,
  ChevronDown,
  FileDown,
} from "lucide-react";

const bachelorPrograms = [
  {
    icon: Code,
    title: "Software Engineering",
    description:
      "Build the future with cutting-edge software development skills",
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

const masterPrograms = [
  {
    icon: Brain,
    title: "Applied Artificial Intelligence",
    description: "Master advanced AI techniques, machine learning, and intelligent systems",
  },
  {
    icon: Briefcase,
    title: "Business Administration (MBA)",
    description: "Develop strategic leadership and business management expertise",
  },
  {
    icon: Languages,
    title: "Applied Linguistics and TESOL",
    description: "Teach English to speakers of other languages with advanced methodologies",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logoEdited.png"
              alt="Al-Khwarizmi University"
              width={200}
              height={150}
              className="h-18 w-40 rounded-lg object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <a
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              href="https://drive.google.com/file/d/1xTw0IZ6-5izZHQIhPg4HiQPf-GdAnvUW/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileDown className="h-4 w-4" />
              Exam Specifications
            </a>
            <a className="text-sm font-medium text-muted-foreground hover:text-foreground" href="#programs">
              Programs
            </a>

            {/* Sign In Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  Sign In
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href="https://admission.akhu.uz/login" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Bachelor
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="https://master.akhu.uz/login" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Master
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Apply Now Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1">
                  Apply Now
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href="https://admission.akhu.uz/register" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Bachelor
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="https://master.akhu.uz/register" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Master
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile menu */}
          <div className="flex items-center gap-2 md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  Sign In
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href="https://admission.akhu.uz/login" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Bachelor
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="https://master.akhu.uz/login" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Master
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1">
                  Apply
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href="https://admission.akhu.uz/register" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Bachelor
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="https://master.akhu.uz/register" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Master
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative min-h-[85vh] overflow-hidden sm:min-h-[88vh]">
        {/* BACKGROUND */}
        <Hero3DScene />
        {/* CONTENT */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-6 pt-20 sm:pt-24 lg:px-8 lg:pb-10 lg:pt-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/80 px-4 py-1.5 shadow-md backdrop-blur-sm">
              <BookOpen
                className="h-4 w-4"
                style={{
                  animation: "icon-color-pulse 3s ease-in-out infinite",
                  background: "linear-gradient(90deg, rgb(239, 68, 68), rgb(34, 197, 94))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              />
              <span
                className="text-sm font-medium"
                style={{
                  background: "linear-gradient(90deg, rgb(239, 68, 68) 0%, rgb(34, 197, 94) 100%)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "gradient-shift 4s ease infinite",
                }}
              >
                2026/2027 Admissions Open
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Shape Your Future at Al-Khwarizmi University
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base font-bold sm:text-lg lg:text-xl leading-relaxed" style={{ color: "#335aa9" }}>
              Apply for our world-class Bachelor and Master programs in technology,
              science, and business. Start your journey towards innovation and excellence.
            </p>

            {/* BUTTONS */}
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a href="https://admission.akhu.uz/register">
                <Button
                  size="lg"
                  className="relative overflow-hidden rounded-xl border-2 border-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 text-white font-semibold text-base transition-all duration-300 hover:border-cyan-400/50 backdrop-blur-sm"
                  style={{
                    animation: "scale-pulse 1.5s ease-in-out infinite",
                    boxShadow: "0 0 30px rgba(59, 130, 246, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <span className="relative z-10 flex items-center">
                    Apply for Bachelor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Button>
              </a>

              <a href="https://master.akhu.uz/register">
                <Button
                  size="lg"
                  className="relative overflow-hidden rounded-xl border-2 border-transparent bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-semibold text-base transition-all duration-300 hover:border-pink-400/50 backdrop-blur-sm"
                  style={{
                    animation: "scale-pulse 1.5s ease-in-out infinite",
                    boxShadow: "0 0 30px rgba(139, 92, 246, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <span className="relative z-10 flex items-center">
                    Apply for Master
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Button>
              </a>
            </div>

            {/* ================= YOUTUBE VIDEO ================= */}
            <div className="mt-8 flex justify-center">
              <div className="w-full max-w-3xl overflow-hidden rounded-xl shadow-xl">
                <div className="relative w-full pb-[56.25%]">
                  <iframe
                    className="absolute left-0 top-0 h-full w-full"
                    src="https://www.youtube.com/embed/dbe37orMYhE?si=PFMbhP8QE2M599XU"
                    title="University Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-4 left-1/2 z-0 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground/50">Scroll</span>
            <div className="h-8 w-5 rounded-full border-2 border-blue-300/30 p-1">
              <div className="mx-auto h-2 w-1 animate-bounce rounded-full bg-blue-500/40" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-6 lg:grid-cols-4 lg:px-8">
          {[
            { value: "5", label: "Bachelor Programs" },
            { value: "3", label: "Master Programs" },
            { value: "100%", label: "Online Process" },
            { value: "2026", label: "Intake Year" },
          ].map((stat) => (
            <div key={stat.label} className="group cursor-default rounded-lg p-3 text-center transition-all duration-200 hover:bg-blue-50/60">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-2xl font-bold text-transparent transition-transform duration-200 group-hover:scale-110 sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Two columns on desktop, stacked on mobile */}
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            {/* Bachelor Programs */}
            <div>
              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-balance text-2xl font-bold text-foreground sm:text-3xl">
                  Bachelor Programs
                </h2>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  Undergraduate degrees for future tech leaders
                </p>
              </div>
              <div className="grid gap-4">
                {bachelorPrograms.map((program) => (
                  <div
                    key={program.title}
                    className="group cursor-default rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300/50 hover:shadow-lg hover:shadow-blue-500/5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 transition-all duration-200 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 group-hover:shadow-md group-hover:shadow-blue-500/10">
                        <program.icon className="h-5 w-5 text-blue-600 transition-transform duration-200 group-hover:scale-110" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {program.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {program.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center lg:text-left">
                <a href="https://admission.akhu.uz/register">
                  <Button className="bg-blue-600 text-white">
                    Apply for Bachelor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Master Programs */}
            <div>
              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-balance text-2xl font-bold text-foreground sm:text-3xl">
                  Master Programs
                </h2>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  Advanced degrees for career advancement
                </p>
              </div>
              <div className="grid gap-4">
                {masterPrograms.map((program) => (
                  <div
                    key={program.title}
                    className="group cursor-default rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300/50 hover:shadow-lg hover:shadow-purple-500/5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 transition-all duration-200 group-hover:from-purple-500/20 group-hover:to-pink-500/20 group-hover:shadow-md group-hover:shadow-purple-500/10">
                        <program.icon className="h-5 w-5 text-purple-600 transition-transform duration-200 group-hover:scale-110" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {program.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {program.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center lg:text-left">
                <a href="https://master.akhu.uz/register">
                  <Button className="bg-purple-600 text-white hover:bg-purple-700">
                    Apply for Master
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600">
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 text-center sm:py-14 lg:px-8">
          <h2 className="text-balance text-2xl font-bold text-white sm:text-3xl">
            Ready to Begin?
          </h2>
          <p className="mt-2 text-sm text-white/80 sm:text-base">
            Start your application today and take the first step towards your
            future.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {/* Apply Now Dropdown in CTA */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="lg"
                  className="gap-2 bg-white text-blue-600 shadow-xl transition-all duration-200 hover:bg-blue-50 hover:shadow-2xl hover:shadow-white/20"
                >
                  Apply Now
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem asChild>
                  <a href="https://admission.akhu.uz/register" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Bachelor
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="https://master.akhu.uz/register" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Master
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Logo & Description */}
            <div className="space-y-4 sm:col-span-2 lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-20 items-center justify-center">
                  <img
                    alt="Al-Khwarizmi University"
                    className="h-18 w-40 rounded-lg object-contain"
                    src="/logoEdited.png"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground sm:text-base">
                    Al-Khwarizmi University admission portal
                  </p>
                </div>
              </Link>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold sm:text-base">
                Useful links
              </h3>
              <nav className="flex flex-col gap-2">
                <Link
                  href="#programs"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Programs
                </Link>
                <a
                  href="https://admission.akhu.uz/login"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Bachelor Login
                </a>
                <a
                  href="https://master.akhu.uz/login"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Master Login
                </a>
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
                  <span>
                    195 Abulgazi Bahodirkhan Street, Urgench City, Khorezm
                    Region
                  </span>
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
              <h3 className="text-sm font-semibold sm:text-base">
                Our location
              </h3>
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
              &copy; {new Date().getFullYear()} Al-Khwarizmi University. All
              rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              This platform was developed by{" "}
              <a
                href="https://mansurbek.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 hover:underline transition-colors"
              >
                Mansurbek
              </a>
              {" "}Qazaqov
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
