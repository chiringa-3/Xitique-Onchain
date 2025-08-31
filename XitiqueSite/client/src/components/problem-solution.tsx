import { AlertTriangle, MapPin, Clock, CheckCircle, Eye, Settings } from "lucide-react";

const problems = [
  {
    icon: AlertTriangle,
    title: "Lack of Transparency",
    description: "No clear record of contributions and rotations",
  },
  {
    icon: MapPin,
    title: "Geographic Barriers", 
    description: "Limited by borders and banking friction",
  },
  {
    icon: Clock,
    title: "Manual Enforcement",
    description: "Relies on trust and manual tracking",
  },
];

const solutions = [
  {
    icon: CheckCircle,
    title: "Automated Contributions",
    description: "Smart contracts handle payments and penalties",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description: "Every transaction publicly auditable on blockchain",
  },
  {
    icon: Settings,
    title: "Global Access",
    description: "Save together across borders with ease",
  },
];

export default function ProblemSolution() {
  return (
    <section id="problem-solution" className="py-20 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl font-bold text-foreground mb-8 text-center">Traditional Challenges</h3>
              <div className="space-y-6">
                {problems.map((problem, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <problem.icon className="w-8 h-8 text-destructive mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-xl font-semibold mb-2">{problem.title}</h4>
                      <p className="text-muted-foreground">{problem.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-foreground mb-8 text-center">Our Solutions</h3>
              <div className="space-y-6">
                {solutions.map((solution, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <solution.icon className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-xl font-semibold mb-2">{solution.title}</h4>
                      <p className="text-muted-foreground">{solution.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
