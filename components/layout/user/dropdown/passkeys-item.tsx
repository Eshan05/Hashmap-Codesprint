"use client"

import React from 'react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import PasskeysPanel, { AddPasskeyInline } from '@/components/auth/passkeys-panel'
import { Credenza, CredenzaTrigger, CredenzaContent, CredenzaHeader, CredenzaBody, CredenzaTitle, CredenzaDescription } from '@/components/ui/credenza'
import { Fingerprint } from 'lucide-react'

export default function PasskeysItem() {
  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Fingerprint />
          Manage Passkeys
        </DropdownMenuItem>
      </CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Passkeys</CredenzaTitle>
          <CredenzaDescription>Manage registered passkeys for your account.</CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody>
          <div className="flex items-center justify-between mb-4">
            <AddPasskeyInline />
          </div>
          <PasskeysPanel />
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  )
}
