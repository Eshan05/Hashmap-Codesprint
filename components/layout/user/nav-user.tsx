"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  Loader2,
  LogOut,
  Sparkles,
  Edit,
  Fingerprint,
  QrCode,
  ShieldCheck,
  ShieldOff,
  Key as KeyIcon,
  Eye,
  EyeOff,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { useTransition, useRef, useEffect, useState } from "react"
import { calculatePasswordStrength } from "@/utils/password-strength"
import ChangePassword from "@/components/auth/change-password"
import { authClient as client } from "@/lib/auth-client"
import { toast } from "sonner"
import { UAParser } from "ua-parser-js"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import CopyButton from "@/components/ui/copy-button"
import { Trash } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Session } from "@/lib/auth-types";
import QRCodeStyling from "qr-code-styling"

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
  const [passkeysOpen, setPasskeysOpen] = useState(false)
  const [twoFaOpen, setTwoFaOpen] = useState(false)
  const [sessionsOpen, setSessionsOpen] = useState(false)
  const [twoFaUri, setTwoFaUri] = useState("")
  const [twoFaPassword, setTwoFaPassword] = useState("")
  const [isPendingTwoFa, setIsPendingTwoFa] = useState(false)
  const qrRef = useRef<HTMLDivElement | null>(null)
  const qr = useRef<QRCodeStyling | null>(null)

  // user-related hooks declared before the early return to keep hook order stable
  const [editName, setEditName] = useState<string | undefined>(session?.user?.name)
  const [editImage, setEditImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [passkeyName, setPasskeyName] = useState("")
  const { data: passkeysData, isPending: isPasskeysLoading, isRefetching, refetch: refetchPasskeys } = client.useListPasskeys();
  const [isDeletingPasskey, setIsDeletingPasskey] = useState<string | null>(null)
  const [sessions, setSessions] = useState<any[] | null>(null)

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
              <DropdownMenuItem onClick={() => { setEditOpen(true) }}>
                <Edit />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setPasskeysOpen(true) }}>
                <Fingerprint />
                Manage Passkeys
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setTwoFaOpen(true) }}>
                <QrCode />
                Manage 2FA
              </DropdownMenuItem>
              <div className="px-2 py-2">
                <ChangePassword />
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                if (isSigningOut) return
                setIsSigningOut(true)
                try {
                  await signOut({
                    fetchOptions: { onSuccess() { router.push("/") }, },
                  })
                } catch (e) {
                  console.error("signOut failed", e)
                } finally {
                  setIsSigningOut(false)
                }
              }}
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <LogOut />
                  <span className="">Log out</span>
                </>
              )}
            </DropdownMenuItem>
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

        {/* Passkeys Dialog */}
        <Dialog open={passkeysOpen} onOpenChange={setPasskeysOpen}>
          <DialogContent className="sm:max-w-[520px] w-11/12">
            <DialogHeader>
              <DialogTitle>Passkeys</DialogTitle>
              <DialogDescription>Manage registered passkeys for your account.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="flex gap-2">
                <Input placeholder="Passkey name" value={passkeyName} onChange={(e) => setPasskeyName(e.target.value)} />
                <Button onClick={async () => {
                  if (!passkeyName) { toast.error("Name required"); return; }
                  const res = await client.passkey.addPasskey({ name: passkeyName });
                  if (res?.error) toast.error(res.error.message);
                  else { toast.success("Passkey created"); setPasskeyName(""); refetchPasskeys?.(); }
                }}>Create</Button>
              </div>
              <div className="max-h-64 overflow-auto">
                {isPasskeysLoading ? <div>Loading...</div> : passkeysData && passkeysData.length ? (
                  passkeysData.map((pk: any) => (
                    <div key={pk.id} className="flex items-center justify-between p-2">
                      <div>
                        <div className="font-medium">{pk.name || 'Passkey'}</div>
                        <div className="text-xs text-muted-foreground">{pk.createdAt ? new Date(pk.createdAt).toLocaleString() : null}</div>
                      </div>
                      <div>
                        <Button size="sm" variant="secondary" onClick={async () => {
                          setIsDeletingPasskey(pk.id); const r = await client.passkey.deletePasskey({ id: pk.id });
                          if (r?.error) toast.error(r.error.message); else { toast.success('Deleted'); refetchPasskeys?.(); }
                          setIsDeletingPasskey(null);
                        }}>{isDeletingPasskey === pk.id ? <Loader2 className="animate-spin" /> : <Trash />}</Button>
                      </div>
                    </div>
                  ))
                ) : (<div>No passkeys</div>)}
              </div>
              <DialogFooter>
                <Button onClick={() => setPasskeysOpen(false)}>Close</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Two-Factor Dialog */}
        <Dialog open={twoFaOpen} onOpenChange={setTwoFaOpen}>
          <DialogContent className="sm:max-w-[520px] w-11/12">
            <DialogHeader>
              <DialogTitle>Two Factor Authentication</DialogTitle>
              <DialogDescription>Manage your TOTP authenticator.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              {twoFaUri ? (
                <div className="flex flex-col items-center gap-2">
                  <div ref={qrRef} />
                  <CopyButton textToCopy={twoFaUri} />
                </div>
              ) : (
                <div className="grid gap-2">
                  <PasswordInput value={twoFaPassword} onChange={(e) => setTwoFaPassword(e.target.value)} placeholder="Password" />
                  <Button onClick={async () => {
                    if (twoFaPassword.length < 8) { toast.error('Password too short'); return; }
                    await client.twoFactor.getTotpUri({ password: twoFaPassword }, { onSuccess(ctx) { setTwoFaUri(ctx.data.totpURI); } });
                    setTwoFaPassword("");
                  }}>Show QR Code</Button>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => { setTwoFaOpen(false); setTwoFaUri(""); }}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sessions Dialog */}
        <Dialog open={sessionsOpen} onOpenChange={async (open) => { setSessionsOpen(open); if (open) { try { const r = await fetch('/api/auth/list-sessions', { credentials: 'same-origin' }); const json = await r.json(); setSessions(json || []); } catch (e) { console.error(e); } } }}>
          <DialogContent className="sm:max-w-[520px] w-11/12">
            <DialogHeader>
              <DialogTitle>Active Sessions</DialogTitle>
              <DialogDescription>Manage active sessions across devices.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-64">
              <div className="grid gap-2">
                {sessions ? sessions.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-2">
                    <div>
                      <div className="text-sm font-medium">{s.device || s.userAgent || 'Device'}</div>
                      <div className="text-xs text-muted-foreground">{s.ip || s.city || ''}</div>
                    </div>
                    <div>
                      <Button size="sm" variant="secondary" onClick={async () => { const r = await client.revokeSession({ token: s.token }); if (r?.error) toast.error(r.error.message); else { toast.success('Session revoked'); setSessions(sessions.filter((x) => x.id !== s.id)); } }}>Revoke</Button>
                    </div>
                  </div>
                )) : <div className="text-sm text-muted-foreground">Loading sessions...</div>}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button onClick={() => setSessionsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
