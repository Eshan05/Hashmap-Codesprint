"use client"

import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { X, Plus, HeartPulseIcon, PersonStandingIcon } from 'lucide-react'
import { MdOutlineFamilyRestroom } from 'react-icons/md'

export default function FamilyHistoryEditor({ name = 'profile.familyHistory' }: { name?: string }) {
  const { control, register } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name })

  return (
    <div>
      <div className="flex flex-col gap-2">
        {fields.map((f, idx) => (
          <div key={f.id} className="flex items-start gap-2 p-1">
            <div className='flex flex-col items-center flex-1 gap-2'>
              <FormItem className="w-full">
                <FormLabel>Relation, Condition, Age</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input {...register(`${name}.${idx}.relation` as const)} placeholder="Mother / Father / Brother / Grandma" className='w-full ps-9' />
                    <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                      <MdOutlineFamilyRestroom size={16} aria-hidden="true" />
                    </div>
                  </div>
                </FormControl>
              </FormItem>
              <FormItem className="w-full">
                {/* <FormLabel>Condition</FormLabel> */}
                <FormControl>
                  <div className="relative">
                    <Input {...register(`${name}.${idx}.name` as const)} placeholder="Condition name" className='w-full ps-9' />
                    <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                      <HeartPulseIcon size={16} aria-hidden="true" />
                    </div>
                  </div>
                </FormControl>
              </FormItem>
              <FormItem className='w-full'>
                {/* <FormLabel>Age</FormLabel> */}
                <FormControl>
                  <div className="relative">

                    <Input {...register(`${name}.${idx}.ageAtOnset` as const)} placeholder="Age (Number)" className='w-full ps-9' />
                    <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                      <PersonStandingIcon size={16} aria-hidden="true" />
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            </div>
            <div className='flex-0 w-max'>
              <Button variant="ghost" className='' size="icon" onClick={() => remove(idx)} aria-label="Remove">
                <X />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2">
        <Button onClick={() => append({ relation: '', name: '', ageAtOnset: null })} size="sm">
          <Plus className="mr-2" /> Add family history
        </Button>
      </div>
    </div >
  )
}
