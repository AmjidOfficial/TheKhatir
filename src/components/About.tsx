import { COMPANY } from "@/lib/company";

const About = () => {
  return (
    <section id="about" className="py-32 bg-secondary/40">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-minimal text-gold mb-4">ABOUT KHATIR</h2>
              <h3 className="text-4xl md:text-6xl font-light text-architectural text-primary mb-12">
                Trusted by hundreds of <span className="text-gold">families.</span>
              </h3>

              <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                <p>
                  {COMPANY.name} is a Peshawar-based property and construction firm dedicated to
                  helping clients buy, sell, invest, and build with confidence.
                </p>
                <p>
                  From verified plots in AWT Housing Scheme to fully-built modern homes and
                  commercial plazas, our team handles every step — consultancy, legal due
                  diligence, construction, and handover.
                </p>
              </div>
            </div>

            <div className="space-y-10">
              <div>
                <h4 className="text-minimal text-gold mb-6">OUR APPROACH</h4>
                <div className="space-y-5">
                  {[
                    { t: "Transparency", d: "Verified documents, fair pricing, no hidden fees." },
                    { t: "Quality", d: "Premium materials and skilled craftsmanship on every build." },
                    { t: "Trust", d: "Years of relationships built across Peshawar's property market." },
                  ].map((item) => (
                    <div key={item.t} className="border-l-2 border-gold pl-6">
                      <h5 className="text-lg font-medium mb-1 text-primary">{item.t}</h5>
                      <p className="text-muted-foreground">{item.d}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-border grid grid-cols-3 gap-6">
                <div>
                  <h4 className="text-minimal text-gold mb-2">FOUNDED</h4>
                  <p className="text-2xl font-light text-primary">{COMPANY.founded}</p>
                </div>
                <div>
                  <h4 className="text-minimal text-gold mb-2">DEALS</h4>
                  <p className="text-2xl font-light text-primary">1000+</p>
                </div>
                <div>
                  <h4 className="text-minimal text-gold mb-2">CLIENTS</h4>
                  <p className="text-2xl font-light text-primary">500+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
