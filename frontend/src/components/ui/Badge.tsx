import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className,
}) => {
  const baseClasses =
    "inline-flex items-center font-medium rounded-full transition-all duration-200 backdrop-blur-sm";

  const variants = {
    default:
      "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 shadow-sm hover:shadow-md",
    success:
      "bg-gradient-to-r from-success-100 to-success-200 text-success-800 shadow-sm hover:shadow-md hover:shadow-success-200/50",
    warning:
      "bg-gradient-to-r from-warning-100 to-warning-200 text-warning-800 shadow-sm hover:shadow-md hover:shadow-warning-200/50",
    danger:
      "bg-gradient-to-r from-error-100 to-error-200 text-error-800 shadow-sm hover:shadow-md hover:shadow-error-200/50",
    info: "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 shadow-sm hover:shadow-md hover:shadow-primary-200/50",
  };

  const sizes = {
    sm: "px-3 py-1 text-xs font-semibold",
    md: "px-4 py-1.5 text-sm font-semibold",
  };

  return (
    <span
      className={clsx(baseClasses, variants[variant], sizes[size], className)}
    >
      {children}
    </span>
  );
};

export default Badge;
