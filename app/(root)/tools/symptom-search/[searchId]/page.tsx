import FadeContent from '@/components/fade-content';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import SymptomSearch from '@/models/SymptomSearch';
import dbConnect from '@/utils/dbConnect';
import { FlagIcon, InfoIcon } from 'lucide-react';
import { notFound } from 'next/navigation';
import { IoInformationOutline } from 'react-icons/io5';
import { BsArrowReturnRight } from "react-icons/bs";
import Link from 'next/link';

interface PageProps {
  params: {
    searchId: string;
  };
}

interface Condition {
  name: string,
  description: string
  explanation: string
}

interface Medicine {
  name: string,
  commonUse: string
  sideEffects: string[]
}

interface SeekHelp {
  title: string,
  explanation: string
}

export default async function SymptomSearchResultPage({ params }: PageProps) {
  await dbConnect();
  const { searchId } = await params;
  const searchResult = await SymptomSearch.findOne({ searchId });

  if (!searchResult) {
    notFound();
  }

  let conditions: Condition[] = [];
  try {
    conditions = JSON.parse(searchResult.potentialConditions || "[]");
  } catch (e) {
    console.error("Error parsing conditions on frontend:", e);
  }

  let medicines: Medicine[] = [];
  try {
    medicines = JSON.parse(searchResult.medicines || "[]");
  } catch (e) {
    console.error("Error parsing medicines on frontend:", e);
  }

  let seekHelpItems: SeekHelp[] = [];
  try {
    seekHelpItems = JSON.parse(searchResult.whenToSeekHelp || "[]");
  } catch (e) {
    console.error("Error parsing whenToSeekHelp on frontend:", e);
  }

  let finalVerdict = searchResult.finalVerdict;
  try {
    const parsedVerdict = JSON.parse(searchResult.finalVerdict || '{}');
    finalVerdict = parsedVerdict.finalVerdict || searchResult.finalVerdict;
  } catch (e) {
    console.error("Error parsing finalVerdict:", e);
  }

  let cumulativePrompt = searchResult.cumulativePrompt;
  try {
    const parsedPrompt = JSON.parse(searchResult.cumulativePrompt || '{}');
    cumulativePrompt = parsedPrompt.problemSummary || searchResult.cumulativePrompt;
  } catch (e) {
    console.error("Error parsing cumulativePrompt:", e);
  }

  return (
    <section className="relative overflow-x-hidden flex flex-col font-inter min-h-svh">
      <div className="w-full px-[1.15rem] py-8 lg:px-8 lg:py-10">
        <header className='relative flex items-center lg:mb-10 mb-6 space-y-8'>
          <h1 className="shadow-heading text-5xl sm:text-6xl md:text-7xl">Symptom Analyzer</h1>
        </header>
        <FadeContent blur={true} duration={500} easing='ease-in' initialOpacity={0}>
          <p className='my-4'><Link href="/symptom-search" className='underline'>Go back to form</Link></p>
          {searchResult.cumulativePrompt ? (
            <article className='flex flex-col gap-4'>
              <section className="flex md:items-start flex-col md:flex-row gap-4 items-center">
                <Card className="max-w-sm w-full">
                  <CardHeader>
                    <CardTitle>Read This</CardTitle>
                    <CardDescription>Based on the inputs you gave on the previous page, this is the information we have extracted. On the basis of the following you will get information about potential conditions and medications and more.</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="max-w-sm w-full">
                  <CardHeader>
                    <CardTitle>Input Summary</CardTitle>
                    <CardDescription>{cumulativePrompt}</CardDescription>
                  </CardHeader>
                </Card>
              </section>
              <div className='lg:max-w-6xl mx-auto border rounded-lg p-2 lg:p-6 bg-[#ddd2] dark:bg-[#2222] backdrop-blur-lg'>
                {conditions.length > 0 && (
                  <section className="my-4 p-1">
                    <h2 className="mt-2 mb-6 text-3xl lg:text-4xl flex items-center font-bold gap-3 px-1"><HoverCard>
                      <HoverCardTrigger asChild>
                        <Button size={'sm-icon'} variant='outline' type='button'>
                          <IoInformationOutline className='hover:text-black dark:hover:text-white text-muted-foreground' />
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent className='w-72 m-2 leading-normal bg-[#fff2] dark:bg-[#2224] backdrop-blur-lg'>
                        <div className="space-y-1 flex flex-col">
                          <h4 className="font-semibold text-base">Potential Conditions</h4>
                          <p className="text-[.75rem] font-normal">
                            This shows the potential conditions that could be the cause of your symptoms. It is loosely in order from most likely to least likely. Please note that this is not a substitute for professional medical advice.
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                      <span>Potential <b className='py-1 px-2 rounded-lg bg-secondary font-bold'>Conditions</b></span>
                    </h2>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 my-2'>
                      {conditions.map((condition, index) => (
                        <Card key={index} className="max-w-sm">
                          <CardHeader>
                            <CardTitle>{condition.name}</CardTitle>
                            <CardDescription>{condition.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{condition.explanation}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                {medicines.length > 0 && (
                  <section className="my-4 p-1">
                    <h2 className="mt-2 mb-6 text-3xl lg:text-4xl flex items-center font-bold gap-3 px-1"><HoverCard>
                      <HoverCardTrigger asChild>
                        <Button size={'sm-icon'} variant='outline' type='button'>
                          <IoInformationOutline className='hover:text-black dark:hover:text-white text-muted-foreground' />
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent className='w-72 m-2 leading-normal bg-[#fff2] dark:bg-[#2224] backdrop-blur-lg'>
                        <div className="space-y-1 flex flex-col">
                          <h4 className="font-semibold text-base">Potential Medications</h4>
                          <p className="text-[.75rem] font-normal">
                            We recommend the following medicines for your symptoms, please note that this is not a substitute for professional medical advice. You find more information about these medicines on our website.
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                      <span>Potential <b className='py-1 px-2 rounded-lg bg-secondary font-bold'>Medications</b></span>
                    </h2>
                    <ul className='grid grid-cols-1 lg:grid-cols-2 p-1 gap-4'>
                      {medicines.map((medicine, index) => (
                        <li key={index}>
                          <Card>
                            <CardHeader>
                              <CardTitle><h3 className='text-xl font-semibold'>{medicine.name}</h3></CardTitle>
                              <CardDescription className=''><p>Commonly used for {medicine.commonUse}</p></CardDescription>
                            </CardHeader>
                            <CardContent className='text-sm'>
                              <section className={`flex ${medicine.sideEffects.length > 3 ? 'items-start' : 'items-center'} gap-2`}>
                                <b className='my-1 font-bold block p-2 text-center border rounded shadow'>Side<br /> Effects</b>
                                <ul className='list-disc list-inside p-1'>
                                  {medicine.sideEffects.map((effect, index) => (
                                    <li key={index} className='list-disc'>{effect}</li>
                                  ))}
                                </ul>
                              </section>
                            </CardContent>
                          </Card>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {seekHelpItems.length > 0 && (
                  <section className="my-4 p-1">
                    <h2 className="mt-2 mb-6 text-3xl lg:text-4xl flex items-center font-bold gap-3 px-1"><HoverCard>
                      <HoverCardTrigger asChild>
                        <Button size={'sm-icon'} variant='outline' type='button'>
                          <IoInformationOutline className='hover:text-black dark:hover:text-white text-muted-foreground' />
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent className='w-72 m-2 leading-normal bg-[#fff2] dark:bg-[#2224] backdrop-blur-lg'>
                        <div className="space-y-1 flex flex-col">
                          <h4 className="font-semibold text-base">Seeking Help</h4>
                          <p className="text-[.75rem] font-normal">
                            If you have any of the following symptoms, you should seek immediate medical attention. These indicate a potential medical emergency, even if you experience less severe symptoms than these.
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                      <span>When to Seek <b className='py-1 px-2 rounded-lg bg-secondary font-bold'>Help</b></span>
                    </h2>
                    <ul className='grid grid-cols-1 md:grid-cols-3 gap-4 my-2'>
                      {seekHelpItems.map((item, index) => (
                        <li key={index}>
                          <Card className='w-full'>
                            <CardHeader>
                              <CardTitle>{item.title}</CardTitle>
                              <CardDescription>{item.explanation}</CardDescription>
                            </CardHeader>
                          </Card>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
              <section className="flex md:items-start flex-col md:flex-row gap-4 items-center">
                <Card className="max-w-sm w-full">
                  <CardHeader>
                    <CardTitle>Final Verdict</CardTitle>
                    <CardDescription>{finalVerdict}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button className="flex items-center gap-2">
                      <FlagIcon className="w-4 h-4" /><b>Report</b>
                    </Button>
                  </CardFooter>
                </Card>
                <Card className="max-w-sm w-full">
                  <CardHeader>
                    <CardTitle className='flex items-center gap-1 max-w-max'><InfoIcon className="w-4 h-4" /><span className='small-caps'>Disclaimer</span></CardTitle>
                    <CardDescription>This information is generated by an AI and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for any health concerns. If you wish report this page you can do so by clicking the button</CardDescription>
                  </CardHeader>
                </Card>
              </section>
            </article>
          ) : (
            <p>Loading...</p>
          )}
        </FadeContent>
      </div>
    </section>
  );
}
