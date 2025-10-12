"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaBody,
  CredenzaFooter,
  CredenzaClose,
} from "@/components/ui/credenza"

interface BaseProps {
  children: React.ReactNode
}

interface WrapDrawerProps extends BaseProps {
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface WDProps extends BaseProps {
  className?: string
  asChild?: true
}

const WrapDrawerContext = React.createContext<{
  title?: string
  description?: string
  setTitle?: (title: string) => void
  setDescription?: (description: string) => void
}>({})

const useWrapDrawerContext = () => {
  const context = React.useContext(WrapDrawerContext)
  return context
}

const WrapDrawer = ({ children, className, ...props }: WrapDrawerProps) => {
  const [title, setTitle] = React.useState<string | undefined>()
  const [description, setDescription] = React.useState<string | undefined>()

  return (
    <WrapDrawerContext.Provider value={{ title, description, setTitle, setDescription }}>
      <Credenza {...props}>
        <div className={cn("inline-block", className)}>
          {children}
        </div>
      </Credenza>
    </WrapDrawerContext.Provider>
  )
}

const WDTrigger = ({ className, children, ...props }: WDProps) => {
  return (
    <CredenzaTrigger className={cn("cursor-pointer", className)} {...props}>
      {children}
    </CredenzaTrigger>
  )
}

interface WDContentProps extends WDProps {
  title?: string
  description?: string
  footer?: React.ReactNode
  showClose?: boolean
}

const WDContent = ({
  className,
  children,
  title,
  description,
  footer,
  showClose = false,
  ...props
}: WDContentProps) => {
  return (
    <CredenzaContent className={className} {...props}>
      {(title || description) && (
        <CredenzaHeader>
          {title && <CredenzaTitle>{title}</CredenzaTitle>}
          {description && <CredenzaDescription>{description}</CredenzaDescription>}
        </CredenzaHeader>
      )}
      <CredenzaBody>
        {children}
      </CredenzaBody>
      {(footer || showClose) && (
        <CredenzaFooter>
          {footer}
          {showClose && (
            <CredenzaClose asChild>
              <button className="px-4 py-2 rounded-md bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200">
                Close
              </button>
            </CredenzaClose>
          )}
        </CredenzaFooter>
      )}
    </CredenzaContent>
  )
}

const WDHeader = CredenzaHeader
const WDTitle = CredenzaTitle
const WDDescription = CredenzaDescription
const WDBody = CredenzaBody
const WDFooter = CredenzaFooter
const WDClose = CredenzaClose

export {
  WrapDrawer,
  WDTrigger,
  WDContent,
  WDHeader,
  WDTitle,
  WDDescription,
  WDBody,
  WDFooter,
  WDClose,
}
