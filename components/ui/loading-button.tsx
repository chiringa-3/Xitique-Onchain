import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  loading = false,
  success = false,
  error = false,
  loadingText,
  successText,
  errorText,
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  const isDisabled = disabled || loading || success;
  
  const getButtonState = () => {
    if (success) {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        text: successText || children,
        className: "bg-green-500 hover:bg-green-600 text-white scale-105"
      };
    }
    
    if (error) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        text: errorText || children,
        className: "bg-red-500 hover:bg-red-600 text-white"
      };
    }
    
    if (loading) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        text: loadingText || children,
        className: "animate-pulse"
      };
    }
    
    return {
      icon: null,
      text: children,
      className: ""
    };
  };

  const state = getButtonState();

  return (
    <Button
      className={cn(
        "transition-all duration-300 relative overflow-hidden",
        state.className,
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {/* Animated background for success */}
      {success && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 animate-pulse opacity-50"></div>
      )}
      
      <div className="flex items-center justify-center gap-2 relative z-10">
        {state.icon}
        <span>{state.text}</span>
      </div>
    </Button>
  );
}