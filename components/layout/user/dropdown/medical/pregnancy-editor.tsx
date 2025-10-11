"use client"

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'

export default function PregnancyEditor({ name = 'profile.pregnancy' }: { name?: string }) {
  const { register, setValue, getValues } = useFormContext()

  const value = getValues().profile?.pregnancy ?? { status: 'unknown', dueDate: null }

  return (
    <div className="grid grid-cols-2 gap-4">
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

      <FormItem>
        <FormLabel>Due date</FormLabel>
        <FormControl>
          <Calendar mode="single" selected={value?.dueDate ? new Date(value.dueDate) : undefined} onSelect={(d: any) => setValue(`${name}.dueDate` as const, d ? d.toISOString() : null)} />
        </FormControl>
      </FormItem>
    </div>
  )
}
