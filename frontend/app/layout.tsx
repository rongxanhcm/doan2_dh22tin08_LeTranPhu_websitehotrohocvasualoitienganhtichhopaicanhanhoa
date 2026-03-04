import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; 
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
  title: "Wrytt - Learn English from Your Mistakes | AI Quiz Generator",
  description: "Submit your essay, AI finds your errors and generates personalized practice quizzes from YOUR actual mistakes. Not generic exercises—learn what YOU need. Free to start.",
  keywords: ["English learning", "AI quiz generator", "grammar checker", "learn from mistakes", "personalized learning", "ESL", "writing improvement", "essay feedback"],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Wrytt - Learn English from Your Mistakes",
    description: "AI analyzes your writing and generates personalized quizzes from YOUR mistakes. Practice what YOU need to improve.",
    type: "website",
    url: "https://wrytt.me",
    images: [
      {
        url: "https://wrytt.me/og-image.png",
        width: 1200,
        height: 630,
        alt: "Wrytt - AI-powered English learning from your mistakes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn English from Your Mistakes with AI",
    description: "Get personalized quizzes generated from your actual writing errors. Free to start.",
    images: ["https://wrytt.me/og-image.png"],
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
        {children}
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  );
}
