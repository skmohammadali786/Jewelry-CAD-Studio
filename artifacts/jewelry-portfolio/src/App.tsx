import { useEffect, useState } from "react";
import { Cursor } from "./components/Cursor";
import { LoadingScreen } from "./components/LoadingScreen";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { GallerySection } from "./components/GallerySection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Cursor />
      <LoadingScreen hidden={!loading} />
      <Navbar />
      <main>
        <HeroSection />
        <GallerySection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
