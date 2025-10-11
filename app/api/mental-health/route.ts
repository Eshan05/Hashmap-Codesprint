import { NextRequest, NextResponse } from 'next/server'
import mentalData from '@/lib/data/mental.json'

interface MentalDisorder {
  category: string
  disorder_name: string
  abbreviation?: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase() || ''

  let filteredData: MentalDisorder[] = mentalData as MentalDisorder[]

  if (query) {
    filteredData = filteredData.filter(item =>
      item.disorder_name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      (item.abbreviation && item.abbreviation.toLowerCase().includes(query))
    )
  }

  const grouped: Record<string, MentalDisorder[]> = {}
  filteredData.forEach(item => {
    if (!grouped[item.category]) {
      grouped[item.category] = []
    }
    grouped[item.category].push(item)
  })

  return NextResponse.json(grouped)
}
