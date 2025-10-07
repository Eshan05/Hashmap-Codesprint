import FadeContent from '@/components/fade-content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WrapDrawer, WDTrigger, WDContent } from '@/components/ui/wrap-drawer';
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
  ClockIcon,
  ShieldAlertIcon,
  FlaskConical,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IoInformationOutline } from 'react-icons/io5';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

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
      <div className="relative w-full px-2 md:px-4 py-8 lg:px-10 lg:py-10">
        <header className="relative mb-8">
          <Card className="overflow-hidden border border-neutral-800/60 bg-neutral-950 text-neutral-100 shadow-2xl dark:border-neutral-800 py-0">
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <h1 className="text-3xl mb-1 font-semibold leading-tight sm:text-4xl lg:text-5xl">Symptom Analysis</h1>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>Adaptive Insight Console</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <ClockIcon className="h-4 w-4" />
                    <span>Updated {updatedCopy}</span>
                  </div>
                  <p className="text-base text-neutral-200/90 sm:text-lg my-4">
                    Curated guidance layered with dynamic risk cues. Explore probable conditions, recommended therapies, and escalation signals designed with Material Expressive clarity.
                  </p>
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
                    <Button size="sm" variant="outline" className="dark">
                      <Plus className="h-4 w-4" /> Add to profile
                    </Button>
                  </div>
                </div>
                <div className="relative w-full max-w-60 self-center">
                  <div
                    className={`relative aspect-square overflow-hidden rounded-3xl border border-neutral-700/70 bg-neutral-900/80 p-4 shadow-xl backdrop-blur-xl transition-colors ${severityBackdrop}`}
                    style={{
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
                    <div className="aspect-square flex flex-col items-center justify-center gap-3 rounded-3xl border border-neutral-700/60 bg-neutral-950/85 p-4 text-center">
                      <header className='flex flex-col gap-1 items-center'>
                        <div className='flex-center-2'>
                          <Gauge className="h-3 w-3" />
                          <span className="text-xs uppercase tracking-wide text-muted-foreground">Severity</span>
                        </div>
                        <span className={`text-sm font-medium ${severityTone}`}>{severityLabel}</span>
                      </header>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-semibold">{severityScore}</span>
                        <span className="mb-1 text-sm text-neutral-400">%</span>
                      </div>
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
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </header>
        <FadeContent blur duration={500} easing="ease-in" initialOpacity={0}>
          {searchResult.cumulativePrompt ? (
            <article className="flex flex-col gap-5">
              <section className="flex flex-col gap-3 md:flex-row md:items-stretch">
                <Card className="w-full border border-neutral-200/70 bg-neutral-50/80 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/60 max-sm:py-4">
                  <CardContent className='flex w-full max-sm:px-4'>
                    <div className='bg-red-300/50 p-2 aspect-square w-10 h-10 rounded-md'>
                      <ShieldAlertIcon className='w-6 h-6' />
                    </div>
                    <CardHeader className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-primary text-lg">
                        <Sparkles className="h-4 w-4 text-neutral-400 dark:text-neutral-300" />
                        AI Disclaimer
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        This information is generated by an AI model and should not be used as a substitute for professional medical advice, diagnosis, or treatment. If you wish to gain more information about anything mentioned click on three dots or learn more.
                      </CardDescription>
                    </CardHeader>
                  </CardContent>
                </Card>
                <Card className="w-full border border-neutral-200/70 bg-neutral-50/80 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/60">
                  <CardContent className='flex w-full'>
                    <div className='bg-sky-300/50 p-2 aspect-square w-10 h-10 rounded-md'>
                      <ShieldAlertIcon className='w-6 h-6' />
                    </div>
                    <div className="flex-1">
                      <CardHeader className="">
                        <CardTitle className="flex items-center gap-2 text-primary text-lg">
                          <InfoIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-300" />
                          Input Summary
                        </CardTitle>
                        <WrapDrawer>
                          <WDTrigger>
                            <CardDescription className="text-muted-foreground text-left">
                              <span className="max-sm:line-clamp-4">
                                {cumulativePrompt}
                              </span>
                            </CardDescription>
                          </WDTrigger>
                          <WDContent title="Input Summary" description="Your submitted symptoms" showClose>
                            <p className="text-sm text-neutral-600 dark:text-neutral-300">{cumulativePrompt}</p>
                          </WDContent>
                        </WrapDrawer>
                      </CardHeader>
                      <CardFooter className="flex flex-wrap gap-2 pt-2">
                        <Button variant="secondary" size="sm" className="">
                          <HeartPulse className="h-4 w-4" /> Learn more
                        </Button>
                        <Button variant="outline" size="sm" className="">
                          Quick annotate
                        </Button>
                      </CardFooter>
                    </div>
                  </CardContent>
                </Card>
              </section>
              <div className="mx-auto space-y-6 rounded-3xl border border-neutral-200/70 bg-neutral-50/80 p-4 shadow-2xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/60 lg:max-w-6xl lg:p-6">
                {conditions.length > 0 && (
                  <section className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center border justify-center rounded-2xl bg-card aspect-square">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button size="icon" variant="ghost" type="button">
                                <ClipboardList className="min-h-5 min-w-5 text-green-400" />
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80 border">
                              <div className="space-y-2 text-sm">
                                <h4 className="font-semibold">Potential Conditions</h4>
                                <p className=''>Ranked suggestions that may align with your symptoms. Confirm with a clinician before acting.</p>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                        <div className="">
                          <h2 className="text-2xl font-semibold tracking-tight ">Potential Conditions</h2>
                          <p className="text-sm text-muted-foreground line-clamp-1">Model-ranked differentials to explore with a clinician.</p>
                          <Badge variant="outline" className="">
                            Likelihood spectrum
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {conditions.map((condition, index) => (
                        <Card
                          key={index}
                          className="group h-full border border-neutral-200/80 bg-white/90 transition hover:-translate-y-0.5 hover:shadow-xl dark:border-neutral-800/80 dark:bg-neutral-900/80 bg-blend-lighten dark:bg-blend-overlay"
                          style={{
                            backgroundImage: conditionGradients[index % conditionGradients.length],
                          }}
                        >
                          <CardHeader className="">
                            <div className="flex items-start justify-between gap-3">
                              <div className="">
                                <CardTitle className="text-xl">{condition.name}</CardTitle>
                                <div className="flex items-center justify-between gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                                  <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                    <span>{index === 0 ? 'Primary signal' : index === 1 ? 'Consider closely' : 'Keep monitoring'}</span>
                                  </div>
                                </div>
                                <CardDescription className="text-muted-foreground mt-2">{condition.description}</CardDescription>
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
                          <CardContent className="gap-2 flex-col flex text-sm text-neutral-600 dark:text-neutral-300">
                            <div className="flex items-center justify-between rounded-2xl border bg-muted px-4 py-3 text-xs uppercase ">
                              <span className="flex items-center gap-2">
                                <Activity className="h-4 w-4" /> Severity trend
                              </span>
                              <span className="font-semibold text-neutral-700 dark:text-neutral-200">{index === 0 ? 'Elevated' : index === 1 ? 'Stable' : 'Mild'}</span>
                            </div>
                            <p>{condition.explanation}</p>
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
                        <div className="flex h-11 w-11 items-center border justify-center rounded-2xl bg-card aspect-square">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button size="icon" variant="ghost" type="button">
                                <Pill className="min-h-5 min-w-5 text-blue-400" />
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80 border">
                              <div className="space-y-2 text-sm">
                                <h4 className="font-semibold">Potential Medications</h4>
                                <p>Pharmacological options aligned to the presented symptom profile. Verify interactions and dosage with a healthcare professional first.</p>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                        <div className="">
                          <h2 className="text-2xl font-semibold tracking-tight">Potential Medications</h2>
                          <p className="text-sm text-muted-foreground line-clamp-1">Verify interactions and dosing with your clinician before proceeding.</p>
                          <Button variant="outline" size="badge" className="text-xs">
                            <Download className="!w-3 !h-3" /> Export to pharmacy
                          </Button>
                        </div>
                      </div>
                    </div>
                    <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {medicines.map((medicine, index) => (
                        <li key={index}>
                          <Card
                            className="h-full border border-neutral-200/80 bg-white/90 transition hover:-translate-y-0.5 hover:shadow-xl dark:border-neutral-800/80 dark:bg-neutral-900/80 bg-blend-lighten dark:bg-blend-overlay"
                            style={{
                              backgroundImage: medicineGradients[index % medicineGradients.length],
                            }}
                          >
                            <CardHeader className="">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                  <CardTitle className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{medicine.name}</CardTitle>
                                  <CardDescription className="text-neutral-600 dark:text-neutral-300">Commonly used for {medicine.commonUse}</CardDescription>
                                </div>
                                {/* <Badge className="rounded-full bg-neutral-900 px-3 py-1 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900">Rx</Badge> */}
                              </div>
                              <div className="flex flex-wrap gap-2 text-muted-foreground text-xs">
                                <Button size={'badge'} variant={'outline'} className=""><Stethoscope className="h-3 w-3" /> Consult provider</Button>
                                <Button size={'badge'} variant={'secondary'} className="text-muted-foreground"><Activity className="h-3 w-3" /> Monitor vitals</Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
                              <div className="flex items-center justify-between rounded-2xl border bg-muted px-4 py-3 text-xs uppercase text-muted-foreground">
                                <span className="flex items-center gap-2">
                                  <Gauge className="h-4 w-4" /> Adherence outlook
                                </span>
                                <span className="font-semibold">{index === 0 ? 'High' : 'Moderate'}</span>
                              </div>
                              <section className="flex items-start gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-200/80 dark:bg-neutral-800/70">
                                  <Pill className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
                                </div>
                                <div className="">
                                  <span className="text-xs font-semibold uppercase">Side effects</span>
                                  <ul className="grid text-sm mt-1">
                                    {medicine.sideEffects.map((effect, effectIndex) => (
                                      <li key={effectIndex} className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                                        <span>{effect}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </section>
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
                                className="h-full border border-neutral-200/80 bg-white/90 transition hover:-translate-y-0.5 hover:shadow-xl dark:border-neutral-800/80 dark:bg-neutral-900/80 bg-blend-lighten dark:bg-blend-overlay"
                                style={{
                                  backgroundImage: helpGradients[index % helpGradients.length],
                                }}
                              >
                                <CardHeader className="">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className='flex flex-col gap-1'>
                                        <CardTitle className="text-lg leading-tight font-semibold mb-2">{item.title}</CardTitle>
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="relative h-4 w-4 aspect-square rounded-full bg-muted"
                                            style={gaugeStyle(severityPercent, severityMeta.tone)}
                                          >
                                          </div>
                                          <span className='text-sm'>{severityPercent}% {severityMeta.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <InfoIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                          <span className="text-sm text-muted-foreground">Contact doctor immediately</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <FlaskConical className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                          <span className="text-sm text-muted-foreground">Easily curable</span>
                                        </div>
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:bg-neutral-200/70 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-100">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <CardDescription className="text-neutral-600 dark:text-neutral-300">
                                    {item.explanation}</CardDescription>
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
                    <WrapDrawer>
                      <WDTrigger>
                        <CardDescription className="text-neutral-600 dark:text-neutral-300">
                          <span className="line-clamp-2 md:line-clamp-none">
                            This information is generated by an AI system and should complement—not replace—professional medical expertise. If symptoms escalate or feel alarming, seek urgent care immediately.
                          </span>
                          <span className="ml-1 text-xs text-blue-500 md:hidden">(tap for more)</span>
                        </CardDescription>
                      </WDTrigger>
                      <WDContent title="Disclaimer" description="Important information" showClose>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                          This information is generated by an AI system and should complement—not replace—professional medical expertise. If symptoms escalate or feel alarming, seek urgent care immediately.
                        </p>
                      </WDContent>
                    </WrapDrawer>
                  </CardHeader>
                </Card>
              </section>
            </article>
          ) : (
            <p>Loading...</p>
          )}
        </FadeContent>
      </div>
    </section >
  );
}
