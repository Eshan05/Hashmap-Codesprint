"use client"

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { MailIcon, PencilIcon, PhoneIcon, User2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import ImageUploadField from '@/components/ui/image-upload-field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import InputTags from '@/components/ui/input-tags'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar as CalIcon, Heart, Image as ImageIcon, Info, Lock as LockIcon, Settings as SettingsIcon, Tag as TagIcon, User } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import AllergiesEditor from './medical/allergies-editor'
import FamilyHistoryEditor from './medical/family-history-editor'
import ImmunizationsEditor from './medical/immunizations-editor'
import MedicationsEditor from './medical/medications-editor'
import MentalHealthEditor from './medical/mental-health-editor'
import PregnancyEditor from './medical/pregnancy-editor'

import { Allergy, FamilyHistoryItem, FavouriteMedicine, Immunization, MedicalCondition, Medication, MentalHealth, Pregnancy, SavedSearch } from '@/types/user-profile'
import { useForm } from 'react-hook-form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AdornedInputField } from '@/components/accessible-sleek-input'
import { Separator } from '@/components/ui/separator'
import GenderSelector from '@/components/profile-gender-selector'

type UserModel = {
  name: string
  email: string
  emailVerified: string | null
  phone: string | null
  image?: string | null
  twoFactorEnabled: boolean
  role?: string
  banned?: boolean
}

type ProfileModel = {
  displayName?: string | null
  bio?: string | null
  gender?: string | null
  locale?: string | null
  timezone?: string | null
  city?: string | null
  countryCode?: string | null
  //
  weight?: number | null
  height?: number | null
  dob?: string | null
  sex?: 'male' | 'female' | 'other' | 'unknown'
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
  //
  chronicConditions?: MedicalCondition[];
  allergies?: Allergy[];
  medications?: Medication[];
  familyHistory?: FamilyHistoryItem[];
  immunizations?: Immunization[];
  pregnancy?: Pregnancy | null;
  mentalHealth?: MentalHealth | null;
  //
  profileVisibility?: 'public' | 'private' | 'members-only'
  location?: { type: 'Point'; coordinates: [number, number] } | null
  //
  favouriteMedicines?: FavouriteMedicine[]
  savedSearches?: SavedSearch[]
  //
  lastPrivacyConsentAt?: string | Date | null
  healthDataConsentVersion?: string | null
  anonymizedId?: string | null
  searchAliases?: string[]
  onboardingCompleted?: boolean
  onboardingStep?: number
  //
  isPublicProfile?: boolean
  consentToResearch?: boolean
  gdprDataRetentionUntil?: string | Date | null
  deletionRequestedAt?: string | Date | null
  deletedAt?: string | Date | null
  //
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
    phone: session?.user?.phone ?? null,
    image: session?.user?.image ?? null,
    twoFactorEnabled: !!session?.user?.twoFactorEnabled,
    role: session?.user?.role ?? 'user',
    banned: !!session?.user?.banned,
  }

  const profileDefaults: ProfileModel = {
    displayName: session?.profile?.displayName ?? session?.user?.name ?? null,
    bio: session?.profile?.bio ?? null,
    gender: session?.profile?.gender ?? null,
    locale: session?.profile?.locale ?? null,
    timezone: session?.profile?.timezone ?? null,
    city: session?.profile?.city ?? null,
    countryCode: session?.profile?.countryCode ?? null,
    //
    weight: session?.profile?.medicalProfile?.weight ?? null,
    height: session?.profile?.medicalProfile?.height ?? null,
    dob: session?.profile?.medicalProfile?.dob ?? null,
    sex: session?.profile?.medicalProfile?.sex ?? 'unknown',
    bloodType: session?.profile?.medicalProfile?.bloodType ?? null,
    //
    chronicConditions: session?.profile?.medicalProfile?.chronicConditions ?? [],
    allergies: session?.profile?.medicalProfile?.allergies ?? [],
    medications: session?.profile?.medicalProfile?.medications ?? [],
    familyHistory: session?.profile?.medicalProfile?.familyHistory ?? [],
    immunizations: session?.profile?.medicalProfile?.immunizations ?? [],
    pregnancy: session?.profile?.medicalProfile?.pregnancy ?? null,
    mentalHealth: session?.profile?.medicalProfile?.mentalHealth ?? null,
    //
    profileVisibility: session?.profile?.profileVisibility ?? 'private',
    location: session?.profile?.location ?? null,
    //
    favouriteMedicines: session?.profile?.favouriteMedicines ?? [],
    savedSearches: session?.profile?.savedSearches ?? [],
    //
    lastPrivacyConsentAt: session?.profile?.lastPrivacyConsentAt ?? null,
    healthDataConsentVersion: session?.profile?.healthDataConsentVersion ?? null,
    anonymizedId: session?.profile?.anonymizedId ?? null,
    searchAliases: session?.profile?.searchAliases ?? [],
    onboardingCompleted: session?.profile?.onboardingCompleted ?? false,
    onboardingStep: session?.profile?.onboardingStep ?? 0,
    //
    isPublicProfile: session?.profile?.isPublicProfile ?? false,
    consentToResearch: session?.profile?.consentToResearch ?? false,
    gdprDataRetentionUntil: session?.profile?.gdprDataRetentionUntil ?? null,
    deletionRequestedAt: session?.profile?.deletionRequestedAt ?? null,
    deletedAt: session?.profile?.deletedAt ?? null,
    //
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

  function onSave(values: unknown) {
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

        <DialogContent className="max-w-4xl w-[94vw]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your public profile and account settings.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <Tabs defaultValue="profile" className="w-full flex-row" orientation="vertical">
              {/* <ScrollArea className="bg-transparent h-60 w-full flex-0"> */}
              <TabsList className="gap-1 flex-col bg-transparent h-full">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <TabsTrigger value="profile" className="" aria-label="Profile">
                          <User />
                        </TabsTrigger>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right">Profile</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <TabsTrigger value="personal" className="" aria-label="Personal">
                          <CalIcon />
                        </TabsTrigger>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right">Personal</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <TabsTrigger value="medical" className="" aria-label="Medical">
                          <Heart />
                        </TabsTrigger>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right">Medical</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <TabsTrigger value="prefs" className="" aria-label="Preferences">
                          <SettingsIcon />
                        </TabsTrigger>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right">Preferences</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <TabsTrigger value="system" className="" aria-label="System">
                          <Info />
                        </TabsTrigger>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right">System</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <TabsTrigger value="account" className="" aria-label="Account">
                          <LockIcon />
                        </TabsTrigger>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right">Account</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsList>
              {/* </ScrollArea> */}

              <ScrollArea className="h-60 w-full flex-1">
                <div className="rounded-md bg-background">
                  <TabsContent value="profile">
                    <div className="flex flex-col gap-4">
                      <section>
                        <FormField
                          control={form.control}
                          name="profile.displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Basic Info</FormLabel>
                              <FormControl>
                                <AdornedInputField
                                  field={field}
                                  Icon={User2Icon}
                                  placeholder="Your public display name"
                                  popoverLabel="Display Name Information"
                                  popoverContent={<p className=''>Your public display name</p>}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="user.email"
                          render={({ field }) => (
                            <FormItem>
                              {/* <FormLabel>Email</FormLabel> */}
                              <FormControl>
                                <AdornedInputField
                                  field={field}
                                  Icon={MailIcon}
                                  inputProps={{ readOnly: true }}
                                  placeholder="you@company.com"
                                  popoverLabel="Email Information"
                                  popoverContent={<p className=''>Your account email (Readonly).</p>}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="user.phone"
                          render={({ field }) => (
                            <FormItem>
                              {/* <FormLabel>Email</FormLabel> */}
                              <FormControl>
                                <AdornedInputField
                                  field={field}
                                  Icon={PhoneIcon}
                                  inputProps={{ readOnly: true }}
                                  placeholder="+1 (555) 123-4567"
                                  popoverLabel="Phone Information"
                                  popoverContent={<p className=''>Your account phone number (Readonly).</p>}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </section>
                      <section>
                        <FormField
                          control={form.control}
                          name="user.image"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel></FormLabel>
                              <FormControl>
                                <ImageUploadField form={form} name="user.image" label="Upload New Image" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </section>
                      <section>
                        <FormField
                          control={form.control}
                          name="profile.gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sex</FormLabel>
                              <FormControl>
                                <GenderSelector
                                  value={field.value as 'male' | 'female' | null}
                                  onChange={(selectedGender) => field.onChange(selectedGender)}
                                  disabled={form.formState.isSubmitting}
                                />
                              </FormControl>
                              <FormDescription>Select your biological sex or primary gender identity.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </section>
                      <FormField
                        control={form.control}
                        name="profile.bio"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value ?? ''} placeholder="Short bio" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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

                      <FormItem>
                        <FormLabel>Search aliases</FormLabel>
                        <FormControl>
                          <Input readOnly value={(form.getValues().profile?.searchAliases || []).join(', ')} />
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
              </ScrollArea>
            </Tabs>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
