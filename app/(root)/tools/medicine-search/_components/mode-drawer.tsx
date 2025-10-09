'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { IoChevronDown } from 'react-icons/io5';
import React from 'react';

const items = [
  {
    id: '1',
    title: 'Aliases and Tags',
    icon: 'command',
    description: 'Learn about aliases and tags',
    collapsibles: [
      {
        title: 'Aliases',
        content: 'Alternative short URLs that redirect to the same destination. Useful for branding or multiple access points.',
        icon: 'link',
      },
      {
        title: 'Tags',
        content: 'Labels to categorize and organize your links for easier management and analytics.',
        icon: 'tag',
      },
    ],
  },
  {
    id: '2',
    title: 'Password Protection',
    icon: 'lock',
    description: 'Secure your link with a password. They will first be redirected to the password page, they must enter the correct password to access the destination URL.',
    collapsibles: [],
  },
  {
    id: '3',
    title: 'UTM Parameters',
    icon: 'target',
    description: 'UTM parameters are tags added to URLs to track the effectiveness of marketing campaigns. They help identify traffic sources in analytics tools like Google Analytics.',
    collapsibles: [
      {
        title: 'Source',
        content: 'Identifies the advertiser, site, publication, ... (EX: Google, newsletter)',
        icon: 'globe',
      },
      {
        title: 'Medium',
        content: 'Identifies the marketing medium (EX: SEO, CPC, Banner, Email)',
        icon: 'satellite-radar',
      },
    ],
    link: {
      url: 'https://support.google.com/analytics/answer/1033863',
      text: 'Learn more about UTM parameters',
    },
    note: undefined,
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
          <DrawerTitle className=''>Configuring Special Links</DrawerTitle>
          <DrawerDescription className=''>
            Learn about the various options available for creating special links.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <Accordion type="multiple" className="w-full">
            {items.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="has-focus-visible:border-ring has-focus-visible:ring-ring/50 outline-none has-focus-visible:ring-[3px]">
                <AccordionTrigger className="justify-start gap-3 text-xl leading-6 font-semibold outline-none hover:no-underline [&>svg]:hidden">
                  <span className="flex items-center gap-3">
                    {/* simple icon placeholder */}
                    <span className="opacity-60">{item.title.slice(0, 1)}</span>
                    <span>{item.title}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  {item.description && <div className="px-4 pb-2 text-sm text-muted-foreground">{item.description}</div>}
                  {item.collapsibles?.map((collapsible, idx) => (
                    <Collapsible key={idx} className="border-t py-2 ps-6 pe-4">
                      <CollapsibleTrigger className="flex gap-2 text-lg leading-6 font-semibold [&[data-state=open]>svg]:rotate-180">
                        <IoChevronDown className="mt-1 size-4 shrink-0 opacity-60 transition-transform duration-200" />
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
                  {item.note && <div className="px-4 py-2 text-xs text-muted-foreground border-t">{item.note}</div>}
                  {item.link && (
                    <div className="px-4 py-2 text-xs text-muted-foreground border-t">
                      <a href={item.link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {item.link.text}
                      </a>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
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
