import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Limbic — PT News",
  description: "Up-to-date news, guidelines, and clinical tools for physical therapists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
