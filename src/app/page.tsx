"use client";

import dynamic from "next/dynamic";
import Header from "@/components/sections/header";
import HeroSection from "@/components/sections/hero";

// Below-the-fold sections — lazy loaded to reduce initial JS bundle
const TrustedBy = dynamic(() => import("@/components/sections/trusted-by"));
const StatsGrid = dynamic(() => import("@/components/sections/stats-grid"));
const ComparisonSection = dynamic(() => import("@/components/sections/comparison"));
const HowItWorks = dynamic(() => import("@/components/sections/how-it-works"));
const FeaturesGrid = dynamic(() => import("@/components/sections/features-grid"));
const Pricing = dynamic(() => import("@/components/sections/pricing"));
const CTABanner = dynamic(() => import("@/components/sections/cta-banner"));
const Footer = dynamic(() => import("@/components/sections/footer"));

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden selection:bg-primary/20 selection:text-primary bg-white">
      {/* Static background gradients — reduced blur for mobile GPU perf */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-15%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] bg-gradient-to-br from-primary/8 to-violet-500/5 blur-[60px] rounded-full" />
        <div className="absolute bottom-[5%] right-[-10%] w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] bg-gradient-to-tl from-violet-500/6 to-primary/4 blur-[60px] rounded-full" />
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
