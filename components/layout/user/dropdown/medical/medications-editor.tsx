"use client"

import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { X, Plus } from 'lucide-react'

export default function MedicationsEditor({ name = 'profile.medications' }: { name?: string }) {
  const { control, register } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name })

  return (
    <div>
      {fields.map((f, idx) => (
        <div key={f.id} className="flex items-center gap-2">
          <FormItem className="flex-1">
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...register(`${name}.${idx}.name` as const)} placeholder="Medication name" />
            </FormControl>
          </FormItem>

          <FormItem className="flex-1">
            <FormLabel>RxNorm</FormLabel>
            <FormControl>
              <Input {...register(`${name}.${idx}.rxNorm` as const)} placeholder="RxNorm code" />
            </FormControl>
          </FormItem>

          <FormItem className="w-40">
            <FormLabel>Dosage</FormLabel>
            <FormControl>
              <Input {...register(`${name}.${idx}.dosage` as const)} placeholder="Dosage" />
            </FormControl>
          </FormItem>

          <FormItem className="w-28">
            <FormLabel>Current</FormLabel>
            <FormControl>
              <Input {...register(`${name}.${idx}.current` as const)} placeholder="true/false" />
            </FormControl>
          </FormItem>

          <Button variant="ghost" size="icon" onClick={() => remove(idx)} aria-label="Remove">
            <X />
          </Button>
        </div>
      ))}

      <div className="mt-2">
        <Button onClick={() => append({ name: '', rxNorm: '', dosage: '', current: false })} size="sm">
          <Plus className="mr-2" /> Add medication
        </Button>
      </div>
    </div>
  )
}
