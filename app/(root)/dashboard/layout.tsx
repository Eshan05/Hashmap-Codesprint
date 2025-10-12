export const metadata = {
  title: "PHT | Dashboard",
  description: "Personal Health Tools",
};

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <main>{children}</main>
    </div>
  );
}
