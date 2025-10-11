"use client"

import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { X, Plus } from 'lucide-react'

export default function FamilyHistoryEditor({ name = 'profile.familyHistory' }: { name?: string }) {
  const { control, register } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name })

  return (
    <div>
      <div className="flex flex-col gap-2">
        {fields.map((f, idx) => (
          <div key={f.id} className="flex items-center gap-2">
            <FormItem className="flex-1">
              <FormLabel>Relation</FormLabel>
              <FormControl>
                <Input {...register(`${name}.${idx}.relation` as const)} placeholder="mother, father, sibling" />
              </FormControl>
            </FormItem>
            <FormItem className="flex-1">
              <FormLabel>Condition</FormLabel>
              <FormControl>
                <Input {...register(`${name}.${idx}.name` as const)} placeholder="Condition name" />
              </FormControl>
            </FormItem>
            <FormItem className="w-28">
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input {...register(`${name}.${idx}.ageAtOnset` as const)} placeholder="age" />
              </FormControl>
            </FormItem>

            <Button variant="ghost" size="icon" onClick={() => remove(idx)} aria-label="Remove">
              <X />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-2">
        <Button onClick={() => append({ relation: '', name: '', ageAtOnset: null })} size="sm">
          <Plus className="mr-2" /> Add family history
        </Button>
      </div>
    </div>
  )
}
