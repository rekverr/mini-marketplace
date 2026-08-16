import React from "react";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  hasError?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  hasError,
  className = "",
  ...props
}) => {
  return (
    <select
      className={`block w-full rounded-md border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 ${
        hasError
          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
          : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
      } ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
