import { NextRequest, NextResponse } from 'next/server'
import mentalData from '@/lib/data/mental.json'

interface MentalDisorder {
  category: string
  disorder_name: string
  abbreviation?: string
}

// GET /api/mental-health?q=search&category=mood&page=1&limit=50 - Get mental health disorders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''
    const categoryFilter = searchParams.get('category')?.toLowerCase()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    let filteredData: MentalDisorder[] = mentalData as MentalDisorder[]

    // Apply search filter
    if (query) {
      filteredData = filteredData.filter(item =>
        item.disorder_name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.abbreviation && item.abbreviation.toLowerCase().includes(query))
      )
    }

    // Apply category filter
    if (categoryFilter) {
      filteredData = filteredData.filter(item =>
        item.category.toLowerCase() === categoryFilter
      )
    }

    // Group by category
    const grouped: Record<string, MentalDisorder[]> = {}
    filteredData.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = []
      }
      grouped[item.category].push(item)
    })

    const usePagination = searchParams.has('page')
    if (usePagination) {
      const skip = (page - 1) * limit
      const paginatedData = filteredData.slice(skip, skip + limit)
      const total = filteredData.length

      return NextResponse.json({
        data: paginatedData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        error: null
      }, { status: 200 })
    }

    return NextResponse.json({ data: grouped, error: null }, { status: 200 })
  } catch (error) {
    console.error('Error fetching mental health data:', error)
    return NextResponse.json(
      { data: null, error: 'Failed to fetch mental health data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { disorder_name, abbreviation, category, notes } = body

    if (!disorder_name || !category) {
      return NextResponse.json(
        { error: 'disorder_name and category are required' },
        { status: 400 }
      )
    }

    // TODO: Actually save to DB
    return NextResponse.json(
      {
        message: 'Mental health diagnosis added successfully',
        data: { disorder_name, abbreviation, category, notes }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding mental health diagnosis:', error)
    return NextResponse.json({ error: 'Failed to add diagnosis' }, { status: 500 })
  }
}
