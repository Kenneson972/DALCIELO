import type { Metadata } from "next";
import { Inter, Poppins, Montserrat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Chatbot } from "@/components/ui/Chatbot";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["400", "600", "700", "900"],
  variable: "--font-poppins" 
});
const montserrat = Montserrat({ 
  subsets: ["latin"], 
  variable: "--font-montserrat" 
});

export const metadata: Metadata = {
  title: 'Pizza dal Cielo - Pizzeria Artisanale à Fort-de-France, Martinique',
  description: 'Découvrez nos pizzas artisanales authentiques à Fort-de-France, Martinique. Ingrédients frais, passion et savoir-faire traditionnel.',
  keywords: 'pizza, pizzeria, Fort-de-France, Martinique, Bellevue, artisanale, restaurant, Pizza dal Cielo',
  openGraph: {
    title: 'Pizza dal Cielo - Des pizzas qui touchent le ciel',
    description: 'Pizzeria artisanale à Fort-de-France, Martinique',
    type: 'website',
    url: 'https://pizzadalcielo.com',
    siteName: 'Pizza dal Cielo',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pizza dal Cielo',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable} ${montserrat.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Chatbot />
      </body>
    </html>
  );
}
