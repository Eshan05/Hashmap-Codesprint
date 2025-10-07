import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from '@/utils/dbConnect';
import SymptomSearch from '@/models/SymptomSearch';
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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API || "AIzaSyBRAOu7yHK3yQybAGoxEzmnaUhbJvyMBO0");
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  generationConfig: { responseMimeType: "application/json" }
});

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { symptoms, duration, pastContext, otherInfo } = body;

    // Need to improve on this
    if (!symptoms) {
      return NextResponse.json({ message: "Symptoms are required" }, { status: 400 });
    }

    const searchId = uuidv4();
    // New document but before response
    const newSearch = new SymptomSearch({
      searchId,
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
    // Cumulative Prompt
    const summarizePrompt = `Summarize the following user input into a concise, clear statement of the problem. Focus on the key symptoms and relevant context:\n\n${initialPrompt}\n\nSummary:`;
    const summarizeResult = await retryWithExponentialBackoff(() => model.generateContent(summarizePrompt));
    const cumulativePrompt = summarizeResult.response.text();
    const summaryHash = await generateSummaryHash(cumulativePrompt);
    console.log(`Summary Hash: Generated`);

    const existingSearch = await SymptomSearch.findOne({ summaryHash });
    if (existingSearch) {
      console.log("Using cached result");
      await SymptomSearch.findOneAndUpdate(
        { searchId },
        {
          cumulativePrompt: existingSearch.cumulativePrompt,
          potentialConditions: existingSearch.potentialConditions,
          medicines: existingSearch.medicines,
          whenToSeekHelp: existingSearch.whenToSeekHelp,
          finalVerdict: existingSearch.finalVerdict,
          summaryHash,
        }
      );
      return; // Exit early
    }

    await SymptomSearch.findOneAndUpdate({ searchId }, { cumulativePrompt, summaryHash });

    // Potential Conditions
    const conditionsPrompt = `Based on the following summary, list potential medical conditions, ordered from most likely to least likely. Return the results as a JSON array of objects.
    
    \nConditions = { name: String, description: String, explanation: String } 
    \n(String), (String: Description about condition), (String: Explanation on why it is a potential condition). 
    \nReturn: Array<Conditions>
    \n\nSummary: ${cumulativePrompt}
    \nJSON Output (Do not include any additional text, formatting, or markdown code blocks. Return ONLY the raw JSON):`;
    const conditionsResult = await retryWithExponentialBackoff(() => model.generateContent(conditionsPrompt));
    let potentialConditions = conditionsResult.response.text();
    try {
      potentialConditions = JSON.stringify(JSON.parse(potentialConditions));
    } catch (parseError) {
      console.error("Error parsing conditions JSON:", parseError);
      potentialConditions = "[]";
    }
    await SymptomSearch.findOneAndUpdate({ searchId }, { potentialConditions });


    // Medicines
    const medicinesPrompt = `Based on the following summary, list potential over-the-counter or common medicines that *might* help alleviate the symptoms. If needed you can include medicines that are not over-the-counter. Return results as raw JSON array of objects as follows:
    
    \nMedicines = { name: String, commonUse: String, sideEffects: String[] }
    \n(String), (String: Commonly used for and concise description of medicine (30-50 words)), (String[]: Array of side effects)
    \nReturn: Array<Medicines>
    \n\nSummary: ${cumulativePrompt}\n\nJSON Output (Do not include any additional text, formatting, or markdown code blocks. Return ONLY the raw JSON):`;
    const medicinesResult = await retryWithExponentialBackoff(() => model.generateContent(medicinesPrompt));
    let medicines = medicinesResult.response.text();
    try {
      medicines = JSON.stringify(JSON.parse(medicines));
    } catch (parseError) {
      console.error("Error parsing medicines JSON:", parseError);
      medicines = "[]";
    }
    await SymptomSearch.findOneAndUpdate({ searchId }, { medicines });

    // When to Seek Help
    const seekHelpPrompt = `Based on the following summary, provide advice on when to seek immediate medical attention. List specific symptoms or situations that warrant urgent care as. Return the results as a JSON array of objects as follows: 
    
    \nSeekHelp = { title: String, explanation: String }
    \n(String: Concise description), (String: More detailed explanation).
    \n Return: Array<SeekHelp>
    \n\nSummary: ${cumulativePrompt}
    \nJSON Output (Do not include any additional text, formatting, or markdown code blocks. Return ONLY the raw JSON):`;
    const seekHelpResult = await retryWithExponentialBackoff(() => model.generateContent(seekHelpPrompt));
    let whenToSeekHelp = seekHelpResult.response.text();
    try {
      whenToSeekHelp = JSON.stringify(JSON.parse(whenToSeekHelp));
    } catch (parseError) {
      console.error("Error parsing whenToSeekHelp JSON:", parseError);
      whenToSeekHelp = "[]";
    }
    await SymptomSearch.findOneAndUpdate({ searchId }, { whenToSeekHelp });

    // Final Verdict
    const verdictPrompt = `Provide a concise final verdict based on the following summary. Do not include disclaimers:\n\nSummary: ${cumulativePrompt}\n\nFinal Verdict:`;
    const verdictResult = await retryWithExponentialBackoff(() => model.generateContent(verdictPrompt));
    const finalVerdict = verdictResult.response.text();
    await SymptomSearch.findOneAndUpdate({ searchId }, { finalVerdict });
    console.log("Response Stored: ", searchId);
  } catch (error) {
    console.error("Error generating Gemini responses:", error);
    await SymptomSearch.findOneAndUpdate(
      { searchId },
      {
        cumulativePrompt: "An error occurred for cumulative prompt.",
        potentialConditions: "An error occurred for potential conditions.",
        medicines: "An error occurred for medicines.",
        whenToSeekHelp: "An error occurred for when to seek help.",
        finalVerdict: "An error occurred for final verdict.",
      }
    );
  }
}