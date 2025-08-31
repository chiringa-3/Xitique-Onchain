import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
  {
    question: "What is a ROSCA?",
    answer: "A ROSCA (Rotating Savings and Credit Association) is a traditional savings system where a group of people regularly contribute money to a common fund, and each member receives the entire sum in turns.",
  },
  {
    question: "Why Hedera?",
    answer: "Hedera offers fast, low-cost, and energy-efficient transactions, making it ideal for regular contributions. Its governance model and enterprise adoption provide stability and trust.",
  },
  {
    question: "Is XITIQUE custodial?", 
    answer: "No, XITIQUE is non-custodial. Users maintain control of their funds through smart contracts, eliminating the need for a central authority to hold money.",
  },
  {
    question: "How do penalties work?",
    answer: "Smart contracts automatically enforce agreed-upon rules. Late payments or missed contributions trigger predefined penalties, ensuring fairness and accountability for all members.",
  },
  {
    question: "When can I try it?",
    answer: "We're currently in development phase. Join our Discord community to stay updated on testnet trials and beta access opportunities.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6 shadow-lg">
                <CardContent className="p-0">
                  <button
                    className="w-full text-left flex justify-between items-center"
                    onClick={() => toggleFAQ(index)}
                  >
                    <h3 className="text-xl font-semibold">{faq.question}</h3>
                    <ChevronDown 
                      className={`w-5 h-5 transform transition-transform ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="mt-4 text-muted-foreground">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
