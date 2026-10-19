import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoMark from "@/assets/khatir-logo-mark.png";
import { COMPANY } from "@/lib/company";
import SocialLinks from "@/components/SocialLinks";

const navLinks = [
  { href: "/work", label: "Properties" },
  { href: "/services", label: "Services" },
  { href: "/developments", label: "Developments" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Guides & News" },
  { href: "/contact", label: "Contact" },
];

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 border-b border-gold/15 bg-background/95 pt-[env(safe-area-inset-top)] shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/90"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex min-h-16 w-full max-w-screen-2xl items-center justify-between gap-2 px-3 py-2 sm:min-h-[4.5rem] sm:gap-4 sm:px-5 lg:px-8">
        <Link to="/" onClick={closeMenu} className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none sm:gap-3" aria-label={COMPANY.name}>
          <img
            src={logoMark}
            alt=""
            aria-hidden="true"
            width="96"
            height="96"
            className="block h-9 w-9 shrink-0 rounded-lg object-contain sm:h-11 sm:w-11 lg:h-12 lg:w-12"
          />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="whitespace-nowrap text-[clamp(11px,3.35vw,13px)] font-bold tracking-tight text-primary sm:text-base lg:text-lg">Khatir Property</span>
            <span className="whitespace-nowrap text-[clamp(8px,2.55vw,10px)] font-semibold tracking-[0.015em] text-muted-foreground sm:text-xs lg:text-sm">Consultant &amp; Builders</span>
          </span>
        </Link>

        <div className="hidden shrink-0 items-center gap-3 xl:flex 2xl:gap-5">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href} className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
          <Link to="/login" className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 2xl:px-5">
            Login / Sign up
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 xl:hidden">
          <Link to="/login" className="inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-2.5 text-[11px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:px-4 sm:text-sm">
            Login
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation-menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div id="mobile-navigation-menu" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background shadow-lg xl:hidden">
          <div className="mx-auto grid w-full max-w-screen-2xl gap-1 px-4 py-3 sm:px-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={closeMenu}
                className="flex min-h-12 items-center rounded-lg px-3 text-base font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                {link.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link to="/login" onClick={closeMenu} className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border px-3 text-sm font-semibold text-foreground">
                Sign in
              </Link>
              <Link to="/signup" onClick={closeMenu} className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground">
                Create account
              </Link>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <SocialLinks iconClassName="h-5 w-5" />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
