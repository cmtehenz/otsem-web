"use client";

import Header from "@/components/sections/header";
import HeroSection from "@/components/sections/hero";
import TrustedBy from "@/components/sections/trusted-by";
import StatsGrid from "@/components/sections/stats-grid";
import ComparisonSection from "@/components/sections/comparison";
import HowItWorks from "@/components/sections/how-it-works";
import FeaturesGrid from "@/components/sections/features-grid";
import Pricing from "@/components/sections/pricing";
import CTABanner from "@/components/sections/cta-banner";
import Footer from "@/components/sections/footer";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden selection:bg-primary/20 selection:text-primary bg-white">
      {/* Static background gradients - no animations for performance */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-15%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] bg-gradient-to-br from-primary/8 to-violet-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[5%] right-[-10%] w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] bg-gradient-to-tl from-violet-500/6 to-primary/4 blur-[80px] rounded-full" />
        <div className="absolute top-[35%] left-[30%] w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] bg-primary/4 blur-[120px] rounded-full opacity-[0.04]" />
      </div>

      <Header />
      <main className="flex-grow w-full">
        <HeroSection />
        <TrustedBy />
        <StatsGrid />
        <ComparisonSection />
        <HowItWorks />
        <FeaturesGrid />
        <Pricing />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
