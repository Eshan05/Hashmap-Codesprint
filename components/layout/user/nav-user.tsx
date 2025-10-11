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
  Laptop,
  Smartphone,
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
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import PasskeysPanel, { AddPasskeyInline } from "@/components/auth/passkeys-panel"
import {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaBody,
  CredenzaHeader,
  CredenzaDescription,
  CredenzaTitle,
  CredenzaFooter,
} from "@/components/ui/credenza"
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
              <DropdownMenuItem onClick={() => { setEditOpen(true) }}>
                <Edit />
                Edit Profile
              </DropdownMenuItem>
              <Credenza>
                <CredenzaTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => {
                    e.preventDefault(); (async () => {
                      try {
                        const r = await fetch('/api/auth/list-sessions', { credentials: 'same-origin' });
                        const json = await r.json();
                        setSessions(json || []);
                      } catch (err) {
                        console.error(err);
                        toast.error('Failed to load sessions');
                      }
                    })()
                  }}>
                    <Laptop />
                    Manage Sessions
                  </DropdownMenuItem>
                </CredenzaTrigger>
                <CredenzaContent>
                  <CredenzaHeader>
                    <CredenzaTitle>Active Sessions</CredenzaTitle>
                    <CredenzaDescription>Manage active sessions across devices.</CredenzaDescription>
                  </CredenzaHeader>
                  <CredenzaBody>
                    <ScrollArea className="h-64">
                      <div className="grid gap-2">
                        {sessions ? (() => {
                          const groups: Record<string, any[]> = {};
                          sessions.filter((s: any) => s.userAgent).forEach((s: any) => {
                            const os = new UAParser(s.userAgent || "").getOS().name || "Unknown";
                            let key = "Other";
                            if (/windows/i.test(os)) key = "Windows";
                            else if (/mac os|macos|ios/i.test(os)) key = "Mac/iOS";
                            else if (/android/i.test(os)) key = "Android";
                            else if (/linux/i.test(os)) key = "Linux";
                            if (!groups[key]) groups[key] = [];
                            groups[key].push(s);
                          });
                          const entries = Object.entries(groups);
                          if (!entries.length) return <p className="text-sm text-muted-foreground">No active sessions</p>;

                          const getIcon = (key: string) => {
                            if (key === "Windows") return <Laptop size={16} />;
                            if (key === "Mac/iOS") return <Laptop size={16} />;
                            if (key === "Android") return <Smartphone size={16} />;
                            if (key === "Linux") return <Laptop size={16} />;
                            return <Laptop size={16} />;
                          };

                          return (
                            <Accordion type="multiple" className="w-full mt-2">
                              {entries.map(([key, list]) => (
                                <AccordionItem key={key} value={key} className="border-b-0 w-full">
                                  <AccordionTrigger className="flex items-center justify-between gap-3 px-2 py-2 rounded-md hover:bg-muted w-full">
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">{getIcon(key)}</span>
                                      <div className="font-medium">{key}</div>
                                      <Badge variant={'secondary'} className="py-0">{`${list.length} ${list.length === 1 ? 'session' : 'sessions'}`}</Badge>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="px-2 py-1">
                                    <div className="grid gap-2">
                                      {list.map((s: any) => {
                                        const parser = new UAParser(s.userAgent || "");
                                        const device = parser.getDevice();
                                        const osName = parser.getOS().name || "Unknown";
                                        const deviceName = device.model || device.vendor || osName;
                                        const location = s.location || s.geo || s.city || s.ipLocation || null;
                                        const ip = s.ip || s.ipAddress || s.clientIp || s.remoteAddress || null;
                                        const isCurrent = s.id === session?.session?.id;
                                        return (
                                          <div key={s.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800">
                                            <div className="flex items-start gap-3">
                                              <div className="pt-0.5">{device.type === 'mobile' ? <Smartphone size={16} /> : <Laptop size={16} />}</div>
                                              <div>
                                                <header className="flex items-center gap-2">
                                                  {isCurrent && <Badge className="py-0">Current</Badge>}
                                                  <div className="font-medium">{deviceName}</div>
                                                </header>
                                                <div className="text-xs text-muted-foreground">{parser.getBrowser().name || 'Unknown'} · {parser.getOS().version || 'Unknown'}</div>
                                                {location ? <div className="text-xs text-muted-foreground">{location}</div> : ip ? <div className="text-xs text-muted-foreground">{ip}</div> : null}
                                              </div>
                                            </div>
                                            <div>
                                              <Button size="sm" variant={isCurrent ? 'default' : 'secondary'} onClick={async () => {
                                                setIsTerminating(s.id);
                                                const r = await client.revokeSession({ token: s.token });
                                                if (r?.error) toast.error(r.error.message); else { toast.success('Session revoked'); setSessions(sessions.filter((x) => x.id !== s.id)); }
                                                if (s.id === session?.session?.id) router.refresh();
                                                setIsTerminating(null);
                                              }}>
                                                {isTerminating === s.id ? <Loader2 size={15} className="animate-spin" /> : isCurrent ? <LogOut size={15} /> : <Trash size={15} />}
                                              </Button>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          )
                        })() : <div className="text-sm text-muted-foreground">Loading sessions...</div>}
                      </div>
                    </ScrollArea>
                  </CredenzaBody>
                </CredenzaContent>
              </Credenza>
              <Credenza>
                <CredenzaTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Fingerprint />
                    Manage Passkeys
                  </DropdownMenuItem>
                </CredenzaTrigger>
                <CredenzaContent className="">
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
              {/* Scan QR Code (only for users with 2FA enabled) */}
              {!!session?.user.twoFactorEnabled && (
                <Dialog>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <QrCode />
                      Scan QR Code
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] w-11/12">
                    <DialogHeader>
                      <DialogTitle>Scan QR Code</DialogTitle>
                      <DialogDescription>Scan the QR code with your TOTP app</DialogDescription>
                    </DialogHeader>

                    {twoFactorVerifyURI ? (
                      <>
                        <div className="flex items-center justify-center">
                          <div ref={qrCodeRef1} />
                        </div>
                        <div className="flex gap-2 items-center justify-center">
                          <p className="text-sm text-muted-foreground">Copy URI to clipboard</p>
                          <CopyButton textToCopy={twoFactorVerifyURI} />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <PasswordInput value={twoFaPassword} onChange={(e) => setTwoFaPassword(e.target.value)} placeholder="Enter Password" />
                        <Button onClick={async () => {
                          if (twoFaPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
                          await client.twoFactor.getTotpUri({ password: twoFaPassword }, { onSuccess(ctx) { setTwoFactorVerifyURI(ctx.data.totpURI); } });
                          setTwoFaPassword("");
                        }}>Show QR Code</Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              )}

              {/* Enable / Disable 2FA dialog */}
              <Dialog open={twoFactorDialog} onOpenChange={setTwoFactorDialog}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    {session?.user.twoFactorEnabled ? <ShieldOff /> : <ShieldCheck />}
                    {session?.user.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] w-11/12">
                  <DialogHeader>
                    <DialogTitle>{session?.user.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}</DialogTitle>
                    <DialogDescription>{session?.user.twoFactorEnabled ? 'Disable the second factor authentication from your account' : 'Enable 2FA to secure your account'}</DialogDescription>
                  </DialogHeader>

                  {twoFactorVerifyURI ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-center">
                        <div ref={qrCodeRef2} />
                      </div>
                      <Label htmlFor="password">Scan the QR code with your TOTP app</Label>
                      <Input value={twoFaPassword} onChange={(e) => setTwoFaPassword(e.target.value)} placeholder="Enter OTP" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="password">Password</Label>
                      <PasswordInput id="password" placeholder="Password" value={twoFaPassword} onChange={(e) => setTwoFaPassword(e.target.value)} />
                    </div>
                  )}
                  <DialogFooter>
                    <Button disabled={isPendingTwoFa} onClick={async () => {
                      if (twoFaPassword.length < 8 && !twoFactorVerifyURI) { toast.error('Password must be at least 8 characters'); return; }
                      setIsPendingTwoFa(true);
                      if (session?.user.twoFactorEnabled) {
                        await client.twoFactor.disable({ password: twoFaPassword, fetchOptions: { onError(ctx) { toast.error(ctx.error.message); }, onSuccess() { toast('2FA disabled successfully'); setTwoFactorDialog(false); } } });
                        setIsPendingTwoFa(false);
                        return;
                      }
                      if (twoFactorVerifyURI) {
                        await client.twoFactor.verifyTotp({ code: twoFaPassword, fetchOptions: { onError(ctx) { setIsPendingTwoFa(false); setTwoFaPassword(''); toast.error(ctx.error.message); }, onSuccess() { toast('2FA enabled successfully'); setTwoFactorVerifyURI(''); setIsPendingTwoFa(false); setTwoFaPassword(''); setTwoFactorDialog(false); } } });
                        return;
                      }
                      await client.twoFactor.enable({ password: twoFaPassword, fetchOptions: { onError(ctx) { toast.error(ctx.error.message); }, onSuccess(ctx) { setTwoFactorVerifyURI(ctx.data.totpURI); } } });
                      setIsPendingTwoFa(false);
                      setTwoFaPassword("");
                    }}>
                      {isPendingTwoFa ? <Loader2 size={15} className="animate-spin" /> : session?.user.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="px-2 py-2">
                <ChangePassword />
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
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
            {!user.emailVerified && (
              <DropdownMenuItem onClick={async () => {
                try {
                  await client.sendVerificationEmail({ email: user.email }, {
                    onSuccess() { toast.success('Verification email sent'); },
                    onError(ctx) { toast.error(ctx.error.message); }
                  });
                } catch (e) { console.error(e); toast.error('Failed to send verification email'); }
              }}>
                <BadgeCheck />
                Verify email
              </DropdownMenuItem>
            )}
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


      </SidebarMenuItem>
    </SidebarMenu>
  )
}
