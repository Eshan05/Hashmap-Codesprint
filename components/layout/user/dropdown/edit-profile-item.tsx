"use client"

import React, { useState } from 'react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { authClient as client } from '@/lib/auth-client'
import { toast } from 'sonner'
import { PencilIcon } from 'lucide-react'

export default function EditProfileItem({ session }: { session: any }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState<string | undefined>(session?.user?.name)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  async function convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setOpen(true)}>
            <PencilIcon />
            Edit Profile
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] w-11/12">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your display name and profile image.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name || ""} onChange={(e) => setName(e.target.value)} />
            <Label htmlFor="image">Profile Image</Label>
            <Input id="image" type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImage(file);
                const r = new FileReader();
                r.onloadend = () => setImagePreview(r.result as string);
                r.readAsDataURL(file);
              }
            }} />
            {imagePreview && (
              <div className="relative w-24 h-24 rounded overflow-hidden">
                <Image src={imagePreview} alt="preview" fill sizes="(max-width: 48px) 48px" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={async () => {
              try {
                await client.updateUser({ name: name, image: image ? await convertImageToBase64(image) : undefined });
                toast.success('Profile updated')
                setOpen(false)
              } catch (e) { toast.error('Failed to update profile') }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
