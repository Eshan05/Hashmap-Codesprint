import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const [session, activeSessions, deviceSessions] =
    await Promise.all([
      auth.api.getSession({
        headers: await headers(),
      }),
      auth.api.listSessions({
        headers: await headers(),
      }),
      auth.api.listDeviceSessions({
        headers: await headers(),
      }),
    ]).catch((e) => {
      console.log(e);
      throw redirect("/sign-in");
    });

  const sessionData = {
    session: session?.session,
    user: {
      id: session?.user.id,
      createdAt: session?.user.createdAt,
      updatedAt: session?.user.updatedAt,
      email: session?.user.email,
      emailVerified: session?.user.emailVerified,
      name: session?.user.name,
      image: session?.user.image,
      twoFactorEnabled: null,
      banned: null,
      role: null,
      banReason: null,
    },
  };

  return (
    <div className="">
    </div>
  )
}