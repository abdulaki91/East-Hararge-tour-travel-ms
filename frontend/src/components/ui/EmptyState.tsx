import type { ReactNode } from "react";
import Button from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <div className={`text-center py-16 px-6 ${className}`}>
      {icon && (
        <div className="mx-auto h-16 w-16 text-gray-400 mb-6 animate-bounce-in opacity-60">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900 mb-3 font-display animate-slide-up">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed animate-slide-up">
          {description}
        </p>
      )}
      {action && (
        <div className="animate-slide-up">
          <Button onClick={action.onClick} size="lg">
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
