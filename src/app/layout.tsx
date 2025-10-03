import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "../lib/react-query";
import { ThemeProvider } from "../contexts/theme-context";
import { FilterProvider } from "../contexts/filter-context";
import { UserProvider } from "../contexts/user-context";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wasserman Prism - Talent Management",
  description: "Talent Management Platform for Wasserman",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('prism-ui-theme') || 'system'
                  var root = document.documentElement

                  root.classList.remove('light', 'dark')

                  if (theme === 'system') {
                    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                    root.classList.add(systemTheme)
                  } else {
                    root.classList.add(theme)
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="system" storageKey="prism-ui-theme">
          <UserProvider>
            <FilterProvider storageKey="prism-cost-center-filter">
              <ReactQueryProvider>
                {children}
                <Toaster richColors position="top-right" />
              </ReactQueryProvider>
            </FilterProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
