import { cache } from 'react';
import { notFound } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MedicineSearch from '@/models/medicine-search';
import type {
  LLMMedicineDiseasePayload,
  LLMMedicineIngredientPayload,
  LLMMedicineNamePayload,
  LLMMedicineSideEffectsPayload,
  LLMMedicineSimilarPayload,
  MedicineSearchMode,
  MedicineSearchParsed,
  ComparisonRow,
  ComparisonValue,
  TherapyOption,
} from '@/types/medicine-search';
import dbConnect from '@/utils/db-conn';

interface PageProps {
  params: {
    searchId: string;
  };
}

const loadSearch = cache(async (searchId: string) => {
  await dbConnect();
  const doc = await MedicineSearch.findOne({ searchId });
  if (!doc) {
    return null;
  }

  const { commonPayload, modePayload, ...rest } = doc.toObject();
  return {
    ...rest,
    common: doc.getCommonPayload(),
    modeSpecific: doc.getModePayload(),
  } as MedicineSearchParsed;
});

export default async function MedicineSearchResultPage({ params }: PageProps) {
  const { searchId } = params;
  const search = await loadSearch(searchId);

  if (!search) {
    notFound();
  }

  if (search.status === 'errored') {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-6 text-center">
        <header className="space-y-2">
          <Badge variant="destructive">errored</Badge>
          <h1 className="text-2xl font-semibold">We could not complete this analysis</h1>
          <p className="text-sm text-muted-foreground">
            {search.errorMessage || 'Something went wrong while generating this report. Please try again in a few minutes.'}
          </p>
        </header>
      </section>
    );
  }

  if (search.status !== 'ready') {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-6 text-center">
        <header className="space-y-2">
          <Badge variant="secondary">{search.status}</Badge>
          <h1 className="text-2xl font-semibold">Still preparing your medicine report</h1>
          <p className="text-sm text-muted-foreground">
            Check back in a few moments. We will refresh automatically once the analysis completes.
          </p>
        </header>
      </section>
    );
  }

  const mode = search.searchType as MedicineSearchMode;

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
        <header className="mb-10 flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{new Date(search.createdAt).toLocaleString()}</p>
          <h1 className="text-3xl font-semibold tracking-tight">{search.title || 'Medicine Intelligence Report'}</h1>
          <p className="text-base text-muted-foreground">{search.summary}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline">{mode.toUpperCase()}</Badge>
            <Badge variant="default">ready</Badge>
            {search.duration ? <Badge variant="outline">Generated in {(search.duration / 1000).toFixed(1)}s</Badge> : null}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <article className="flex flex-col gap-6">
            <CommonInsights parsed={search} />
            <ModeSpecific mode={mode} payload={search.modeSpecific} />
          </article>
          <aside className="flex flex-col gap-6">
            <AdvancedActions parsed={search} />
          </aside>
        </div>
      </div>
    </section>
  );
}

function CommonInsights({ parsed }: { parsed: MedicineSearchParsed }) {
  const { common } = parsed;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinical Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold">Summary</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{common.summary}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Key Takeaways</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {common.keyTakeaways.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>

        {common.clinicalActions.length ? (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Clinical Actions</h2>
            <div className="grid gap-3">
              {common.clinicalActions.map((action, idx) => (
                <div key={idx} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold">{action.title}</h3>
                    <Badge variant={priorityVariant(action.priority)}>{action.priority}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{action.rationale}</p>
                  {action.evidenceLevel ? (
                    <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">Evidence {action.evidenceLevel}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {common.riskAlerts.length ? (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Risk Alerts</h2>
            <div className="flex flex-col gap-3">
              {common.riskAlerts.map((risk, idx) => (
                <div key={idx} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">{risk.name}</h3>
                    <Badge variant={severityVariant(risk.severity)}>{risk.severity}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{risk.mitigation}</p>
                  {risk.triggerNotes?.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                      {risk.triggerNotes.map((note, noteIdx) => (
                        <li key={noteIdx}>{note}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {common.interactionNotes.length ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Interactions</h2>
            <div className="flex flex-col gap-3">
              {common.interactionNotes.map((note, idx) => (
                <div key={idx} className="rounded-md border p-3">
                  <h3 className="text-sm font-semibold">{note.interactingAgent}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{note.effect}</p>
                  <p className="mt-2 text-sm text-muted-foreground"><span className="font-medium">Recommendation:</span> {note.recommendation}</p>
                  {note.evidenceLevel ? (
                    <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Evidence {note.evidenceLevel}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {common.monitoringGuidance.length ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Monitoring Guidance</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {common.monitoringGuidance.map((tip, idx) => (
                <div key={idx} className="rounded-md border p-3 text-sm">
                  <p className="font-semibold">{tip.metric}</p>
                  <p className="text-muted-foreground">{tip.frequency}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{tip.note}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {common.followUpPrompts.length ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Follow-up Prompts</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {common.followUpPrompts.map((prompt, idx) => (
                <li key={idx}>{prompt}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {common.patientCounseling.length ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Counseling Notes</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {common.patientCounseling.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <Separator />
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">References</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {common.references.map((reference, idx) => (
              <li key={idx}>
                <span className="font-medium">{reference.label}</span>
                {reference.citation ? <span className="ml-1">— {reference.citation}</span> : null}
                {reference.url ? (
                  <a className="ml-2 text-primary hover:underline" href={reference.url} target="_blank" rel="noreferrer">
                    Source
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <p className="text-xs text-muted-foreground">{common.disclaimer}</p>
      </CardContent>
    </Card>
  );
}

function ModeSpecific({ mode, payload }: { mode: MedicineSearchMode; payload: MedicineSearchParsed['modeSpecific'] }) {
  if (!payload) {
    return null;
  }

  switch (mode) {
    case 'disease':
      return <DiseaseInsights payload={payload as LLMMedicineDiseasePayload} />;
    case 'name':
      return <NameInsights payload={payload as LLMMedicineNamePayload} />;
    case 'sideEffects':
      return <SideEffectInsights payload={payload as LLMMedicineSideEffectsPayload} />;
    case 'ingredient':
      return <IngredientInsights payload={payload as LLMMedicineIngredientPayload} />;
    case 'similar':
      return <SimilarInsights payload={payload as LLMMedicineSimilarPayload} />;
    default:
      return null;
  }
}

function DiseaseInsights({ payload }: { payload: LLMMedicineDiseasePayload }) {
  const {
    pathophysiologySnapshot = 'No pathophysiology summary available.',
    firstLineTherapies = [],
    secondLineOptions = [],
    combinationStrategies = [],
    monitoringPlan = [],
    nonPharmacologicAdjuncts = [],
    redFlags = [],
  } = payload;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disease-focused Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold">Pathophysiology Snapshot</h2>
          <p className="text-sm text-muted-foreground">{pathophysiologySnapshot}</p>
        </section>

        <TreatmentRail title="First-line Therapies" items={firstLineTherapies} />
        <TreatmentRail title="Second-line Options" items={secondLineOptions} />
        <TreatmentRail title="Combination Strategies" items={combinationStrategies} />

        {monitoringPlan.length ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Monitoring Plan</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {monitoringPlan.map((tip, idx) => (
                <div key={idx} className="rounded-md border p-3 text-sm">
                  <p className="font-semibold">{tip.metric}</p>
                  <p className="text-muted-foreground">{tip.frequency}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{tip.note}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {nonPharmacologicAdjuncts.length ? (
          <section>
            <h2 className="text-lg font-semibold">Non-pharmacologic Adjuncts</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {nonPharmacologicAdjuncts.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {redFlags.length ? (
          <section>
            <h2 className="text-lg font-semibold">Red Flags</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {redFlags.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}

function NameInsights({ payload }: { payload: LLMMedicineNamePayload }) {
  const {
    mechanism = 'No mechanism details available.',
    primaryIndications = [],
    formulations = [],
    dosingGuidance = [],
    doseAdjustments = [],
  } = payload;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold">Mechanism</h2>
          <p className="text-sm text-muted-foreground">{mechanism}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Primary Indications</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {primaryIndications.map((indication, idx) => (
              <div key={idx} className="rounded-md border p-3 text-sm">
                <p className="font-semibold">{indication.condition}</p>
                <p className="text-muted-foreground">{indication.note}</p>
              </div>
            ))}
          </div>
        </section>

        {formulations.length ? (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Formulations</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {formulations.map((form, idx) => (
                <div key={idx} className="rounded-md border p-3 text-sm">
                  <p className="font-semibold">{form.form}</p>
                  <p className="text-muted-foreground">Strengths: {form.strengths.join(', ')}</p>
                  {form.release ? <p className="text-xs text-muted-foreground">Release profile: {form.release}</p> : null}
                  {form.notes ? <p className="text-xs text-muted-foreground">{form.notes}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Dosing Guidance</h2>
          <div className="space-y-3">
            {dosingGuidance.map((dose, idx) => (
              <div key={idx} className="rounded-md border p-3 text-sm">
                <p className="font-semibold">{dose.population}</p>
                <p className="text-muted-foreground">{dose.dose} · {dose.frequency}</p>
                {dose.maxDose ? <p className="text-xs text-muted-foreground">Max: {dose.maxDose}</p> : null}
                {dose.titration ? <p className="text-xs text-muted-foreground">Titration: {dose.titration}</p> : null}
              </div>
            ))}
          </div>
        </section>

        {doseAdjustments.length ? (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Dose Adjustments</h2>
            <div className="space-y-3">
              {doseAdjustments.map((adjustment, idx) => (
                <div key={idx} className="rounded-md border p-3 text-sm">
                  <p className="font-semibold">{adjustment.factor}</p>
                  <p className="text-muted-foreground">{adjustment.recommendation}</p>
                  {adjustment.rationale ? <p className="text-xs text-muted-foreground">{adjustment.rationale}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <SafetySection payload={payload} />
      </CardContent>
    </Card>
  );
}

function SideEffectInsights({ payload }: { payload: LLMMedicineSideEffectsPayload }) {
  const {
    likelyCulprits = [],
    mechanisticInsights = 'Mechanistic insights were not provided.',
    managementStrategies = [],
    alternativeOptions = [],
    whenToEscalate = [],
    documentationTips = [],
  } = payload;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adverse Effect Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Likely Culprits</h2>
          <div className="space-y-3">
            {likelyCulprits.map((culprit, idx) => (
              <div key={idx} className="rounded-md border p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{culprit.drugName}</p>
                  <Badge variant="outline">{culprit.likelihood}</Badge>
                </div>
                <p className="text-muted-foreground">{culprit.mechanism}</p>
                <p className="text-xs text-muted-foreground">Onset: {culprit.onsetTiming}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Mechanistic Insights</h2>
          <p className="text-sm text-muted-foreground">{mechanisticInsights}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Management Strategies</h2>
          <div className="space-y-3">
            {managementStrategies.map((strategy, idx) => (
              <div key={idx} className="rounded-md border p-3 text-sm">
                <p className="font-semibold">{strategy.strategy}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                  {strategy.steps.map((step: string, stepIdx: number) => (
                    <li key={stepIdx}>{step}</li>
                  ))}
                </ul>
                {strategy.monitoring ? <p className="mt-2 text-xs text-muted-foreground">Monitoring: {strategy.monitoring}</p> : null}
              </div>
            ))}
          </div>
        </section>

        {alternativeOptions.length ? (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Alternative Options</h2>
            <div className="space-y-3">
              {alternativeOptions.map((option, idx) => (
                <div key={idx} className="rounded-md border p-3 text-sm">
                  <p className="font-semibold">{option.name}</p>
                  <p className="text-muted-foreground">{option.comparison}</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Pros</p>
                      <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                        {option.pros.map((pro: string, proIdx: number) => (
                          <li key={proIdx}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Cons</p>
                      <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                        {option.cons.map((con: string, conIdx: number) => (
                        {whenToEscalate.map((item, idx) => (
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
                        {documentationTips.map((tip, idx) => (

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Escalation Guidance</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {payload.whenToEscalate.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Documentation Tips</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {payload.documentationTips.map((tip: string, idx: number) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </section>
      </CardContent>
    </Card>
  );
}

function IngredientInsights({ payload }: { payload: LLMMedicineIngredientPayload }) {
  const {
    products = [],
    brandEquivalents = [],
    therapeuticClasses = [],
    formulationDetails = [],
    regulatoryNotes = [],
    availabilityConsiderations = [],
    qualityFlags = [],
  } = payload;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingredient Intelligence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Products</h2>
          <div className="space-y-3">
            {products.map((product, idx) => (
              <div key={idx} className="rounded-md border p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{product.productName}</p>
                  <Badge variant="outline">{product.form}</Badge>
                  <Badge variant={product.otc ? 'secondary' : 'default'}>{product.otc ? 'OTC' : 'Rx'}</Badge>
                </div>
                <p className="text-muted-foreground">Strength: {product.strength}</p>
              </div>
            ))}
          </div>
        </section>

        {brandEquivalents.length ? (
          <section>
            <h2 className="text-lg font-semibold">Brand Equivalents</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {brandEquivalents.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Therapeutic Classes</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {therapeuticClasses.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>

        {formulationDetails.length ? (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Formulation Details</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {formulationDetails.map((form, idx) => (
                <div key={idx} className="rounded-md border p-3 text-sm">
                  <p className="font-semibold">{form.form}</p>
                  <p className="text-muted-foreground">Strengths: {form.strengths.join(', ')}</p>
                  {form.release ? <p className="text-xs text-muted-foreground">Release: {form.release}</p> : null}
                  {form.notes ? <p className="text-xs text-muted-foreground">{form.notes}</p> : null}
                </div>
              ))}
            </div>
              {regulatoryNotes.length ? (
        ) : null}

        {payload.regulatoryNotes.length ? (
                    {regulatoryNotes.map((note, idx) => (
            <h2 className="text-lg font-semibold">Regulatory Notes</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {payload.regulatoryNotes.map((note: string, idx: number) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
              {availabilityConsiderations.length ? (
        ) : null}

        {payload.availabilityConsiderations.length ? (
                    {availabilityConsiderations.map((consideration, idx) => (
            <h2 className="text-lg font-semibold">Availability Considerations</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {payload.availabilityConsiderations.map((consideration: string, idx: number) => (
                <li key={idx}>{consideration}</li>
              ))}
            </ul>
              {qualityFlags.length ? (
        ) : null}

        {payload.qualityFlags.length ? (
                    {qualityFlags.map((flag, idx) => (
            <h2 className="text-lg font-semibold">Quality Flags</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {payload.qualityFlags.map((flag: string, idx: number) => (
                <li key={idx}>{flag}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SimilarInsights({ payload }: { payload: LLMMedicineSimilarPayload }) {
  const {
    alternatives = [],
    comparisonMatrix = [],
    switchingGuidance = [],
    costConsiderations = [],
    transitionRisks = [],
    monitoringAfterSwitch = [],
  } = payload;

  const headerAlternatives: ComparisonValue[] = comparisonMatrix[0]?.alternatives ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alternative Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Alternatives</h2>
          <div className="space-y-3">
            {alternatives.map((option, idx) => (
              <div key={idx} className="rounded-md border p-3 text-sm">
                <p className="font-semibold">{option.name}</p>
                <p className="text-muted-foreground">{option.comparison}</p>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Pros</p>
                    <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                      {option.pros.map((pro: string, proIdx: number) => (
                        <li key={proIdx}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Cons</p>
                    <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                      {option.cons.map((con: string, conIdx: number) => (
                        <li key={conIdx}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Comparison Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b">
                <tr>
                  <th className="px-2 py-2">Attribute</th>
                  <th className="px-2 py-2">Baseline</th>
                  {headerAlternatives.map((comp, idx) => (
                    <th key={idx} className="px-2 py-2">{comp.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonMatrix.map((row: ComparisonRow, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="px-2 py-2 font-semibold">{row.attribute}</td>
                    <td className="px-2 py-2 text-muted-foreground">{row.baseline}</td>
                    {row.alternatives.map((alt: ComparisonValue, altIdx: number) => (
                      <td key={altIdx} className="px-2 py-2 text-muted-foreground">{alt.detail}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Switching Guidance</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {switchingGuidance.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>

        {costConsiderations.length ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Cost Considerations</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {costConsiderations.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {transitionRisks.length ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Transition Risks</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {transitionRisks.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {monitoringAfterSwitch.length ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Monitoring After Switch</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {monitoringAfterSwitch.map((tip, idx) => (
                <div key={idx} className="rounded-md border p-3 text-sm">
                  <p className="font-semibold">{tip.metric}</p>
                  <p className="text-muted-foreground">{tip.frequency}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{tip.note}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}

function AdvancedActions({ parsed }: { parsed: MedicineSearchParsed }) {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Session Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div>
          <p className="text-xs uppercase tracking-wide">Query</p>
          <p className="font-medium text-foreground">{parsed.query}</p>
        </div>
        <Separator />
        <div>
          <p className="text-xs uppercase tracking-wide">Search ID</p>
          <p className="font-mono text-xs">{parsed.searchId}</p>
        </div>
        {parsed.summary ? (
          <>
            <Separator />
            <div>
              <p className="text-xs uppercase tracking-wide">At-a-glance summary</p>
              <p>{parsed.summary}</p>
            </div>
          </>
        ) : null}
        <Separator />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Generated content is for clinical decision support and education only. Confirm all recommendations with authoritative medical references and patient-specific data.
        </p>
      </CardContent>
    </Card>
  );
}

function TreatmentRail({ title, items }: { title: string; items: TherapyOption[] }) {
  if (!items?.length) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((therapy, idx) => (
          <div key={idx} className="rounded-md border p-3 text-sm">
            <p className="font-semibold">{therapy.name}</p>
            <p className="text-muted-foreground">{therapy.rationale}</p>
            {therapy.cautions?.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                {therapy.cautions.map((caution: string, cautionIdx: number) => (
                  <li key={cautionIdx}>{caution}</li>
                ))}
              </ul>
            ) : null}
            {therapy.evidenceLevel ? (
              <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">Evidence {therapy.evidenceLevel}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function SafetySection({ payload }: { payload: LLMMedicineNamePayload }) {
  const {
    contraindications = [],
    blackBoxWarnings = [],
    commonSideEffects = [],
    seriousSideEffects = [],
    monitoringParameters = [],
    patientCounselingPoints = [],
  } = payload;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Safety</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border p-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Contraindications</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            {contraindications.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border p-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Black Box Warnings</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            {blackBoxWarnings.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <Separator />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border p-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Common Side Effects</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            {commonSideEffects.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border p-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Serious Side Effects</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            {seriousSideEffects.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="rounded-md border p-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Monitoring Parameters</p>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            {monitoringParameters.map((tip, idx) => (
              <div key={idx} className="rounded-md border p-3 text-sm">
                <p className="font-semibold">{tip.metric}</p>
                <p className="text-muted-foreground">{tip.frequency}</p>
                <p className="mt-2 text-xs text-muted-foreground">{tip.note}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border p-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Patient Counseling</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            {patientCounselingPoints.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function priorityVariant(priority: 'urgent' | 'soon' | 'routine') {
  switch (priority) {
    case 'urgent':
      return 'destructive';
    case 'soon':
      return 'default';
    default:
      return 'secondary';
  }
}

function severityVariant(severity: 'low' | 'moderate' | 'high') {
  switch (severity) {
    case 'high':
      return 'destructive';
    case 'moderate':
      return 'default';
    default:
      return 'secondary';
  }
}