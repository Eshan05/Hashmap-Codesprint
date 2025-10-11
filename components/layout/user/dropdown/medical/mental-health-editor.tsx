"use client"

import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { X, Plus } from 'lucide-react'

export default function MentalHealthEditor({ name = 'profile.mentalHealth.diagnoses' }: { name?: string }) {
  const { control, register, setValue, getValues } = useFormContext()
  const base = name.split('.').slice(0, 2).join('.') // 'profile.mentalHealth'

  const diagnosesName = name
  const mh = getValues().profile?.mentalHealth ?? { diagnoses: [], isUnderCare: false }

  const { fields, append, remove } = useFieldArray({ control, name: diagnosesName })

  return (
    <div>
      <div className="flex items-center gap-2">
        <FormItem className="flex-1">
          <FormLabel>Is under care</FormLabel>
          <FormControl>
            <Input {...register(`${base}.isUnderCare` as const)} placeholder="true/false" />
          </FormControl>
        </FormItem>
      </div>

      <div className="mt-2 space-y-2">
        {fields.map((f, idx) => (
          <div key={f.id} className="flex items-center gap-2">
            <FormItem className="flex-1">
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input {...register(`${diagnosesName}.${idx}.code` as const)} placeholder="diagnosis code" />
              </FormControl>
            </FormItem>
            <FormItem className="flex-1">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...register(`${diagnosesName}.${idx}.name` as const)} placeholder="diagnosis name" />
              </FormControl>
            </FormItem>
            <Button variant="ghost" size="icon" onClick={() => remove(idx)}>
              <X />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-2">
        <Button onClick={() => append({ code: '', name: '' })} size="sm"><Plus className="mr-2" />Add diagnosis</Button>
      </div>
    </div>
  )
}
