const milestones = [
  {
    id: "M1",
    title: "Ideation & UX Prototype",
    description: "Research, user interviews, and prototype development",
    color: "primary",
  },
  {
    id: "M2",
    title: "Smart Contract PoC",
    description: "Core smart contract development and testing",
    color: "secondary",
  },
  {
    id: "M3", 
    title: "Testnet Group Trials",
    description: "Beta testing with select community groups",
    color: "accent",
  },
  {
    id: "M4",
    title: "Security Review & Community Pilot",
    description: "Full audit, mainnet deployment, and public launch",
    color: "primary",
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">Roadmap</h2>
          
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start">
                <div className={`flex-shrink-0 w-12 h-12 bg-${milestone.color} rounded-full flex items-center justify-center text-white font-bold mr-6`}>
                  {milestone.id}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
