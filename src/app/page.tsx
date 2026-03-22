import { Hero } from "@/components/sections/Hero";
import { MenuHighlight } from "@/components/sections/MenuHighlight";
import { ContactSection } from "@/components/sections/ContactSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { PizzaSlider } from "@/components/sections/PizzaSlider";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { ClosedDayOrderingBanner } from "@/components/ui/ClosedDayOrderingBanner";
import { getChefProduct, getProducts } from "@/lib/productsStore";
import { getHomepageSettings } from "@/lib/homepageSettingsStore";
import { menuData } from "@/data/menuData";
import { generateSlug } from "@/lib/utils";
import type { Metadata } from "next";
import { absoluteUrl, getDefaultOgImageUrl } from "@/lib/seo";

export const revalidate = 0; // Pizza du Chef toujours à jour (pas de cache page)

export const metadata: Metadata = {
  /** `absolute` évite le suffixe du layout (`%s | Pizza Dal Cielo`) → pas de double marque dans <title>. */
  title: {
    absolute: "Pizza Dal Cielo — Pizzeria artisanale à Fort-de-France (Bellevue)",
  },
  description:
    "Pizza Dal Cielo à Bellevue (Fort-de-France) : pizzas artisanales faites main, ingrédients frais. Consultez le menu, commandez en ligne et payez en toute sécurité.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "Pizza Dal Cielo — Pizzeria artisanale à Fort-de-France",
    description:
      "Pizzas artisanales faites main à Bellevue (Fort-de-France). Menu complet, commande en ligne, paiement sécurisé.",
    url: absoluteUrl("/"),
    type: "website",
    siteName: "Pizza Dal Cielo",
    images: [
      { url: getDefaultOgImageUrl(), width: 1200, height: 630, alt: "Pizza Dal Cielo — Fort-de-France" },
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
  let supabaseReachable = false;
  let pizzaSliderItems = pizzasForSlider();
  let sliderEnabled = true;

  try {
    const [chef, products, homepageSettings] = await Promise.all([
      getChefProduct(),
      getProducts(),
      getHomepageSettings(),
    ]);
    supabaseReachable = true;
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

  // Si Supabase répond et chef=null → la pizza du chef est désactivée, pas de fallback
  const chefPizza = supabaseReachable
    ? chefProduct
    : (chefProduct ?? menuData.pizzas.find((p) => p.category === "Du Chef") ?? null);

  return (
    <>
      <Hero />

      <ClosedDayOrderingBanner />

      {/* Pizza du Chef */}
      <WaveDivider fill="rgba(255,248,240,0.0)" />
      <MenuHighlight chefPizza={chefPizza} />

      {/* Slider pizzas */}
      {sliderEnabled && (
        <>
          <WaveDivider fill="rgba(255,248,240,0.0)" />
          <PizzaSlider items={pizzaSliderItems} />
        </>
      )}

      {/* Lien Instagram (sans grille photos) */}
      <WaveDivider fill="rgba(255,248,240,0.0)" />
      <GallerySection />

      {/* Contact */}
      <WaveDivider fill="rgba(255,248,240,0.0)" />
      <ContactSection />
    </>
  );
}
