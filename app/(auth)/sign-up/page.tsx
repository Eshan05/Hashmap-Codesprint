import { Logo } from "@/components/common/logo";
import { SignUp } from "@/components/features/auth/sign-up";
import { Suspense } from "react";

export default function Page() {

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center p-4">
      <div className="size-16 my-4 rounded-full border-2 grid place-items-center p-1 shadow-xs">
        <Logo className="size-10" />
      </div>
      <div className="max-w-md w-full">
        <Suspense fallback={<div aria-hidden className="h-8" />}>
          <SignUp />
        </Suspense>
      </div>
    </div >
  );
}