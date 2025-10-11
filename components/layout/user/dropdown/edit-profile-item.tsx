"use client"

import React from 'react'
import { useState } from 'react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PencilIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { User, Image as ImageIcon, Calendar as CalIcon, Heart, Settings as SettingsIcon, Tag as TagIcon, Lock as LockIcon, MapPin, Info } from 'lucide-react'
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from '@/components/ui/input-group'
import InputTags from '@/components/ui/input-tags'
import ImageUploadField from '@/components/ui/image-upload-field'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectLabel } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import FamilyHistoryEditor from './medical/family-history-editor'
import ImmunizationsEditor from './medical/immunizations-editor'
import MedicationsEditor from './medical/medications-editor'
import AllergiesEditor from './medical/allergies-editor'
import PregnancyEditor from './medical/pregnancy-editor'
import MentalHealthEditor from './medical/mental-health-editor'
import { Checkbox } from '@/components/ui/checkbox'

import { useForm } from 'react-hook-form'

type UserModel = {
  name: string
  email: string
  emailVerified: string | null
  image?: string | null
  twoFactorEnabled: boolean
  role?: string
  banned?: boolean
}

type ProfileModel = {
  displayName?: string | null
  bio?: string | null
  pronouns?: string | null
  pronounsVerified?: boolean
  locale?: string | null
  timezone?: string | null
  city?: string | null
  countryCode?: string | null
  dob?: string | null
  sex?: 'male' | 'female' | 'other' | 'unknown'
  bloodType?: string | null
  chronicConditions?: Array<{ code?: string; name?: string; active?: boolean; onsetYear?: number | null }>
  allergies?: Array<{ substanceCode?: string; name?: string; severity?: string; confirmed?: boolean }>
  medications?: Array<{ name?: string; rxNorm?: string; dosage?: string | null; current?: boolean }>
  tags?: string[]
  // additional system/metadata fields from IUserProfile
  profileVisibility?: 'public' | 'private' | 'members-only'
  location?: { type: 'Point'; coordinates: [number, number] } | null
  symptomPreferences?: Record<string, any>
  favouriteMedicines?: Array<Record<string, any>>
  savedSearches?: Array<Record<string, any>>
  metadata?: Record<string, any>
  lastPrivacyConsentAt?: string | Date | null
  healthDataConsentVersion?: string | null
  anonymizedId?: string | null
  searchAliases?: string[]
  onboardingCompleted?: boolean
  onboardingStep?: number
  localeHints?: { measuredAt?: Date; timezoneOffset?: number } | null
  isPublicProfile?: boolean
  consentToResearch?: boolean
  dataSharingOptIn?: boolean
  gdprDataRetentionUntil?: string | Date | null
  deletionRequestedAt?: string | Date | null
  deletedAt?: string | Date | null
  isActive?: boolean
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
}

export default function EditProfileItem({ session }: { session: any }) {
  const [open, setOpen] = useState(false)

  const userDefaults: UserModel = {
    name: session?.user?.name ?? '',
    email: session?.user?.email ?? '',
    emailVerified: session?.user?.emailVerified ?? null,
    image: session?.user?.image ?? null,
    twoFactorEnabled: !!session?.user?.twoFactorEnabled,
    role: session?.user?.role ?? 'user',
    banned: !!session?.user?.banned,
  }

  const profileDefaults: ProfileModel = {
    displayName: session?.profile?.displayName ?? session?.user?.name ?? null,
    bio: session?.profile?.bio ?? null,
    pronouns: session?.profile?.pronouns ?? null,
    pronounsVerified: session?.profile?.pronounsVerified ?? false,
    locale: session?.profile?.locale ?? null,
    timezone: session?.profile?.timezone ?? null,
    city: session?.profile?.city ?? null,
    countryCode: session?.profile?.countryCode ?? null,
    dob: session?.profile?.medicalProfile?.dob ?? null,
    sex: session?.profile?.medicalProfile?.sex ?? 'unknown',
    bloodType: session?.profile?.medicalProfile?.bloodType ?? null,
    chronicConditions: session?.profile?.medicalProfile?.chronicConditions ?? [],
    allergies: session?.profile?.medicalProfile?.allergies ?? [],
    medications: session?.profile?.medicalProfile?.medications ?? [],
    tags: session?.profile?.tags ?? [],
    // additional fields from IUserProfile
    profileVisibility: session?.profile?.profileVisibility ?? 'private',
    location: session?.profile?.location ?? null,
    symptomPreferences: session?.profile?.symptomPreferences ?? {},
    favouriteMedicines: session?.profile?.favouriteMedicines ?? [],
    savedSearches: session?.profile?.savedSearches ?? [],
    metadata: session?.profile?.metadata ?? {},
    lastPrivacyConsentAt: session?.profile?.lastPrivacyConsentAt ?? null,
    healthDataConsentVersion: session?.profile?.healthDataConsentVersion ?? null,
    anonymizedId: session?.profile?.anonymizedId ?? null,
    searchAliases: session?.profile?.searchAliases ?? [],
    onboardingCompleted: session?.profile?.onboardingCompleted ?? false,
    onboardingStep: session?.profile?.onboardingStep ?? 0,
    localeHints: session?.profile?.localeHints ?? null,
    isPublicProfile: session?.profile?.isPublicProfile ?? false,
    consentToResearch: session?.profile?.consentToResearch ?? false,
    dataSharingOptIn: session?.profile?.dataSharingOptIn ?? false,
    gdprDataRetentionUntil: session?.profile?.gdprDataRetentionUntil ?? null,
    deletionRequestedAt: session?.profile?.deletionRequestedAt ?? null,
    deletedAt: session?.profile?.deletedAt ?? null,
    isActive: session?.profile?.isActive ?? true,
    createdAt: session?.profile?.createdAt ?? null,
    updatedAt: session?.profile?.updatedAt ?? null,
  }

  const form = useForm<{ user: UserModel; profile: ProfileModel }>({
    defaultValues: {
      user: userDefaults,
      profile: profileDefaults,
    },
  })

  function onSave(values: any) {
    // For now just log and toast; backend wiring later
    console.log('Save payload', values)
    toast.success('Profile changes saved (frontend only)')
    setOpen(false)
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

        <DialogContent className="max-w-3xl w-[94vw]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your public profile and account settings.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <Tabs defaultValue="profile" className="flex flex-col">
              <div className="grid grid-cols-12 gap-4">
                <aside className="col-span-1">
                  <ScrollArea className="h-[56vh] w-full">
                    <TabsList className="flex flex-col gap-2">
                      <TabsTrigger value="profile" aria-label="Profile"><User className="size-4" /></TabsTrigger>
                      <TabsTrigger value="avatar" aria-label="Avatar"><ImageIcon className="size-4" /></TabsTrigger>
                      <TabsTrigger value="personal" aria-label="Personal"><CalIcon className="size-4" /></TabsTrigger>
                      <TabsTrigger value="medical" aria-label="Medical"><Heart className="size-4" /></TabsTrigger>
                      <TabsTrigger value="prefs" aria-label="Preferences"><SettingsIcon className="size-4" /></TabsTrigger>
                      <TabsTrigger value="meta" aria-label="Tags"><TagIcon className="size-4" /></TabsTrigger>
                      <TabsTrigger value="system" aria-label="System"><Info className="size-4" /></TabsTrigger>
                      <TabsTrigger value="account" aria-label="Account"><LockIcon className="size-4" /></TabsTrigger>
                    </TabsList>
                  </ScrollArea>
                </aside>

                <div className="col-span-11">
                  <div className="p-4 border rounded-md bg-background">
                    <TabsContent value="profile">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="profile.displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display name</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} placeholder="Your public display name" />
                              </FormControl>
                              <FormDescription>How your name appears on your public profile.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="user.email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="you@company.com" />
                              </FormControl>
                              <FormDescription>Your account email (used for sign-in).</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="profile.bio"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} placeholder="Short bio" />
                              </FormControl>
                              <FormDescription>A short summary about you.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="avatar">
                      <div className="grid grid-cols-2 gap-4 items-start">
                        <div>
                          <FormField
                            control={form.control}
                            name="user.image"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Profile Image</FormLabel>
                                <FormControl>
                                  <ImageUploadField form={form as any} name="user.image" />
                                </FormControl>
                                <FormDescription>Recommended 256x256 PNG or JPG.</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div>
                          <FormItem>
                            <FormLabel>Pronouns</FormLabel>
                            <FormControl>
                              <InputGroup>
                                <InputGroupInput {...form.register('profile.pronouns' as const)} placeholder="they/them" />
                                <InputGroupButton onClick={() => toast('Pronouns saved')} variant="ghost">Save</InputGroupButton>
                              </InputGroup>
                            </FormControl>
                            <FormDescription>Optional pronouns shown on your profile.</FormDescription>
                          </FormItem>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="personal">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="profile.dob"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of birth</FormLabel>
                              <FormControl>
                                <Calendar mode="single" onSelect={(d: any) => field.onChange(d ? d.toISOString() : null)} selected={field.value ? new Date(field.value) : undefined} />
                              </FormControl>
                              <FormDescription>Used for age-based features. Not public.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="profile.city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} placeholder="City" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="profile.countryCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="US">United States</SelectItem>
                                    <SelectItem value="IN">India</SelectItem>
                                    <SelectItem value="GB">United Kingdom</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="medical">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="profile.sex"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sex</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value || 'unknown'}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                    <SelectItem value="unknown">Prefer not to say</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="profile.bloodType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Blood Type</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select blood type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bt => (
                                      <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="profile.chronicConditions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chronic conditions</FormLabel>
                              <FormControl>
                                <InputTags
                                  value={Array.isArray(field.value) ? field.value.map((c: any) => c.name || c.code || '') : []}
                                  onChange={(next) => {
                                    const vals = typeof next === 'function' ? next(Array.isArray(field.value) ? field.value.map((c: any) => c.name || c.code || '') : []) : next
                                    field.onChange(vals.map((v: string) => ({ name: v })))
                                  }}
                                />
                              </FormControl>
                              <FormDescription>List of ongoing medical conditions.</FormDescription>
                            </FormItem>
                          )}
                        />

                        <div>
                          <h4 className="text-sm font-medium mb-2">Medications</h4>
                          <MedicationsEditor name="profile.medications" />
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Allergies</h4>
                          <AllergiesEditor name="profile.allergies" />
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Family history</h4>
                          <FamilyHistoryEditor name="profile.familyHistory" />
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Immunizations</h4>
                          <ImmunizationsEditor name="profile.immunizations" />
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Mental health</h4>
                          <MentalHealthEditor name="profile.mentalHealth.diagnoses" />
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Pregnancy</h4>
                          <PregnancyEditor name="profile.pregnancy" />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="prefs">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="profile.locale"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Language / Locale</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} placeholder="en-US" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="profile.timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Timezone</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} placeholder="America/New_York" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="meta">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="profile.tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tags</FormLabel>
                              <FormControl>
                                <InputTags value={field.value || []} onChange={(v) => field.onChange(v)} />
                              </FormControl>
                              <FormDescription>Keywords to help others find your profile.</FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="system">
                      <div className="grid grid-cols-2 gap-4">
                        <FormItem>
                          <FormLabel>Profile visibility</FormLabel>
                          <FormControl>
                            <Input readOnly value={form.getValues().profile?.profileVisibility ?? ''} />
                          </FormControl>
                        </FormItem>

                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input readOnly value={form.getValues().profile?.location ? JSON.stringify(form.getValues().profile?.location) : ''} />
                          </FormControl>
                          <FormDescription>GeoJSON point (lon, lat) if available.</FormDescription>
                        </FormItem>

                        <FormItem className="col-span-2">
                          <FormLabel>Symptom preferences</FormLabel>
                          <FormControl>
                            <pre className="max-h-40 overflow-auto rounded bg-muted p-2 text-sm">{JSON.stringify(form.getValues().profile?.symptomPreferences ?? {}, null, 2)}</pre>
                          </FormControl>
                        </FormItem>

                        <FormItem>
                          <FormLabel>Favourite medicines</FormLabel>
                          <FormControl>
                            <pre className="max-h-36 overflow-auto rounded bg-muted p-2 text-sm">{JSON.stringify(form.getValues().profile?.favouriteMedicines ?? [], null, 2)}</pre>
                          </FormControl>
                        </FormItem>

                        <FormItem>
                          <FormLabel>Saved searches</FormLabel>
                          <FormControl>
                            <pre className="max-h-36 overflow-auto rounded bg-muted p-2 text-sm">{JSON.stringify(form.getValues().profile?.savedSearches ?? [], null, 2)}</pre>
                          </FormControl>
                        </FormItem>

                        <FormItem className="col-span-2">
                          <FormLabel>Metadata</FormLabel>
                          <FormControl>
                            <pre className="max-h-40 overflow-auto rounded bg-muted p-2 text-sm">{JSON.stringify(form.getValues().profile?.metadata ?? {}, null, 2)}</pre>
                          </FormControl>
                        </FormItem>

                        <FormItem>
                          <FormLabel>Search aliases</FormLabel>
                          <FormControl>
                            <Input readOnly value={(form.getValues().profile?.searchAliases || []).join(', ')} />
                          </FormControl>
                        </FormItem>

                        <FormItem>
                          <FormLabel>Locale hints</FormLabel>
                          <FormControl>
                            <Input readOnly value={form.getValues().profile?.localeHints ? JSON.stringify(form.getValues().profile?.localeHints) : ''} />
                          </FormControl>
                        </FormItem>

                        <FormItem>
                          <FormLabel>Onboarding</FormLabel>
                          <FormControl>
                            <Input readOnly value={`completed: ${String(form.getValues().profile?.onboardingCompleted)} step: ${String(form.getValues().profile?.onboardingStep)}`} />
                          </FormControl>
                        </FormItem>

                        <FormItem>
                          <FormLabel>Privacy / Consent</FormLabel>
                          <div className="flex gap-4 items-center mt-2">
                            <div className="flex items-center gap-2">
                              <Checkbox {...form.register('profile.consentToResearch' as const)} checked={Boolean(form.getValues().profile?.consentToResearch)} />
                              <span>Consent to research</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Checkbox {...form.register('profile.dataSharingOptIn' as const)} checked={Boolean(form.getValues().profile?.dataSharingOptIn)} />
                              <span>Data sharing opt-in</span>
                            </div>
                          </div>
                        </FormItem>

                        <FormItem>
                          <FormLabel>Timestamps</FormLabel>
                          <FormControl>
                            <Input readOnly value={`created: ${String(form.getValues().profile?.createdAt)} updated: ${String(form.getValues().profile?.updatedAt)}`} />
                          </FormControl>
                        </FormItem>
                      </div>
                    </TabsContent>

                    <TabsContent value="account">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="user.twoFactorEnabled"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Two-factor authentication</FormLabel>
                              <FormControl>
                                <InputGroup>
                                  <InputGroupInput readOnly value={field.value ? 'Enabled' : 'Disabled'} />
                                  <InputGroupButton onClick={() => toast('Two-factor flow not implemented here')}>
                                    Manage
                                  </InputGroupButton>
                                </InputGroup>
                              </FormControl>
                              <FormDescription>Manage your TOTP / passkeys in the Security menu.</FormDescription>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="user.role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>Account role, for admin use.</FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={form.handleSubmit(onSave)}>Save changes</Button>
                  </div>
                </div>
              </div>
            </Tabs>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
