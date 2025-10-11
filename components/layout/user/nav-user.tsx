"use client"

import {
  ChevronsUpDown,
  ShieldCheck,
  ShieldOff
} from "lucide-react"

import ChangePassword from "@/components/auth/change-password"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { authClient as client } from "@/lib/auth-client"
import { Session } from "@/lib/auth-types"
import dynamic from 'next/dynamic'
import Image from "next/image"
import { useRouter } from "next/navigation"
import QRCodeStyling from "qr-code-styling"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

const dmiClasses = 'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden'

const QL = () => (
  <div className={`${dmiClasses}`}>
    <Skeleton className="size-4 shrink-0 rounded-full" />
    <Skeleton className="h-4 w-20 shrink-0 rounded-md" />
  </div>
)

const EditProfileItem = dynamic(() => import('./dropdown/edit-profile-item'), { ssr: false, loading: () => <QL /> })
const SessionsItem = dynamic(() => import('./dropdown/sessions-item'), { ssr: false, loading: () => <QL /> })
const PasskeysItem = dynamic(() => import('./dropdown/passkeys-item'), { ssr: false, loading: () => <QL /> })
const TwoFaScanItem = dynamic(() => import('./dropdown/twofa-scan-item'), { ssr: false, loading: () => <QL /> })
const TwoFaToggleItem = dynamic(() => import('./dropdown/twofa-toggle-item'), { ssr: false, loading: () => <QL /> })
const VerifyEmailItem = dynamic(() => import('./dropdown/verify-email-item'), { ssr: false, loading: () => <QL /> })
const BillingItem = dynamic(() => import('./dropdown/billing-item'), { ssr: false, loading: () => <QL /> })
const NotificationsItem = dynamic(() => import('./dropdown/notifications-item'), { ssr: false, loading: () => <QL /> })
const SignOutItem = dynamic(() => import('./dropdown/signout-item'), { ssr: false, loading: () => <QL /> })

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function NavUser({
  session,
}: {
  session: Session | null
}) {
  const { isMobile } = useSidebar()

  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [twoFactorDialog, setTwoFactorDialog] = useState(false)
  const [twoFactorVerifyURI, setTwoFactorVerifyURI] = useState("")
  const [twoFaPassword, setTwoFaPassword] = useState("")
  const [isPendingTwoFa, setIsPendingTwoFa] = useState(false)
  const qrCodeRef1 = useRef<HTMLDivElement | null>(null)
  const qrCodeRef2 = useRef<HTMLDivElement | null>(null)
  const qrCode1 = useRef<QRCodeStyling | null>(null)
  const qrCode2 = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    if (twoFactorVerifyURI && qrCodeRef1.current) {
      if (!qrCode1.current) {
        qrCode1.current = new QRCodeStyling({
          width: 200,
          height: 200,
          data: twoFactorVerifyURI,
          dotsOptions: { color: "#000000", type: "rounded" },
          backgroundOptions: { color: "#ffffff" },
        })
      } else {
        qrCode1.current.update({ data: twoFactorVerifyURI })
      }
      try { qrCode1.current.append(qrCodeRef1.current) } catch (e) { /* ignore */ }
    }
  }, [twoFactorVerifyURI])

  useEffect(() => {
    if (twoFactorVerifyURI && qrCodeRef2.current) {
      if (!qrCode2.current) {
        qrCode2.current = new QRCodeStyling({
          width: 200,
          height: 200,
          data: twoFactorVerifyURI,
          dotsOptions: { color: "#000000", type: "rounded" },
          backgroundOptions: { color: "#ffffff" },
        })
      } else {
        qrCode2.current.update({ data: twoFactorVerifyURI })
      }
      try { qrCode2.current.append(qrCodeRef2.current) } catch (e) { /* ignore */ }
    }
  }, [twoFactorVerifyURI])

  const [editName, setEditName] = useState<string | undefined>(session?.user?.name)
  const [editImage, setEditImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [sessions, setSessions] = useState<any[] | null>(null)
  const [isTerminating, setIsTerminating] = useState<string | null>(null)

  if (!session?.user) return null
  const user = session.user


  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={session?.user.image || undefined} alt={user.name} />
                <AvatarFallback className="rounded-lg">{user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={session?.user.image || undefined} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{user.name} {user.emailVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 text-xs p-1">
                        <ShieldCheck size={10} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-800 text-xs p-1">
                        <ShieldOff size={10} />
                      </span>
                    )}</span>
                  </div>
                  <span className="truncate text-xs">{user.email}</span>

                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {/* Edit profile (lazy) */}
              <EditProfileItem session={session} />
              {/* Sessions (lazy) */}
              <SessionsItem session={session} />
              <PasskeysItem />
              {/* Scan QR Code (only for users with 2FA enabled) */}
              {session?.user.twoFactorEnabled && <TwoFaScanItem />}

              {/* Enable / Disable 2FA dialog */}
              <TwoFaToggleItem enabled={!!session?.user.twoFactorEnabled} />

              <ChangePassword />
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <BillingItem />
            <NotificationsItem />
            <DropdownMenuSeparator />
            {!user.emailVerified && <VerifyEmailItem email={user.email} />}
            <SignOutItem />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit Profile Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-[425px] w-11/12">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>Update your display name and profile image.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={editName || ""} onChange={(e) => setEditName(e.target.value)} />
              <Label htmlFor="image">Profile Image</Label>
              <Input id="image" type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setEditImage(file);
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
                  await client.updateUser({ name: editName, image: editImage ? await convertImageToBase64(editImage) : undefined });
                  toast.success("Profile updated");
                  setEditOpen(false);
                } catch (e) {
                  toast.error("Failed to update profile");
                }
              }}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


      </SidebarMenuItem>
    </SidebarMenu>
  )
}
