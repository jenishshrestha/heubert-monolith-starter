import { HeroSection } from "./components/HeroSection";
import { TechGrid } from "./components/TechGrid";

export function HomePage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="container mx-auto max-w-7xl">
        <HeroSection />
        <TechGrid />
      </div>
    </main>
  );
}
