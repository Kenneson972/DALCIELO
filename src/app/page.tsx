import { Hero } from "@/components/sections/Hero";
import { MenuHighlight } from "@/components/sections/MenuHighlight";
import { ContactSection } from "@/components/sections/ContactSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { PizzaSlider } from "@/components/sections/PizzaSlider";
import { getChefProduct, getProducts } from "@/lib/productsStore";
import { getHomepageSettings } from "@/lib/homepageSettingsStore";
import { menuData } from "@/data/menuData";
import { generateSlug } from "@/lib/utils";
import { ORDERING_ENABLED } from "@/lib/ordering";

export const revalidate = 0; // Pizza du Chef toujours à jour (pas de cache page)

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

  return (
    <>
      {!ORDERING_ENABLED && (
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
