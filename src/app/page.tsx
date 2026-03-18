import { Hero } from "@/components/sections/Hero";
import { MenuHighlight } from "@/components/sections/MenuHighlight";
import { ContactSection } from "@/components/sections/ContactSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { PizzaSlider } from "@/components/sections/PizzaSlider";
import { getChefProduct, getProducts } from "@/lib/productsStore";
import { getHomepageSettings } from "@/lib/homepageSettingsStore";
import { menuData } from "@/data/menuData";
import { generateSlug } from "@/lib/utils";
import { orderingBlockReason } from "@/lib/ordering";
import type { Metadata } from "next";
import { absoluteUrl, getDefaultOgImageUrl } from "@/lib/seo";

export const revalidate = 0; // Pizza du Chef toujours à jour (pas de cache page)

export const metadata: Metadata = {
  title: "Pizza dal Cielo — Pizzeria artisanale à Fort-de-France (Bellevue)",
  description:
    "Pizza dal Cielo à Bellevue (Fort-de-France) : pizzas artisanales faites main, ingrédients frais. Consultez le menu, commandez en ligne et payez en toute sécurité.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "Pizza dal Cielo — Pizzeria artisanale à Fort-de-France",
    description:
      "Pizzas artisanales faites main à Bellevue (Fort-de-France). Menu complet, commande en ligne, paiement sécurisé.",
    url: absoluteUrl("/"),
    type: "website",
    siteName: "Pizza dal Cielo",
    images: [
      { url: getDefaultOgImageUrl(), width: 1200, height: 630, alt: "Pizza dal Cielo — Fort-de-France" },
    ],
  },
};

function pizzasForSlider() {
  return menuData.pizzas.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: (p as { image?: string }).image ?? null,
    category: p.category,
    slug: generateSlug(p.name),
  }));
}

export default async function Home() {
  let chefProduct = null;
  let pizzaSliderItems = pizzasForSlider();
  let sliderEnabled = true;

  try {
    const [chef, products, homepageSettings] = await Promise.all([
      getChefProduct(),
      getProducts(),
      getHomepageSettings(),
    ]);
    chefProduct = chef;
    sliderEnabled = homepageSettings.sliderEnabled;
    if (products.length > 0) {
      const pizzaProducts = products.filter(
        (p) => p.type === "pizza" && p.available && (p.show_in_slider !== false)
      );
      if (pizzaProducts.length > 0) {
        pizzaSliderItems = pizzaProducts.map((p) => ({
          id: p.menu_id,
          name: p.name,
          price: p.price,
          image: p.slider_image_url ?? p.image_url,
          category: p.category ?? "Pizzas",
          slug: p.slug,
        }));
      }
    }
  } catch {
    // Supabase indisponible → fallback menuData
  }

  const chefPizza =
    chefProduct ?? menuData.pizzas.find((p) => p.category === "Du Chef") ?? null;

  const blockReason = orderingBlockReason();

  return (
    <>
      {blockReason === 'monday' && (
        <div className="bg-red-600 text-white text-center text-sm font-bold py-2.5 px-4">
          🔒 Pizzeria fermée le lundi — Revenez à partir de mardi !
        </div>
      )}
      {blockReason === 'coming_soon' && (
        <div className="bg-amber-500 text-white text-center text-sm font-bold py-2.5 px-4">
          🚧 Commande en ligne bientôt disponible — Appelez le +596 696 88 72 70 ou{' '}
          <a href="https://wa.me/596696887270" className="underline" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </div>
      )}
      <Hero />
      <MenuHighlight chefPizza={chefPizza} />
      {sliderEnabled && <PizzaSlider items={pizzaSliderItems} />}
      <GallerySection />
      <ContactSection />
    </>
  );
}
