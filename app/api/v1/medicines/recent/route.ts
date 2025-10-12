import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db-conn';
import MedicineSearch from '@/models/medicine-search';
import { auth } from '@/lib/auth';

// GET /api/v1/medicines/recent?userId=xxx&page=1&limit=10 - Get recent medicine searches
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
    const searches = await MedicineSearch.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .select('searchId searchType query createdAt');

    const total = await MedicineSearch.countDocuments(query);

    // Transform the data to match the RecentSearch interface
    const transformedSearches = searches.map(search => ({
      searchId: search.searchId,
      title: `${search.searchType.charAt(0).toUpperCase() + search.searchType.slice(1)}: ${search.query}`,
      symptoms: search.query, // Using query as symptoms for compatibility with Recent component
      createdAt: search.createdAt
    }));

    return NextResponse.json({
      data: transformedSearches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching recent medicine searches:', error);
    return NextResponse.json({ error: 'Failed to fetch recent medicine searches' }, { status: 500 });
  }
}