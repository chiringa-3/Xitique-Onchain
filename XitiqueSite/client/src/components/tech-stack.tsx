import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const techItems = [
  { name: "Hedera", initial: "H", color: "primary" },
  { name: "Prisma", initial: "P", color: "secondary" },
  { name: "Replit", initial: "R", color: "accent" },
  { name: "More", initial: "+", color: "primary" },
];

export default function TechStack() {
  return (
    <section id="tech" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">Tech Stack</h2>
          <p className="text-xl text-muted-foreground mb-12">Built with cutting-edge Web3 technology</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {techItems.map((item, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 bg-${item.color}/10 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <span className={`text-2xl font-bold text-${item.color}`}>{item.initial}</span>
                </div>
                <p className="font-semibold">{item.name}</p>
              </div>
            ))}
          </div>

          <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-6 py-3 text-base font-semibold shadow-lg">
            <Sparkles className="w-5 h-5 mr-2" />
            Hedera Africa Hackathon 2025
          </Badge>
        </div>
      </div>
    </section>
  );
}
