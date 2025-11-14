import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Inbotiq Login System Demo",
  description: "Login to your account",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
