
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { retryWithExponentialBackoff } from '@/lib/utils';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" }
});


export async function POST(req: NextRequest) {
  try {
    const { name, rep, set } = await req.json();
    const prompt = `Give me number of calories burned when done  ${name} exerises, no of set is ${set} & no of reps per set is ${rep} i just want  number of calories burned  no anything other than that `
    const geminiResult = await retryWithExponentialBackoff(() => model.generateContent(prompt));
    let result = geminiResult.response.text();
    const calo = parseInt(result.split(":")[1].replace(/[\r\n]+/gm, " ").replace("}", ""));
    return NextResponse.json({ calo }, { status: 200 });
  }
  catch (e) {
    console.log(e)
  }
}