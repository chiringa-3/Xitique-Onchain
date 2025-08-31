

const quickLinks = [
  { href: "#about", label: "About" },
  { href: "#features", label: "Features" },
  { href: "#team", label: "Team" },
  { href: "#faq", label: "FAQ" },
];

const contactLinks = [
  { href: "mailto:team@xitique.com", label: "team@xitique.com" },
  { href: "https://x.com/xitiqueonchain", label: "Follow on X", external: true },
  { href: "https://discord.gg/NHjRZzYC", label: "Join Discord", external: true },
];

export default function Footer() {
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
  };

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold">XITIQUE</span>
            </div>
            <p className="text-muted mb-4">Modernizing community savings with blockchain technology</p>
            <p className="text-muted text-sm">© 2025 XITIQUE OnChain. All rights reserved.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(link.href)}
                  className="block text-muted hover:text-background transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-2">
              {contactLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="block text-muted hover:text-background transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
