import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import About from "@/components/about";
import ProblemSolution from "@/components/problem-solution";
import HowItWorks from "@/components/how-it-works";
import Features from "@/components/features";
import TechStack from "@/components/tech-stack";
import Team from "@/components/team";
import Roadmap from "@/components/roadmap";
import FAQ from "@/components/faq";
import FinalCTA from "@/components/final-cta";
import Contact from "@/components/contact";
import Footer from "@/components/footer";

export default function Landing() {
  return (
    <div className="font-sans text-foreground bg-background">
      <Navbar />
      <Hero />
      <About />
      <ProblemSolution />
      <HowItWorks />
      <Features />
      <TechStack />
      <Team />
      <Roadmap />
      <FAQ />
      <FinalCTA />
      <Contact />
      <Footer />
    </div>
  );
}
