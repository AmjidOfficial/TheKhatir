import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { COMPANY, waLink } from "@/lib/company";
import SocialLinks from "@/components/SocialLinks";

const Contact = () => {
  return (
    <section id="contact" className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20">
            <div>
              <h2 className="text-minimal text-gold mb-4">GET IN TOUCH</h2>
              <h3 className="text-4xl md:text-6xl font-light text-architectural text-primary mb-12">
                Let's find your <span className="text-gold">perfect property.</span>
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-gold mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-minimal text-muted-foreground mb-1">OFFICE</h4>
                    <address className="not-italic text-lg text-primary">
                      {COMPANY.address}
                    </address>
                  </div>
                </div>

                {COMPANY.contacts.map((c) => (
                  <div key={c.phone} className="flex items-start gap-4">
                    <Phone className="h-5 w-5 text-gold mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-minimal text-muted-foreground mb-1">{c.name.toUpperCase()}</h4>
                      <a
                        href={`tel:${c.phoneRaw}`}
                        className="text-lg text-primary hover:text-gold transition-colors"
                      >
                        {c.phone}
                      </a>
                    </div>
                  </div>
                ))}

              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-lg bg-gradient-emerald p-10 text-luxe-foreground shadow-architectural">
                <MessageCircle className="h-10 w-10 text-gold mb-4" />
                <h4 className="text-2xl font-light mb-3">Talk to us instantly</h4>
                <p className="text-luxe-foreground/80 mb-6 leading-relaxed">
                  Have a question about a property, plot, or construction project?
                  Send us a message on WhatsApp — we usually reply within minutes.
                </p>
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-md font-medium hover:bg-[#1ebe57] transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat on WhatsApp
                </a>
              </div>

              <div>
                <h4 className="text-minimal text-gold mb-4">FOLLOW US</h4>
                <SocialLinks />
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-muted-foreground leading-relaxed">
                  <span className="text-gold font-medium">Consultancy · Construction · Projects</span> — your
                  trusted Peshawar property partner since {COMPANY.founded}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
