"use client"

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function PregnancyEditor({ name = 'profile.pregnancy' }: { name?: string }) {
  const { register, setValue, getValues } = useFormContext()

  const value = getValues().profile?.pregnancy ?? { status: 'unknown', dueDate: null }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <FormItem>
        <FormLabel>Status</FormLabel>
        <FormControl>
          <Select value={value?.status ?? 'unknown'} onValueChange={(v) => setValue(`${name}.status` as const, v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pregnant">Pregnant</SelectItem>
              <SelectItem value="not_pregnant">Not pregnant</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </FormControl>
      </FormItem>

      <FormItem className="flex flex-col">
        <FormLabel>Due date</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start items-center text-left font-normal",
                  !value?.dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                {value?.dueDate ? (
                  format(new Date(value.dueDate), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value?.dueDate ? new Date(value.dueDate) : undefined}
              onSelect={(date) => setValue(`${name}.dueDate` as const, date ? date.toISOString() : null)}
            />
          </PopoverContent>
        </Popover>
      </FormItem>
    </div>
  )
}
