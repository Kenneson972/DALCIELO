import { Hero } from "@/components/sections/Hero";
import { MenuHighlight } from "@/components/sections/MenuHighlight";
import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { GallerySection } from "@/components/sections/GallerySection";

export default function Home() {
  return (
    <>
      <Hero />
      <MenuHighlight />
      <AboutSection />
      <GallerySection />
      <ContactSection />
    </>
  );
}
