import { ReactNode } from "react";
import { FileSearch } from "lucide-react";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ElementType;
  action?: ReactNode;
  className?: string;
  isError?: boolean;
}

export function EmptyState({
  title,
  description,
  icon: Icon = FileSearch,
  action,
  className,
  isError = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 md:p-12 text-center min-h-[20rem] rounded-2xl border",
        isError
          ? "bg-danger/10 border-danger/20 text-danger"
          : "bg-surface border-border",
        className
      )}
    >
      <div
        className={cn(
          "w-16 h-16 flex items-center justify-center rounded-full mb-6",
          isError ? "bg-danger/20 text-danger" : "bg-surface-sunken text-fg-muted"
        )}
      >
        <Icon className="w-8 h-8" />
      </div>
      <h3
        className={cn(
          "text-xl font-display font-bold mb-2",
          isError ? "text-danger" : "text-fg"
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "max-w-md mb-8",
          isError ? "text-danger/80" : "text-fg-muted"
        )}
      >
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
