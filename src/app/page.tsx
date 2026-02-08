"use client";

import dynamic from "next/dynamic";
import Header from "@/components/sections/header";
import HeroSection from "@/components/sections/hero";

// Lightweight placeholder for below-the-fold sections while they load
const SectionSkeleton = () => (
  <div className="w-full py-16 animate-pulse">
    <div className="container mx-auto px-4 sm:px-6 space-y-4">
      <div className="h-8 bg-slate-100 rounded-lg w-1/3 mx-auto" />
      <div className="h-4 bg-slate-50 rounded w-2/3 mx-auto" />
    </div>
  </div>
);

// Below-the-fold sections — lazy loaded with loading skeletons to reduce initial JS bundle
const TrustedBy = dynamic(() => import("@/components/sections/trusted-by"), {
  loading: () => <SectionSkeleton />,
});
const StatsGrid = dynamic(() => import("@/components/sections/stats-grid"), {
  loading: () => <SectionSkeleton />,
});
const ComparisonSection = dynamic(() => import("@/components/sections/comparison"), {
  loading: () => <SectionSkeleton />,
});
const HowItWorks = dynamic(() => import("@/components/sections/how-it-works"), {
  loading: () => <SectionSkeleton />,
});
const FeaturesGrid = dynamic(() => import("@/components/sections/features-grid"), {
  loading: () => <SectionSkeleton />,
});
const Pricing = dynamic(() => import("@/components/sections/pricing"), {
  loading: () => <SectionSkeleton />,
});
const CTABanner = dynamic(() => import("@/components/sections/cta-banner"), {
  loading: () => <SectionSkeleton />,
});
const Footer = dynamic(() => import("@/components/sections/footer"), {
  loading: () => <SectionSkeleton />,
});

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-white selection:bg-[#6F00FF]/15 selection:text-[#6F00FF]">
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
