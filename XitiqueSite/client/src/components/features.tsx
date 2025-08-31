import { Shield, Eye, Settings, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Blockchain Security",
    description: "Trust the code, not a middleman.",
  },
  {
    icon: Eye,
    title: "Full Transparency", 
    description: "Every contribution. Publicly auditable.",
  },
  {
    icon: Settings,
    title: "Automated Rules",
    description: "On-time payments. Fair rotations.",
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Save together, across borders.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">Key Features</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-lg">"{feature.description}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
