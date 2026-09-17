import type { Metadata, Viewport } from "next"
import { Geist_Mono, Inter, Noto_Sans_Bengali } from "next/font/google"

import "./globals.css"
import { AppProviders } from "@/components/providers"
import { cn } from "@/lib/utils"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

const fontBangla = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-bangla",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Auberge — Hotel ERP, CRM & Omnichannel AI",
  description:
    "A multi-property hotel operating system: front desk, revenue, CRM, omnichannel inbox and an AI that answers the phone. A product of UVTR Infotech.",
  applicationName: "Auberge",
  authors: [{ name: "UVTR Infotech", url: "https://uvtrinfotech.com/" }],
  creator: "UVTR Infotech",
  publisher: "UVTR Infotech",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfd" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="bn"
      suppressHydrationWarning
      // No `font-sans` utility here: it lands in the utilities layer and would
      // override the html[lang="bn"] Bangla face. The base layer sets it.
      className={cn(fontSans.variable, fontMono.variable, fontBangla.variable)}
    >
      <body className="bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
