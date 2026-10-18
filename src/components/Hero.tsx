import heroImage from "@/assets/khatir-hero.jpg";
import { waLink } from "@/lib/company";
import { ArrowRight, MessageCircle } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32">
      <img
        src={heroImage}
        alt="Khatir Property Consultant & Builders — premium properties in Peshawar"
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full scale-105 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[40rem] w-[40rem] rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-primary/30 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-1 text-center">
        <div className="reveal mb-6 inline-flex max-w-full items-center gap-3 rounded-full glass-dark px-4 py-2 sm:mb-8">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold animate-pulse" />
          <span className="text-minimal text-gold/90">Peshawar · Property & Construction</span>
        </div>

        <h1 className="reveal mb-6 text-4xl font-light text-white text-architectural sm:mb-8 sm:text-5xl md:text-7xl lg:text-[5.5rem]">
          Building Trust.
          <br />
          <span className="text-gold-shimmer font-normal">Crafting Homes.</span>
        </h1>

        <div className="reveal-delayed mx-auto mb-6 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent sm:mb-8" />

        <p className="reveal-delayed mx-auto mb-8 max-w-2xl text-base font-light leading-relaxed tracking-wide text-white sm:mb-12 sm:text-xl">
          Khatir Property Consultant &amp; Builders — Peshawar's trusted partner for premium properties,
          plots, and turn-key construction.
        </p>

        <div className="reveal-delayed flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <a
            href="/work"
            className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-gold px-6 py-3.5 font-semibold tracking-wide text-gold-foreground transition-all duration-500 hover:-translate-y-0.5 hover:shadow-gold sm:w-auto sm:px-8"
          >
            View Properties
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full glass-dark px-6 py-3.5 font-medium tracking-wide text-white transition-colors hover:bg-white/10 sm:w-auto sm:px-8"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </div>

        <div className="reveal-delayed mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:mt-14 sm:grid-cols-3 sm:gap-4">
          {[
            { title: "Local market guidance", detail: "Peshawar and nearby areas" },
            { title: "Property & construction", detail: "One team for your next step" },
            { title: "Direct consultation", detail: "Talk to our team on WhatsApp" },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-center backdrop-blur-sm sm:py-4">
              <div className="text-sm font-medium text-white sm:text-base">{item.title}</div>
              <div className="mt-1 text-xs text-white/75 sm:text-sm">{item.detail}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="reveal-delayed absolute bottom-3 left-1/2 hidden -translate-x-1/2 sm:block">
        <div className="relative mx-auto h-8 w-px overflow-hidden bg-white/15">
          <div className="absolute inset-x-0 top-0 h-1/3 bg-gold" style={{ animation: "scrollCue 2.4s ease-in-out infinite" }} />
        </div>
        <div className="text-minimal mt-2 text-center tracking-[0.3em] text-white/70">SCROLL</div>
      </div>
    </section>
  );
};

export default Hero;
