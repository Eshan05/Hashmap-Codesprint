import { AppSidebar } from '@/components/layout/user/app-sidebar';
import { ModeToggle } from "@/components/common/mode-toggle";
import { Providers } from '@/components/providers';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ThemeProvider } from "next-themes";

export default async function RLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div suppressHydrationWarning>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SidebarProvider className="overflow-x-hidden">
          <AppSidebar />
          <SidebarInset className="max-w-full group-has[[data-collapsible=icon]]/sidebar-wrapper:w-10 ">
            <section className="transition-[margin] ease-linear">
              <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 group-has-[[data-collapsible=icon]]/sidebar-wrapper:ml-0 group-has-[[data-collapsible=icon]]/sidebar-wrapper:w-full">
                <div className="flex items-center gap-2 px-4 justify-between w-full">
                  <aside className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <h1 className="text-lg font-semibold leading-none">
                      PHT
                    </h1>
                  </aside>
                  <aside>
                    <ModeToggle />
                  </aside>
                </div>
              </header>
              <main className="relative group-has-[[data-collapsible=icon]]/sidebar-wrapper:ml-0 ml-0 px-4">
                <Providers>
                  {children}
                </Providers>
                {/* <footer className="w-full mx-auto relative"> */}
                {/* <Footer7 /> */}
                {/* </footer> */}
              </main>
            </section>
          </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    </div>
  );
}
