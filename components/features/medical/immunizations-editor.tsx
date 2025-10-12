"use client"

import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { X, Plus } from 'lucide-react'

export default function ImmunizationsEditor({ name = 'profile.immunizations' }: { name?: string }) {
  const { control, register } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name })

  return (
    <div>
      {fields.map((f, idx) => (
        <div key={f.id} className="flex items-center gap-2">
          <FormItem className="flex-1">
            <FormLabel>Code</FormLabel>
            <FormControl>
              <Input {...register(`${name}.${idx}.code` as const)} placeholder="Immunization code" />
            </FormControl>
          </FormItem>

          <FormItem className="flex-1">
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...register(`${name}.${idx}.name` as const)} placeholder="Vaccine name" />
            </FormControl>
          </FormItem>

          <FormItem className="w-40">
            <FormLabel>Date</FormLabel>
            <FormControl>
              <Input {...register(`${name}.${idx}.date` as const)} placeholder="YYYY-MM-DD" />
            </FormControl>
          </FormItem>

          <Button variant="ghost" size="icon" onClick={() => remove(idx)} aria-label="Remove">
            <X />
          </Button>
        </div>
      ))}

      <div className="mt-2">
        <Button onClick={() => append({ code: '', name: '', date: '' })} size="sm">
          <Plus className="mr-2" /> Add immunization
        </Button>
      </div>
    </div>
  )
}
