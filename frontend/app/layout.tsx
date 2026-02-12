import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext"; // Import này
import { Toaster } from "react-hot-toast"; // <--- [MỚI 1] Import
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eloqua",
  description: "Essay fixer and improver powered by AI",
  icons: {
    icon: "/logo.svg", // Trỏ trực tiếp đến tên file mới
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider> {/* Bọc ở đây */}
          {children}
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        </LanguageProvider>
      </body>
    </html>
  );
}
