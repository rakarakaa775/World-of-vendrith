import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vendrith World Builder",
  description: "World authoring workspace for Vandrith World",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
