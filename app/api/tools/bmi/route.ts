import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'


export async function POST(req: NextRequest) {
  const { weight, height } = await req.json();
  const cookieStore = await cookies()
  const value = weight / (height * height);

  const token = cookieStore.get("token");
  if (!token || typeof token != "string") {
    return NextResponse.json({ message: "Authentication failed" }, { status: 400 });
  }


  return NextResponse.json({ bmi: value }, { status: 200 });
}