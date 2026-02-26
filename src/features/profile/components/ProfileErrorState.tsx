import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileErrorStateProps {
  error: string;
  onRetry?: () => void;
  type?: "user-not-found" | "network-error" | "generic";
}

export const ProfileErrorState: React.FC<ProfileErrorStateProps> = ({
  error,
  onRetry,
  type = "generic",
}) => {
  const getErrorContent = () => {
    switch (type) {
      case "user-not-found":
        return {
          title: "User Not Found",
          description:
            "The profile you're looking for doesn't exist or has been deactivated.",
          showRetry: false,
        };
      case "network-error":
        return {
          title: "Network Error",
          description:
            "Failed to load profile. Please check your connection and try again.",
          showRetry: true,
        };
      default:
        return {
          title: "Something went wrong",
          description:
            error || "An unexpected error occurred while loading the profile.",
          showRetry: true,
        };
    }
  };

  const content = getErrorContent();

  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <div className="w-[80%] max-w-md">
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="space-y-4">
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-400">
                {content.title}
              </h3>
              <p className="text-red-700 dark:text-red-300 mt-1">
                {content.description}
              </p>
            </div>

            {content.showRetry && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default ProfileErrorState;
