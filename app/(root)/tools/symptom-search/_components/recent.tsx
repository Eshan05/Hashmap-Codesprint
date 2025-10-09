"use client"

import { format } from 'date-fns'

import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { RecentSearch } from "@/types/recent-search"
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Clock, ExternalLink, HeartPulse, PersonStandingIcon } from 'lucide-react'

interface RecentProps {
  items: RecentSearch[]
}

export default function Recent({ items }: RecentProps) {
  if (!items || items.length === 0) return null
  // Group items by formatted date
  const groups = items.reduce<Record<string, RecentSearch[]>>((acc, cur) => {
    let key: string
    try {
      key = format(new Date(cur.createdAt), 'MMM d, yyyy')
    } catch (e) {
      key = new Date(cur.createdAt).toLocaleDateString()
    }

    if (!acc[key]) acc[key] = []
    acc[key].push(cur)
    return acc
  }, {})

  // Sort groups by date descending
  const groupEntries = Object.entries(groups).sort((a, b) => {
    const aDate = new Date(a[1][0].createdAt).getTime()
    const bDate = new Date(b[1][0].createdAt).getTime()
    return bDate - aDate
  })

  return (
    <Timeline defaultValue={groupEntries.length || 1}>
      {groupEntries.map(([dateLabel, groupItems], gIndex) => (
        <TimelineItem key={dateLabel} step={gIndex + 1}>
          <TimelineHeader>
            <TimelineSeparator />
            <TimelineDate className='flex-center-2'>{dateLabel} <Badge className='py-0'>{groupItems.length > 1 ? `${groupItems.length} searches` : '1 search'}</Badge></TimelineDate>
            <TimelineTitle className='sr-only'></TimelineTitle>
            <TimelineIndicator />
          </TimelineHeader>
          <TimelineContent>
            {groupItems.length > 3 ? (
              <Collapsible>
                <div className="space-y-2">
                  {groupItems.slice(0, 2).map((item, idx) => (
                    <div key={item.searchId || idx} className="flex flex-col items-start justify-between p-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.title || 'Untitled'}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{item.symptoms}</div>
                      </div>
                      <div className="ml-3 text-xs text-muted-foreground">{format(new Date(item.createdAt), 'HH:mm')}</div>
                    </div>
                  ))}

                  <CollapsibleTrigger className="w-full text-left text-sm text-primary mt-1">Show {groupItems.length - 2} more</CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-2 mt-2">
                      {groupItems.slice(2).map((item, idx) => (
                        <div key={item.searchId || idx} className="flex flex-col items-start justify-between p-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium">{item.title || 'Untitled'}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">{item.symptoms}</div>
                          </div>
                          <div className="ml-3 text-xs text-muted-foreground">{format(new Date(item.createdAt), 'HH:mm')}</div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ) : (
              <div className="space-y-2">
                {groupItems.map((item, idx) => (
                  <div key={item.searchId || idx} className="flex flex-col items-start justify-between p-2">
                    <div className="flex-1">
                      <Link href={`/tools/symptom-search/${item.searchId}`} className="text-sm font-medium underline text-primary flex-center-1"><ExternalLink className="inline shrink-0 size-3" /> {item.title || 'Untitled'} </Link>
                      <div className="text-xs text-muted-foreground flex-center-1 line-clamp-1">
                        <HeartPulse className="inline w-3 h-3" />
                        {item.symptoms.charAt(0).toUpperCase() + item.symptoms.slice(1)}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground flex-center-1">
                      <Clock className="inline w-3 h-3" />
                      {format(new Date(item.createdAt), 'HH:mm')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )
}
