'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { SymptomSelector } from './symptom-selector';
import { Button } from '@/components/ui/button';
import { useSymptomStore } from '@/lib/store/symptom-select-store';
import { useEffect } from 'react';

export function SymptomDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCount = useSymptomStore((state) => state.selectedSymptoms.size);

  const isDrawerOpen = searchParams.has('panel');

  useEffect(() => {
    if (!searchParams.has('panel') && isDrawerOpen) {
      // Logic to handle external closing if needed, but onOpenChange is primary
    }
  }, [searchParams, isDrawerOpen]);


  // Helper to safely manipulate query strings without losing existing ones
  const createQueryString = (params: Record<string, string | null>): string => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    }
    // Clean up any empty params
    if (!newSearchParams.get('category')) newSearchParams.delete('subCategory');
    if (!newSearchParams.get('panel')) {
      newSearchParams.delete('category');
      newSearchParams.delete('subCategory');
    }
    return newSearchParams.toString();
  };

  const handleOpenChange = (open: boolean) => {
    const newQueryString = createQueryString({ panel: open ? 'open' : null });
    router.push(`${pathname}?${newQueryString}`);
  };

  return (
    <Drawer
      direction="left"
      shouldScaleBackground
      open={isDrawerOpen}
      onOpenChange={handleOpenChange}
    >
      <DrawerTrigger asChild>
        <Button type="button" variant={'secondary'} className="relative">
          Select from List
          {selectedCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
              {selectedCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-w-sm h-full flex flex-col">
        <DrawerHeader>
          <DrawerTitle className='text-lg font-semibold'>Select Symptoms</DrawerTitle>
          <DrawerDescription className='text-sm text-muted-foreground'>
            Browse categories or search for specific symptoms.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-grow overflow-y-auto px-4">
          <SymptomSelector
            category={searchParams.get('category')}
            subCategory={searchParams.get('subCategory')}
          />
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}