import FadeContent from '@/components/fade-content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import SymptomSearch from '@/models/symptom-search';
import dbConnect from '@/utils/db-conn';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bookmark,
  ClipboardList,
  Download,
  Droplet,
  Gauge,
  HeartPulse,
  Home,
  InfoIcon,
  MoreHorizontal,
  Pill,
  Phone,
  Plus,
  Share2,
  Shield,
  Sparkles,
  Stethoscope,
  Thermometer,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IoInformationOutline } from 'react-icons/io5';

interface PageProps {
  params: {
    searchId: string;
  };
}

interface Condition {
  name: string;
  description: string;
  explanation: string;
}

interface Medicine {
  name: string;
  commonUse: string;
  sideEffects: string[];
}

interface SeekHelp {
  title: string;
  explanation: string;
}

type Timestamp = Date | string | number | undefined;

export default async function SymptomSearchResultPage({ params }: PageProps) {
  await dbConnect();
  const { searchId } = params;
  const searchResult = await SymptomSearch.findOne({ searchId });

  if (!searchResult) {
    notFound();
  }

  let conditions: Condition[] = [];
  try {
    conditions = JSON.parse(searchResult.potentialConditions || "[]");
  } catch (e) {
    console.error("Error parsing conditions on frontend:", e);
  }

  let medicines: Medicine[] = [];
  try {
    medicines = JSON.parse(searchResult.medicines || "[]");
  } catch (e) {
    console.error("Error parsing medicines on frontend:", e);
  }

  let seekHelpItems: SeekHelp[] = [];
  try {
    seekHelpItems = JSON.parse(searchResult.whenToSeekHelp || "[]");
  } catch (e) {
    console.error("Error parsing whenToSeekHelp on frontend:", e);
  }

  let finalVerdict = searchResult.finalVerdict;
  try {
    const parsedVerdict = JSON.parse(searchResult.finalVerdict || '{}');
    finalVerdict = parsedVerdict.finalVerdict || searchResult.finalVerdict;
  } catch (e) {
    console.error("Error parsing finalVerdict:", e);
  }

  let cumulativePrompt = searchResult.cumulativePrompt;
  try {
    const parsedPrompt = JSON.parse(searchResult.cumulativePrompt || '{}');
    cumulativePrompt = parsedPrompt.problemSummary || searchResult.cumulativePrompt;
  } catch (e) {
    console.error("Error parsing cumulativePrompt:", e);
  }

  const createdAt: Timestamp = searchResult.createdAt;
  const updatedCopy = createdAt ? new Date(createdAt).toLocaleString() : 'Just now';

  const severityBaseline = conditions.length ? Math.min(92, 40 + conditions.length * 11) : 36;
  const severityScore = Math.min(100, severityBaseline);
  const severityLabel = severityScore >= 75 ? 'High Attention' : severityScore >= 55 ? 'Moderate' : 'Mild';
  const severityTone = severityScore >= 75 ? 'text-rose-500 dark:text-rose-400' : severityScore >= 55 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';
  const severityBackdrop = severityScore >= 75
    ? 'from-rose-200/40 via-rose-100/15 to-transparent dark:from-rose-500/15 dark:via-rose-500/5 dark:to-transparent'
    : severityScore >= 55
      ? 'from-amber-200/40 via-amber-100/15 to-transparent dark:from-amber-500/15 dark:via-amber-500/5 dark:to-transparent'
      : 'from-emerald-200/40 via-emerald-100/15 to-transparent dark:from-emerald-500/15 dark:via-emerald-500/5 dark:to-transparent';
  const gaugeRotation = `${(severityScore / 100) * 360}deg`;

  const totalConditions = conditions.length;
  const totalMedicines = medicines.length;
  const totalAlerts = seekHelpItems.length;

  const conditionGradients = [
    'linear-gradient(130deg, rgba(79, 70, 229, 0.18), rgba(124, 58, 237, 0.1))',
    'linear-gradient(135deg, rgba(59, 130, 246, 0.16), rgba(14, 165, 233, 0.1))',
    'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(34, 197, 94, 0.1))',
  ];
  const medicineGradients = [
    'linear-gradient(135deg, rgba(244, 114, 182, 0.18), rgba(216, 180, 254, 0.1))',
    'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(253, 224, 71, 0.1))',
    'linear-gradient(135deg, rgba(96, 165, 250, 0.18), rgba(129, 140, 248, 0.1))',
  ];
  const helpGradients = [
    'linear-gradient(135deg, rgba(248, 113, 113, 0.2), rgba(251, 191, 36, 0.1))',
    'linear-gradient(135deg, rgba(252, 165, 165, 0.18), rgba(251, 211, 141, 0.1))',
    'linear-gradient(135deg, rgba(147, 197, 253, 0.18), rgba(191, 219, 254, 0.1))',
  ];

  const severityPalette = [
    { tone: 'rgba(248, 113, 113, 0.75)', label: 'Critical' },
    { tone: 'rgba(251, 191, 36, 0.75)', label: 'Urgent' },
    { tone: 'rgba(59, 130, 246, 0.75)', label: 'Monitor' },
  ];

  const reliefIdeas = [
    {
      title: 'Hydration & Rest',
      description: 'Sip water or electrolyte mix and rest briefly to observe symptom shifts before escalating.',
      icon: Droplet,
    },
    {
      title: 'Guided Breathing',
      description: 'Use a 4-7-8 breathing cycle for two minutes to calm stress-linked flares.',
      icon: Activity,
    },
    {
      title: 'Warm Compress',
      description: 'Apply a warm compress to localized discomfort for short-term relief and note reactions.',
      icon: Thermometer,
    },
  ];

  const quickChecklist = [
    'Log onset time and symptom intensity',
    'Note any recent triggers or exertion',
    'Record current medications and dosages',
  ];

  const buildSymptomChips = (text: string) =>
    text
      .split(/[,.;]/)
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk.length > 0)
      .slice(0, 3);

  const gaugeStyle = (percent: number, tone: string) => ({
    backgroundImage: `conic-gradient(${tone} 0deg, ${tone} ${percent * 3.6}deg, rgba(220,220,220,0.16) ${percent * 3.6}deg)`,
  });

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
      <div className="relative w-full px-5 py-8 lg:px-11 lg:py-10">
        <header className="relative mb-8">
          <Card className="overflow-hidden border border-neutral-800/60 bg-neutral-950 text-neutral-100 shadow-2xl dark:border-neutral-800">
            <CardContent className="p-7 md:p-9">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl space-y-5">
                  <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.28em] text-neutral-300">
                    <Sparkles className="h-4 w-4" />
                    <span>Adaptive Insight Console</span>
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.4rem]">Symptom Insight Canvas</h1>
                    <p className="text-base text-neutral-200/90 sm:text-lg">
                      Curated guidance layered with dynamic risk cues. Explore probable conditions, recommended therapies, and escalation signals designed with Material Expressive clarity.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <Badge className="border border-neutral-100/40 bg-neutral-100/20 text-neutral-50">
                      Material Expressive 3
                    </Badge>
                    <Badge variant="outline" className="border-neutral-100/40 text-neutral-100/90">
                      <HeartPulse className="mr-1 h-3.5 w-3.5" /> Real-time markers
                    </Badge>
                    <Badge variant="outline" className="border-neutral-100/40 text-neutral-100/90">
                      <Pill className="mr-1 h-3.5 w-3.5" /> Pharmacology ready
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <Button asChild size="sm" className="gap-2 bg-neutral-100 text-neutral-900 hover:bg-neutral-200">
                      <Link href="/symptom-search">
                        <ArrowRight className="h-4 w-4" />
                        New assessment
                      </Link>
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-neutral-800 text-neutral-100 hover:bg-neutral-700">
                      <Stethoscope className="h-4 w-4" /> Check similar conditions
                    </Button>
                    <Button size="sm" variant="outline" className="border-neutral-700 text-neutral-100 hover:bg-neutral-800">
                      <Plus className="h-4 w-4" /> Add to profile
                    </Button>
                  </div>
                </div>
                <div className="relative w-full max-w-xs self-center">
                  <div
                    className={`relative aspect-square overflow-hidden rounded-[34px] border border-neutral-700/70 bg-neutral-900/80 p-6 shadow-xl backdrop-blur-xl transition-colors ${severityBackdrop}`}
                    style={{
                      // embed the computed color directly into the conic-gradient to avoid using a CSS custom property
                      backgroundImage: (() => {
                        const gaugeColor = severityScore >= 75
                          ? 'rgba(244, 63, 94, 0.45)'
                          : severityScore >= 55
                            ? 'rgba(234, 179, 8, 0.4)'
                            : 'rgba(16, 185, 129, 0.45)';
                        return `conic-gradient(${gaugeColor} 0deg, ${gaugeColor} ${gaugeRotation}, rgba(255,255,255,0.05) ${gaugeRotation})`;
                      })(),
                    }}
                  >
                    <div className="absolute inset-[18%] flex flex-col items-center justify-center gap-3 rounded-[26px] border border-neutral-700/60 bg-neutral-950/85 p-6 text-center">
                      <Gauge className="h-6 w-6 text-neutral-400" />
                      <span className="text-[0.68rem] uppercase tracking-[0.28em] text-neutral-500">Severity</span>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-semibold">{severityScore}</span>
                        <span className="mb-1 text-sm text-neutral-400">%</span>
                      </div>
                      <span className={`text-sm font-medium ${severityTone}`}>{severityLabel}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.2em] text-neutral-400">
                    <div className="rounded-2xl border border-neutral-700/60 bg-neutral-900/70 px-3 py-2 text-neutral-100">
                      {totalConditions} Conditions
                    </div>
                    <div className="rounded-2xl border border-neutral-700/60 bg-neutral-900/70 px-3 py-2 text-neutral-100">
                      {totalMedicines} Medications
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span>Updated {updatedCopy}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="text-neutral-500 hover:bg-neutral-200/80 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/symptom-search">Edit original submission</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Share2 className="h-4 w-4" /> Share report
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Download className="h-4 w-4" /> Download snapshot
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <FadeContent blur duration={500} easing="ease-in" initialOpacity={0}>
          <p className="my-4 text-neutral-600 transition hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-200">
            <Link href="/symptom-search" className="underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-600">Return to intake form</Link>
          </p>
          {searchResult.cumulativePrompt ? (
            <article className="flex flex-col gap-5">
              <section className="flex flex-col gap-3 md:flex-row md:items-stretch">
                <Card className="w-full border border-neutral-200/70 bg-neutral-50/80 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/60">
                  <CardHeader className="space-y-3">
                    <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-50">
                      <Sparkles className="h-5 w-5 text-neutral-400 dark:text-neutral-300" />
                      Overview Snapshot
                    </CardTitle>
                    <CardDescription className="text-neutral-600 dark:text-neutral-300">
                      Highlights the AI synthesized pathways using your submission. Pair this with clinician guidance before making care decisions.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex flex-wrap gap-2 pt-0 text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                    <span className="rounded-full border border-neutral-200 px-3 py-1 dark:border-neutral-700">{totalConditions} Conditions</span>
                    <span className="rounded-full border border-neutral-200 px-3 py-1 dark:border-neutral-700">{totalMedicines} Medications</span>
                    <span className="rounded-full border border-neutral-200 px-3 py-1 dark:border-neutral-700">{totalAlerts} Alerts</span>
                  </CardFooter>
                </Card>
                <Card className="w-full border border-neutral-200/70 bg-neutral-50/80 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/60">
                  <CardHeader className="space-y-3">
                    <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-50">
                      <InfoIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-300" />
                      Input Summary
                    </CardTitle>
                    <CardDescription className="leading-6 text-neutral-600 dark:text-neutral-300">{cumulativePrompt}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex flex-wrap gap-2 pt-0">
                    <Button variant="secondary" size="sm" className="bg-neutral-200 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700">
                      <HeartPulse className="h-4 w-4" /> Learn more
                    </Button>
                    <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/80 dark:text-neutral-400 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-100">
                      Quick annotate
                    </Button>
                  </CardFooter>
                </Card>
              </section>
              <div className="mx-auto space-y-6 rounded-3xl border border-neutral-200/70 bg-neutral-50/80 p-4 shadow-[0_34px_120px_-40px_rgba(20,20,20,0.45)] backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/60 lg:max-w-6xl lg:p-6">
                {conditions.length > 0 && (
                  <section className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900/80 text-neutral-100 shadow-inner dark:bg-neutral-100/10 dark:text-neutral-100">
                          <ClipboardList className="h-5 w-5" />
                        </span>
                        <div className="space-y-1">
                          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">Potential Conditions</h2>
                          <p className="text-sm text-neutral-400 dark:text-neutral-400">Model-ranked differentials to explore with a clinician.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-neutral-400/40 text-neutral-300 dark:border-neutral-700 dark:text-neutral-300">
                          Likelihood spectrum
                        </Badge>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button size="icon" variant="ghost" type="button" className="h-9 w-9 border border-neutral-700/60 text-neutral-300 hover:bg-neutral-800/70 dark:border-neutral-700 dark:text-neutral-300">
                              <IoInformationOutline className="h-4 w-4" />
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80 border border-neutral-200 bg-neutral-100/95 text-neutral-800 backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-200">
                            <div className="space-y-2 text-sm">
                              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Potential Conditions</h4>
                              <p>Ranked suggestions that may align with your symptoms. Confirm with a clinician before acting.</p>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {conditions.map((condition, index) => (
                        <Card
                          key={index}
                          className="group h-full border border-neutral-200/80 bg-white/90 transition hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-xl dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:hover:border-neutral-600"
                          style={{
                            backgroundImage: conditionGradients[index % conditionGradients.length],
                            backgroundBlendMode: 'overlay',
                          }}
                        >
                          <CardHeader className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-2">
                                <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">{condition.name}</CardTitle>
                                <CardDescription className="text-neutral-600 dark:text-neutral-300">{condition.description}</CardDescription>
                              </div>
                              <Badge className="rounded-full bg-neutral-900 px-3 py-1 text-xs text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900">#{index + 1}</Badge>
                            </div>
                            <div className="flex items-center justify-between gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                <span>{index === 0 ? 'Primary signal' : index === 1 ? 'Consider closely' : 'Keep monitoring'}</span>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:bg-neutral-200/70 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="gap-2">
                                    <Bookmark className="h-4 w-4" /> Bookmark insight
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2">
                                    <Share2 className="h-4 w-4" /> Share with clinician
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2">
                                    <Plus className="h-4 w-4" /> Add to care plan
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
                            <p>{condition.explanation}</p>
                            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-100/70 px-4 py-3 text-xs uppercase tracking-[0.18em] text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                              <span className="flex items-center gap-2">
                                <Activity className="h-4 w-4" /> Severity trend
                              </span>
                              <span className="font-semibold text-neutral-700 dark:text-neutral-200">{index === 0 ? 'Elevated' : index === 1 ? 'Stable' : 'Mild'}</span>
                            </div>
                          </CardContent>
                          <CardFooter className="flex flex-wrap gap-2 pt-0">
                            <Button size="sm" variant="secondary" className="bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200">
                              <ArrowRight className="h-4 w-4" /> Learn more
                            </Button>
                            <Button size="sm" variant="outline" className="border-neutral-300 text-neutral-600 hover:bg-neutral-200/80 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800/70">
                              <Pill className="h-4 w-4" /> Related treatments
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                {medicines.length > 0 && (
                  <section className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900/80 text-neutral-100 shadow-inner dark:bg-neutral-100/10">
                          <Pill className="h-5 w-5" />
                        </span>
                        <div className="space-y-1">
                          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">Potential Medications</h2>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">Verify interactions and dosing with your clinician before proceeding.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/70 dark:text-neutral-400 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-100">
                          <Download className="mr-2 h-3.5 w-3.5" /> Export to pharmacy
                        </Button>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button size="icon" variant="ghost" type="button" className="h-9 w-9 border border-neutral-700/60 text-neutral-300 hover:bg-neutral-800/70 dark:border-neutral-700 dark:text-neutral-300">
                              <IoInformationOutline className="h-4 w-4" />
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80 border border-neutral-200 bg-neutral-100/95 text-neutral-800 backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-200">
                            <div className="space-y-2 text-sm">
                              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Potential Medications</h4>
                              <p>Pharmacological options aligned to the presented symptom profile. Verify interactions and dosage with a healthcare professional first.</p>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    </div>
                    <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {medicines.map((medicine, index) => (
                        <li key={index}>
                          <Card
                            className="h-full border border-neutral-200/80 bg-white/90 transition hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-xl dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:hover:border-neutral-600"
                            style={{
                              backgroundImage: medicineGradients[index % medicineGradients.length],
                              backgroundBlendMode: 'overlay',
                            }}
                          >
                            <CardHeader className="space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                  <CardTitle className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{medicine.name}</CardTitle>
                                  <CardDescription className="text-neutral-600 dark:text-neutral-300">Commonly used for {medicine.commonUse}</CardDescription>
                                </div>
                                <Badge className="rounded-full bg-neutral-900 px-3 py-1 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900">Rx</Badge>
                              </div>
                              <div className="flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
                                <span className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 dark:border-neutral-700"><Stethoscope className="h-3 w-3" /> Consult provider</span>
                                <span className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 dark:border-neutral-700"><Activity className="h-3 w-3" /> Monitor vitals</span>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
                              <section className="flex items-start gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-200/80 dark:bg-neutral-800/70">
                                  <Pill className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
                                </div>
                                <div className="space-y-2">
                                  <span className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">Side effects</span>
                                  <ul className="grid gap-1 text-sm">
                                    {medicine.sideEffects.map((effect, effectIndex) => (
                                      <li key={effectIndex} className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400/80 dark:bg-neutral-500/70" />
                                        <span>{effect}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </section>
                              <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-100/70 px-4 py-3 text-xs uppercase tracking-[0.18em] text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                                <span className="flex items-center gap-2">
                                  <Gauge className="h-4 w-4" /> Adherence outlook
                                </span>
                                <span className="font-semibold text-neutral-700 dark:text-neutral-200">{index === 0 ? 'High' : 'Moderate'}</span>
                              </div>
                            </CardContent>
                            <CardFooter className="flex flex-wrap gap-2 pt-0">
                              <Button size="sm" variant="secondary" className="bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200">
                                <Stethoscope className="h-4 w-4" /> Learn more
                              </Button>
                              <Button size="sm" variant="outline" className="border-neutral-300 text-neutral-600 hover:bg-neutral-200/80 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800/70">
                                Save to regimen
                              </Button>
                            </CardFooter>
                          </Card>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {seekHelpItems.length > 0 && (
                  <section className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900/80 text-neutral-100 shadow-inner dark:bg-neutral-100/10">
                          <AlertTriangle className="h-5 w-5" />
                        </span>
                        <div className="space-y-1">
                          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">When to Seek Help</h2>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">Escalation cues, similar symptoms, and immediate self-checks.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="border-neutral-300 text-neutral-600 hover:bg-neutral-200/80 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800/70">
                          <ClipboardList className="mr-2 h-4 w-4" /> Emergency checklist
                        </Button>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button size="icon" variant="ghost" type="button" className="h-9 w-9 border border-neutral-700/60 text-neutral-300 hover:bg-neutral-800/70 dark:border-neutral-700 dark:text-neutral-300">
                              <IoInformationOutline className="h-4 w-4" />
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80 border border-neutral-200 bg-neutral-100/95 text-neutral-800 backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-200">
                            <div className="space-y-2 text-sm">
                              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Seeking Help</h4>
                              <p>Signals that should prompt direct medical intervention, especially if symptoms escalate rapidly or combine with other risk markers.</p>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[2fr_1fr]">
                      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {seekHelpItems.map((item, index) => {
                          const severityMeta = severityPalette[index % severityPalette.length];
                          const severityPercent = Math.min(94, 72 + index * 9);
                          const symptomChips = buildSymptomChips(item.explanation);

                          return (
                            <li key={index}>
                              <Card
                                className="h-full border border-neutral-200/80 bg-white/90 transition hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-xl dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:hover:border-neutral-600"
                                style={{
                                  backgroundImage: helpGradients[index % helpGradients.length],
                                  backgroundBlendMode: 'overlay',
                                }}
                              >
                                <CardHeader className="space-y-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="relative h-14 w-14 rounded-full border border-neutral-200 bg-neutral-100/70 p-1 dark:border-neutral-700 dark:bg-neutral-900/40"
                                        style={gaugeStyle(severityPercent, severityMeta.tone)}
                                      >
                                        <div className="absolute inset-[30%] flex flex-col items-center justify-center rounded-full bg-neutral-50/90 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-neutral-600 dark:bg-neutral-900/80 dark:text-neutral-200">
                                          <span>{severityPercent}%</span>
                                          <span>{severityMeta.label}</span>
                                        </div>
                                      </div>
                                      <div>
                                        <CardTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</CardTitle>
                                        <Badge variant="outline" className="mt-1 border-neutral-300 text-neutral-500 dark:border-neutral-700 dark:text-neutral-300">Priority</Badge>
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:bg-neutral-200/70 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-100">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <CardDescription className="text-neutral-600 dark:text-neutral-300">{item.explanation}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
                                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                                    <Home className="h-4 w-4" /> Immediate steps
                                  </div>
                                  <p className="text-sm leading-6">
                                    Contact your provider or emergency services if the symptom worsens, combines with breathing difficulty, or leads to loss of consciousness.
                                  </p>
                                  {symptomChips.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {symptomChips.map((chip, chipIndex) => (
                                        <span key={chipIndex} className="flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50/80 px-3 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                                          <HeartPulse className="h-3.5 w-3.5" />
                                          {chip}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                                <CardFooter className="flex flex-wrap items-center justify-between gap-2 pt-0 text-xs text-neutral-500 dark:text-neutral-400">
                                  <span className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" /> Contact provider immediately
                                  </span>
                                  <ArrowRight className="h-4 w-4" />
                                </CardFooter>
                              </Card>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="space-y-3">
                        <Card className="border border-neutral-200/80 bg-white/90 dark:border-neutral-800/80 dark:bg-neutral-900/80">
                          <CardHeader className="space-y-2">
                            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-neutral-600 dark:text-neutral-400">
                              <ClipboardList className="h-4 w-4" /> Quick checklist
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                            {quickChecklist.map((item, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <span className="mt-1 h-2 w-2 rounded-full bg-neutral-400/70 dark:bg-neutral-600" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                        <Card className="border border-neutral-200/80 bg-white/90 dark:border-neutral-800/80 dark:bg-neutral-900/80">
                          <CardHeader className="space-y-2">
                            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-neutral-600 dark:text-neutral-400">
                              <Home className="h-4 w-4" /> Quick relief ideas
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
                            {reliefIdeas.map(({ title, description, icon: IdeaIcon }, index) => (
                              <div key={index} className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-3 dark:border-neutral-700 dark:bg-neutral-800/50">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-200/80 text-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-200">
                                  <IdeaIcon className="h-4 w-4" />
                                </span>
                                <div className="space-y-1">
                                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{title}</p>
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </section>
                )}
              </div>
              <section className="flex flex-col gap-3 md:flex-row">
                <Card className="w-full border border-neutral-200/70 bg-neutral-50/80 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/60">
                  <CardHeader className="space-y-3">
                    <CardTitle className="text-neutral-900 dark:text-neutral-50">Final Verdict</CardTitle>
                    <CardDescription className="text-neutral-600 dark:text-neutral-300">{finalVerdict}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex flex-wrap gap-2 pt-0">
                    <Button className="flex items-center gap-2 bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200">
                      <InfoIcon className="h-4 w-4" /> Report insight
                    </Button>
                    <Button variant="ghost" className="text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/80 dark:text-neutral-400 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-100">
                      Save snapshot
                    </Button>
                  </CardFooter>
                </Card>
                <Card className="w-full border border-neutral-200/70 bg-neutral-50/80 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/60">
                  <CardHeader className="space-y-3">
                    <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
                      <InfoIcon className="h-4 w-4" /> Disclaimer
                    </CardTitle>
                    <CardDescription className="text-neutral-600 dark:text-neutral-300">
                      This information is generated by an AI system and should complement—not replace—professional medical expertise. If symptoms escalate or feel alarming, seek urgent care immediately.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </section>
            </article>
          ) : (
            <p>Loading...</p>
          )}
        </FadeContent>
      </div>
    </section>
  );
}
