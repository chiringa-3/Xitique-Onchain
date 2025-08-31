import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import xitiqueLogo from "@assets/9qFCP6A3TO2y2mEIloQh1A_1755099192259.webp";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#features", label: "Features" },
  { href: "#tech", label: "Tech" },
  { href: "#team", label: "Team" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      const scrollPos = window.scrollY + 100;

      sections.forEach((section) => {
        const element = section as HTMLElement;
        const top = element.offsetTop;
        const bottom = top + element.offsetHeight;

        if (scrollPos >= top && scrollPos <= bottom) {
          setActiveSection(element.id);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const targetId = href.replace("#", "");
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      const offsetTop = targetSection.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
    
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src={xitiqueLogo} alt="XITIQUE Logo" className="h-10 w-auto mr-3" />
            <span className="text-xl font-bold text-foreground">XITIQUE</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className={`text-muted-foreground hover:text-primary transition-colors ${
                  activeSection === link.href.replace("#", "") ? "text-primary" : ""
                }`}
              >
                {link.label}
              </button>
            ))}
            <Button asChild>
              <a
                href="https://xitique-fi-chiringatamboii.replit.app"
                target="_blank"
                rel="noopener noreferrer"
                className="transform hover:scale-105 transition-all"
              >
                Launch App
              </a>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-primary"
                >
                  {link.label}
                </button>
              ))}
              <a
                href="https://x.com/xitiqueonchain"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 text-primary"
              >
                Follow on X
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
