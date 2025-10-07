import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dbConnect from '@/utils/db-conn';
import SymptomSearch from '@/models/symptom-search';
import User from '@/models/user';
import { v4 as uuidv4 } from 'uuid';
import { retryWithExponentialBackoff } from '@/lib/utils';

async function generateSummaryHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  generationConfig: { responseMimeType: "application/json" }
});

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { symptoms, pastContext, otherInfo } = body;

    // Need to improve on this
    if (!symptoms) {
      return NextResponse.json({ message: "Symptoms are required" }, { status: 400 });
    }

    let user = null;
    try {
      // This is a placeholder - you need to implement proper session handling
      // For example using better-auth session
      // const session = await auth.api.getSession({ headers });
      // if (session?.user) {
      //   user = await User.findOne({ email: session.user.email });
      // }

      // For demo purposes, create or find a demo user
      user = await User.findOneAndUpdate(
        { email: 'demo@example.com' },
        {
          name: 'Demo User',
          email: 'demo@example.com',
          emailVerified: new Date(),
          role: 'user',
          banned: false
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Error getting user session:', error);
    }

    const searchId = uuidv4();
    // New document but before response
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    const newSearch = new SymptomSearch({
      searchId,
      user: user._id,
      symptoms,
      pastContext,
      otherInfo,
    });

    await newSearch.save();

    //! Need to improve this substantially
    const prompt = `
      User Symptoms Information: ${symptoms}
      Past Related Context: ${pastContext || 'None'}
      Other Information: ${otherInfo || 'None'}
`;
    await generateGeminiResponses(searchId, prompt);
    return NextResponse.json({ searchId }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred", error: error }, { status: 500 });
  }
}

async function generateGeminiResponses(searchId: string, initialPrompt: string) {
  try {
    console.log(`[${searchId}] Step 1: Generating Title and Summary...`);
    const titleAndSummaryPrompt = `Based on the user input, generate a concise title (under 60 chars) and a clear summary.\n\nUser Input:\n${initialPrompt}`;

    const titleAndSummaryResult = await retryWithExponentialBackoff(() =>
      model.generateContent({
        contents: [{ role: "user", parts: [{ text: titleAndSummaryPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING, description: "A concise title for the symptom search." },
              cumulativePrompt: { type: SchemaType.STRING, description: "A summary of the user's symptoms and context." },
            },
            required: ["title", "cumulativePrompt"],
          },
        },
      })
    );
    const { title, cumulativePrompt } = JSON.parse(titleAndSummaryResult.response.text());
    const summaryHash = await generateSummaryHash(cumulativePrompt);
    console.log(`[${searchId}] Step 1: Success. Hash generated.`);

    console.log(`Summary Hash: Generated`);

    const existingSearch = await SymptomSearch.findOne({ summaryHash });
    if (existingSearch) {
      console.log("Using cached result");
      await SymptomSearch.findOneAndUpdate(
        { searchId },
        {
          title,
          cumulativePrompt: existingSearch.cumulativePrompt,
          potentialConditions: existingSearch.potentialConditions,
          medicines: existingSearch.medicines,
          whenToSeekHelp: existingSearch.whenToSeekHelp,
          finalVerdict: existingSearch.finalVerdict,
          quickChecklist: existingSearch.quickChecklist,
          reliefIdeas: existingSearch.reliefIdeas,
          summaryHash,
        }
      );
      return;
    }

    await SymptomSearch.findOneAndUpdate({ searchId }, { title, cumulativePrompt, summaryHash });
    const fullAnalysisPrompt = `
      Based on the following user symptom summary, provide a comprehensive health analysis.
      Your response must be a single JSON object that strictly adheres to the provided schema.

      **Analysis Instructions:**

      1.  **potentialConditions**: List potential medical conditions, ordered from most likely to least likely. For each, provide: (Try for 2+)
          - name
          - lookoutFactor (Eg. Primary signal, Consider closely, Keep monitoring or similar)
          - description (concise)
          - explanation (why it matches)
          - severityTrend (e.g., Elevated, Stable, Mild)
      2.  **medicines**: List potential medicines (OTC or common prescriptions). For each, provide: (Try for 2+)
          - name
          - commonUse (30-50 words)
          - sideEffects (array of strings)
          - adherence (High/Moderate/Low) — a short label indicating expected adherence/outlook
      3.  **whenToSeekHelp**: For escalation cues, provide for each: (Try for 2+)
          - title
          - whenContact (e.g., Immediately, Within 24 hours, This week)
          - curability (e.g., Easily curable, Needs intervention, etc.)
          - explanation
          - criticality (Like 72% Critical or 81% Urgent)
          - immediateSteps (a simple small paragraph when and which steps to take immediately)
      4. **quickChecklist**: An array of short strings the user can check immediately (onset time, recent triggers, record current meds, etc.) (Aim for 4-6 items)
      5. **reliefIdeas**: An array of objects with title and description for quick non-pharmacologic relief ideas. Like 'Guided Breathing','Hydration & Rest' with descriptions 
      6.  **finalVerdict**: Provide a concise final verdict based on the summary. Do not include legal disclaimers.

      **User Symptom Summary:**
      ${cumulativePrompt}
    `;

    const fullAnalysisResult = await retryWithExponentialBackoff(() =>
      model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullAnalysisPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              potentialConditions: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    name: { type: SchemaType.STRING },
                    lookoutFactor: { type: SchemaType.STRING },
                    description: { type: SchemaType.STRING },
                    explanation: { type: SchemaType.STRING },
                    severityTrend: { type: SchemaType.STRING },
                  },
                  required: ["name", "description", "explanation", "severityTrend", "lookoutFactor"],
                },
              },
              medicines: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    name: { type: SchemaType.STRING },
                    commonUse: { type: SchemaType.STRING },
                    sideEffects: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    adherence: { type: SchemaType.STRING },
                  },
                  required: ["name", "commonUse", "sideEffects", "adherence"],
                },
              },
              whenToSeekHelp: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    title: { type: SchemaType.STRING },
                    explanation: { type: SchemaType.STRING },
                    criticality: { type: SchemaType.STRING },
                    immediateSteps: { type: SchemaType.STRING },
                    curability: { type: SchemaType.STRING },
                    whenContact: { type: SchemaType.STRING },
                  },
                  required: ["title", "explanation", "criticality", "immediateSteps", "curability", "whenContact"],
                },
              },
              quickChecklist: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              reliefIdeas: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    title: { type: SchemaType.STRING },
                    description: { type: SchemaType.STRING },
                    icon: { type: SchemaType.STRING },
                  },
                  required: ["title", "description"],
                },
              },
              finalVerdict: { type: SchemaType.STRING },
            },
            required: ["potentialConditions", "medicines", "whenToSeekHelp", "finalVerdict", "quickChecklist", "reliefIdeas"],
          },
        },
      })
    );

    console.log(`[${searchId}] Step 4: Storing full analysis...`);
    console.log("Full Analysis Response: ", fullAnalysisResult.response.text());
    const fullAnalysis = JSON.parse(fullAnalysisResult.response.text());
    await SymptomSearch.findOneAndUpdate(
      { searchId },
      {
        potentialConditions: JSON.stringify(fullAnalysis.potentialConditions),
        medicines: JSON.stringify(fullAnalysis.medicines),
        whenToSeekHelp: JSON.stringify(fullAnalysis.whenToSeekHelp),
        quickChecklist: JSON.stringify(fullAnalysis.quickChecklist || []),
        reliefIdeas: JSON.stringify(fullAnalysis.reliefIdeas || []),
        finalVerdict: fullAnalysis.finalVerdict,
      }
    );

    console.log("Response Stored: ", searchId);
  } catch (error) {
    console.error("Error generating Gemini responses:", error);
    await SymptomSearch.findOneAndUpdate(
      { searchId },
      {
        title: "Error generating title.",
        cumulativePrompt: "An error occurred for cumulative prompt.",
        potentialConditions: "An error occurred for potential conditions.",
        medicines: "An error occurred for medicines.",
        whenToSeekHelp: "An error occurred for when to seek help.",
        finalVerdict: "An error occurred for final verdict.",
        quickChecklist: "An error occurred for quick checklist.",
        reliefIdeas: "An error occurred for relief ideas.",
      }
    );
  }
}