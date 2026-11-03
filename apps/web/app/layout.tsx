import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Interview Hub — Practice with purpose",
  description:
    "Technical interview practice, thoughtful AI feedback, and a clearer path forward.",
};
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
