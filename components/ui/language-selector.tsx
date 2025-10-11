"use client"

import * as React from "react"
import Link from "next/link"
import { Popover, PopoverTrigger, PopoverContent } from "./popover"
import { ScrollArea } from "./scroll-area"
import { Button } from "@/components/ui/button"
import { HiOutlineTranslate } from "react-icons/hi";

const LANGUAGES: { code: string; native: string; latin: string }[] = [
  { code: "en", native: "English", latin: "English" },
  { code: "es", native: "Español", latin: "Spanish" },
  { code: "fr", native: "Français", latin: "French" },
  { code: "de", native: "Deutsch", latin: "German" },
  { code: "zh", native: "中文", latin: "Chinese" },
  { code: "ja", native: "日本語", latin: "Japanese" },
  { code: "ru", native: "Русский", latin: "Russian" },
  { code: "pa", native: "ਪੰਜਾਬੀ", latin: "Punjabi" },
  { code: "hi", native: "हिन्दी", latin: "Hindi" },
]

export default function LanguageSelector() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={'outline'} size={'icon'}>
          <HiOutlineTranslate />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-50 p-1.5">
        <ScrollArea className="">
          <div className="flex flex-col">
            {LANGUAGES.map((l) => (
              <Button key={l.code} variant={'ghost'} className="flex justify-between px-2 py-1">
                <div>{l.native}</div>
                <div className="text-muted-foreground">{`(${l.latin})`}</div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
