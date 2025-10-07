import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
const up = [

  {
    id: 2,
    img: "https://hips.hearstapps.com/hmg-prod/images/muscular-shirtless-man-exercising-with-dumbbells-royalty-free-image-1711991944.jpg?crop=1.00xw:1.00xh;0,0&resize=1200:*"
  },
  {
    id: 3,
    img: "https://hips.hearstapps.com/hmg-prod/images/muscular-shirtless-man-exercising-with-dumbbells-royalty-free-image-1711991944.jpg?crop=1.00xw:1.00xh;0,0&resize=1200:*"
  },
  {
    id: 4,
    img: "https://hips.hearstapps.com/hmg-prod/images/muscular-shirtless-man-exercising-with-dumbbells-royalty-free-image-1711991944.jpg?crop=1.00xw:1.00xh;0,0&resize=1200:*"
  }
]

const lo = [
  {
    id: 1,
    img: "https://images.squarespace-cdn.com/content/v1/5cf93199c24c0a000107ec5b/fc0d07d2-2f97-485c-9c7f-4ee883f9abb2/Goblet+Squat.png?format=2500w"
  },
  {
    id: 2,
    img: "https://images.squarespace-cdn.com/content/v1/5cf93199c24c0a000107ec5b/fc0d07d2-2f97-485c-9c7f-4ee883f9abb2/Goblet+Squat.png?format=2500w"
  },
  {
    id: 3,
    img: "https://images.squarespace-cdn.com/content/v1/5cf93199c24c0a000107ec5b/fc0d07d2-2f97-485c-9c7f-4ee883f9abb2/Goblet+Squat.png?format=2500w"
  }
]

const yo = [
  {
    id: 1,
    img: "https://a.storyblok.com/f/97382/2000x1500/4c15e1224b/cover-benefits-of-yoga-and-meditation.png/m/1168x947/smart/filters:quality(65)"
  },
  {
    id: 2,
    img: "https://a.storyblok.com/f/97382/2000x1500/4c15e1224b/cover-benefits-of-yoga-and-meditation.png/m/1168x947/smart/filters:quality(65)"
  },
  {
    id: 3,
    img: "https://a.storyblok.com/f/97382/2000x1500/4c15e1224b/cover-benefits-of-yoga-and-meditation.png/m/1168x947/smart/filters:quality(65)"
  },
]

const page = () => {




  return (
    <section className="relative overflow-x-hidden flex flex-col font-inter min-h-svh">
      <div className="w-full px-4 py-8 lg:px-8 lg:py-10">
        <header className='relative flex items-center lg:mb-10 space-y-8'>
          <h1 className="shadow-heading text-5xl sm:text-6xl md:text-7xl">Exercises</h1>
        </header>

      </div>
      <div>
        <Tabs defaultValue="account" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="Upper Body">Upper Body</TabsTrigger>
            <TabsTrigger value="Lower Body">Lower Body</TabsTrigger>
            <TabsTrigger value="Yoga">Yoga</TabsTrigger>
          </TabsList>
          <TabsContent value="Upper Body">
            <div className='flex items-center'>
              {up.map((item) => (
                <div className='bg-[rgb(250,250,250)] p-2 rounded flex ' key={item.id}>
                  <img
                    src={item.img}
                    alt=''
                    className=" rounded-lg object-fit " />
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="Lower Body"><div className='flex items-center'>
            {lo.map((item) => (
              <div className='bg-[rgb(250,250,250)] p-2 rounded flex ' key={item.id}>
                <img
                  src={item.img}
                  alt=''
                  className=" rounded-lg object-fit " />
              </div>
            ))}
          </div></TabsContent>
          <TabsContent value="Yoga"><div className='flex items-center'>
            {yo.map((item) => (
              <div className='bg-[rgb(250,250,250)] p-2 rounded flex ' key={item.id}>
                <img
                  src={item.img}
                  alt=''
                  className=" rounded-lg object-fit " />
              </div>
            ))}
          </div></TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

export default page
