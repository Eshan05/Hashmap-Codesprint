import PublicNavbar from "@/components/layout/public-navbar";

export const metadata = {
  title: "PHT | Authentication",
  description: "Personal Health Tools",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PublicNavbar />
      <main>{children}</main>
    </div>
  );
}
