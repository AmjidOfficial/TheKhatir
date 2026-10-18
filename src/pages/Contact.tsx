import Navigation from "@/components/Navigation";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";

const ContactPage = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Contact Khater Property Consultant & Builders | Peshawar"
        description="Get in touch with Khater Property Consultant & Builders in Peshawar — AWT Housing Scheme, Kohat Road. Call or WhatsApp our team."
        path="/contact"
      />
      <Navigation />
      <div className="pt-20">
        <Contact />
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default ContactPage;
