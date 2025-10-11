"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import CopyButton from "@/components/ui/copy-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormControl } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient as client, signOut, useSession } from "@/lib/auth-client";
import { Session } from "@/lib/auth-types";
import {
  Edit,
  Fingerprint,
  Laptop,
  Loader2,
  LogOut,
  Plus,
  QrCode,
  ShieldCheck,
  ShieldOff,
  StopCircle,
  Trash,
  X,
  Apple,
  Monitor,
  MapPin,
  LockIcon,
  KeyIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaBody,
  CredenzaHeader,
  CredenzaDescription,
  CredenzaTitle,
  CredenzaFooter,
} from "@/components/ui/credenza";
import Image from "next/image";
import { useRouter } from "next/navigation";
import QRCodeStyling from "qr-code-styling";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { calculatePasswordStrength } from "@/utils/password-strength";
import { UAParser } from "ua-parser-js";
import { TbBrandAndroid, TbBrandApple, TbBrandWindows } from "react-icons/tb";
import { FaLinux } from "react-icons/fa6";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChangePassword from "@/components/auth/change-password";
import PasskeysPanel, { AddPasskeyInline } from "@/components/auth/passkeys-panel"

function MobileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

export default function UserCard(props: {
  session: Session | null;
  activeSessions: Session["session"][];
}) {
  const router = useRouter();
  const { data, isPending } = useSession();
  const session = data || props.session;
  const [isTerminating, setIsTerminating] = useState<string>();
  const [isPendingTwoFa, setIsPendingTwoFa] = useState<boolean>(false);
  const [twoFaPassword, setTwoFaPassword] = useState<string>("");
  const [twoFactorDialog, setTwoFactorDialog] = useState<boolean>(false);
  const [twoFactorVerifyURI, setTwoFactorVerifyURI] = useState<string>("");
  const [isSignOut, setIsSignOut] = useState<boolean>(false);
  const [emailVerificationPending, setEmailVerificationPending] =
    useState<boolean>(false);
  const [activeSessions, setActiveSessions] = useState(props.activeSessions);
  const qrCodeRef1 = useRef<HTMLDivElement>(null);
  const qrCodeRef2 = useRef<HTMLDivElement>(null);
  const qrCode1 = useRef<QRCodeStyling | null>(null);
  const qrCode2 = useRef<QRCodeStyling | null>(null);
  const removeActiveSession = (id: string) =>
    setActiveSessions(activeSessions.filter((session) => session.id !== id));

  useEffect(() => {
    if (twoFactorVerifyURI && qrCodeRef1.current) {
      if (!qrCode1.current) {
        qrCode1.current = new QRCodeStyling({
          width: 200,
          height: 200,
          data: twoFactorVerifyURI,
          dotsOptions: {
            color: "#000000",
            type: "rounded",
          },
          backgroundOptions: {
            color: "#ffffff",
          },
        });
      } else {
        qrCode1.current.update({
          data: twoFactorVerifyURI,
        });
      }
      qrCode1.current.append(qrCodeRef1.current);
    }
  }, [twoFactorVerifyURI]);

  useEffect(() => {
    if (twoFactorVerifyURI && qrCodeRef2.current) {
      if (!qrCode2.current) {
        qrCode2.current = new QRCodeStyling({
          width: 200,
          height: 200,
          data: twoFactorVerifyURI,
          dotsOptions: {
            color: "#000000",
            type: "rounded",
          },
          backgroundOptions: {
            color: "#ffffff",
          },
        });
      } else {
        qrCode2.current.update({
          data: twoFactorVerifyURI,
        });
      }
      qrCode2.current.append(qrCodeRef2.current);
    }
  }, [twoFactorVerifyURI]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome {session?.user.name}!</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8 grid-cols-1">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-14 w-14 sm:flex ">
                <AvatarImage
                  src={session?.user.image || undefined}
                  alt="Avatar"
                  className="object-cover"
                />
                <AvatarFallback className="text-xl">{session?.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold leading-none">
                    {session?.user.name}
                  </p>
                  {session?.user.emailVerified && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 text-xs px-2 py-0.5">
                      <ShieldCheck size={12} />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm">{session?.user.email}</p>
              </div>
            </div>
            <EditUserDialog />
          </div>
          <div className="flex items-center justify-between">
            <div>
            </div>
          </div>
        </div>

        {session?.user.emailVerified ? null : (
          <Alert>
            <AlertTitle>Verify Your Email Address</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Please verify your email address. Check your inbox for the
              verification email. If you haven't received the email, click the
              button below to resend.
              <Button
                size="sm"
                variant="secondary"
                className="mt-2"
                onClick={async () => {
                  await client.sendVerificationEmail(
                    {
                      email: session?.user.email || "",
                    },
                    {
                      onRequest(context) {
                        setEmailVerificationPending(true);
                      },
                      onError(context) {
                        toast.error(context.error.message);
                        setEmailVerificationPending(false);
                      },
                      onSuccess() {
                        toast.success("Verification email sent successfully");
                        setEmailVerificationPending(false);
                      },
                    },
                  );
                }}
              >
                {emailVerificationPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Credenza>
          <div className="px-2 w-max gap-1 flex flex-col">
            <p className="text-xs font-medium ">Active Sessions</p>
            <CredenzaTrigger asChild>
              <Button variant="ghost" size="sm" className="mt-2">
                View sessions
              </Button>
            </CredenzaTrigger>
          </div>
          <CredenzaContent>
            <CredenzaHeader>
              <CredenzaTitle>Active Sessions</CredenzaTitle>
              <CredenzaDescription>Manage your active sessions across all devices.</CredenzaDescription>
            </CredenzaHeader>
            <CredenzaBody>
              <ScrollArea className='overflow-y-auto mb-4 h-60'>

                {/* Group sessions by OS category */}
                {(() => {
                  const groups: Record<string, typeof activeSessions> = {};
                  activeSessions
                    .filter((s) => s.userAgent)
                    .forEach((s) => {
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
                  if (!entries.length)
                    return <p className="text-sm text-muted-foreground">No active sessions</p>;

                  const getIcon = (key: string) => {
                    if (key === "Windows") return <TbBrandWindows size={16} />;
                    if (key === "Mac/iOS") return <TbBrandApple size={16} />;
                    if (key === "Android") return <TbBrandAndroid size={16} />;
                    if (key === "Linux") return <FaLinux size={16} />;
                    return <Laptop size={16} />;
                  };

                  return (
                    <Accordion type="multiple" className="w-full mt-2">
                      {entries.map(([key, sessions]) => (
                        <AccordionItem key={key} value={key} className="border-b-0 w-full">
                          <AccordionTrigger className="flex items-center justify-between gap-3 px-2 py-2 rounded-md hover:bg-muted w-full">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{getIcon(key)}</span>
                              <div className="font-medium">{key}</div>
                              <Badge variant={'secondary'} className="py-0">{`${sessions.length} ${sessions.length === 1 ? 'session' : 'sessions'}`}</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-2 py-1">
                            <div className="grid gap-2">
                              {sessions.map((s) => {
                                const parser = new UAParser(s.userAgent || "");
                                const device = parser.getDevice();
                                const osVersion = parser.getOS().version || "Unknown";
                                const browser = parser.getBrowser().name || "Unknown";
                                const browserVer = parser.getBrowser().version || "Unknown";
                                const osName = parser.getOS().name || "Unknown";
                                const deviceName = device.model || device.vendor || osName;
                                // @ts-expect-error Fuck
                                const location = (s).location || (s).geo || (s).city || (s).ipLocation || null;
                                // @ts-expect-error Fuck
                                const ip = (s).ip || (s).ipAddress || (s).clientIp || (s).remoteAddress || null;
                                const isCurrent = s.id === props.session?.session.id;
                                return (
                                  <div key={s.id} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800">
                                    <div className="flex items-start gap-3">
                                      <div className="pt-0.5">
                                        {device.type === "mobile" ? <MobileIcon /> : <Laptop size={16} />}
                                      </div>
                                      <div>
                                        <header className="flex-center-2">
                                          {isCurrent && (
                                            <Badge variant={'informative'} className="px-2 py-0 rounded-full text-xs">Current</Badge>
                                          )}
                                          <div className="text-sm font-medium">{deviceName}</div>
                                        </header>
                                        <div className="text-xs text-muted-foreground">{osName} {osVersion} · {browser} {browserVer}</div>
                                        {location ? (
                                          <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={12} />{String(location)}</div>
                                        ) : ip ? (
                                          <div className="text-xs text-muted-foreground">IP: {ip}</div>
                                        ) : null}

                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="md-icon"
                                        variant={isCurrent ? "default" : "secondary"}
                                        onClick={async () => {
                                          setIsTerminating(s.id);
                                          const res = await client.revokeSession({ token: s.token });
                                          if (res.error) {
                                            toast.error(res.error.message);
                                          } else {
                                            toast.success("Session terminated successfully");
                                            removeActiveSession(s.id);
                                          }
                                          if (s.id === props.session?.session.id) router.refresh();
                                          setIsTerminating(undefined);
                                        }}
                                      >
                                        {isTerminating === s.id ? <Loader2 size={15} className="animate-spin" /> : isCurrent ? <LogOut size={15} /> : <Trash size={15} />}
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  );
                })()}
              </ScrollArea>
            </CredenzaBody>
          </CredenzaContent>
        </Credenza>
        <div className="border-y py-4 flex items-center flex-wrap justify-between gap-2">
          <div className="flex flex-col gap-2">
            <Credenza>
              <div className="px-2 w-max gap-1 flex flex-col">
                {/* <p className="text-xs font-medium">Passkeys</p> */}
                <CredenzaTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Fingerprint />
                    Manage passkeys
                  </Button>
                </CredenzaTrigger>
              </div>
              <CredenzaContent>
                <CredenzaHeader>
                  <CredenzaTitle>Passkeys</CredenzaTitle>
                  <CredenzaDescription>
                    Manage registered passkeys for your account.
                  </CredenzaDescription>
                </CredenzaHeader>
                <CredenzaBody>
                  <div className="flex items-center justify-between mb-4">
                    <AddPasskeyInline />
                  </div>
                  <PasskeysPanel />
                </CredenzaBody>
              </CredenzaContent>
            </Credenza>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm">Two Factor</p>
            <div className="flex gap-2">
              {!!session?.user.twoFactorEnabled && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <QrCode size={16} />
                      <span className="md:text-sm text-xs">Scan QR Code</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] w-11/12">
                    <DialogHeader>
                      <DialogTitle>Scan QR Code</DialogTitle>
                      <DialogDescription>
                        Scan the QR code with your TOTP app
                      </DialogDescription>
                    </DialogHeader>

                    {twoFactorVerifyURI ? (
                      <>
                        <div className="flex items-center justify-center">
                          <div ref={qrCodeRef1} />
                        </div>
                        <div className="flex gap-2 items-center justify-center">
                          <p className="text-sm text-muted-foreground">
                            Copy URI to clipboard
                          </p>
                          <CopyButton textToCopy={twoFactorVerifyURI} />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <PasswordInput
                          value={twoFaPassword}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setTwoFaPassword(e.target.value)
                          }
                          placeholder="Enter Password"
                        />
                        <Button
                          onClick={async () => {
                            if (twoFaPassword.length < 8) {
                              toast.error(
                                "Password must be at least 8 characters",
                              );
                              return;
                            }
                            await client.twoFactor.getTotpUri(
                              {
                                password: twoFaPassword,
                              },
                              {
                                onSuccess(context) {
                                  setTwoFactorVerifyURI(context.data.totpURI);
                                },
                              },
                            );
                            setTwoFaPassword("");
                          }}
                        >
                          Show QR Code
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              )}
              <Dialog open={twoFactorDialog} onOpenChange={setTwoFactorDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant={
                      session?.user.twoFactorEnabled ? "destructive" : "outline"
                    }
                    className="gap-2"
                  >
                    {session?.user.twoFactorEnabled ? (
                      <ShieldOff size={16} />
                    ) : (
                      <ShieldCheck size={16} />
                    )}
                    <span className="md:text-sm text-xs">
                      {session?.user.twoFactorEnabled
                        ? "Disable 2FA"
                        : "Enable 2FA"}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] w-11/12">
                  <DialogHeader>
                    <DialogTitle>
                      {session?.user.twoFactorEnabled
                        ? "Disable 2FA"
                        : "Enable 2FA"}
                    </DialogTitle>
                    <DialogDescription>
                      {session?.user.twoFactorEnabled
                        ? "Disable the second factor authentication from your account"
                        : "Enable 2FA to secure your account"}
                    </DialogDescription>
                  </DialogHeader>

                  {twoFactorVerifyURI ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-center">
                        <div ref={qrCodeRef2} />
                      </div>
                      <Label htmlFor="password">
                        Scan the QR code with your TOTP app
                      </Label>
                      <Input
                        value={twoFaPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setTwoFaPassword(e.target.value)
                        }
                        placeholder="Enter OTP"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="password">Password</Label>
                      <PasswordInput
                        id="password"
                        placeholder="Password"
                        value={twoFaPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setTwoFaPassword(e.target.value)
                        }
                      />
                    </div>
                  )}
                  <DialogFooter>
                    <Button
                      disabled={isPendingTwoFa}
                      onClick={async () => {
                        if (twoFaPassword.length < 8 && !twoFactorVerifyURI) {
                          toast.error("Password must be at least 8 characters");
                          return;
                        }
                        setIsPendingTwoFa(true);
                        if (session?.user.twoFactorEnabled) {
                          const res = await client.twoFactor.disable({
                            password: twoFaPassword,
                            fetchOptions: {
                              onError(context) {
                                toast.error(context.error.message);
                              },
                              onSuccess() {
                                toast("2FA disabled successfully");
                                setTwoFactorDialog(false);
                              },
                            },
                          });
                        } else {
                          if (twoFactorVerifyURI) {
                            await client.twoFactor.verifyTotp({
                              code: twoFaPassword,
                              fetchOptions: {
                                onError(context) {
                                  setIsPendingTwoFa(false);
                                  setTwoFaPassword("");
                                  toast.error(context.error.message);
                                },
                                onSuccess() {
                                  toast("2FA enabled successfully");
                                  setTwoFactorVerifyURI("");
                                  setIsPendingTwoFa(false);
                                  setTwoFaPassword("");
                                  setTwoFactorDialog(false);
                                },
                              },
                            });
                            return;
                          }
                          const res = await client.twoFactor.enable({
                            password: twoFaPassword,
                            fetchOptions: {
                              onError(context) {
                                toast.error(context.error.message);
                              },
                              onSuccess(ctx) {
                                setTwoFactorVerifyURI(ctx.data.totpURI);
                                // toast.success("2FA enabled successfully");
                                // setTwoFactorDialog(false);
                              },
                            },
                          });
                        }
                        setIsPendingTwoFa(false);
                        setTwoFaPassword("");
                      }}
                    >
                      {isPendingTwoFa ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : session?.user.twoFactorEnabled ? (
                        "Disable 2FA"
                      ) : (
                        "Enable 2FA"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2 justify-between items-center">
        <ChangePassword />
        {session?.session.impersonatedBy ? (
          <Button
            className="gap-2 z-10"
            variant="secondary"
            onClick={async () => {
              setIsSignOut(true);
              await client.admin.stopImpersonating();
              setIsSignOut(false);
              toast.info("Impersonation stopped successfully");
              router.push("/admin");
            }}
            disabled={isSignOut}
          >
            <span className="text-sm">
              {isSignOut ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <StopCircle size={16} color="red" />
                  Stop Impersonation
                </div>
              )}
            </span>
          </Button>
        ) : (
          <Button
            className="gap-2 z-10"
            variant="secondary"
            onClick={async () => {
              setIsSignOut(true);
              await signOut({
                fetchOptions: {
                  onSuccess() {
                    router.push("/");
                  },
                },
              });
              setIsSignOut(false);
            }}
            disabled={isSignOut}
          >
            <span className="text-sm">
              {isSignOut ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <LogOut size={16} />
                  Sign Out
                </div>
              )}
            </span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function EditUserDialog() {
  const { data, isPending, error } = useSession();
  const [name, setName] = useState<string>();
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, startTransition] = useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2" variant="secondary">
          <Edit size={13} />
          Edit User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Edit user information</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="name"
            placeholder={data?.user.name}
            required
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setName(e.target.value);
            }}
          />
          <div className="grid gap-2">
            <Label htmlFor="image">Profile Image</Label>
            <div className="flex items-end gap-4">
              {imagePreview && (
                <div className="relative w-16 h-16 rounded-sm overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Profile preview"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 w-full">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-muted-foreground"
                />
                {imagePreview && (
                  <X
                    className="cursor-pointer"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={isLoading}
            onClick={async () => {
              startTransition(async () => {
                await client.updateUser({
                  image: image ? await convertImageToBase64(image) : undefined,
                  name: name ? name : undefined,
                  fetchOptions: {
                    onSuccess: () => {
                      toast.success("User updated successfully");
                    },
                    onError: (error) => {
                      toast.error(error.error.message);
                    },
                  },
                });
                startTransition(() => {
                  setName("");
                  router.refresh();
                  setImage(null);
                  setImagePreview(null);
                  setOpen(false);
                });
              });
            }}
          >
            {isLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddPasskey() {
  const [isOpen, setIsOpen] = useState(false);
  const [passkeyName, setPasskeyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPasskey = async () => {
    if (!passkeyName) {
      toast.error("Passkey name is required");
      return;
    }
    setIsLoading(true);
    const res = await client.passkey.addPasskey({
      name: passkeyName,
    });
    if (res?.error) {
      toast.error(res?.error.message);
    } else {
      setIsOpen(false);
      toast.success("Passkey added successfully. You can now use it to login.");
    }
    setIsLoading(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={'sm'} className="gap-2 mx-auto">
          <Plus size={15} />
          Add New Passkey
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>Add New Passkey</DialogTitle>
          <DialogDescription>
            Create a new passkey to securely access your account without a
            password.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="passkey-name">Passkey Name</Label>
          <Input
            id="passkey-name"
            value={passkeyName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPasskeyName(e.target.value)
            }
          />
        </div>
        <DialogFooter>
          <Button
            disabled={isLoading}
            type="submit"
            onClick={handleAddPasskey}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                <Fingerprint className="mr-2 h-4 w-4" />
                Create Passkey
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}