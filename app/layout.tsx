import type { Metadata, Viewport } from "next";
import "./globals.css";
import SmoothScroll from "@/components/common/SmoothScroll";
import Nav from "@/components/navigation/Nav";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `${site.brand} — ${site.role}`,
  description: site.tagline,
};

export const viewport: Viewport = {
  themeColor: "#f3ebe0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <SmoothScroll />
        <Nav />
        {children}
      </body>
    </html>
  );
}
