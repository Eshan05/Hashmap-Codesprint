import { NextRequest, NextResponse } from 'next/server'
import medicationsData from '@/lib/data/medications.json'

// GET /api/medications?q=search&page=1&limit=50 - Search medications with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Max 100

    // Filter medications by brand_name or generic_name containing the query
    const filtered = (medicationsData as any[]).filter((med: any) =>
      med.brand_name?.toLowerCase().includes(query) ||
      med.generic_name?.toLowerCase().includes(query)
    )

    // Apply pagination
    const skip = (page - 1) * limit
    const results = filtered.slice(skip, skip + limit)
    const total = filtered.length

    return NextResponse.json({
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      error: null
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching medications:', error)
    return NextResponse.json(
      { data: null, error: 'Failed to fetch medications' },
      { status: 500 }
    )
  }
}