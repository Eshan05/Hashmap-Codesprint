import { NextRequest, NextResponse } from 'next/server'
import medicationsData from '@/lib/data/medications.json'
import { redis } from '@/lib/redis'
import { upstashRedis } from '@/lib/redis'
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: upstashRedis,
  limiter: Ratelimit.slidingWindow(100, "1 h"), // 100 requests per hour per IP
})

// GET /api/medications?q=search&page=1&limit=50 - Search medications with pagination
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-vercel-real-ip') || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const { success } = await ratelimit.limit(ip)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Max 100

    const cacheKey = `medications:${query}:${page}:${limit}`

    // Check cache
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json(JSON.parse(cached), { status: 200 })
    }

    // Filter medications by brand_name or generic_name containing the query
    const filtered = (medicationsData as any[]).filter((med: any) =>
      med.brand_name?.toLowerCase().includes(query) ||
      med.generic_name?.toLowerCase().includes(query)
    )

    // Apply pagination
    const skip = (page - 1) * limit
    const results = filtered.slice(skip, skip + limit)
    const total = filtered.length

    const response = {
      data: results,
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
  } catch (error) {
    console.error('Error fetching medications:', error)
    return NextResponse.json(
      { data: null, error: 'Failed to fetch medications' },
      { status: 500 }
    )
  }
}