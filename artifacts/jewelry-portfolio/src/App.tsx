import { useEffect, useState } from "react";
import { Cursor } from "./components/Cursor";
import { LoadingScreen } from "./components/LoadingScreen";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { MarqueeStrip } from "./components/MarqueeStrip";
import { GallerySection } from "./components/GallerySection";
import { ProcessSection } from "./components/ProcessSection";
import { AboutSection } from "./components/AboutSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Cursor />
      <LoadingScreen hidden={!loading} />
      <Navbar />
      <main>
        <HeroSection />
        <MarqueeStrip />
        <GallerySection />
        <ProcessSection />
        <AboutSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
