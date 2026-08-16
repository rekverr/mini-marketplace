import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input: React.FC<InputProps> = ({
  hasError,
  className = "",
  ...props
}) => {
  return (
    <input
      className={`block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
        hasError
          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
          : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
      } ${className}`}
      {...props}
    />
  );
};
