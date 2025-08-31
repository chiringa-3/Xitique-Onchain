import { Button } from "@/components/ui/button";

export default function FinalCTA() {
  return (
    <section id="final-cta" className="py-20 bg-gradient-to-r from-primary to-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-8">Join the Revolution</h2>
          <p className="text-xl text-primary-foreground/90 mb-12">Be part of the future of community savings</p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button asChild size="lg" variant="secondary" className="px-8 py-4 text-lg bg-white text-primary hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg">
              <a href="https://x.com/xitiqueonchain" target="_blank" rel="noopener noreferrer">
                Follow our journey on X
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
