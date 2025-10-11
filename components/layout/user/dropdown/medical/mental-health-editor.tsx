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

interface MentalDisorder {
  disorder_name: string
  abbreviation?: string
}

interface MentalHealthGroups {
  [category: string]: MentalDisorder[]
}

export default function MentalHealthEditor({ name = 'profile.mentalHealth.diagnoses' }: { name?: string }) {
  const { setValue, getValues } = useFormContext()
  const [diagnoses, setDiagnoses] = useState<MentalDisorder[]>([])
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [mentalGroups, setMentalGroups] = useState<MentalHealthGroups>({})

  useEffect(() => {
    setDiagnoses((getValues(name) as MentalDisorder[]) || [])
  }, [getValues, name])

  useEffect(() => {
    if (search.trim()) {
      fetch(`/api/mental-health?q=${encodeURIComponent(search)}`)
        .then(res => res.json())
        .then(setMentalGroups)
        .catch(console.error)
    } else {
      // Fetch all if no search
      fetch('/api/mental-health')
        .then(res => res.json())
        .then(setMentalGroups)
        .catch(console.error)
    }
  }, [search])

  const addDiagnosis = (diagnosis: MentalDisorder) => {
    const newValue = [...diagnoses, diagnosis]
    setDiagnoses(newValue)
    setValue(name, newValue)
    setOpen(false)
    setSearch('')
  }

  const removeDiagnosis = (index: number) => {
    const newValue = diagnoses.filter((_: MentalDisorder, i: number) => i !== index)
    setDiagnoses(newValue)
    setValue(name, newValue)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {diagnoses.map((diagnosis: MentalDisorder, index: number) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
            {diagnosis.disorder_name} {diagnosis.abbreviation && `(${diagnosis.abbreviation})`}
            <Button type="button" variant={'ghost'} onClick={() => removeDiagnosis(index)} className="ml-1 hover:bg-muted rounded !p-0.5 h-min z-10">
              <X className="!size-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <Credenza open={open} onOpenChange={setOpen}>
        <CredenzaTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            Add Mental Health Condition
          </Button>
        </CredenzaTrigger>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>Select Mental Health Condition</CredenzaTitle>
          </CredenzaHeader>
          <CredenzaBody>
            <Command>
              <CommandInput
                placeholder="Search mental health conditions..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                <CommandEmpty>No conditions found.</CommandEmpty>
                {Object.entries(mentalGroups).map(([category, items]) => (
                  <CommandGroup key={category} heading={category}>
                    {items.map((disorder: MentalDisorder, index: number) => (
                      <CommandItem
                        key={`${category}-${index}`}
                        onSelect={() => addDiagnosis(disorder)}
                      >
                        {disorder.disorder_name} {disorder.abbreviation && `(${disorder.abbreviation})`}
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
