"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authClient as client } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaDescription,
  CredenzaTitle,
} from "@/components/ui/credenza";
import { Loader2, KeyIcon, EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import { calculatePasswordStrength } from "@/utils/password-strength";

type FormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  signOutDevices?: boolean;
};

export default function ChangePassword() {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      signOutDevices: false,
    },
  });

  const newPassword = watch("newPassword") || "";

  const onSubmit = async (data: FormValues) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (data.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    const res = await client.changePassword({
      newPassword: data.newPassword,
      currentPassword: data.currentPassword,
      revokeOtherSessions: data.signOutDevices,
    });
    setLoading(false);
    if (res.error) {
      toast.error(res.error.message || "Couldn't change your password");
    } else {
      setOpen(false);
      toast.success("Password changed successfully");
      reset();
    }
  };

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger asChild>
        <Button className="gap-2 z-10" variant="outline" size="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M2.5 18.5v-1h19v1zm.535-5.973l-.762-.442l.965-1.693h-1.93v-.884h1.93l-.965-1.642l.762-.443L4 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L4 10.835zm8 0l-.762-.442l.966-1.693H9.308v-.884h1.93l-.965-1.642l.762-.443L12 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L12 10.835zm8 0l-.762-.442l.966-1.693h-1.931v-.884h1.93l-.965-1.642l.762-.443L20 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L20 10.835z"
            ></path>
          </svg>
          <span className="text-sm text-muted-foreground">Change Password</span>
        </Button>
      </CredenzaTrigger>

      <CredenzaContent className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2">
          <CredenzaHeader>
            <CredenzaTitle>Change Password</CredenzaTitle>
            <CredenzaDescription className="">
              Please enter your current password and the new password you would like to use.
            </CredenzaDescription>
          </CredenzaHeader>

          <div className="grid gap-2">
            <Label htmlFor="current-password">Current Password</Label>
            <p className="text-xs text-muted-foreground -mt-1">Enter your current password correctly to proceed.</p>
            <PasswordInput
              id="current-password"
              {...register("currentPassword", { required: true, minLength: 8 })}
              placeholder="Password"
              leftIcon={<LockIcon className="size-4 shrink-0 text-muted-foreground" />}
            />

            <Label htmlFor="new-password" className="mt-4">New Password</Label>
            <p className="text-xs text-muted-foreground -mt-1">Enter a new password as per requirements and re-enter to confirm it.</p>

            <div className="relative">
              <Input
                id="new-password"
                type={isVisible ? "text" : "password"}
                {...register("newPassword", { required: true, minLength: 8 })}
                placeholder="New Password"
                className="w-full peer ps-9 pe-9"
              />
              <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                <KeyIcon size={16} aria-hidden="true" />
              </div>
              <button
                className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={() => setIsVisible((s) => !s)}
                aria-label={isVisible ? "Hide password" : "Show password"}
                aria-pressed={isVisible}
              >
                {isVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>

            <div className="relative">
              <Input
                id="confirm-password"
                type={isConfirmVisible ? "text" : "password"}
                {...register("confirmPassword", { required: true, minLength: 8 })}
                placeholder="Confirm Password"
                className="w-full peer ps-9 pe-9"
              />
              <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                <KeyIcon size={16} aria-hidden="true" />
              </div>
              <button
                className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={() => setIsConfirmVisible((s) => !s)}
                aria-label={isConfirmVisible ? "Hide password" : "Show password"}
                aria-pressed={isConfirmVisible}
              >
                {isConfirmVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>

            {/* Strength meter (5 bars) */}
            <div className="">
              {(() => {
                const score = calculatePasswordStrength(newPassword); // 0-5
                const bars = Array.from({ length: 5 }).map((_, i) => i + 1);
                const getBarClass = (index: number) => {
                  if (score === 0) return "bg-neutral-200";
                  if (index <= score) {
                    if (score <= 1) return "bg-red-500";
                    if (score === 2) return "bg-amber-500";
                    if (score === 3) return "bg-yellow-400";
                    if (score === 4) return "bg-green-400";
                    return "bg-green-600";
                  }
                  return "bg-muted/20";
                };

                return (
                  <div className="flex items-center gap-2 mb-2">
                    {bars.map((b) => (
                      <div key={b} className={`h-2 flex-1 rounded-sm ${getBarClass(b)}`} style={{ minWidth: 0 }} />
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="flex gap-2 items-center">
              <Checkbox {...register("signOutDevices")} />
              <p className="text-sm">Sign out from other devices</p>
            </div>
          </div>

          <CredenzaFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 size={15} className="animate-spin" /> : "Change Password"}
            </Button>
          </CredenzaFooter>
        </form>
      </CredenzaContent>
    </Credenza>
  );
}
