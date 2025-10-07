import { NextRequest, NextResponse } from "next/server";
export async function POSt(req: NextRequest) {
  const { sys, dia } = await req.json();

  if (sys > 120 || dia > 80) {
    const value = "Your BP is high cons Doctor";
    let level = ""
    if (sys > 120 && sys < 130) level = "mid";
    else if (sys > 129 && sys < 140) level = "danger1"
    else level = "danger2";
    return NextResponse.json({ bp: value, level }, { status: 200 });
  }


  return NextResponse.json({ bp: "You are fine" }, { status: 200 });

}