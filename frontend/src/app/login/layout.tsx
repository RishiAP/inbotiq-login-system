import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signup | Inbotiq Login System Demo",
  description: "Signup for a new account",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
