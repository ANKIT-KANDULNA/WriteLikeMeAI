import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Navbar } from "@/components/layout/Navbar";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-black font-sans">
      <main className="flex-1">
        <Navbar />
        <HeroSection />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
