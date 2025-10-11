import { NextRequest, NextResponse } from 'next/server'
import medicationsData from '@/lib/data/medications.json'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase() || ''

  // Filter medications by brand_name containing the query
  const filtered = (medicationsData as any[]).filter((med: any) =>
    med.brand_name?.toLowerCase().includes(query)
  )

  // Limit results to prevent large responses
  const results = filtered.slice(0, 50)

  return NextResponse.json(results)
}