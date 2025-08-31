const steps = [
  {
    number: "1",
    title: "Create or Join",
    description: "Find or start a contribution group with trusted members",
    color: "primary",
  },
  {
    number: "2", 
    title: "Set Parameters",
    description: "Define contribution amount and payment frequency",
    color: "secondary",
  },
  {
    number: "3",
    title: "Automate",
    description: "Smart contracts handle contributions and rules automatically",
    color: "accent",
  },
  {
    number: "4",
    title: "Receive Funds",
    description: "Get the pooled funds when it's your turn",
    color: "primary",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">How It Works</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className={`bg-${step.color}/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-${step.color}/20 transition-colors`}>
                  <span className={`text-2xl font-bold text-${step.color}`}>{step.number}</span>
                </div>
                <h4 className="text-xl font-semibold mb-4">{step.title}</h4>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
