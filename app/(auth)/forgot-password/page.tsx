"use client";

import { Logo } from "@/components/common/logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { authClient as client } from "@/lib/auth-client";
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, Loader2, MailIcon, User2Icon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Component() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await client.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      setIsSubmitted(true);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
        <div className="size-16 my-4 rounded-full border-2 grid place-items-center p-1 shadow-xs">
          <Logo className="size-10" />
        </div>
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <Card className="max-w-md w-full bg-gradient-to-b from-neutral-100/60 to-white/30 dark:from-neutral-900/60 dark:to-neutral-900/30 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl md:text-2xl">Check your email</CardTitle>
            <CardDescription className="text-sm">
              We've sent a password reset link to <code className="font-mono">{email}</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle2 className="size-4" />
              <AlertTitle>Password reset email sent</AlertTitle>
              <AlertDescription>
                If you don't see the email, check your spam folder. The link will expire for your security.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/sign-in">
                <User2Icon className="h-4 w-4" /> Return to sign in
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/contact">
                <MailIcon className="h-4 w-4" /> Contact us
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="size-16 my-4 rounded-full border-2 grid place-items-center p-1 shadow-xs">
        <Logo className="size-10" />
      </div>
      <Card className="w-full max-w-md bg-gradient-to-b from-neutral-100/60 to-white/30 dark:from-neutral-900/60 dark:to-neutral-900/30 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl md:text-2xl">Forgot password</CardTitle>
          <CardDescription className="text-sm">
            <div className="leading-tight sm:text-balance">
              Enter the email address you used when you joined and we’ll send you instructions to reset your password.
              <br />
              <br />
              For security reasons, we do NOT store your password. So rest assured that we will never send your password via email.
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="relative w-full">
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full peer ps-9"
              />
              <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                <MailIcon size={16} aria-hidden="true" />
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button className="w-full mt-2 gap-2" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <MailIcon size={16} />}
              <span>Send reset link</span>
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2">
          <Button asChild variant="outline" className="w-full">
            <Link href="/sign-in">
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/contact">
              <MailIcon className="h-4 w-4" /> Contact us
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
