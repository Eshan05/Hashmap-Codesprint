'use client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { SymptomDrawer } from '@/app/(root)/tools/symptom-search/_components/symptom-drawer'
import { AutosizeTextarea } from '@/components/ui/autoresize-textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import InputTags from '@/components/ui/input-tags'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useSymptomStore } from '@/lib/store/symptom-select-store'
import { ListOrderedIcon, TextCursorInputIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { IoInformationOutline } from "react-icons/io5"

const FormSchema = z.object({
  symptoms: z.string(),
  pastContext: z.string().optional(),
  otherInfo: z.string().optional(),
});

export default function SymptomFormMain() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      symptoms: '',
      pastContext: '',
      otherInfo: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagMode, setTagMode] = useState(false);
  const router = useRouter();
  const addSymptom = useSymptomStore((s) => s.addSymptom);
  const clearSymptoms = useSymptomStore((s) => s.clearSymptoms);

  const selectedSymptoms = useSymptomStore((state) => state.selectedSymptoms);

  useEffect(() => {
    const symptomsArray = Array.from(selectedSymptoms);
    const symptomString = symptomsArray.join(', ');
    form.setValue('symptoms', symptomString, { shouldValidate: true });
    // When tagMode is enabled, keep local tags in sync with the selector
    if (tagMode) {
      setTags(symptomsArray);
    }
  }, [selectedSymptoms, form]);

  useEffect(() => {
    if (!tagMode) {
      form.setValue('symptoms', tags.join(', '), { shouldValidate: true });
    }
  }, [tags, tagMode, form]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const data = await response.json();
        window.open(`/tools/symptom-search/${data.searchId}`, '_blank');
        // router.push(`/symptom-search/${data.searchId}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'An error occurred');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="symptoms"
          render={({ field }) => (
            <FormItem className='lg:grid lg:grid-cols-3 gap-2'>
              <FormLabel className="p-1">
                <header className="px-1 flex items-start gap-2 font-medium">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button size={'sm-icon'} variant='outline' type='button'>
                        <IoInformationOutline className='hover:text-black dark:hover:text-white text-muted-foreground' />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className='w-72 m-2 leading-normal bg-[#fff2] dark:bg-[#2224] backdrop-blur-lg'>
                      <div className="space-y-1 flex flex-col">
                        <h4 className="font-semibold text-base">Symptoms</h4>
                        <p className="text-[.75rem] font-normal">
                          Please either choose the list option to put in symptoms directly along with their duration in the input box next to it, or select the other option wherein you can use natural language to describe your symptoms.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <article className='flex flex-col items-start lg:gap-1'>
                    <span className='text-base -mt-0.5'>Symptoms</span>
                    <div className='gap-2 space-evenly items-start lg:flex hidden'>
                      <ToggleGroup
                        type='single'
                        className='p-1'
                        value={tagMode ? 'symptom-list' : 'symptom-nlp'}
                        onValueChange={(value) => setTagMode(value === 'symptom-list')}
                      >
                        <ToggleGroupItem variant={'outline'} value="symptom-list" aria-label='symptom-list'><ListOrderedIcon className='w-4 h-4' /></ToggleGroupItem>
                        <ToggleGroupItem variant={'outline'} value="symptom-nlp" aria-label='symptom-nlp'><TextCursorInputIcon className='w-4 h-4' /></ToggleGroupItem>
                      </ToggleGroup>
                      <p className='text-muted-foreground !text-sm inline-block'>Select a mode (Hover over the information icon to know more), you can see examples for natural language input <Button size="none" type='button' variant="link">here</Button></p>
                    </div>
                  </article>
                </header>
              </FormLabel>
              <div className='w-full lg:col-span-2 -mt-4 lg:mt-0 p-1'>
                <FormControl className=''>
                  {tagMode ? (
                    <InputTags
                      value={tags}
                      onChange={(v) => {
                        const newTags = typeof v === 'function' ? (v as (prev: string[]) => string[])(tags) : v
                        setTags(newTags)
                        clearSymptoms()
                        newTags.forEach((sym) => addSymptom(sym))
                      }}
                      className='my-1'
                      readOnly
                      placeholder='Add symptoms via the selector drawer'
                    />
                  ) : (
                    <AutosizeTextarea {...field} className='my-1' placeholder='Enter your symptoms here...' />
                  )}
                </FormControl>
                <div className='gap-2 space-evenly items-start flex lg:hidden'>
                  <ToggleGroup type='single' className='p-1'
                    value={tagMode ? 'symptom-list' : 'symptom-nlp'}
                    onValueChange={(value) => setTagMode(value === 'symptom-list')}>
                    <ToggleGroupItem value="symptom-list" aria-label='Toggle symptom list mode'><ListOrderedIcon className='w-4 h-4' /></ToggleGroupItem>
                    <ToggleGroupItem value="symptom-nlp" aria-label='Toggle symptom NLP mode'><TextCursorInputIcon className='w-4 h-4' /></ToggleGroupItem>
                  </ToggleGroup>
                  <p className='text-muted-foreground !text-sm inline-block'>Select a mode (Hover over the information icon to know more), you can see examples for natural language input <Button size="none" variant="link" type='button'>here</Button>. If you have any issues with list input, please contact <Button size="none" variant="link" type='button'>here</Button>.</p>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pastContext"
          render={({ field }) => (
            <FormItem className='lg:grid lg:grid-cols-3 gap-2'>
              <FormLabel className="p-1">
                <header className="px-1 flex items-start gap-2 font-medium">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button size={'sm-icon'} variant='outline' type='button'>
                        <IoInformationOutline className='hover:text-black dark:hover:text-white text-muted-foreground' />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className='w-72 m-2 leading-normal bg-[#fff2] dark:bg-[#2224] backdrop-blur-lg'>
                      <div className="space-y-1 flex flex-col">
                        <h4 className="font-semibold text-base">Past Related Context</h4>
                        <p className="text-[.75rem] font-normal">
                          If you have any past related context, please enter it here. Optional, but recommended.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <article className='flex flex-col items-start lg:gap-1'>
                    <span className='text-base -mt-0.5'>Past Related Context</span>
                    <div className='gap-2 space-evenly items-start lg:flex hidden'>
                      <p className='text-muted-foreground !text-sm inline-block'>If you have any useful past related context please enter it here, you can see examples for some inputs <Button size="none" type='button' variant="link">here</Button></p>
                    </div>
                  </article>
                </header>
              </FormLabel>
              <div className='w-full lg:col-span-2 -mt-4 lg:mt-0 p-1'>
                <FormControl>
                  <AutosizeTextarea {...field} className='my-1' placeholder='Enter your past related context here... (Optional)' />
                </FormControl>
                <div className='gap-2 space-evenly items-start flex lg:hidden'>
                  <p className='text-muted-foreground !text-sm inline-block p-1'>If you have any useful past related context please enter it here, you can see examples for some inputs <Button size="none" type='button' variant="link">here</Button></p>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='otherInfo'
          render={({ field }) => (
            <FormItem className='lg:grid lg:grid-cols-3 gap-2'>
              <FormLabel className="p-1">
                <header className="px-1 flex items-start gap-2 font-medium">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button size={'sm-icon'} variant='outline' type='button'>
                        <IoInformationOutline className='hover:text-black dark:hover:text-white text-muted-foreground' />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className='w-72 m-2 leading-normal bg-[#fff2] dark:bg-[#2224] backdrop-blur-lg'>
                      <div className="space-y-1 flex flex-col">
                        <h4 className="font-semibold text-base">Other Information</h4>
                        <p className="text-[.75rem] font-normal">
                          If you any more information, please enter it here. Details from your profile like age, location and other information will be included by default, so you can skip including those. Optional, but recommended.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <article className='flex flex-col items-start lg:gap-1'>
                    <span className='text-base -mt-0.5'>Other Information</span>
                    <div className='gap-2 space-evenly items-start lg:flex hidden'>
                      <p className='text-muted-foreground !text-sm inline-block'>If you feel like you have any more information that you want to include, please enter it here. You can see examples for some inputs <Button size="none" type='button' variant="link">here</Button></p>
                    </div>
                  </article>
                </header>
              </FormLabel>
              <div className='w-full lg:col-span-2 -mt-4 lg:mt-0 p-1'>
                <FormControl>
                  <AutosizeTextarea {...field} className='my-1' placeholder='Enter other information here... (Optional)' />
                </FormControl>
                <div className='gap-2 space-evenly items-start flex lg:hidden'>
                  <p className='text-muted-foreground !text-sm inline-block p-1'>If you feel like you have any more information that you want to include, please enter it here. You can see examples for some inputs <Button size="none" type='button' variant="link">here</Button></p>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={loading}>
              {loading ? 'Forming Response...' : 'Analyze'}
            </Button>
            <SymptomDrawer />
          </div>
          <div className='flex items-center space-x-2'>
            <Checkbox id="data-share" defaultChecked />
            <Label htmlFor="data-share"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Don&apos;t store my inputs
            </Label>
          </div>
        </section>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </Form>
  );
};