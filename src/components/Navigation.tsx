import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/khatir-logo.png";
import { COMPANY } from "@/lib/company";
import SocialLinks from "@/components/SocialLinks";

const navLinks = [
  { href: "/work", label: "PROPERTIES" },
  { href: "/services", label: "SERVICES" },
  { href: "/about", label: "ABOUT" },
  { href: "/blog", label: "BLOG" },
  { href: "/contact", label: "CONTACT" },
];

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gold/15">
      <div className="container mx-auto px-6 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center group" aria-label={COMPANY.name}>
          <img
            src={logo}
            alt={COMPANY.name}
            className="h-14 md:h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-105 dark:bg-background/0 dark:brightness-125 dark:contrast-125"
          />
        </Link>

        <div className="hidden md:flex items-center space-x-10">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className="relative text-minimal text-muted-foreground hover:text-primary transition-colors duration-300 after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-gold after:transition-all hover:after:w-full"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <SocialLinks className="hidden lg:flex" iconClassName="h-4 w-4" />
          <ThemeToggle />
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? "✕" : "☰"}
        </Button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="container mx-auto px-6 py-6 space-y-4">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className="block text-minimal text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <SocialLinks iconClassName="h-4 w-4" />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
