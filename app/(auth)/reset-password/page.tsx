"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// Removed Label import
import { authClient as client } from "@/lib/auth-client";
import { AlertCircle, CheckCircle2, CheckCircle, XCircle, ArrowLeft, MailIcon, Loader2, KeyIcon, EyeIcon, EyeOffIcon, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { calculatePasswordStrength } from "@/utils/password-strength";
import { Logo } from "@/components/auth/logo";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Basic client-side validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await client.resetPassword({
        newPassword: password,
        token: new URLSearchParams(window.location.search).get("token")!,
      });

      if (res.error) {
        setError(res.error.message || "Failed to reset password.");
        toast.error(res.error.message || "Failed to reset password.");
      } else {
        setIsSubmitted(true);
        toast.success("Password reset successfully");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="size-16 my-4 rounded-full border-2 grid place-items-center p-1 shadow-xs">
          <Logo className="size-10" />
        </div>
        <Card className="max-w-md w-full bg-gradient-to-b from-neutral-100/60 to-white/30 dark:from-neutral-900/60 dark:to-neutral-900/30 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl md:text-2xl">Password reset</CardTitle>
            <CardDescription className="text-sm">Your password has been updated.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle2 className="size-4" />
              <AlertTitle>Reset successful</AlertTitle>
              <AlertDescription>
                You can now sign in with your new password. For security, your old sessions may be invalidated.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/contact">
                <MailIcon className="h-4 w-4" /> Contact us
              </Link>
            </Button>
            <Button asChild variant="default" className="w-full">
              <Link href="/patient/dashboard">
                <ExternalLink className="h-4 w-4" /> Go to dashboard
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="size-16 my-4 rounded-full border-2 grid place-items-center p-1 shadow-xs">
        <Logo className="size-10" />
      </div>
      <Card className="w-full max-w-md bg-gradient-to-b from-neutral-100/60 to-white/30 dark:from-neutral-900/60 dark:to-neutral-900/30 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl md:text-2xl">Reset password</CardTitle>
          <CardDescription className="text-sm">
            Enter your new password and confirm it below. Make sure it is at least 8 characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="grid gap-2 w-full">
                <div className="relative w-full">
                  <Input
                    id="new-password"
                    type={isVisible ? "text" : "password"}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
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

                <div className="relative w-full">
                  <Input
                    id="confirm-password"
                    type={isConfirmVisible ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
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
                <div className="mt-1">
                  {(() => {
                    const score = calculatePasswordStrength(password); // 0-5
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

                <div className='flex w-full flex-col items-start justify-center my-2'>
                  <div className='mx-2 flex flex-col items-start gap-1'>
                    {(() => {
                      if (!password) return null;
                      const flags = [
                        { value: /[A-Z]/.test(password), message: 'At least one uppercase letter' },
                        { value: /[a-z]/.test(password), message: 'At least one lowercase letter' },
                        { value: /[0-9]/.test(password), message: 'At least one number' },
                        { value: /[!@#$%^&*]/.test(password), message: 'At least one special character' },
                        { value: /.{8,}/.test(password), message: 'At least 8 characters' },
                      ];

                      return (
                        <>
                          {flags.map((f, i) => (
                            <div key={i} className='inline-flex gap-2 text-sm items-center'>
                              {f.value ? (
                                <CheckCircle className='text-primary' size={12} />
                              ) : (
                                <XCircle className='text-muted-foreground' size={12} />
                              )}
                              <p className={f.value ? 'text-primary' : 'text-muted-foreground'}>{f.message}</p>
                            </div>
                          ))}
                          <div className='inline-flex gap-2 text-sm items-center'>
                            {password && confirmPassword && password === confirmPassword ? (
                              <CheckCircle className='text-primary' size={12} />
                            ) : (
                              <XCircle className='text-muted-foreground' size={12} />
                            )}
                            <p className={password && confirmPassword && password === confirmPassword ? 'text-primary' : 'text-muted-foreground'}>Passwords match</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button className="w-full mt-4 gap-2" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              <span>{isSubmitting ? "Resetting..." : "Reset password"}</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
