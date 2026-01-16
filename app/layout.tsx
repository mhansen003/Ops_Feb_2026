import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Operations Backlog - February 2026",
  description: "Executive Operations Dashboard and Backlog Analysis",
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
