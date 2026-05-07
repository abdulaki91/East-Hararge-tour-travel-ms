import { clsx } from "clsx";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: "primary" | "secondary" | "accent" | "white";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  color = "primary",
}) => {
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const colorClasses = {
    primary: "border-slate-200 border-t-blue-600",
    secondary: "border-slate-200 border-t-purple-600",
    accent: "border-slate-200 border-t-orange-600",
    white: "border-white/30 border-t-white",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={clsx(
          "animate-spin rounded-full border-2",
          sizeClasses[size],
          colorClasses[color],
          className,
        )}
      />
    </div>
  );
};

export default LoadingSpinner;
