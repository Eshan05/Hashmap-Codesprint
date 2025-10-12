import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { Ratelimit } from '@upstash/ratelimit';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { retryWithExponentialBackoff } from '@/lib/utils';
import dbConnect from '@/utils/db-conn';
import MedicineSearch from '@/models/medicine-search';
import UserProfile from '@/models/user-profile';
import { auth } from '@/lib/auth';
import { upstashRedis } from '@/lib/redis';
import type {
  LLMMedicineCommonPayload,
  LLMMedicineIngredientPayload,
  LLMMedicineNamePayload,
  LLMMedicineDiseasePayload,
  LLMMedicineSideEffectsPayload,
  LLMMedicineSimilarPayload,
  MedicineSearchMode
} from '@/types/medicine-search';

const ratelimit = new Ratelimit({
  redis: upstashRedis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_API || '');
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-lite',
  generationConfig: { responseMimeType: 'application/json' },
});

function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ').toLowerCase();
}

function buildQueryHash(userId: string, searchType: MedicineSearchMode, query: string): string {
  return createHash('sha256').update(`${userId}:${searchType}:${normalizeQuery(query)}`).digest('hex');
}

async function buildProfileSummary(userId: string): Promise<string> {
  try {
    const profile = await UserProfile.findOne({ user: userId }).lean();
    if (!profile) {
      return '';
    }

    const medical = profile.medicalProfile || {};
    const dob = medical.dob ? new Date(medical.dob) : null;
    const age = dob ? Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : null;
    const chronic = Array.isArray(medical.chronicConditions) ? medical.chronicConditions.map((c: any) => c?.name ?? String(c)).join(', ') : '';
    const allergies = Array.isArray(medical.allergies) ? medical.allergies.map((a: any) => a?.name ?? String(a)).join(', ') : '';
    const medications = Array.isArray(medical.medications) ? medical.medications.map((m: any) => m?.name ?? m?.brand_name ?? String(m)).join(', ') : '';
    const pregnancy = medical.pregnancy ? JSON.stringify(medical.pregnancy) : 'none';

    return `Patient context:\n- age: ${age ?? 'unknown'}\n- sex: ${medical.sex ?? 'unknown'}\n- bloodType: ${medical.bloodType ?? 'unknown'}\n- chronicConditions: ${chronic || 'none'}\n- allergies: ${allergies || 'none'}\n- medications: ${medications || 'none'}\n- pregnancy: ${pregnancy}`;
  } catch (error) {
    console.warn('Failed to build profile summary for medicine search', error);
    return '';
  }
}

function commonPayloadSchema() {
  return {
    type: SchemaType.OBJECT,
    properties: {
      summary: { type: SchemaType.STRING },
      bodyMechanismSummary: { type: SchemaType.STRING },
      keyTakeaways: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      clinicalActions: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            rationale: { type: SchemaType.STRING },
            priority: { type: SchemaType.STRING },
            evidenceLevel: { type: SchemaType.STRING },
          },
          required: ['title', 'rationale', 'priority'],
        },
      },
      riskAlerts: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            severity: { type: SchemaType.STRING },
            mitigation: { type: SchemaType.STRING },
            triggerNotes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          },
          required: ['name', 'severity', 'mitigation'],
        },
      },
      interactionNotes: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            interactingAgent: { type: SchemaType.STRING },
            effect: { type: SchemaType.STRING },
            recommendation: { type: SchemaType.STRING },
            evidenceLevel: { type: SchemaType.STRING },
          },
          required: ['interactingAgent', 'effect', 'recommendation'],
        },
      },
      monitoringGuidance: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            metric: { type: SchemaType.STRING },
            frequency: { type: SchemaType.STRING },
            note: { type: SchemaType.STRING },
          },
          required: ['metric', 'frequency', 'note'],
        },
      },
      references: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            label: { type: SchemaType.STRING },
            url: { type: SchemaType.STRING },
            citation: { type: SchemaType.STRING },
          },
          required: ['label'],
        },
      },
      followUpPrompts: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      patientCounseling: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      disclaimer: { type: SchemaType.STRING },
    },
    required: ['summary', 'bodyMechanismSummary', 'keyTakeaways', 'clinicalActions', 'riskAlerts', 'interactionNotes', 'monitoringGuidance', 'references', 'followUpPrompts', 'patientCounseling', 'disclaimer'],
  } satisfies Record<string, unknown>;
}

function therapyOptionSchema() {
  return {
    type: SchemaType.OBJECT,
    properties: {
      name: { type: SchemaType.STRING },
      rationale: { type: SchemaType.STRING },
      cautions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      evidenceLevel: { type: SchemaType.STRING },
    },
    required: ['name', 'rationale'],
  } as const;
}

function monitoringTipSchema() {
  return {
    type: SchemaType.OBJECT,
    properties: {
      metric: { type: SchemaType.STRING },
      frequency: { type: SchemaType.STRING },
      note: { type: SchemaType.STRING },
    },
    required: ['metric', 'frequency', 'note'],
  } as const;
}

function formulationSchema() {
  return {
    type: SchemaType.OBJECT,
    properties: {
      form: { type: SchemaType.STRING },
      strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      release: { type: SchemaType.STRING },
      notes: { type: SchemaType.STRING },
    },
    required: ['form', 'strengths'],
  } as const;
}

function dosageInstructionSchema() {
  return {
    type: SchemaType.OBJECT,
    properties: {
      population: { type: SchemaType.STRING },
      dose: { type: SchemaType.STRING },
      frequency: { type: SchemaType.STRING },
      maxDose: { type: SchemaType.STRING },
      titration: { type: SchemaType.STRING },
    },
    required: ['population', 'dose', 'frequency'],
  } as const;
}

function adjustmentSchema() {
  return {
    type: SchemaType.OBJECT,
    properties: {
      factor: { type: SchemaType.STRING },
      recommendation: { type: SchemaType.STRING },
      rationale: { type: SchemaType.STRING },
    },
    required: ['factor', 'recommendation'],
  } as const;
}

function alternativeOptionSchema() {
  return {
    type: SchemaType.OBJECT,
    properties: {
      name: { type: SchemaType.STRING },
      comparison: { type: SchemaType.STRING },
      pros: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      cons: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    },
    required: ['name', 'comparison', 'pros', 'cons'],
  } as const;
}

function comparisonRowSchema() {
  return {
    type: SchemaType.OBJECT,
    properties: {
      attribute: { type: SchemaType.STRING },
      baseline: { type: SchemaType.STRING },
      alternatives: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            detail: { type: SchemaType.STRING },
          },
          required: ['name', 'detail'],
        },
      },
    },
    required: ['attribute', 'baseline', 'alternatives'],
  } as const;
}

function modePayloadSchema(searchType: MedicineSearchMode) {
  switch (searchType) {
    case 'disease':
      return {
        type: SchemaType.OBJECT,
        properties: {
          pathophysiologySnapshot: { type: SchemaType.STRING },
          firstLineTherapies: { type: SchemaType.ARRAY, items: therapyOptionSchema() },
          secondLineOptions: { type: SchemaType.ARRAY, items: therapyOptionSchema() },
          combinationStrategies: { type: SchemaType.ARRAY, items: therapyOptionSchema() },
          monitoringPlan: { type: SchemaType.ARRAY, items: monitoringTipSchema() },
          nonPharmacologicAdjuncts: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          redFlags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        },
        required: ['pathophysiologySnapshot', 'firstLineTherapies', 'secondLineOptions', 'combinationStrategies', 'monitoringPlan', 'nonPharmacologicAdjuncts', 'redFlags'],
      } satisfies Record<string, unknown>;
    case 'name':
      return {
        type: SchemaType.OBJECT,
        properties: {
          mechanism: { type: SchemaType.STRING },
          primaryIndications: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                condition: { type: SchemaType.STRING },
                note: { type: SchemaType.STRING },
              },
              required: ['condition', 'note'],
            },
          },
          formulations: { type: SchemaType.ARRAY, items: formulationSchema() },
          dosingGuidance: { type: SchemaType.ARRAY, items: dosageInstructionSchema() },
          doseAdjustments: { type: SchemaType.ARRAY, items: adjustmentSchema() },
          contraindications: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          blackBoxWarnings: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          commonSideEffects: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          seriousSideEffects: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          monitoringParameters: { type: SchemaType.ARRAY, items: monitoringTipSchema() },
          patientCounselingPoints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        },
        required: ['mechanism', 'primaryIndications', 'formulations', 'dosingGuidance', 'doseAdjustments', 'contraindications', 'blackBoxWarnings', 'commonSideEffects', 'seriousSideEffects', 'monitoringParameters', 'patientCounselingPoints'],
      } satisfies Record<string, unknown>;
    case 'sideEffects':
      return {
        type: SchemaType.OBJECT,
        properties: {
          likelyCulprits: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                drugName: { type: SchemaType.STRING },
                likelihood: { type: SchemaType.STRING },
                mechanism: { type: SchemaType.STRING },
                onsetTiming: { type: SchemaType.STRING },
              },
              required: ['drugName', 'likelihood', 'mechanism', 'onsetTiming'],
            },
          },
          mechanisticInsights: { type: SchemaType.STRING },
          managementStrategies: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                strategy: { type: SchemaType.STRING },
                steps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                monitoring: { type: SchemaType.STRING },
              },
              required: ['strategy', 'steps'],
            },
          },
          alternativeOptions: { type: SchemaType.ARRAY, items: alternativeOptionSchema() },
          whenToEscalate: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          documentationTips: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        },
        required: ['likelyCulprits', 'mechanisticInsights', 'managementStrategies', 'alternativeOptions', 'whenToEscalate', 'documentationTips'],
      } satisfies Record<string, unknown>;
    case 'ingredient':
      return {
        type: SchemaType.OBJECT,
        properties: {
          products: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                productName: { type: SchemaType.STRING },
                form: { type: SchemaType.STRING },
                strength: { type: SchemaType.STRING },
                otc: { type: SchemaType.BOOLEAN },
              },
              required: ['productName', 'form', 'strength', 'otc'],
            },
          },
          brandEquivalents: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          therapeuticClasses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          formulationDetails: { type: SchemaType.ARRAY, items: formulationSchema() },
          regulatoryNotes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          availabilityConsiderations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          qualityFlags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        },
        required: ['products', 'brandEquivalents', 'therapeuticClasses', 'formulationDetails', 'regulatoryNotes', 'availabilityConsiderations', 'qualityFlags'],
      } satisfies Record<string, unknown>;
    case 'similar':
      return {
        type: SchemaType.OBJECT,
        properties: {
          alternatives: { type: SchemaType.ARRAY, items: alternativeOptionSchema() },
          comparisonMatrix: { type: SchemaType.ARRAY, items: comparisonRowSchema() },
          switchingGuidance: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          costConsiderations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          transitionRisks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          monitoringAfterSwitch: { type: SchemaType.ARRAY, items: monitoringTipSchema() },
        },
        required: ['alternatives', 'comparisonMatrix', 'switchingGuidance', 'costConsiderations', 'transitionRisks', 'monitoringAfterSwitch'],
      } satisfies Record<string, unknown>;
    default:
      throw new Error(`Unsupported searchType: ${searchType}`);
  }
}

function buildPrompt(searchType: MedicineSearchMode, query: string, profileSummary: string) {
  const contextLine = profileSummary ? `\n\n${profileSummary}` : '';
  const shared = `You are PharmAssistant, a meticulous clinical pharmacology expert. Respond with a single JSON object that strictly matches the provided schema. Be precise, cite evidence-based rationale, and tailor details for practicing clinicians. ALWAYS include a "bodyMechanismSummary" that explains in plain language how the medicine affects the body so a layperson can understand.`;

  const instructions: Record<MedicineSearchMode, string> = {
    disease: `Focus on evidence-backed regimens for managing ${query}. Highlight first-, second-line, and combination strategies. Include concise red-flag monitoring guidance for complications.`,
    name: `Provide a deep dive on ${query}. Cover mechanism, all major formulations, dose adjustments, and counseling points relevant to day-to-day prescribing.`,
    sideEffects: `Investigate medications most likely to cause ${query}. Include pathophysiology insights, management strategies, and practical documentation tips.`,
    ingredient: `Summarize the pharmacologic profile for the active ingredient ${query}. Detail branded products, class positioning, and regulatory considerations clinicians should know.`,
    similar: `Identify therapeutically comparable alternatives to ${query}. Compare trade-offs, switching considerations, and monitoring after transitions.`,
  };

  return `${shared}\n\nQuery: ${query}\nMode: ${searchType}\n${instructions[searchType]}${contextLine}\n\nReturn only JSON with fields: title, summary, commonPayload, modePayload.`;
}

async function generateMedicineResponse(options: {
  searchId: string;
  searchType: MedicineSearchMode;
  query: string;
  profileSummary: string;
}) {
  const { searchId, searchType, query, profileSummary } = options;
  const started = Date.now();
  try {
    const prompt = buildPrompt(searchType, query, profileSummary);
    const schema = {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        summary: { type: SchemaType.STRING },
        commonPayload: commonPayloadSchema(),
        modePayload: modePayloadSchema(searchType),
      },
      required: ['title', 'summary', 'commonPayload', 'modePayload'],
    } as const;

    const result = await retryWithExponentialBackoff(() =>
      // @ts-expect-error Pasting schema as is shows no error but putting `schema` does for some reason
      model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema, //? Why does using the variable here cause a TS error?
        },
      })
    );

    const parsed = JSON.parse(result.response.text()) as {
      title: string;
      summary: string;
      commonPayload: LLMMedicineCommonPayload;
      modePayload:
      | LLMMedicineDiseasePayload
      | LLMMedicineNamePayload
      | LLMMedicineSideEffectsPayload
      | LLMMedicineIngredientPayload
      | LLMMedicineSimilarPayload;
    };

    await MedicineSearch.findOneAndUpdate(
      { searchId },
      {
        title: parsed.title,
        summary: parsed.summary,
        commonPayload: JSON.stringify(parsed.commonPayload),
        modePayload: JSON.stringify(parsed.modePayload),
        status: 'ready',
        errorMessage: '',
        duration: Date.now() - started,
      }
    );
  } catch (error) {
    console.error('Error generating medicine response', error);
    const message = error instanceof Error ? error.message : 'Failed to generate medicine response';
    await MedicineSearch.findOneAndUpdate(
      { searchId },
      {
        status: 'errored',
        errorMessage: message,
      }
    );
    throw error;
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { success } = await ratelimit.limit(`${session.user.id}:medicines:get`);
    if (!success) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const searchId = searchParams.get('searchId');
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);

    if (searchId) {
      const search = await MedicineSearch.findOne({ searchId, user: session.user.id }).lean();
      if (!search) {
        return NextResponse.json({ message: 'Search not found' }, { status: 404 });
      }
      return NextResponse.json(search, { status: 200 });
    }

    const skip = Math.max(0, (page - 1) * limit);
    const [searches, total] = await Promise.all([
      MedicineSearch.find({ user: session.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MedicineSearch.countDocuments({ user: session.user.id }),
    ]);

    return NextResponse.json(
      {
        data: searches,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in medicine search GET', error);
    return NextResponse.json({ message: 'An error occurred', error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { success } = await ratelimit.limit(`${session.user.id}:medicines:post`);
    if (!success) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const searchType: MedicineSearchMode = body.searchType;
    const query: string = body.query;

    if (!searchType || !['disease', 'name', 'sideEffects', 'ingredient', 'similar'].includes(searchType)) {
      return NextResponse.json({ message: 'Invalid searchType' }, { status: 400 });
    }
    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ message: 'query is required' }, { status: 400 });
    }

    const queryHash = buildQueryHash(session.user.id, searchType, query);
    const existing = await MedicineSearch.findOne({ user: session.user.id, queryHash }).lean();
    if (existing) {
      return NextResponse.json(
        {
          searchId: existing.searchId,
          searchType: existing.searchType,
          query: existing.query,
          status: existing.status,
          reused: true,
        },
        { status: 200 }
      );
    }

    const searchId = uuidv4();
    const newSearch = await MedicineSearch.create({
      searchId,
      user: session.user.id,
      searchType,
      query: query.trim(),
      queryHash,
      status: 'pending',
    });

    const profileSummary = await buildProfileSummary(session.user.id);
    await generateMedicineResponse({
      searchId: newSearch.searchId,
      searchType,
      query: query.trim(),
      profileSummary,
    });

    const refreshed = await MedicineSearch.findOne({ searchId }).lean();
    return NextResponse.json(
      {
        searchId,
        searchType,
        query: query.trim(),
        status: refreshed?.status ?? 'pending',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in medicine search POST', error);
    return NextResponse.json({ message: 'An error occurred', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { success } = await ratelimit.limit(`${session.user.id}:medicines:delete`);
    if (!success) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const searchId = searchParams.get('searchId');
    if (!searchId) {
      return NextResponse.json({ message: 'searchId is required' }, { status: 400 });
    }

    const deleted = await MedicineSearch.findOneAndDelete({ searchId, user: session.user.id });
    if (!deleted) {
      return NextResponse.json({ message: 'Search not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Search deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in medicine search DELETE', error);
    return NextResponse.json({ message: 'An error occurred', error: String(error) }, { status: 500 });
  }
}
