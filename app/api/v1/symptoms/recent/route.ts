import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db-conn';
import SymptomSearch from '@/models/symptom-search';
import { auth } from '@/lib/auth';

// GET /api/v1/symptoms/recent?userId=xxx&page=1&limit=10 - Get recent symptom searches
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // TODO: Fix user session handling to properly associate searches with logged-in users
    const query = {};
    /*
    if (userId) {
      query.user = userId;
    } else {
      try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (session?.user?.id) {
          query.user = session.user.id;
        }
      } catch (error) {
        console.warn('Could not get session:', error);
      }
    }
    */

    const skip = (page - 1) * limit;
    const searches = await SymptomSearch.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .select('searchId title symptoms createdAt user');

    const total = await SymptomSearch.countDocuments(query);

    return NextResponse.json({
      data: searches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching recent searches:', error);
    return NextResponse.json({ error: 'Failed to fetch recent searches' }, { status: 500 });
  }
}