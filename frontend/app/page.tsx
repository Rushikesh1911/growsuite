import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProductStory } from "@/components/landing/ProductStory";
import { ConnectedJourney } from "@/components/landing/ConnectedJourney";
import { MessySimple } from "@/components/landing/MessySimple";
import { DarkActivity } from "@/components/landing/DarkActivity";
import { MadeFor } from "@/components/landing/MadeFor";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen text-[#0A0A0A] flex flex-col font-sans overflow-x-hidden bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <main className="flex-1 w-full flex flex-col">
        {/* 1. Hero — product-led pipeline demo */}
        <Hero />

        {/* 2. Product Story — 4-tab interactive demo with autoplay */}
        <ProductStory />

        {/* 3. Connected Journey — Lead → Deal → Client → Project → Tasks → Invoice → Payment */}
        <ConnectedJourney />

        {/* 4. Messy → Simple — too many tools, one workspace */}
        <MessySimple />

        {/* 5. Dark Activity — from first conversation to paid invoice */}
        <DarkActivity />

        {/* 6. Made For — Freelancers / Small teams / Growing businesses */}
        <MadeFor />

        {/* 7. Pricing */}
        <Pricing />

        {/* 8. Final CTA */}
        <CTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
