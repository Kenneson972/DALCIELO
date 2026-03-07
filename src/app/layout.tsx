import type { Metadata } from "next";
import { Inter, Poppins, Montserrat, Indie_Flower, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LayoutSwitch } from "@/components/layout/LayoutSwitch";
import { JsonLd } from "@/components/seo/JsonLd";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-poppins",
  display: "swap",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});
const indieFlower = Indie_Flower({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-indie",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const BASE_URL = 'https://pizzadalcielo.com'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Pizza dal Cielo - Pizzeria Artisanale à Fort-de-France, Martinique',
    template: '%s | Pizza dal Cielo',
  },
  description: 'Découvrez nos pizzas artisanales authentiques à Fort-de-France, Martinique. Ingrédients frais, passion et savoir-faire traditionnel. Commander en ligne ou sur place.',
  keywords: 'pizza, pizzeria, Fort-de-France, Martinique, Bellevue, artisanale, restaurant, Pizza dal Cielo, commander pizza, livraison Martinique',
  alternates: { canonical: BASE_URL },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Pizza dal Cielo - Des pizzas qui touchent le ciel',
    description: 'Pizzeria artisanale à Fort-de-France, Martinique. Pizzas faites main, ingrédients frais.',
    type: 'website',
    url: BASE_URL,
    siteName: 'Pizza dal Cielo',
    locale: 'fr_FR',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pizza dal Cielo - Pizzeria Artisanale Martinique',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pizza dal Cielo - Pizzeria Artisanale Martinique',
    description: 'Pizzas faites main à Fort-de-France. Commander en ligne.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${poppins.variable} ${montserrat.variable} ${indieFlower.variable} ${playfair.variable}`}
    >
      <body className={`${poppins.className} antialiased min-h-screen flex flex-col`}>
        <JsonLd />
        <LayoutSwitch>{children}</LayoutSwitch>
      </body>
    </html>
  );
}
