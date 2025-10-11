"use client"

import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { X, Plus } from 'lucide-react'

export default function AllergiesEditor({ name = 'profile.allergies' }: { name?: string }) {
  const { control, register } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name })

  return (
    <div>
      {fields.map((f, idx) => (
        <div key={f.id} className="flex items-center gap-2">
          <FormItem className="flex-1">
            <FormLabel>Substance</FormLabel>
            <FormControl>
              <Input {...register(`${name}.${idx}.name` as const)} placeholder="Allergen name" />
            </FormControl>
          </FormItem>

          <FormItem className="w-36">
            <FormLabel>Severity</FormLabel>
            <FormControl>
              <Input {...register(`${name}.${idx}.severity` as const)} placeholder="mild/moderate/severe" />
            </FormControl>
          </FormItem>

          <FormItem className="w-28">
            <FormLabel>Confirmed</FormLabel>
            <FormControl>
              <Input {...register(`${name}.${idx}.confirmed` as const)} placeholder="true/false" />
            </FormControl>
          </FormItem>

          <Button variant="ghost" size="icon" onClick={() => remove(idx)} aria-label="Remove">
            <X />
          </Button>
        </div>
      ))}

      <div className="mt-2">
        <Button onClick={() => append({ substanceCode: '', name: '', severity: 'unknown', confirmed: false })} size="sm">
          <Plus className="mr-2" /> Add allergy
        </Button>
      </div>
    </div>
  )
}
