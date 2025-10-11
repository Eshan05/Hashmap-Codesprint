import { NextRequest, NextResponse } from 'next/server'
import mentalData from '@/lib/data/mental.json'
import { redis } from '@/lib/redis'
import { upstashRedis } from '@/lib/redis'
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: upstashRedis,
  limiter: Ratelimit.slidingWindow(100, "1 h"), // 100 requests per hour per IP
})

interface MentalDisorder {
  category: string
  disorder_name: string
  abbreviation?: string
}

// GET /api/mental-health?q=search&category=mood&page=1&limit=50 - Get mental health disorders
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-vercel-real-ip') || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const { success } = await ratelimit.limit(ip)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''
    const categoryFilter = searchParams.get('category')?.toLowerCase()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    const cacheKey = `mental-health:${query}:${categoryFilter || 'all'}:${page}:${limit}`

    // Check cache
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json(JSON.parse(cached), { status: 200 })
    }

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

      const response = {
        data: paginatedData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        error: null
      }

      // Cache for 1 hour
      await redis.setex(cacheKey, 3600, JSON.stringify(response))

      return NextResponse.json(response, { status: 200 })
    }

    const response = { data: grouped, error: null }

    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(response))

    return NextResponse.json(response, { status: 200 })
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
    const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-vercel-real-ip') || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const { success } = await ratelimit.limit(ip)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
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
