"use client"

import { HeroSection } from "@/components/showcase/hero-section"
import { ArchitectureSection } from "@/components/showcase/architecture-section"
import { TechSection } from "@/components/showcase/tech-section"
import { ModulesSection } from "@/components/showcase/modules-section"
import { FooterSection } from "@/components/showcase/footer-section"
import { DemoSection } from "@/components/showcase/demo-section"

export default function AetherSimPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Section 1: Project Showcase / Hero */}
      <HeroSection />

      {/* Section 2: Unity Demo Showcase (Research Grade) */}
      <DemoSection />

      {/* Section 3: Architecture */}
      <ArchitectureSection />

      {/* Divider */}
      <div className="flex justify-center">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      {/* Section 3: Modules */}
      <ModulesSection />

      {/* Divider */}
      <div className="flex justify-center">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      {/* Section 4: Tech Stack */}
      <TechSection />

      {/* Section 5: Footer */}
      <FooterSection />
    </div>
  )
}

