import { Building2, Home, HardHat, Compass } from "lucide-react";

const services = [
  {
    number: "01",
    title: "PROPERTY CONSULTANCY",
    icon: Compass,
    description:
      "Expert guidance on buying, selling, and investing in residential and commercial properties across Peshawar.",
  },
  {
    number: "02",
    title: "REAL ESTATE",
    icon: Home,
    description:
      "Verified plots, houses, apartments, and shops for sale and rent in AWT, Hayatabad, and prime Kohat Road locations.",
  },
  {
    number: "03",
    title: "CONSTRUCTION",
    icon: HardHat,
    description:
      "Turn-key construction services — from foundation to finishing — delivered on time with premium materials.",
  },
  {
    number: "04",
    title: "PROJECT DEVELOPMENT",
    icon: Building2,
    description:
      "End-to-end development of housing schemes, commercial plazas, and custom-built homes.",
  },
];

const Services = () => {
  return (
    <section id="services" className="relative py-32 bg-background overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 bg-gold/5 blur-3xl rounded-full" />
      <div className="container mx-auto px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <p className="text-minimal text-gold mb-4 tracking-[0.3em]">— SERVICES —</p>
            <h3 className="text-4xl md:text-6xl font-light text-architectural text-primary">
              What We <span className="italic text-gold">Offer</span>
            </h3>
            <div className="mx-auto mt-6 h-px w-24 divider-gold" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.number}
                  className="group relative p-8 rounded-2xl border border-border bg-card hover:border-gold/60 hover:shadow-elegant transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gold/0 group-hover:bg-gold/10 transition-all duration-700 blur-2xl" />
                  <span className="absolute top-6 right-6 text-6xl font-light text-gold/10 group-hover:text-gold/20 transition-colors">
                    {s.number}
                  </span>
                  <div className="flex items-start gap-6 relative">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-emerald text-luxe-foreground group-hover:bg-gradient-gold transition-all duration-500 shadow-elegant">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-light mb-3 text-primary">{s.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
