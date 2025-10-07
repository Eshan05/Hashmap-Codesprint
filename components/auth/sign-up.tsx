"use client";

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
import { useState, useTransition } from "react";
import { Loader2, MailIcon, KeyIcon, EyeIcon, EyeOffIcon, UserPlus2Icon, ExternalLinkIcon } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCallbackURL } from "@/lib/shared";
import ImageUploadField from "@/components/ui/image-upload-field";
import { Form } from "@/components/ui/form";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { calculatePasswordStrength } from "@/utils/password-strength";
import { CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  image?: File | undefined;
};

export function SignUp() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, startTransition] = useTransition();
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      image: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (data.password !== data.passwordConfirmation) {
      toast.error("Passwords do not match");
      return;
    }

    startTransition(async () => {
      try {
        await signUp.email({
          email: data.email,
          password: data.password,
          name: `${data.firstName} ${data.lastName}`.trim(),
          image: data.image ? await convertImageToBase64(data.image as File) : "",
          callbackURL: "/dashboard",
          fetchOptions: {
            onError: (ctx) => {
              toast.error(ctx.error.message);
            },
            onSuccess: async () => {
              toast.success("Successfully signed up");
              router.push(getCallbackURL(params));
            },
          },
        });
      } catch (err) {
        if (err instanceof Error) toast.error(err.message);
      }
    });
  };

  return (
    <Card className="max-w-md w-full bg-gradient-to-b from-neutral-100/50 to-white/30 dark:from-neutral-900/50 dark:to-neutral-900/30 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-xl md:text-2xl">Create an account</CardTitle>
        <CardDescription className="text-sm">Join and get access to the dashboard and features.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              <FormItem>
                <FormLabel className="sr-only">First name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="First name"
                      {...form.register("firstName", { required: "First name is required" })}
                      className="w-full peer ps-9"
                    />
                    <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                      <UserPlus2Icon size={16} aria-hidden="true" />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel className="sr-only">Last name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Last name"
                      {...form.register("lastName", { required: "Last name is required" })}
                      className="w-full peer ps-9"
                    />
                    <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                      <UserPlus2Icon size={16} aria-hidden="true" />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>

            <FormItem>
              <FormLabel className="sr-only">Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    {...form.register("email", { required: "Email is required" })}
                    className="w-full peer ps-9"
                  />
                  <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                    <MailIcon size={16} aria-hidden="true" />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
            <section className="flex flex-col gap-2">
              <FormItem>
                <FormLabel className="sr-only">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="password"
                      type={isVisible ? "text" : "password"}
                      placeholder="Password"
                      {...form.register("password", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })}
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
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel className="sr-only">Confirm password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="password_confirmation"
                      type={isConfirmVisible ? "text" : "password"}
                      placeholder="Confirm password"
                      {...form.register("passwordConfirmation", { required: "Confirm password is required", minLength: { value: 8, message: "Confirm password must be at least 8 characters" } })}
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
                </FormControl>
                <FormMessage />
              </FormItem>

              {/* Strength meter (5 bars) */}
              <div className="">
                {(() => {
                  const password = form.getValues("password") || "";
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
            </section>

            <div className="grid gap-2">
              <ImageUploadField form={form} name={"image"} label="Profile image (optional)" />
            </div>

            <Button type="submit" className="w-full" disabled={loading as unknown as boolean}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Create account"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="flex justify-center w-full flex-col text-center text-sm text-muted-foreground">
          <div className="flex-center-1 justify-center">
            Have an account? <Link href="/sign-in" className="text-primary underline">Sign in</Link><ExternalLinkIcon className="size-3 inline" />
          </div>
          <div className="flex-center-1 justify-center">Facing Issues?{" "} <Link href={'/contact'} className="text-primary underline cursor-pointer">Contact us</Link> <ExternalLinkIcon className="size-3 inline" /></div>
        </div>
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