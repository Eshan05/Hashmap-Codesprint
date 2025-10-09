import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db-conn';
import SymptomSearch from '@/models/symptom-search';

export async function GET() {
  try {
    await dbConnect();

    const searches = await SymptomSearch.find({})
      .sort({ createdAt: -1 })
      // .limit(5)
      .lean()
      .select('searchId title symptoms createdAt');

    return NextResponse.json(searches);
  } catch (error) {
    console.error('Error fetching recent searches:', error);
    return NextResponse.json({ error: 'Failed to fetch recent searches' }, { status: 500 });
  }
}