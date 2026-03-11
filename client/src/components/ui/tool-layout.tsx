import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  outputValue?: string;
}

export default function ToolLayout({
  title,
  description,
  icon,
  children,
  outputValue,
}: ToolLayoutProps) {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    if (!outputValue) return;

    try {
      await navigator.clipboard.writeText(outputValue);
      toast({
        title: "Copied!",
        description: "Output copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Tool Header */}
      <div className="mb-3">
        <div className="flex items-center space-x-2 mb-1">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded-md">
            {icon}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {/* Tool Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {children}
      </div>

    </div>
  );
}

interface ToolInputProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  headerActions?: React.ReactNode;
}

export function ToolInput({ title, children, actions, headerActions }: ToolInputProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            <div className="p-0.5 bg-blue-100 dark:bg-blue-900/20 rounded mr-1.5">
              <div className="h-3 w-3 bg-blue-500 dark:bg-blue-400 rounded-sm" />
            </div>
            {title}
          </CardTitle>
          {headerActions}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {children}
        {actions && <div className="flex space-x-2">{actions}</div>}
      </CardContent>
    </Card>
  );
}

interface ToolOutputProps {
  title: string;
  value: string;
  canCopy?: boolean;
  children?: React.ReactNode;
}

export function ToolOutput({ title, value, canCopy = true, children }: ToolOutputProps) {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "Copied!",
        description: "Output copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            <div className="p-0.5 bg-green-100 dark:bg-green-900/20 rounded mr-1.5">
              <div className="h-3 w-3 bg-green-500 dark:bg-green-400 rounded-sm" />
            </div>
            {title}
          </CardTitle>
          {canCopy && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              disabled={!value}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
