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
    // Call Gemini API in the background
    await generateGeminiResponses(searchId, prompt);
    return NextResponse.json({ searchId }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred", error: error }, { status: 500 });
  }
}

async function generateGeminiResponses(searchId: string, initialPrompt: string) {
  try {
    // Generate Title
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

      1.  **potentialConditions**: List potential medical conditions, ordered from most likely to least likely. For each, provide a name, a concise description, and a clear explanation of why it's a potential match for the user's symptoms.
      2.  **medicines**: List potential over-the-counter or common medicines that might help alleviate the symptoms. You can include prescription medicines if they are highly relevant. For each, provide the name, its common use in a concise description (30-50 words), and an array of potential side effects.
      3.  **whenToSeekHelp**: List specific symptoms or situations that warrant immediate medical attention. For each, provide a clear title and a more detailed explanation.
      4.  **finalVerdict**: Provide a concise final verdict based on the summary. Do not include any disclaimers.

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
                    description: { type: SchemaType.STRING },
                    explanation: { type: SchemaType.STRING },
                  },
                  required: ["name", "description", "explanation"],
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
                  },
                  required: ["name", "commonUse", "sideEffects"],
                },
              },
              whenToSeekHelp: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    title: { type: SchemaType.STRING },
                    explanation: { type: SchemaType.STRING },
                  },
                  required: ["title", "explanation"],
                },
              },
              finalVerdict: {
                type: SchemaType.STRING,
              },
            },
            required: ["potentialConditions", "medicines", "whenToSeekHelp", "finalVerdict"],
          },
        },
      })
    );

    console.log(`[${searchId}] Step 4: Storing full analysis...`);
    const fullAnalysis = JSON.parse(fullAnalysisResult.response.text());
    await SymptomSearch.findOneAndUpdate(
      { searchId },
      {
        potentialConditions: JSON.stringify(fullAnalysis.potentialConditions),
        medicines: JSON.stringify(fullAnalysis.medicines),
        whenToSeekHelp: JSON.stringify(fullAnalysis.whenToSeekHelp),
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
      }
    );
  }
}