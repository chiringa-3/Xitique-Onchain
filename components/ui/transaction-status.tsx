import { CheckCircle, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TransactionStatusProps {
  status: 'pending' | 'confirming' | 'success' | 'error';
  txHash?: string;
  message?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export function TransactionStatus({ 
  status, 
  txHash, 
  message, 
  onRetry, 
  onClose 
}: TransactionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-blue-500" />,
          title: "Transaction Pending",
          description: message || "Please confirm the transaction in your wallet",
          bgColor: "bg-blue-50 dark:bg-blue-950",
          borderColor: "border-blue-200 dark:border-blue-800",
          textColor: "text-blue-700 dark:text-blue-300"
        };
      case 'confirming':
        return {
          icon: (
            <div className="relative">
              <div className="h-8 w-8 rounded-full border-4 border-orange-200 dark:border-orange-800"></div>
              <div className="absolute inset-0 h-8 w-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
            </div>
          ),
          title: "Confirming Transaction",
          description: message || "Transaction is being confirmed on the blockchain",
          bgColor: "bg-orange-50 dark:bg-orange-950",
          borderColor: "border-orange-200 dark:border-orange-800",
          textColor: "text-orange-700 dark:text-orange-300"
        };
      case 'success':
        return {
          icon: (
            <div className="relative">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="absolute inset-0 h-8 w-8 rounded-full bg-green-200 animate-ping opacity-25"></div>
            </div>
          ),
          title: "Transaction Successful!",
          description: message || "Your transaction has been confirmed",
          bgColor: "bg-green-50 dark:bg-green-950",
          borderColor: "border-green-200 dark:border-green-800",
          textColor: "text-green-700 dark:text-green-300"
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-8 w-8 text-red-500" />,
          title: "Transaction Failed",
          description: message || "There was an error processing your transaction",
          bgColor: "bg-red-50 dark:bg-red-950",
          borderColor: "border-red-200 dark:border-red-800",
          textColor: "text-red-700 dark:text-red-300"
        };
      default:
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-gray-500" />,
          title: "Processing",
          description: "Please wait...",
          bgColor: "bg-gray-50 dark:bg-gray-950",
          borderColor: "border-gray-200 dark:border-gray-800",
          textColor: "text-gray-700 dark:text-gray-300"
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2 transition-all duration-500 animate-in slide-in-from-bottom-4`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {config.icon}
          </div>
          
          <div className="flex-1 space-y-2">
            <h3 className={`font-semibold text-lg ${config.textColor}`}>
              {config.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {config.description}
            </p>
            
            {txHash && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Transaction Hash:
                </p>
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border">
                  <code className="text-xs font-mono break-all flex-1">
                    {txHash}
                  </code>
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.open(`https://hashscan.io/testnet/transaction/${txHash}`, '_blank')}
                    data-testid="button-view-transaction"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              {status === 'error' && onRetry && (
                <Button 
                  size="sm" 
                  onClick={onRetry}
                  data-testid="button-retry-transaction"
                >
                  Try Again
                </Button>
              )}
              {(status === 'success' || status === 'error') && onClose && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onClose}
                  data-testid="button-close-status"
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}