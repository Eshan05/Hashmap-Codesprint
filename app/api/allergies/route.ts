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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase() || ''

  const filtered = Object.keys(allergyData).reduce((acc, category) => {
    const cat = category as keyof typeof allergyData
    acc[cat] = allergyData[cat].filter((allergy) =>
      allergy.name.toLowerCase().includes(query)
    )
    return acc
  }, {} as typeof allergyData)

  return NextResponse.json(filtered)
}