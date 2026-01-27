"use client";

import { motion } from "framer-motion";
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
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
            scale: [1, 1.08, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] left-[-15%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] bg-gradient-to-br from-primary/8 to-violet-400/5 blur-[100px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -15, 0],
            y: [0, 25, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-[5%] right-[-10%] w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] bg-gradient-to-tl from-violet-400/6 to-primary/4 blur-[80px] rounded-full"
        />
        <motion.div
          animate={{
            opacity: [0.03, 0.06, 0.03],
            scale: [0.9, 1, 0.9]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[35%] left-[30%] w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] bg-primary/4 blur-[120px] rounded-full"
        />
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
