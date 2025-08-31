import { Button } from "@/components/ui/button";
import xitiqueLogo from "@assets/9qFCP6A3TO2y2mEIloQh1A_1755099192259.webp";

export default function Hero() {
  return (
    <section id="hero" className="min-h-screen flex items-center mesh-bg network-pattern pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              From Tradition to{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Blockchain
              </span>
            </h1>
          </div>
          
          <div className="animate-slide-up">
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">XITIQUE modernizes community savings (ROSCA) with Hedera smart contracts secure, transparent, and borderless.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up">
            <Button asChild size="lg" className="px-8 py-4 text-lg transform hover:scale-105 transition-all shadow-lg">
              <a href="https://discord.gg/NHjRZzYC" target="_blank" rel="noopener noreferrer">
                Join the Movement
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all">
              <a href="https://living-bowl-f51.notion.site/Whitepaper-122d53cbd8c28060826fc2f36e511014" target="_blank" rel="noopener noreferrer">
                Read the Litepaper
              </a>
            </Button>
          </div>

          <div className="mt-16 flex justify-center animate-float">
            <div className="relative">
              <div className="w-16 h-16 bg-primary rounded-full opacity-20"></div>
              <div className="absolute top-4 left-4 w-8 h-8 bg-secondary rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
