import { Card, CardContent } from "@/components/ui/card";

const teamMembers = [
  {
    name: "Luis Chiringatambo",
    role: "Founder & Technical Lead",
    bio: "Blockchain enthusiast and DeFi builder, leading the vision, strategy, and technical direction of XITIQUE. Passionate about financial inclusion and decentralized solutions.",
    roleColor: "primary",
  },
  {
    name: "Sinesipho",
    role: "Product Developer & Design Student", 
    bio: "Passionate about building user-centered products. Combines product development skills with design expertise to create intuitive Web3 experiences.",
    roleColor: "secondary",
  },
  {
    name: "Abdullahi",
    role: "Web3 Content Creator",
    bio: "Specializes in creating engaging educational content for blockchain and decentralized finance. Focused on storytelling and community growth for XITIQUE.",
    roleColor: "accent",
  },
];

export default function Team() {
  return (
    <section id="team" className="py-20 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">Our Team</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className={`text-${member.roleColor} font-semibold mb-4`}>{member.role}</p>
                  <p className="text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
