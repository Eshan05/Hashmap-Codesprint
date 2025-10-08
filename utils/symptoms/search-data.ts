import { structuredSymptoms, topLevelSymptoms } from './index';

export interface SearchableItem {
  type: 'symptom' | 'category' | 'subCategory';
  key: string;
  displayName: string;
  path?: string
  categoryKey?: string;
  subCategoryKey?: string;
}

const searchableItems: SearchableItem[] = [];

Object.entries(structuredSymptoms).forEach(([categoryKey, categoryData]) => {
  // Add the main category as a searchable item
  searchableItems.push({
    type: 'category',
    key: categoryKey,
    displayName: categoryData.displayName,
    categoryKey: categoryKey,
  });

  if (categoryData.subCategories) {
    Object.entries(categoryData.subCategories).forEach(([subCategoryKey, subCategoryData]) => {
      // Add the sub-category as a searchable item
      searchableItems.push({
        type: 'subCategory',
        key: subCategoryKey,
        displayName: subCategoryData.displayName,
        path: `${categoryData.displayName}`,
        categoryKey: categoryKey,
        subCategoryKey: subCategoryKey,
      });
      // Add all symptoms from this sub-category
      subCategoryData.symptoms.forEach(symptom => {
        searchableItems.push({
          type: 'symptom',
          key: symptom,
          displayName: symptom,
          path: `${categoryData.displayName} > ${subCategoryData.displayName}`,
          categoryKey: categoryKey,
          subCategoryKey: subCategoryKey,
        });
      });
    });
  } else {
    // Add symptoms from categories that have no sub-categories
    if (categoryData.symptoms) {
      categoryData.symptoms.forEach(symptom => {
        searchableItems.push({
          type: 'symptom',
          key: symptom,
          displayName: symptom,
          path: categoryData.displayName,
          categoryKey: categoryKey,
        });
      });
    }
  }
});

// Add "All Symptoms" as a special category
searchableItems.push({
  type: 'category',
  key: 'ALL',
  displayName: topLevelSymptoms.ALL,
  categoryKey: 'ALL'
})

export const allSearchableItems = searchableItems;