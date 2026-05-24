import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Duffers OS",
  description: "Operations portal for Duffers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}