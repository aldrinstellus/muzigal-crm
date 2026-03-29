import { useId } from "react";
import { cn } from "../lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
  headingLevel?: "h2" | "h3" | "h4" | "h5" | "h6";
}

export function Card({ children, className, title, action, headingLevel = "h3" }: CardProps) {
  const titleId = useId();
  const Heading = headingLevel;

  return (
    <div
      className={cn(
        "bg-card text-card-foreground border border-border rounded-xl p-6",
        className
      )}
      role={title ? "region" : undefined}
      aria-labelledby={title ? titleId : undefined}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <Heading id={titleId} className="text-sm font-semibold text-foreground">
              {title}
            </Heading>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
