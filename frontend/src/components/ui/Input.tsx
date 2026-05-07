import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, helperText, leftIcon, rightIcon, id, ...props },
    ref,
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-700 mb-2 font-display"
          >
            {label}
          </label>
        )}

        <div className="relative group">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <div className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200">
                {leftIcon}
              </div>
            </div>
          )}

          <input
            id={inputId}
            className={clsx(
              "block w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200",
              "focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:bg-white",
              "hover:border-gray-300 hover:shadow-md",
              "placeholder:text-gray-400 text-gray-900",
              "px-4 py-3 text-sm font-medium",
              leftIcon && "pl-12",
              rightIcon && "pr-12",
              error &&
                "border-error-300 focus:border-error-500 focus:ring-error-100 bg-error-50/50",
              className,
            )}
            ref={ref}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center z-10">
              <div className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200">
                {rightIcon}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-error-600 font-medium animate-slide-up">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
