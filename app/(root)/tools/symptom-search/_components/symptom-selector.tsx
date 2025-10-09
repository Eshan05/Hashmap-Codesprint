'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from '@/components/ui/label';
import { useSymptomStore } from '@/lib/store/symptom-select-store';
import { allSymptoms, structuredSymptoms, topLevelSymptoms } from '@/utils/symptoms';
import { categoryIcons } from '@/utils/symptoms/icons';
import { allSearchableItems, SearchableItem } from '@/utils/symptoms/search-data';
import { ArrowLeft, ChevronRight, XIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface SymptomSelectorProps {
  category: string | null;
  subCategory: string | null;
}

export function SymptomSelector({ category, subCategory }: SymptomSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addSymptom, removeSymptom, isSymptomSelected } = useSymptomStore();
  const [search, setSearch] = useState('');
  const selectedSymptoms = useSymptomStore((state) => state.selectedSymptoms);
  const selectedArray = useMemo(() => Array.from(selectedSymptoms), [selectedSymptoms]);

  const handleSymptomToggle = (symptom: string) => {
    if (isSymptomSelected(symptom)) {
      removeSymptom(symptom);
    } else {
      addSymptom(symptom);
    }
  };

  const handleSelect = (item: SearchableItem) => {
    if (item.type === 'symptom') {
      handleSymptomToggle(item.key);
    } else {
      // If selecting from partial command (no space), complete the command
      if (search.startsWith('/') && !search.includes(' ')) {
        const key = item.subCategoryKey ?? item.key ?? item.categoryKey;
        setSearch(`/${key.toLowerCase()} `);
        return;
      }
      // When selecting a category or sub-category, we must build the full path.
      const params: Record<string, string | null> = { category: item.categoryKey || null };
      if (item.type === 'subCategory') {
        params.subCategory = item.key;
      } else if (item.subCategoryKey) {
        params.subCategory = item.subCategoryKey;
      } else if (!structuredSymptoms[item.categoryKey!]?.subCategories) {
        // If it's a category with no subs (like Neck), set subCategory to the same key.
        params.subCategory = item.categoryKey as string;
      }
      navigate(params);
    }
    setSearch('');
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
    <div className="space-y-1">
      {Object.entries(topLevelSymptoms).map(([key, displayName]) => {
        const IconComponent = categoryIcons[key];
        return (
          <Button key={key} variant={'ghost'} onClick={() => handleCategoryClick(key)} className="w-full flex items-center justify-between p-2 rounded-md hover:bg-accent text-muted-foreground">
            <div className="flex items-center gap-3 font-medium tracking-tight text-xl leading-6">
              {IconComponent && <IconComponent className="size-5 shrink-0" />}
              <span>{displayName.replace(/ symptoms$/i, '')}</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )
      })}
    </div>
  );

  const renderCategoryPanel = () => {
    if (!category || !structuredSymptoms[category]?.subCategories) return null;
    const { displayName, subCategories } = structuredSymptoms[category];
    const IconComponent = categoryIcons[category];

    return (
      <div>
        <Button variant="ghost" onClick={goBack} className="mb-2 w-full hidden justify-start">
          <ArrowLeft className="h-4 w-4 mr-2" /> All Categories
        </Button>
        <Button variant={'default'} className="flex items-center w-full gap-3 mb-4 px-2" onClick={goBack}>
          {IconComponent && <IconComponent className="size-5 shrink-0" />}
          <h3 className="font-medium tracking-tight text-xl leading-6">{displayName}</h3>
        </Button>
        <div className="space-y-1 mt-1">
          {Object.entries(subCategories!).map(([key, data]) => (
            <Button variant={'ghost'} key={key} onClick={() => handleSubCategoryClick(key)} className="w-full text-lg leading-6 flex items-center justify-between p-2 rounded-md hover:bg-accent text-muted-foreground">
              <span>{data.displayName}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
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
    const IconComponent = category ? categoryIcons[category] : undefined;
    return (
      <div>
        <Button variant="ghost" onClick={goBack} className="mb-2 w-full hidden justify-start">
          <ArrowLeft className="h-4 w-4 mr-2" /> {backButtonText}
        </Button>
        <Button variant={'default'} className="flex items-center w-full gap-3 mb-4 px-2" onClick={goBack}>
          {IconComponent && <IconComponent className="size-5 shrink-0" />}
          <h3 className="font-medium text-xl tracking-tight leading-6">{title}</h3>
        </Button>
        <div className="space-y-1">
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

  const filteredResults = useMemo(() => {
    if (!search) return { symptoms: [], categories: [], scope: '', subScope: '' };
    const query = search.toLowerCase()

    if (query === '/') {
      const categories = allSearchableItems.filter(item => item.type === 'category' || item.type === 'subCategory');
      return {
        symptoms: [],
        categories,
        scope: '',
        subScope: '',
      };
    }

    let scope = '';
    let subScope = '';
    let sQuery = query;

    // Handle scoped search ("/legs pain")
    if (search.startsWith('/')) {
      const parts = search.split(' ');
      const command = parts[0].substring(1).toLowerCase();
      if (parts.length === 1) {
        // No space, show matching categories
        const matchingCategories = Object.keys(structuredSymptoms).filter(key =>
          key.toLowerCase().startsWith(command) || structuredSymptoms[key].displayName.toLowerCase().includes(command)
        );
        const matchingSubs: string[] = [];
        for (const catKey of Object.keys(structuredSymptoms)) {
          if (structuredSymptoms[catKey].subCategories) {
            Object.keys(structuredSymptoms[catKey].subCategories!).forEach(subKey => {
              if (subKey.toLowerCase().startsWith(command) || structuredSymptoms[catKey].subCategories![subKey].displayName.toLowerCase().includes(command)) {
                matchingSubs.push(subKey);
              }
            });
          }
        }
        const categories = allSearchableItems.filter(item =>
          (item.type === 'category' && matchingCategories.includes(item.key)) ||
          (item.type === 'subCategory' && matchingSubs.includes(item.key))
        );
        return {
          symptoms: [],
          categories,
          scope: '',
          subScope: '',
        };
      } else {
        // Has space, find exact match for scope
        let matchedCategoryKey = Object.keys(structuredSymptoms).find(key => key.toLowerCase() === command.toLowerCase());
        let matchedSubKey = '';
        if (!matchedCategoryKey) {
          // Check if it's a subCategory key
          for (const catKey of Object.keys(structuredSymptoms)) {
            if (structuredSymptoms[catKey].subCategories) {
              const subKey = Object.keys(structuredSymptoms[catKey].subCategories!).find(sub => sub.toLowerCase() === command.toLowerCase());
              if (subKey) {
                matchedCategoryKey = catKey;
                matchedSubKey = subKey;
                break;
              }
            }
          }
        }
        if (matchedCategoryKey) {
          scope = matchedCategoryKey;
          subScope = matchedSubKey;
          sQuery = parts.slice(1).join(' ').toLowerCase();
        }
      }
    }

    if (!sQuery) {
      // If only a scope is typed , show all symptoms for that scope
      if (scope) {
        let symptoms;
        if (subScope) {
          symptoms = allSearchableItems.filter(item => item.type === 'symptom' && item.categoryKey === scope && item.subCategoryKey === subScope);
        } else {
          symptoms = allSearchableItems.filter(item => item.type === 'symptom' && item.categoryKey === scope);
        }
        return { symptoms, categories: [], scope, subScope };
      }
      return { symptoms: [], categories: [], scope: '', subScope: '' };
    }

    const results = allSearchableItems.filter(item => {
      const isMatch = item.displayName.toLowerCase().includes(sQuery);
      if (scope) {
        if (subScope) {
          return isMatch && item.categoryKey === scope && item.subCategoryKey === subScope;
        }
        return isMatch && item.categoryKey === scope;
      }
      return isMatch;
    });

    return {
      symptoms: results.filter(item => item.type === 'symptom'),
      categories: results.filter(item => item.type !== 'symptom'),
      scope,
      subScope,
    };
  }, [search]);

  useEffect(() => {
    if (filteredResults.scope) {
      const params: Record<string, string | null> = { category: filteredResults.scope };
      if (filteredResults.subScope) {
        params.subCategory = filteredResults.subScope;
      } else if (!structuredSymptoms[filteredResults.scope]?.subCategories) {
        params.subCategory = filteredResults.scope;
      }
      navigate(params);
    }
  }, [filteredResults.scope, filteredResults.subScope]);

  return (
    <div className="w-full">
      <Command shouldFilter={false} className="relative rounded-lg border bg-background overflow-visible">
        <div className='flex-center-2 relative'>
          {filteredResults.scope && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Badge variant="secondary">
                {(filteredResults.subScope
                  ? structuredSymptoms[filteredResults.scope].subCategories![filteredResults.subScope].displayName
                  : structuredSymptoms[filteredResults.scope].displayName).replace(/ symptoms$/i, '')}
              </Badge>
            </div>
          )}
          <CommandInput
            placeholder={filteredResults.scope ? "Search within category..." : "Type a command or search..."}
            value={search}
            onValueChange={setSearch}
          />
        </div>
        {search && (
          <CommandList className="absolute top-11 w-full rounded-md border bg-background shadow-lg z-10">
            <CommandEmpty>No results found. Searched for {search}.<br /> {filteredResults.categories.length} categories, {filteredResults.symptoms.length} symptoms</CommandEmpty>

            {filteredResults.categories.length > 0 && (
              <CommandGroup heading="Go to...">
                {filteredResults.categories.map(item => (
                  <CommandItem key={`${item.type}-${item.key}`} onSelect={() => handleSelect(item)} className="cursor-pointer flex-col items-start gap-0 sm:flex-row sm:items-center sm:gap-2">
                    <span>{item.displayName}</span>
                    {item.path && <span className="text-xs text-muted-foreground max-sm:mr-auto sm:ml-auto">{item.path}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredResults.symptoms.length > 0 && (
              <CommandGroup heading="Symptoms">
                {filteredResults.symptoms.map(item => (
                  <CommandItem key={item.key} onSelect={() => handleSelect(item)} className="flex justify-between items-center cursor-pointer">
                    <div className="flex flex-col">
                      <span className="capitalize">{item.displayName.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-muted-foreground">{item.path}</span>
                    </div>
                    <Checkbox checked={isSymptomSelected(item.key)} className="ml-4" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </Command>

      {/* Selected symptoms quick-list */}
      {selectedArray.length > 0 && (
        <div className="mt-4">
          <div className="border-t my-2" />
          <div className="space-y-2">
            {selectedArray.map(symptom => {
              const item = allSearchableItems.find(i => i.type === 'symptom' && i.key === symptom);
              return (
                <div key={symptom} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                  <div className="flex flex-col gap-0">
                    <span className="font-medium text-sm capitalize">{symptom.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-muted-foreground">{item?.path || ''}</span>
                  </div>
                  <Button variant="ghost" onClick={() => removeSymptom(symptom)} className="ml-4">
                    <XIcon />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4">
        {{
          main: renderMainPanel(),
          category: renderCategoryPanel(),
          symptoms: renderSymptomPanel(),
        }[activePanel]}
      </div>
    </div>
  );
}