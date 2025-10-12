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
import { X } from 'lucide-react'

interface Allergy {
  name: string
  description?: string
}

interface AllergyGroups {
  food: Allergy[]
  medical: Allergy[]
  environmental: Allergy[]
  contact: Allergy[]
}

export default function AllergiesEditor({ name = 'profile.allergies' }: { name?: string }) {
  const { setValue, getValues } = useFormContext()
  const [allergies, setAllergies] = useState<Allergy[]>([])

  useEffect(() => {
    setAllergies((getValues(name) as Allergy[]) || [])
  }, [getValues, name])
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [allergyGroups, setAllergyGroups] = useState<AllergyGroups>({
    food: [],
    medical: [],
    environmental: [],
    contact: [],
  })

  useEffect(() => {
    if (search.trim()) {
      fetch(`/api/v1/allergies?q=${encodeURIComponent(search)}`)
        .then(res => res.json())
        .then(response => setAllergyGroups(response.data || response))
        .catch(console.error)
    } else {
      // Fetch all if no search
      fetch('/api/v1/allergies')
        .then(res => res.json())
        .then(response => setAllergyGroups(response.data || response))
        .catch(console.error)
    }
  }, [search])

  const addAllergy = (allergy: Allergy) => {
    const newValue = [...allergies, allergy]
    setAllergies(newValue)
    setValue(name, newValue)
    setOpen(false)
    setSearch('')
  }

  const removeAllergy = (index: number) => {
    console.log('Removing allergy at index:', index)
    const newValue = allergies.filter((_: Allergy, i: number) => i !== index)
    setAllergies(newValue)
    setValue(name, newValue)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {allergies.map((allergy: Allergy, index: number) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
            {allergy.name}
            <Button type="button" variant={'ghost'} onClick={() => removeAllergy(index)} className="ml-1 hover:bg-muted rounded !p-0.5 h-min z-10">
              <X className="!size-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <Credenza open={open} onOpenChange={setOpen}>
        <CredenzaTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            Add Allergy
          </Button>
        </CredenzaTrigger>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>Select Allergy</CredenzaTitle>
          </CredenzaHeader>
          <CredenzaBody>
            <Command>
              <CommandInput
                placeholder="Search allergies by name..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                <CommandEmpty>No allergies found.</CommandEmpty>
                {Object.entries(allergyGroups).map(([category, items]) => (
                  <CommandGroup key={category} heading={category.charAt(0).toUpperCase() + category.slice(1)}>
                    {items.map((allergy: Allergy, index: number) => (
                      <CommandItem
                        key={`${category}-${index}`}
                        onSelect={() => addAllergy(allergy)}
                      >
                        {allergy.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </CredenzaBody>
        </CredenzaContent>
      </Credenza>
    </div>
  )
}
