import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeshOps | Service Mesh Incident Commander",
  description:
    "Learn service-mesh operations in a quick plain-language tutorial, then command a complete incident campaign.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
