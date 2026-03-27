import { HeroSection } from "./components/HeroSection";
import { TechGrid } from "./components/TechGrid";
import { ThemeToggle } from "./components/ThemeToggle";

export function HomePage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="container mx-auto max-w-7xl">
        <HeroSection />
        <TechGrid />
      </div>
    </main>
  );
}
