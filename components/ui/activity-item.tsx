import { LucideIcon } from "lucide-react";

interface ActivityItemProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  title: string;
  timestamp: string;
  amount?: string;
  amountColor?: string;
}

export function ActivityItem({
  icon: Icon,
  iconBgColor,
  iconColor,
  title,
  timestamp,
  amount,
  amountColor = "text-gray-900 dark:text-white",
}: ActivityItemProps) {
  return (
    <div className="flex items-start space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
      <div className={`p-2 ${iconBgColor} rounded-lg`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{timestamp}</p>
      </div>
      {amount && (
        <span className={`text-sm font-medium ${amountColor}`}>{amount}</span>
      )}
    </div>
  );
}
