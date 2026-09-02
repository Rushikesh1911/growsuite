import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { IntegrationsMarquee } from "@/components/landing/IntegrationsMarquee";
import { SingTogether } from "@/components/landing/SingTogether";
import { ConnectedJourney } from "@/components/landing/ConnectedJourney";
import { ProductStory } from "@/components/landing/ProductStory";
import { MadeFor } from "@/components/landing/MadeFor";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen text-[var(--gs-bg-alt)] flex flex-col font-sans bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <main className="flex-1 w-full flex flex-col">
        {/* 1. Hero — product-led pipeline demo */}
        <Hero />

        {/* 2. Integrations */}
        {/* <IntegrationsMarquee /> */}

        {/* 3. The Core Solution: Scrollytelling Lead -> Payment */}
        <ConnectedJourney />

        {/* 4. The Problem & Solution: Systems that never spoke */}
        <SingTogether />

        {/* 5. Product Features - Bento Grid */}
        <ProductStory />

        {/* 6. Target Audience: Made For */}
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
