import { Logo } from "@/components/auth/logo";
import SignIn from "@/components/auth/sign-in";

export default function Page() {

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center p-4">
      <div className="size-16 my-4 rounded-full border-2 grid place-items-center p-1 shadow-xs">
        <Logo className="size-10" />
      </div>
      <div className="max-w-md w-full">
        <SignIn />
      </div>
    </div >
  );
}