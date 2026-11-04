import { FormEvent, useState } from "react";
import { MapPin, Phone, MessageCircle, Send } from "lucide-react";
import { COMPANY, waLink } from "@/lib/company";
import SocialLinks from "@/components/SocialLinks";

const Contact = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("Buying a property");
  const [area, setArea] = useState("");
  const [message, setMessage] = useState("");

  const submitEnquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const enquiry = [
      "New website enquiry",
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Interested in: ${interest}`,
      area.trim() ? `Preferred area: ${area.trim()}` : "",
      message.trim() ? `Details: ${message.trim()}` : "",
      "Source: Khatir Property Consultant & Builders website",
    ].filter(Boolean).join("\n");
    window.open(waLink(enquiry), "_blank", "noopener,noreferrer");
  };

  return (
    <section id="contact" className="bg-background py-16 sm:py-24 lg:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:gap-14 lg:gap-20">
          <div className="min-w-0">
            <h2 className="text-minimal mb-4 text-gold">GET IN TOUCH</h2>
            <h3 className="mb-8 text-3xl font-light text-architectural text-primary sm:mb-10 sm:text-4xl lg:mb-12 lg:text-6xl">
              Let's find your <span className="text-gold">perfect property.</span>
            </h3>

            <div className="space-y-6">
              <div className="flex min-w-0 items-start gap-4">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-gold" />
                <div className="min-w-0">
                  <h4 className="text-minimal mb-1 text-muted-foreground">OFFICE</h4>
                  <address className="break-words text-base not-italic text-primary sm:text-lg">{COMPANY.address}</address>
                </div>
              </div>

              {COMPANY.contacts.map((contact) => (
                <div key={contact.phone} className="flex items-start gap-4">
                  <Phone className="mt-1 h-5 w-5 shrink-0 text-gold" />
                  <div className="min-w-0">
                    <h4 className="text-minimal mb-1 text-muted-foreground">{contact.name.toUpperCase()}</h4>
                    <a href={`tel:${contact.phoneRaw}`} className="break-words text-base text-primary transition-colors hover:text-gold sm:text-lg">
                      {contact.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-border pt-6 sm:mt-10">
              <p className="leading-relaxed text-muted-foreground">
                <span className="font-medium text-gold">Consultancy · Construction · Development</span>.
                Local property guidance from the Khatir team in Peshawar.
              </p>
              <div className="mt-5"><SocialLinks /></div>
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <div className="rounded-2xl bg-gradient-emerald p-5 text-luxe-foreground shadow-architectural sm:p-8">
              <div className="mb-4 flex items-center gap-3">
                <MessageCircle className="h-8 w-8 shrink-0 text-gold" />
                <div>
                  <h4 className="text-xl font-medium sm:text-2xl">Quick property enquiry</h4>
                  <p className="mt-1 text-sm text-luxe-foreground/75">Tell us what you need. We’ll connect on WhatsApp.</p>
                </div>
              </div>

              <form onSubmit={submitEnquiry} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-medium" htmlFor="enquiry-name">
                    Your name
                    <input id="enquiry-name" name="name" autoComplete="name" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="h-11 min-w-0 rounded-lg border border-white/20 bg-white/10 px-3 text-base text-white outline-none placeholder:text-white/55 focus-visible:ring-2 focus-visible:ring-gold" placeholder="Full name" />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium" htmlFor="enquiry-phone">
                    Phone / WhatsApp
                    <input id="enquiry-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={30} value={phone} onChange={(event) => setPhone(event.target.value)} className="h-11 min-w-0 rounded-lg border border-white/20 bg-white/10 px-3 text-base text-white outline-none placeholder:text-white/55 focus-visible:ring-2 focus-visible:ring-gold" placeholder="+92..." />
                  </label>
                </div>

                <label className="grid gap-1.5 text-sm font-medium" htmlFor="enquiry-interest">
                  What are you looking for?
                  <select id="enquiry-interest" name="interest" value={interest} onChange={(event) => setInterest(event.target.value)} className="h-11 min-w-0 rounded-lg border border-white/20 bg-[#163d32] px-3 text-base text-white outline-none focus-visible:ring-2 focus-visible:ring-gold">
                    <option>Buying a property</option>
                    <option>Selling a property</option>
                    <option>Renting a property</option>
                    <option>Plot or land</option>
                    <option>Construction or renovation</option>
                    <option>Investment or development project</option>
                    <option>General consultation</option>
                  </select>
                </label>

                <label className="grid gap-1.5 text-sm font-medium" htmlFor="enquiry-area">
                  Preferred area (optional)
                  <input id="enquiry-area" name="area" maxLength={120} value={area} onChange={(event) => setArea(event.target.value)} className="h-11 min-w-0 rounded-lg border border-white/20 bg-white/10 px-3 text-base text-white outline-none placeholder:text-white/55 focus-visible:ring-2 focus-visible:ring-gold" placeholder="e.g. Hayatabad, DHA, AWT..." />
                </label>

                <label className="grid gap-1.5 text-sm font-medium" htmlFor="enquiry-message">
                  More details (optional)
                  <textarea id="enquiry-message" name="message" rows={3} maxLength={1200} value={message} onChange={(event) => setMessage(event.target.value)} className="min-w-0 resize-y rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-base text-white outline-none placeholder:text-white/55 focus-visible:ring-2 focus-visible:ring-gold" placeholder="Share your budget, size or other needs..." />
                </label>

                <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-gold px-5 py-3 font-semibold text-gold-foreground transition-transform hover:-translate-y-0.5 sm:w-auto">
                  <Send className="h-4 w-4" /> Send enquiry on WhatsApp
                </button>
                <p className="text-xs leading-5 text-luxe-foreground/70">Your message opens in WhatsApp. It is not submitted to a website database yet.</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
