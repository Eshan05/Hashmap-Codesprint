import type { Metadata } from "next";

const metadata: Metadata = {
  title: "Symptom Search",
  description: "Input your symptoms and get instant medical advice.",
};

export default function SympLayout({
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
