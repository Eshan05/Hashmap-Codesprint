import PublicNavbar from "@/components/layout/public-navbar";

export const metadata = {
  title: "NabhaCare | Authentication",
  description: "Telemedicine for Nabha and surrounding rural areas",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-vaul-drawer-wrapper="">
      <PublicNavbar />
      <main>{children}</main>
    </div>
  );
}
