import { MapPin, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/khatir-logo.png";
import { COMPANY, waLink } from "@/lib/company";
import SocialLinks from "@/components/SocialLinks";

const Footer = () => {
  return (
    <footer className="relative border-t border-gold/20 bg-gradient-luxe text-luxe-foreground overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{backgroundImage:'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize:'24px 24px'}} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div className="container mx-auto px-6 py-16 relative">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center bg-white rounded-xl p-3 mb-5 shadow-gold" aria-label={COMPANY.name}>
              <img src={logo} alt={COMPANY.name} className="h-20 w-auto object-contain" />
            </Link>
            <p className="text-sm text-luxe-foreground/90 leading-relaxed max-w-md">
              {COMPANY.services}. Trusted property and construction partners serving Peshawar and beyond.
            </p>
            <div className="mt-6">
              <SocialLinks />
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-luxe-foreground/95">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-gold flex-shrink-0" />
                <span>{COMPANY.address}</span>
              </li>
              {COMPANY.contacts.map((c) => (
                <li key={c.phone} className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gold flex-shrink-0" />
                  <a href={`tel:${c.phoneRaw}`} className="hover:text-gold transition-colors">
                    {c.name}: {c.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-luxe-foreground/95">
              <li><Link to="/" className="hover:text-gold transition-colors">Home</Link></li>
              <li><Link to="/work" className="hover:text-gold transition-colors">Properties</Link></li>
              <li><Link to="/services" className="hover:text-gold transition-colors">Services</Link></li>
              <li><Link to="/about" className="hover:text-gold transition-colors">About</Link></li>
              <li><Link to="/blog" className="hover:text-gold transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
              <li>
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-luxe-foreground/20 flex flex-col md:flex-row justify-between gap-4 text-xs text-luxe-foreground/90">
          <p>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          <p className="tracking-wider">{COMPANY.services.toUpperCase()}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
