import { Card, CardContent } from "@/components/ui/card";
import { Hexagon, Star } from "lucide-react";

interface NFTCardProps {
  name: string;
  groupName: string;
  reputationBoost: number;
  gradientColors: string;
  icon?: "hexagon" | "star";
}

export function NFTCard({ 
  name, 
  groupName, 
  reputationBoost, 
  gradientColors,
  icon = "hexagon" 
}: NFTCardProps) {
  const IconComponent = icon === "star" ? Star : Hexagon;

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardContent className="p-4">
        <div className={`w-full h-32 bg-gradient-to-br ${gradientColors} rounded-lg mb-3 flex items-center justify-center`}>
          <div className="text-white text-center">
            <IconComponent className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs font-medium">{groupName} NFT</p>
          </div>
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{name}</h4>
        <p className="text-xs text-gray-600 dark:text-gray-400">{groupName}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">Reputation Boost</span>
          <span className="text-xs font-medium text-secondary">+{reputationBoost}</span>
        </div>
      </CardContent>
    </Card>
  );
}
