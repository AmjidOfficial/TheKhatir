import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import { COMPANY } from "@/lib/company";

interface Props {
  className?: string;
  iconClassName?: string;
}

const SocialLinks = ({ className = "", iconClassName = "h-5 w-5" }: Props) => {
  const links = [
    { href: COMPANY.social.facebook, label: "Facebook", Icon: Facebook },
    { href: COMPANY.social.instagram, label: "Instagram", Icon: Instagram },
    { href: COMPANY.social.youtube, label: "YouTube", Icon: Youtube },
    { href: COMPANY.social.linkedin, label: "LinkedIn", Icon: Linkedin },
  ];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {links.filter(({ href }) => href && /^https:\/\//i.test(href)).map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground transition-all duration-300 hover:border-gold hover:bg-gold hover:text-gold-foreground"
        >
          <Icon className={iconClassName} />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
