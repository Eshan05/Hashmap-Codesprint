"use client"

import React, { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaBody,
  CredenzaHeader,
  CredenzaDescription,
  CredenzaTitle,
} from "@/components/ui/credenza";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { UAParser } from "ua-parser-js";
import { Laptop, Smartphone, Loader2, LogOut, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { authClient as client } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SessionsItem({ session }: { session: any }) {
  const [sessions, setSessions] = useState<any[] | null>(null);
  const [isTerminating, setIsTerminating] = useState<string | null>(null);
  const router = useRouter();

  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            (async () => {
              try {
                const r = await fetch("/api/auth/list-sessions", { credentials: "same-origin" });
                const json = await r.json();
                setSessions(json || []);
              } catch (err) {
                console.error(err);
                toast.error("Failed to load sessions");
              }
            })();
          }}
        >
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
  )
}
