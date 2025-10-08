'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSymptomStore } from '@/lib/store/symptom-select-store';
// import * as Symptoms from '@/utils/symptoms';
import { structuredSymptoms, allSymptoms, topLevelSymptoms } from '@/utils/symptoms';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface SymptomSelectorProps {
  category: string | null;
  subCategory: string | null;
}

export function SymptomSelector({ category, subCategory }: SymptomSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { addSymptom, removeSymptom, isSymptomSelected } = useSymptomStore();

  const handleSymptomToggle = (symptom: string) => {
    if (isSymptomSelected(symptom)) {
      removeSymptom(symptom);
    } else {
      addSymptom(symptom);
    }
  };

  const navigate = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === null) newSearchParams.delete(key);
      else newSearchParams.set(key, value);
    }
    router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
  };

  // --- Navigation Logic ---
  const handleCategoryClick = (categoryKey: string) => {
    if (categoryKey === 'ALL') {
      navigate({ category: 'ALL' });
      return;
    }

    const categoryData = structuredSymptoms[categoryKey];
    if (!categoryData.subCategories) {
      navigate({ category: categoryKey, subCategory: categoryKey });
    } else {
      navigate({ category: categoryKey });
    }
  };

  const handleSubCategoryClick = (subCategoryKey: string) => {
    navigate({ subCategory: subCategoryKey });
  };

  const goBack = () => {
    const categoryData = category ? structuredSymptoms[category] : null;
    if (subCategory && categoryData?.subCategories) {
      navigate({ subCategory: null });
    } else {
      navigate({ category: null, subCategory: null });
    }
  };

  // --- Panel Rendering ---

  const renderMainPanel = () => (
    <div className="space-y-2">
      {Object.entries(topLevelSymptoms).map(([key, displayName]) => (
        <button key={key} onClick={() => handleCategoryClick(key)} className="w-full flex items-center justify-between p-2 rounded-md hover:bg-accent">
          <span>{displayName}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      ))}
    </div>
  );

  const renderCategoryPanel = () => {
    if (!category || !structuredSymptoms[category]?.subCategories) return null;
    const { displayName, subCategories } = structuredSymptoms[category];

    return (
      <div>
        <Button variant="ghost" onClick={goBack} className="mb-2 w-full justify-start">
          <ArrowLeft className="h-4 w-4 mr-2" /> All Categories
        </Button>
        <h3 className="font-semibold mb-4 px-2">{displayName}</h3>
        <div className="space-y-2">
          {Object.entries(subCategories!).map(([key, data]) => (
            <button key={key} onClick={() => handleSubCategoryClick(key)} className="w-full flex items-center justify-between p-2 rounded-md hover:bg-accent">
              <span>{data.displayName}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderSymptomPanel = () => {
    if (!category) return null;

    const categoryData = structuredSymptoms[category];
    let symptomsToList: string[] = [];
    let title = '';
    if (category === 'ALL') {
      symptomsToList = allSymptoms;
      title = 'All Symptoms';
    } else {
      title = categoryData.displayName;
    }
    let backButtonText = "All Categories";


    if (subCategory) {
      if (subCategory === category && !categoryData.subCategories) {
        // This is a top-level category with no sub-categories (e.g., Neck, Skin)
        symptomsToList = categoryData.symptoms || [];
      } else if (categoryData.subCategories?.[subCategory]) {
        // This is a sub-category
        const subCategoryData = categoryData.subCategories[subCategory];
        symptomsToList = subCategoryData.symptoms;
        title = subCategoryData.displayName;
        backButtonText = categoryData.displayName;
      }
    }

    if (symptomsToList.length === 0) return <div>No symptoms found.</div>;
    return (
      <div>
        <Button variant="ghost" onClick={goBack} className="mb-2 w-full justify-start">
          <ArrowLeft className="h-4 w-4 mr-2" /> {backButtonText}
        </Button>
        <h3 className="font-semibold mb-4 px-2">{title}</h3>
        <div className="space-y-3">
          {symptomsToList.map((symptom) => (
            <div key={symptom} className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors">
              <Checkbox
                id={symptom}
                checked={isSymptomSelected(symptom)}
                onCheckedChange={() => handleSymptomToggle(symptom)}
              />
              <Label htmlFor={symptom} className="capitalize flex-grow cursor-pointer text-sm">
                {symptom.replace(/_/g, ' ')}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Derive the active panel from the props
  const getActivePanel = () => {
    if (category && subCategory) return 'symptoms';
    if (category && structuredSymptoms[category]?.subCategories) return 'category';
    // This handles the case where a category without subs was clicked
    if (category && !structuredSymptoms[category]?.subCategories) return 'symptoms';
    return 'main';
  };
  const activePanel = getActivePanel();

  return (
    <div className="w-full">
      <div className="mb-4">
        <Input placeholder="Search all symptoms..." />
      </div>
      {activePanel === 'main' && renderMainPanel()}
      {activePanel === 'category' && renderCategoryPanel()}
      {activePanel === 'symptoms' && renderSymptomPanel()}
    </div>
  );
}