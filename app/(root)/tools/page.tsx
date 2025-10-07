import { Button } from "@/components/ui/button";

export default function Tools() {
  return (
    <section className="relative overflow-x-hidden flex flex-col font-inter min-h-svh">
      <div className="w-full px-4 py-8 lg:px-8 lg:py-10">
        <header className='relative flex items-center lg:mb-10 space-y-8'>
          <h1 className="shadow-heading text-5xl sm:text-6xl md:text-7xl">Health tools</h1>
        </header>
        <div className="flex flex-wrap gap-4 p-2 m-2">
          <Button>Get Started</Button>
          <Button>BMI Calculator</Button>
          <Button>Verify Blood Levels</Button>
          <Button>Body Fat Calculator</Button>
          <Button>Calorie Tracker</Button>
          <Button>Hydration Tracker</Button>
          <Button>Symptom Search</Button>
          <Button>Medicine Finder</Button>
          <Button>Disease Glossary</Button>
        </div>
      </div>
    </section>
  )
}