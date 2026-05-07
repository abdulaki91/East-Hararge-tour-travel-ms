import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";

interface RatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const Rating: React.FC<RatingProps> = ({
  value,
  onChange,
  readonly = false,
  size = "md",
  showValue = false,
  className,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(null);
    }
  };

  const displayValue = hoverValue ?? value;

  return (
    <div className={clsx("flex items-center gap-1", className)}>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayValue;
          const StarComponent = isFilled ? StarIcon : StarOutlineIcon;

          return (
            <button
              key={star}
              type="button"
              className={clsx(
                sizeClasses[size],
                readonly
                  ? "cursor-default"
                  : "cursor-pointer hover:scale-125 transition-all duration-200 hover:drop-shadow-lg",
                isFilled
                  ? "text-warning-400 drop-shadow-sm"
                  : "text-gray-300 hover:text-warning-200",
                !readonly &&
                  "focus:outline-none focus:ring-2 focus:ring-warning-300 focus:ring-offset-1 rounded-sm",
              )}
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
            >
              <StarComponent className="w-full h-full filter" />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm text-gray-600 ml-2 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default Rating;
