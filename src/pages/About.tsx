import Navigation from "@/components/Navigation";
import About from "@/components/About";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="About Khatir Property Consultant & Builders | Peshawar"
        description="Learn about Khatir Property Consultant & Builders, providing property consultancy, construction and development services in Peshawar."
        path="/about"
      />
      <Navigation />
      <div className="pt-20">
        <About />
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default AboutPage;
