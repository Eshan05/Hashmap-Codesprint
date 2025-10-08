import { structuredSymptoms } from '@/utils/symptoms';
import fuzzysort from 'fuzzysort';

export interface SearchableSymptom {
  symptom: string;
  categoryKey: string;
  subCategoryKey?: string;
  path: string;
  prepared: Fuzzysort.Prepared | undefined;
}

// This function transforms your nested data into a flat, searchable list.
function createSearchableList(): SearchableSymptom[] {
  const list: SearchableSymptom[] = [];

  for (const [categoryKey, categoryData] of Object.entries(structuredSymptoms)) {
    if (categoryData.subCategories) {
      for (const [subCategoryKey, subCategoryData] of Object.entries(categoryData.subCategories)) {
        for (const symptom of subCategoryData.symptoms) {
          list.push({
            symptom,
            categoryKey,
            subCategoryKey,
            path: `${categoryData.displayName} > ${subCategoryData.displayName}`,
            prepared: fuzzysort.prepare(symptom),
          });
        }
      }
    } else if (categoryData.symptoms) {
      // Handle categories without sub-categories
      for (const symptom of categoryData.symptoms) {
        list.push({
          symptom,
          categoryKey,
          path: categoryData.displayName,
          prepared: fuzzysort.prepare(symptom),
        });
      }
    }
  }
  return list;
}

// Create the list once and export it so it's not regenerated on every render.
export const searchableSymptomList = createSearchableList();

// The main search function that will be called from the component.
export function searchSymptoms(query: string): Fuzzysort.Results {
  if (!query) return Object.assign([], { total: 0 });

  return fuzzysort.go(query, searchableSymptomList, {
    key: 'symptom',
    threshold: -1000,
    limit: 10,
  });
}