import heroImage from "@/assets/khatir-hero.jpg";
import { waLink } from "@/lib/company";
import { ArrowRight, MessageCircle } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image — LCP candidate */}
      <img
        src={heroImage}
        alt="Khatir Property Consultant & Builders — premium properties in Peshawar"
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover scale-105"
      />
      <div className="absolute inset-0 bg-gradient-hero" />
      {/* Subtle gold radial glow */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[40rem] w-[40rem] rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-primary/30 blur-3xl" />

      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        {/* Top eyebrow chip */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 mb-8 rounded-full glass-dark reveal">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-minimal text-gold/90">Established 2005 · Peshawar</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-light text-white text-architectural mb-8 reveal">
          Building Trust.
          <br />
          <span className="text-gold-shimmer font-normal">Crafting Homes.</span>
        </h1>

        <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent reveal-delayed" />

        <p className="text-base md:text-xl text-white font-light tracking-wide max-w-2xl mx-auto mb-12 reveal-delayed">
          Khatir Property Consultant &amp; Builders — Peshawar's trusted partner for premium properties,
          plots, and turn-key construction.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 reveal-delayed">
          <a
            href="/work"
            className="group inline-flex items-center justify-center gap-2 bg-gradient-gold text-gold-foreground px-8 py-3.5 rounded-full font-medium tracking-wide hover:shadow-gold transition-all duration-500 hover:-translate-y-0.5"
          >
            View Properties
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 glass-dark text-white px-8 py-3.5 rounded-full font-medium tracking-wide hover:bg-white/10 transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </div>

        {/* Service highlights, without unverified business statistics */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto reveal-delayed">
          {[
            { title: "Local market guidance", detail: "Peshawar and nearby areas" },
            { title: "Property & construction", detail: "One team for your next step" },
            { title: "Direct consultation", detail: "Talk to our team on WhatsApp" },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-white/15 bg-black/20 px-4 py-4 text-center backdrop-blur-sm">
              <div className="text-sm md:text-base font-medium text-white">{item.title}</div>
              <div className="text-xs md:text-sm text-white/75 mt-1">{item.detail}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 reveal-delayed">
        <div className="relative h-14 w-[1.5px] mx-auto bg-white/15 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1/3 bg-gold" style={{ animation: "scrollCue 2.4s ease-in-out infinite" }} />
        </div>
        <div className="text-minimal text-white/70 mt-3 tracking-[0.3em] text-center">SCROLL</div>
      </div>
    </section>
  );
};

export default Hero;
