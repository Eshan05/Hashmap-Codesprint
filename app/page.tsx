import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  HeartPulse,
  Layers,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import PublicNavbar from "@/components/layout/public-navbar";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Symptoms explored last week", value: "460k" },
  { label: "Medication safety checks", value: "78k" },
  { label: "Conditions in your library", value: "1.2k" },
];

const howItWorks = [
  {
    title: "Bring everything together",
    description:
      "Collect allergies, medications, past procedures, and specialist contacts in one private workspace.",
    icon: Layers,
  },
  {
    title: "Understand what matters",
    description:
      "Reference clear summaries, annotated timelines, and linked resources for every symptom you track.",
    icon: Sparkles,
  },
  {
    title: "Act with confidence",
    description:
      "Check medication interactions, prep questions for visits, and export notes when you are ready to share.",
    icon: Activity,
  },
];

const toolkits = [
  {
    title: "Symptom companion",
    description:
      "Explore guided symptom checks built with clinicians and see suggested questions for your care team.",
    icon: HeartPulse,
    href: "/tools/symptom-search",
  },
  {
    title: "Medication clarity",
    description:
      "Log prescriptions, screen for interactions, and store pharmacy information without spreadsheets.",
    icon: ShieldCheck,
    href: "/tools/medicine-search",
  },
  {
    title: "Health timeline",
    description:
      "Keep appointment notes, lab highlights, and personal observations together with lightweight timelines.",
    icon: BarChart3,
    href: "/dashboard",
  },
];

const testimonials = [
  {
    quote:
      "PHT became the hub for my specialists, medications, and symptom notes. Every visit starts with a clear rundown now.",
    author: "Lina Ortega",
    role: "Neurology patient",
  },
  {
    quote:
      "The medication clarity tool replaced binders of printouts. Interaction checks are two clicks away during telehealth visits.",
    author: "Marcus Haley",
    role: "Type 2 diabetes advocate",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-white to-white text-slate-900">
      <div className="absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden">
        <div className="h-[520px] w-[1200px] rounded-full bg-gradient-to-br from-sky-200/70 via-indigo-200/40 to-emerald-100/60 blur-3xl" />
      </div>

      <PublicNavbar />

      <main className="relative mx-auto w-full max-w-[1240px] px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <section className="grid items-center gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm text-slate-600 shadow-sm backdrop-blur">
              <Sparkles className="size-4 text-slate-500" />
              Now in open beta
            </div>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Personal health tools for organizing what matters most.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              PHT keeps medications, allergies, symptom notes, and trusted research in one place so you always walk into appointments prepared.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="/sign-up" className="text-base font-semibold">
                  Create your workspace
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-base font-semibold">
                <Link href="/tools" className="inline-flex items-center gap-2">
                  Browse tools
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur"
                >
                  <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute -left-8 top-10 h-24 w-24 rounded-full bg-sky-200/50 blur-2xl" />
            <div className="absolute -right-6 bottom-6 h-28 w-28 rounded-full bg-emerald-200/40 blur-2xl" />
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                <span className="text-sm font-medium text-slate-600">Daily Snapshot</span>
                <span className="text-xs text-emerald-600">Updated moments ago</span>
              </div>
              <div className="space-y-6 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Today</p>
                    <p className="text-lg font-semibold text-slate-900">Health brief</p>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    Ready to share
                  </div>
                </div>
                <div className="grid gap-3">
                  {[
                    { label: "Symptoms logged", value: "Migraine, aura", delta: "Added note" },
                    { label: "Medication check", value: "Sumatriptan + Naproxen", delta: "No conflicts" },
                    { label: "Upcoming visit", value: "Neurology • Nov 3", delta: "Prep questions" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm text-slate-600"
                    >
                      <span className="font-medium">{item.label}</span>
                      <span className="text-slate-900">
                        {item.value}
                        <span className="ml-2 text-xs text-emerald-600">{item.delta}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Next best action</p>
                  <p className="mt-2 text-sm text-slate-600">
                    "Review your neurology visit checklist and export the medication list before Friday."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="relative mt-20 overflow-hidden rounded-[32px] border border-slate-200 bg-white/90 px-6 py-16 shadow-xl shadow-slate-200/50 backdrop-blur sm:px-10">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#e0f2fe_0,_transparent_60%)] opacity-70" />
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              How it works
            </span>
            <h2 className="mt-4 text-balance text-3xl font-semibold text-slate-900 sm:text-4xl">
              One private place for your medical records, notes, and research.
            </h2>
            <p className="mt-4 text-base text-slate-600">
              PHT removes app juggling so you can capture details once, link trusted resources, and stay organized between visits.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {howItWorks.map((step) => (
              <div key={step.title} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-6 text-left shadow-sm">
                <step.icon className="size-10 rounded-full bg-slate-900/90 p-2 text-white" />
                <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="tools" className="mt-20">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                Personal health tools
              </span>
              <h2 className="mt-3 text-balance text-3xl font-semibold text-slate-900 sm:text-4xl">
                Build a command center for your health information.
              </h2>
            </div>
            <Button asChild variant="ghost">
              <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold">
                See all tools
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {toolkits.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="group relative flex h-full flex-col gap-5 rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-lg shadow-slate-200/40 transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl"
              >
                <tool.icon className="size-11 rounded-2xl bg-slate-900/90 p-2.5 text-white transition-transform group-hover:scale-105" />
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-slate-900">{tool.title}</h3>
                  <p className="text-sm text-slate-600">{tool.description}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  Explore
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section id="stories" className="mt-20 rounded-[32px] border border-slate-200 bg-slate-950 px-6 py-16 text-slate-100 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)] sm:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              In the field
            </span>
            <h2 className="mt-4 text-balance text-3xl font-semibold sm:text-4xl">
              Built with patients, caregivers, and clinical navigators.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="flex h-full flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8"
              >
                <p className="text-lg text-slate-100">&quot;{testimonial.quote}&quot;</p>
                <div className="space-y-1 text-sm text-slate-300">
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="cta" className="relative mt-20 overflow-hidden rounded-[32px] border border-slate-200 bg-white px-6 py-16 shadow-xl shadow-slate-200/60 sm:px-10">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,_#bbf7d0_0,_transparent_60%)] opacity-60" />
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
                Make PHT yours
              </span>
              <h2 className="mt-4 text-balance text-3xl font-semibold text-slate-900 sm:text-4xl">
                Keep your health history close without juggling five apps.
              </h2>
              <p className="mt-4 text-base text-slate-600">
                Document what matters, attach relevant resources, and invite trusted collaborators when you choose to share.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link href="/sign-up" className="text-base font-semibold">
                    Get started free
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/how-it-works" className="inline-flex items-center gap-2 text-base font-semibold">
                    What's new this month
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-8">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <ShieldCheck className="size-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Private by design</p>
                  <p className="text-lg font-semibold text-slate-900">End-to-end encryption and on-demand sharing</p>
                </div>
              </div>
              <dl className="mt-8 space-y-4 text-sm text-slate-600">
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <dt>Organize anything</dt>
                  <dd className="font-semibold text-slate-900">Symptoms, medications, lab highlights, visit notes</dd>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <dt>Access control</dt>
                  <dd className="font-semibold text-slate-900">Share instantly with family, caregivers, or physicians</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Success metrics</dt>
                  <dd className="font-semibold text-emerald-600">Visit prep time -40% | Answers captured 100%</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/90 py-6 text-sm text-slate-500">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} PHT. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-slate-900">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-slate-900">
              Terms
            </Link>
            <Link href="mailto:hello@pht.health" className="transition-colors hover:text-slate-900">
              hello@pht.health
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
