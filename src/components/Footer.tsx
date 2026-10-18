import { MapPin, Phone } from "lucide-react";
import logo from "@/assets/khater-brand.svg";
import { COMPANY, waLink } from "@/lib/company";
import SocialLinks from "@/components/SocialLinks";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-gold/20 bg-gradient-luxe text-luxe-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div className="container relative mx-auto px-4 pb-28 pt-10 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-4">
          <div className="min-w-0 md:col-span-2">
            <a href="/" className="mb-5 inline-flex max-w-full items-center rounded-xl bg-white p-3 shadow-gold" aria-label={COMPANY.name}>
              <img src={logo} alt={COMPANY.name} width="760" height="180" className="h-14 w-auto max-w-full object-contain sm:h-20" />
            </a>
            <p className="max-w-md break-words text-sm leading-relaxed text-luxe-foreground/90">
              {COMPANY.services}. Trusted property and construction partners serving Peshawar and beyond.
            </p>
            <div className="mt-6"><SocialLinks /></div>
          </div>

          <div className="min-w-0">
            <h4 className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">Contact</h4>
            <ul className="space-y-3 break-words text-sm text-luxe-foreground/95">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{COMPANY.address}</span>
              </li>
              {COMPANY.contacts.map((c) => (
                <li key={c.phone} className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <a href={`tel:${c.phoneRaw}`} className="min-w-0 break-words transition-colors hover:text-gold">
                    {c.name}: {c.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h4 className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-luxe-foreground/95">
              <li><a href="/" className="transition-colors hover:text-gold">Home</a></li>
              <li><a href="/work" className="transition-colors hover:text-gold">Properties</a></li>
              <li><a href="/developments" className="transition-colors hover:text-gold">Developments</a></li>
              <li><a href="/events" className="transition-colors hover:text-gold">Events & Site Visits</a></li>
              <li><a href="/guides" className="transition-colors hover:text-gold">Property Guides</a></li>
              <li><a href="/services" className="transition-colors hover:text-gold">Services</a></li>
              <li><a href="/about" className="transition-colors hover:text-gold">About</a></li>
              <li><a href="/blog" className="transition-colors hover:text-gold">Blog</a></li>
              <li><a href="/contact" className="transition-colors hover:text-gold">Contact</a></li>
              <li><a href="/login" className="transition-colors hover:text-gold">Business Workspace</a></li>
              <li><a href={waLink()} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gold">WhatsApp Us</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex min-w-0 flex-col justify-between gap-3 border-t border-luxe-foreground/20 pt-5 text-xs text-luxe-foreground/90 sm:mt-12 sm:flex-row sm:items-start sm:gap-4 sm:pt-6">
          <p className="break-words">© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          <p className="max-w-full break-words text-left text-[10px] tracking-wide sm:text-right sm:text-xs sm:tracking-wider">{COMPANY.services.toUpperCase()}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
