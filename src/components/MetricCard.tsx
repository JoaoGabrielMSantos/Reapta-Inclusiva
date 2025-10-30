import { ReactNode } from "react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendUp,
  className 
}: MetricCardProps) => {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p className={cn(
              "text-sm font-medium flex items-center gap-1",
              trendUp ? "text-success" : "text-destructive"
            )}>
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-primary opacity-80">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
