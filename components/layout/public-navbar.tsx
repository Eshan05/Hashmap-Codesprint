"use client";

import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useSession } from '@/lib/auth-client';
import { LucideIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HiOutlineMenuAlt3 } from 'react-icons/hi';
import { IconType } from 'react-icons/lib';
import { TbBuildingSkyscraper, TbHome, TbMailShare, TbVideo, TbWorldQuestion } from "react-icons/tb";
import { Logo } from "../auth/logo";
import { EButton } from '../ui/enhanced-button';
import LanguageSelector from '../ui/language-selector';

interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon | IconType
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: TbHome },
  { label: 'How it works', href: '/how-it-works', icon: TbWorldQuestion },
  { label: 'Health Tools', href: '/tools', icon: TbVideo },
  { label: 'About', href: '/about', icon: TbBuildingSkyscraper },
  { label: 'Contact', href: '/contact', icon: TbMailShare },
];

export default function PublicNavbar() {
  const { data: session } = useSession();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [applyActiveStyles, setApplyActiveStyles] = useState(false);
  const lastScrollY = useRef(0);
  const DOCK_THRESHOLD = 5;
  const HIDE_THRESHOLD = 80;

  const handleScroll = useCallback(() => {
    if (typeof window === 'undefined') return;
    const currentScrollY = window.scrollY;

    if (currentScrollY > DOCK_THRESHOLD) {
      setApplyActiveStyles(true);
    } else {
      setApplyActiveStyles(false);
    }

    if (currentScrollY > HIDE_THRESHOLD) {
      if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    } else {
      setIsVisible(true);
    }
    lastScrollY.current = currentScrollY <= 0 ? 0 : currentScrollY;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleNavLinkClick = (
    sectionId: string,
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();
    const element = document.getElementById(sectionId.substring(1));
    if (element) {
      const navbarHeight = document.querySelector('header')?.clientHeight || HIDE_THRESHOLD;
      const offset = isVisible && applyActiveStyles ? navbarHeight : 0;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: elementPosition, behavior: 'smooth' });
    }
    setIsMobileOpen(false);
  };

  const baseNavContainerClasses = "flex h-16 md:h-11 items-center justify-between py-8 px-4 md:px-8 transition-colors duration-300";
  const activeNavContainerStyles = "bg-white";
  const inactiveNavContainerStyles = "bg-white";

  return (
    <header
      className={`w-full bg-white mx-auto fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className={`${baseNavContainerClasses} max-w-[1440px] mx-auto ${applyActiveStyles ? activeNavContainerStyles : inactiveNavContainerStyles}`}>
        <div className="w-full flex items-center">
          {/* Left: logo */}
          <div className="flex-1 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
              <span className="font-bold text-lg text-black">NabhaCare</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center">
            <nav className="flex items-center gap-6">
              {navItems.map((item) => (
                <EButton effect={'hoverUnderline'} variant={'link'} className={'flex items-center px-0 font-normal cursor-pointer'} key={item.label} asChild>
                  <Link href={item.href} className="lg:!text-base text-gray-600 hover:text-black">
                    {item.label}
                  </Link>
                </EButton>
              ))}
            </nav>
          </div>

          {/* Right: actions */}
          <div className="flex-1 items-center justify-end gap-2 hidden md:flex">
            <LanguageSelector />
            {session ? (
              <Button asChild>
                <Link href="/dashboard" className="text-sm font-medium">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant={'secondary'} asChild>
                  <Link href="/sign-in" className="text-sm">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up" className=" text-sm font-medium">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden ml-2">
            <Drawer open={isMobileOpen} onOpenChange={setIsMobileOpen} shouldScaleBackground>
              <DrawerTrigger asChild>
                <Button aria-label="Open menu">
                  <HiOutlineMenuAlt3 /> Menu
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm py-4">
                  <DrawerHeader className='sr-only'>
                    <DrawerTitle></DrawerTitle>
                    <DrawerDescription></DrawerDescription>
                  </DrawerHeader>
                  <header className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                      <Logo />
                      <span className="font-semibold text-black text-2xl">NabhaCare</span>
                    </div>
                    <DrawerClose asChild>
                      <Button className="p-2 rounded-md" size={'icon'} variant={'ghost'}><XIcon /></Button>
                    </DrawerClose>
                  </header>
                  <div className="mt-4 px-4 space-y-2">
                    {navItems.map((item) => (
                      <Link key={item.label} href={item.href} className="block text-gray-700 hover:text-black flex-center-2 text-base">
                        {item.icon && <item.icon className="" />}
                        {item.label}
                      </Link>
                    ))}

                    <footer className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between mt-3">
                        <LanguageSelector />
                        <aside className="flex items-center gap-2">
                          {session ? (
                            <Button asChild>
                              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-black">Dashboard</Link>
                            </Button>
                          ) : (
                            <>
                              <Button variant={'secondary'} asChild>
                                <Link href="/sign-in" className="text-sm text-gray-600 hover:text-black">Sign in</Link>
                              </Button>

                              <Button asChild>
                                <Link href="/sign-up" className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md text-sm font-medium">Sign up</Link>
                              </Button>
                            </>
                          )}
                        </aside>
                      </div>
                    </footer>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </header >
  );
}
