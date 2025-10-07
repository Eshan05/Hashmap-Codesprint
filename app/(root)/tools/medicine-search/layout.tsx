import type { Metadata } from "next";

const metadata: Metadata = {
  title: "Medicine Search",
  description: "Search for medicines via name, disease, side effects and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}
    </div>
  );
}
