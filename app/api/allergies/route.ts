import { NextRequest, NextResponse } from 'next/server'

const allergyData = {
  food: [
    { name: 'Peanut', description: 'Common food allergen causing severe reactions.' },
    { name: 'Milk', description: 'Allergy to cow\'s milk proteins.' },
    { name: 'Egg', description: 'Allergy to egg proteins.' },
    { name: 'Wheat', description: 'Gluten-related allergy.' },
    { name: 'Soy', description: 'Soybean allergy.' },
    { name: 'Fish', description: 'Seafood allergy.' },
    { name: 'Shellfish', description: 'Crustacean or mollusk allergy.' },
    { name: 'Tree Nut', description: 'Allergy to nuts like almonds, walnuts.' },
  ],
  medical: [
    { name: 'Penicillin', description: 'Antibiotic allergy.' },
    { name: 'Aspirin', description: 'NSAID allergy.' },
    { name: 'Latex', description: 'Rubber allergy.' },
    { name: 'Iodine', description: 'Contrast dye allergy.' },
    { name: 'Sulfa Drugs', description: 'Sulfonamide allergy.' },
  ],
  environmental: [
    { name: 'Pollen', description: 'Hay fever from plant pollen.' },
    { name: 'Dust Mites', description: 'House dust allergy.' },
    { name: 'Mold', description: 'Fungal spore allergy.' },
    { name: 'Pet Dander', description: 'Animal hair allergy.' },
    { name: 'Cockroach', description: 'Insect allergen.' },
  ],
  contact: [
    { name: 'Nickel', description: 'Metal allergy in jewelry.' },
    { name: 'Latex', description: 'Contact dermatitis from latex.' },
    { name: 'Perfume', description: 'Fragrance allergy.' },
    { name: 'Poison Ivy', description: 'Plant resin allergy.' },
  ],
}

// GET /api/allergies?q=search&category=food - Get allergies with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''
    const categoryFilter = searchParams.get('category')?.toLowerCase()

    let filtered = Object.keys(allergyData).reduce((acc, category) => {
      const cat = category as keyof typeof allergyData
      acc[cat] = allergyData[cat].filter((allergy) =>
        allergy.name.toLowerCase().includes(query)
      )
      return acc
    }, {} as typeof allergyData)

    // Filter by category if specified
    if (categoryFilter && allergyData[categoryFilter as keyof typeof allergyData]) {
      filtered = { [categoryFilter]: filtered[categoryFilter as keyof typeof allergyData] } as typeof allergyData
    }

    return NextResponse.json({ data: filtered, error: null }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ data: null, error: 'Failed to fetch allergies' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, name, description } = body

    if (!category || !name || !description) {
      return NextResponse.json(
        { error: 'category, name, and description are required' },
        { status: 400 }
      )
    }

    if (!allergyData[category as keyof typeof allergyData]) {
      return NextResponse.json(
        { error: 'Invalid category. Must be one of: food, medical, environmental, contact' },
        { status: 400 }
      )
    }

    // TODO: Actually save to DB
    return NextResponse.json(
      {
        message: 'Allergy added successfully',
        data: { category, name, description }
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add allergy' }, { status: 500 })
  }
}