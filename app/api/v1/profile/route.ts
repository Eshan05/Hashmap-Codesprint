import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import User from '@/models/user'
import UserProfile from '@/models/user-profile'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, errors: { general: 'Unauthorized' } }, { status: 401 })
    }

    console.log('Fetching profile for user ID:', session.user.id)
    const userProfile = await UserProfile.findOne({ user: session.user.id }).lean()
    if (!userProfile) {
      return NextResponse.json({ success: false, errors: { general: 'Profile not found' } }, { status: 404 })
    }

    // Map back to the form structure
    const profileData = {
      displayName: userProfile.displayName,
      bio: userProfile.bio,
      gender: userProfile.gender,
      locale: userProfile.locale,
      timezone: userProfile.timezone,
      city: userProfile.city,
      countryCode: userProfile.countryCode,
      weight: userProfile.medicalProfile?.weight,
      height: userProfile.medicalProfile?.height,
      dob: userProfile.medicalProfile?.dob,
      sex: userProfile.medicalProfile?.sex,
      bloodType: userProfile.medicalProfile?.bloodType,
      chronicConditions: userProfile.medicalProfile?.chronicConditions,
      allergies: userProfile.medicalProfile?.allergies,
      medications: userProfile.medicalProfile?.medications,
      familyHistory: userProfile.medicalProfile?.familyHistory,
      immunizations: userProfile.medicalProfile?.immunizations,
      pregnancy: userProfile.medicalProfile?.pregnancy,
      mentalHealth: userProfile.medicalProfile?.mentalHealth ? {
        ...userProfile.medicalProfile.mentalHealth,
        diagnoses: userProfile.medicalProfile.mentalHealth.diagnoses?.map((d: any) => ({
          disorder_name: d.name,
          abbreviation: d.code,
        })) || [],
      } : null,
      profileVisibility: userProfile.profileVisibility,
      location: userProfile.location,
      favouriteMedicines: userProfile.favouriteMedicines,
      savedSearches: userProfile.savedSearches,
      lastPrivacyConsentAt: userProfile.lastPrivacyConsentAt,
      healthDataConsentVersion: userProfile.healthDataConsentVersion,
      anonymizedId: userProfile.anonymizedId,
      searchAliases: userProfile.searchAliases,
      onboardingCompleted: userProfile.onboardingCompleted,
      onboardingStep: userProfile.onboardingStep,
      isPublicProfile: userProfile.isPublicProfile,
      consentToResearch: userProfile.consentToResearch,
      gdprDataRetentionUntil: userProfile.gdprDataRetentionUntil,
      deletionRequestedAt: userProfile.deletionRequestedAt,
      deletedAt: userProfile.deletedAt,
      isActive: userProfile.isActive,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt,
    }

    const userData = session.user

    return NextResponse.json({ success: true, data: { user: userData, profile: profileData } })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ success: false, errors: { general: 'Internal server error' } }, { status: 500 })
  }
}
import dbConnect from '@/utils/db-conn'

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, errors: { general: 'Unauthorized' } }, { status: 401 })
    }

    const body = await request.json()
    const { user: userData, profile: profileData } = body

    // Basic validation
    const errors: Record<string, string> = {}

    if (!userData.name || userData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }

    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.email = 'Invalid email format'
    }

    if (profileData.dob && isNaN(Date.parse(profileData.dob))) {
      errors.dob = 'Invalid date of birth'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    // Update User
    await User.findByIdAndUpdate(session.user.id, {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      image: userData.image,
      twoFactorEnabled: userData.twoFactorEnabled,
      role: userData.role,
      banned: userData.banned,
    })

    // Map profile data to medicalProfile
    const medicalProfile = {
      dob: profileData.dob,
      weight: profileData.weight,
      height: profileData.height,
      sex: profileData.sex,
      bloodType: profileData.bloodType,
      chronicConditions: profileData.chronicConditions,
      allergies: profileData.allergies,
      medications: profileData.medications,
      familyHistory: profileData.familyHistory,
      immunizations: profileData.immunizations,
      pregnancy: profileData.pregnancy,
      mentalHealth: profileData.mentalHealth ? {
        ...profileData.mentalHealth,
        diagnoses: profileData.mentalHealth.diagnoses?.map((d: any) => ({
          name: d.disorder_name,
          code: d.abbreviation,
        })) || [],
      } : null,
    }

    // Update UserProfile
    await UserProfile.findOneAndUpdate(
      { user: session.user.id },
      {
        displayName: profileData.displayName,
        bio: profileData.bio,
        gender: profileData.gender,
        locale: profileData.locale,
        timezone: profileData.timezone,
        city: profileData.city,
        countryCode: profileData.countryCode,
        profileVisibility: profileData.profileVisibility,
        location: profileData.location,
        favouriteMedicines: profileData.favouriteMedicines,
        savedSearches: profileData.savedSearches,
        lastPrivacyConsentAt: profileData.lastPrivacyConsentAt,
        healthDataConsentVersion: profileData.healthDataConsentVersion,
        anonymizedId: profileData.anonymizedId,
        searchAliases: profileData.searchAliases,
        onboardingCompleted: profileData.onboardingCompleted,
        onboardingStep: profileData.onboardingStep,
        isPublicProfile: profileData.isPublicProfile,
        consentToResearch: profileData.consentToResearch,
        gdprDataRetentionUntil: profileData.gdprDataRetentionUntil,
        deletionRequestedAt: profileData.deletionRequestedAt,
        deletedAt: profileData.deletedAt,
        isActive: profileData.isActive,
        medicalProfile,
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ success: false, errors: { general: 'Internal server error' } }, { status: 500 })
  }
}

// PATCH /api/profile - Partially update user profile
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, errors: { general: 'Unauthorized' } }, { status: 401 })
    }

    const body = await request.json()

    if (body.user) {
      const userUpdates: any = {}
      const allowedUserFields = ['name', 'email', 'phone', 'image', 'twoFactorEnabled', 'role', 'banned']

      for (const field of allowedUserFields) {
        if (body.user[field] !== undefined) {
          userUpdates[field] = body.user[field]
        }
      }

      if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(session.user.id, userUpdates)
      }
    }

    if (body.profile) {
      const profileUpdates: any = {}
      const profileData = body.profile

      if (profileData.dob || profileData.weight || profileData.height || profileData.sex ||
        profileData.bloodType || profileData.chronicConditions || profileData.allergies ||
        profileData.medications || profileData.familyHistory || profileData.immunizations ||
        profileData.pregnancy || profileData.mentalHealth) {

        const existingProfile = await UserProfile.findOne({ user: session.user.id })
        const medicalProfile = existingProfile?.medicalProfile || {}

        if (profileData.dob !== undefined) medicalProfile.dob = profileData.dob
        if (profileData.weight !== undefined) medicalProfile.weight = profileData.weight
        if (profileData.height !== undefined) medicalProfile.height = profileData.height
        if (profileData.sex !== undefined) medicalProfile.sex = profileData.sex
        if (profileData.bloodType !== undefined) medicalProfile.bloodType = profileData.bloodType
        if (profileData.chronicConditions !== undefined) medicalProfile.chronicConditions = profileData.chronicConditions
        if (profileData.allergies !== undefined) medicalProfile.allergies = profileData.allergies
        if (profileData.medications !== undefined) medicalProfile.medications = profileData.medications
        if (profileData.familyHistory !== undefined) medicalProfile.familyHistory = profileData.familyHistory
        if (profileData.immunizations !== undefined) medicalProfile.immunizations = profileData.immunizations
        if (profileData.pregnancy !== undefined) medicalProfile.pregnancy = profileData.pregnancy

        if (profileData.mentalHealth !== undefined) {
          medicalProfile.mentalHealth = {
            ...profileData.mentalHealth,
            diagnoses: profileData.mentalHealth.diagnoses?.map((d: any) => ({
              name: d.disorder_name,
              code: d.abbreviation,
            })) || [],
          }
        }

        profileUpdates.medicalProfile = medicalProfile
      }

      // Handle other profile fields
      const allowedProfileFields = [
        'displayName', 'bio', 'gender', 'locale', 'timezone', 'city', 'countryCode',
        'profileVisibility', 'location', 'favouriteMedicines', 'savedSearches',
        'lastPrivacyConsentAt', 'healthDataConsentVersion', 'anonymizedId',
        'searchAliases', 'onboardingCompleted', 'onboardingStep', 'isPublicProfile',
        'consentToResearch', 'gdprDataRetentionUntil', 'deletionRequestedAt',
        'deletedAt', 'isActive'
      ]

      for (const field of allowedProfileFields) {
        if (profileData[field] !== undefined) {
          profileUpdates[field] = profileData[field]
        }
      }

      if (Object.keys(profileUpdates).length > 0) {
        await UserProfile.findOneAndUpdate(
          { user: session.user.id },
          profileUpdates,
          { new: true }
        )
      }
    }

    return NextResponse.json({ success: true, message: 'Profile partially updated' })
  } catch (error) {
    console.error('Profile patch error:', error)
    return NextResponse.json({ success: false, errors: { general: 'Internal server error' } }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, errors: { general: 'Unauthorized' } }, { status: 401 })
    }

    await UserProfile.findOneAndUpdate(
      { user: session.user.id },
      {
        deletedAt: new Date(),
        isActive: false,
        deletionRequestedAt: new Date()
      }
    )

    await User.findByIdAndUpdate(session.user.id, {
      banned: true
    })

    return NextResponse.json({ success: true, message: 'Profile marked for deletion' }, { status: 200 })
  } catch (error) {
    console.error('Profile deletion error:', error)
    return NextResponse.json({ success: false, errors: { general: 'Internal server error' } }, { status: 500 })
  }
}