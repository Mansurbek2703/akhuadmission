import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { TransferForm } from "@/components/transfer-form";
import {
  ArrowLeft,
  CalendarClock,
  FileText,
  GraduationCap,
  ClipboardCheck,
  AlertTriangle,
  Languages,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Transfer Admissions | Al-Khwarizmi University",
  description:
    "Transfer to Al-Khwarizmi University. Review transfer regulations, eligibility, required documents, and submit your transfer application online.",
};

const deadlines = [
  { term: "Fall Intake", date: "July 30" },
  { term: "Winter Intake", date: "December 12" },
];

const documents = [
  "Passport or national ID card",
  "Official academic transcript from your current university",
  "High school / lyceum / college diploma",
  "English proficiency certificate (IELTS 5.5+ or equivalent)",
  "Motivation letter (optional)",
  "Additional achievements & certificates (optional)",
];

const eligibility = [
  "Currently enrolled as a full-time bachelor's student.",
  "Completed at least the first year of undergraduate study.",
  "Minimum 70% cumulative academic performance with no academic debt.",
  "Curriculum difference with the target program does not exceed 30%.",
];

const ieltsTable = [
  { ielts: "5.5", cefr: "B2", toefl: "46–59", duolingo: "95–100" },
  { ielts: "6.0", cefr: "B2", toefl: "60–78", duolingo: "105–110" },
  { ielts: "6.5", cefr: "B2+", toefl: "79–93", duolingo: "115–120" },
  { ielts: "7.0", cefr: "C1", toefl: "94–101", duolingo: "125–130" },
  { ielts: "7.5+", cefr: "C1+", toefl: "102–120", duolingo: "135+" },
];

const evaluation = [
  {
    step: "1. Initial Screening",
    desc: "Verification of eligibility, documents, and academic records.",
  },
  {
    step: "2. Interview",
    desc: "Motivation and academic-readiness interview with the faculty.",
  },
  {
    step: "3. Final Assessment",
    desc: "Credit evaluation, placement decision, and admission offer.",
  },
];

export default function TransferPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between px-2.5 py-3 sm:px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logoEdited.png"
              alt="Al-Khwarizmi University"
              width={200}
              height={150}
              className="h-16 w-auto rounded-lg object-contain"
            />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-accent/40">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center lg:px-10">
          <h1 className="text-balance text-4xl font-bold text-foreground sm:text-5xl">
            Transfer to Al-Khwarizmi University
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Continue your undergraduate journey at Al-Khwarizmi University.
            Review the transfer regulations below, confirm your eligibility, and
            submit your application with the required documents online.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16 lg:px-10">
        {/* Eligibility notice */}
        <div className="mb-10 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Important eligibility requirement
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Applicants must have completed their <strong>first year</strong>{" "}
              of study. As a newly established university, Al-Khwarizmi accepts
              transfer students into the <strong>2nd year only</strong> — we do
              not currently offer 3rd or 4th year placements.
            </p>
          </div>
        </div>

        {/* Deadlines */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Application Deadlines
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {deadlines.map((d) => (
              <div
                key={d.term}
                className="rounded-xl border border-border bg-card p-5"
              >
                <p className="text-sm text-muted-foreground">{d.term}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {d.date}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Eligibility list */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Minimum Requirements
            </h2>
          </div>
          <ul className="space-y-2">
            {eligibility.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Documents */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Required Documents
            </h2>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {documents.map((doc) => (
              <li
                key={doc}
                className="flex items-start gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {doc}
              </li>
            ))}
          </ul>
        </section>

        {/* IELTS equivalence */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              English Proficiency Equivalence
            </h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary text-left text-foreground">
                  <th className="px-4 py-3 font-semibold">IELTS</th>
                  <th className="px-4 py-3 font-semibold">CEFR</th>
                  <th className="px-4 py-3 font-semibold">TOEFL iBT</th>
                  <th className="px-4 py-3 font-semibold">Duolingo</th>
                </tr>
              </thead>
              <tbody>
                {ieltsTable.map((r, i) => (
                  <tr
                    key={r.ielts}
                    className={i % 2 === 0 ? "bg-card" : "bg-secondary/40"}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {r.ielts}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.cefr}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.toefl}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.duolingo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            A minimum of IELTS 5.5 (or equivalent) is required for admission.
          </p>
        </section>

        {/* Evaluation process */}
        <section className="mb-14">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Evaluation Process
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {evaluation.map((e) => (
              <div
                key={e.step}
                className="rounded-xl border border-border bg-card p-5"
              >
                <p className="text-sm font-semibold text-foreground">
                  {e.step}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {e.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Application form */}
        <section
          id="apply"
          className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 sm:p-8"
        >
          <h2 className="text-2xl font-bold text-foreground">
            Transfer Application
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Complete the form below and upload your documents. Your application
            will be sent directly to the Admissions Office for review.
          </p>
          <div className="mt-8">
            <TransferForm />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-muted-foreground lg:px-8">
          © {new Date().getFullYear()} Al-Khwarizmi University. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
