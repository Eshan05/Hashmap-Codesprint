'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Thermometer, Pill, AlertTriangle, FlaskConical, Repeat } from 'lucide-react';
import React from 'react';

const items = [
  {
    id: 'disease',
    title: 'Disease / Condition',
    icon: Thermometer,
    description: 'Search by disease or condition to find recommended medicines, common treatments, and typical dosages.',
    collapsibles: [
      {
        title: 'Example prompts',
        content: `"What medicines are commonly prescribed for type 2 diabetes?"\n"First-line treatments for acute otitis media"\n"Drugs used to manage hypertension in adults"`,
      },
      {
        title: 'Follow-ups to try',
        content: `"What are typical dosages and frequency?"\n"Any major contraindications?"`,
      },
    ],
  },
  {
    id: 'name',
    title: 'Medicine by Name',
    icon: Pill,
    description: 'Look up a specific medicine to see indications, common side effects, interactions, and brand/generic names.',
    collapsibles: [
      {
        title: 'Example prompts',
        content: `"Information on amoxicillin"\n"What is paracetamol used for?"\n"Compare atorvastatin vs simvastatin"`,
      },
      {
        title: 'Follow-ups to try',
        content: `"What are common adverse reactions?"\n"Does it require dose adjustment in renal impairment?"`,
      },
    ],
  },
  {
    id: 'sideEffects',
    title: 'Side Effects / Adverse Reactions',
    icon: AlertTriangle,
    description: 'Search by side effect to find medicines that commonly cause it and possible alternatives.',
    collapsibles: [
      {
        title: 'Example prompts',
        content: `"Which drugs commonly cause dizziness?"\n"Medications associated with dry cough"\n"Drugs linked to photosensitivity reactions"`,
      },
      {
        title: 'Follow-ups to try',
        content: `"What are safer alternatives?"\n"How should this side effect be managed?"`,
      },
    ],
  },
  {
    id: 'ingredient',
    title: 'Ingredient / Active Substance',
    icon: FlaskConical,
    description: 'Find medicines that contain a specific active ingredient and view brand equivalents.',
    collapsibles: [
      {
        title: 'Example prompts',
        content: `"List drugs containing metformin"\n"Which OTC products contain ibuprofen?"`,
      },
      {
        title: 'Follow-ups to try',
        content: `"Generic vs brand-name examples"\n"Typical dosing ranges"`,
      },
    ],
  },
  {
    id: 'similar',
    title: 'Find Similar Medicines',
    icon: Repeat,
    description: 'Get alternatives or therapeutically equivalent medicines to a given drug.',
    collapsibles: [
      {
        title: 'Example prompts',
        content: `"Alternatives to lisinopril"\n"Drugs similar to cetirizine for allergies"`,
      },
      {
        title: 'Follow-ups to try',
        content: `"How do their side-effect profiles compare?"\n"Cost or availability differences"`,
      },
    ],
  },
];

export function ModeDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isDrawerOpen = searchParams.has('panel') && searchParams.get('panel') === 'mode';

  const createQueryString = (params: Record<string, string | null>): string => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    }
    if (!newSearchParams.get('panel')) {
      newSearchParams.delete('category');
      newSearchParams.delete('subCategory');
    }
    return newSearchParams.toString();
  };

  const handleOpenChange = (open: boolean) => {
    const newQueryString = createQueryString({ panel: open ? 'mode' : null });
    router.push(`${pathname}${newQueryString ? `?${newQueryString}` : ''}`);
  };

  return (
    <Drawer
      direction="right"
      shouldScaleBackground
      open={isDrawerOpen}
      onOpenChange={handleOpenChange}
    >
      <DrawerTrigger asChild>
        <Button size="none" type="button" variant="link">here</Button>
      </DrawerTrigger>
      <DrawerContent className="max-w-sm h-full flex flex-col">
        <DrawerHeader>
          <DrawerTitle className=''>Search Modes</DrawerTitle>
          <DrawerDescription className=''>Choose a mode to see example prompts and tips for better queries.</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <Accordion type="multiple" className="w-full">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <AccordionItem key={item.id} value={item.id} className="has-focus-visible:border-ring has-focus-visible:ring-ring/50 outline-none has-focus-visible:ring-[3px]">
                  <AccordionTrigger className="justify-start gap-3 text-xl leading-6 font-semibold outline-none hover:no-underline [&>svg]:hidden">
                    <span className="flex items-center gap-3">
                      {Icon ? <Icon className="h-4 w-4 opacity-60" /> : <span className="opacity-60">{item.title.slice(0, 1)}</span>}
                      <span>{item.title}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    {item.description && <div className="px-4 pb-2 text-sm text-muted-foreground">{item.description}</div>}
                    {item.collapsibles?.map((collapsible, idx) => (
                      <Collapsible key={idx} className="border-t py-2 ps-6 pe-4">
                        <CollapsibleTrigger className="flex gap-2 text-lg leading-6 font-semibold [&[data-state=open]>svg]:rotate-180">
                          <ChevronDown className="mt-1 h-4 w-4 shrink-0 opacity-60 transition-transform duration-200" />
                          <span className="flex items-center gap-3">
                            <span className="opacity-60">•</span>
                            <span className='font-light'>{collapsible.title}</span>
                          </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="text-muted-foreground data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down mt-1 overflow-hidden ps-6 text-sm transition-all">
                          {collapsible.content}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
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