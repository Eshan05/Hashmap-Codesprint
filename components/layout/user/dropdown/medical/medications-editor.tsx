"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from '@/components/ui/credenza'
import { useFormContext } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { ListOrderedIcon, PillBottleIcon, TextCursorInputIcon, X } from 'lucide-react'
import Link from 'next/link'

interface Medication {
  brand_name?: string
  generic_name?: string
  pharm_class?: string[]
}

export default function MedicationsEditor({ name = 'profile.medications' }: { name?: string }) {
  const { setValue, getValues } = useFormContext()
  const [medications, setMedications] = useState<Medication[]>([])

  useEffect(() => {
    setMedications((getValues(name) as Medication[]) || [])
  }, [getValues, name])
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [availableMeds, setAvailableMeds] = useState<Medication[]>([])

  useEffect(() => {
    if (search.trim()) {
      fetch(`/api/medications?q=${encodeURIComponent(search)}`)
        .then(res => res.json())
        .then(response => setAvailableMeds(response.data || response))
        .catch(console.error)
    } else {
      setAvailableMeds([])
    }
  }, [search])

  const addMedication = (med: Medication) => {
    const newValue = [...medications, med]
    setMedications(newValue)
    setValue(name, newValue)
    setOpen(false)
    setSearch('')
  }

  const removeMedication = (index: number) => {
    const newValue = medications.filter((_: Medication, i: number) => i !== index)
    setMedications(newValue)
    setValue(name, newValue)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {medications.map((med: Medication, index: number) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
            {med.brand_name || med.generic_name || 'Unknown'}
            <Button type="button" variant={'ghost'} onClick={(e) => { removeMedication(index); }} className="ml-1 hover:bg-muted rounded !p-0.5 h-min z-10">
              <X className="!size-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <Credenza open={open} onOpenChange={setOpen}>
        <CredenzaTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            Add Medication
          </Button>
        </CredenzaTrigger>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>Select Medication</CredenzaTitle>
          </CredenzaHeader>
          <CredenzaBody>
            <Command>
              <CommandInput
                placeholder="Search medications by brand name..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandList className='no-scrollbar'>
                <CommandEmpty>No medications found.</CommandEmpty>
                <CommandGroup>
                  {availableMeds.map((med, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => addMedication(med)}
                    >
                      <div className="flex gap-4 w-full">
                        <span className="flex h-9 w-9 items-center aspect-square justify-center rounded-xl bg-muted"><PillBottleIcon className="size-4" /></span>
                        <div className="flex flex-col gap-1">
                          <Link href={`/medicine/name/${med.brand_name}`} className="flex-center-2 capitalize text-primary"><TextCursorInputIcon />{med.brand_name || med.generic_name || 'Unknown'}</Link>
                          <div className='capitalize w-80 truncate text-sm flex-center-1 text-muted-foreground'><ListOrderedIcon className="size-3" />{med.generic_name || 'Unknown'}</div>
                          <div className='flex-center-1 flex-wrap'>
                            {med.pharm_class?.map((cls, clsIndex) => (
                              <Badge key={clsIndex} variant="outline" className="text-xs">
                                <span className='max-w-80 truncate'>{cls}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </CredenzaBody>
        </CredenzaContent>
      </Credenza>
    </div>
  )
}
