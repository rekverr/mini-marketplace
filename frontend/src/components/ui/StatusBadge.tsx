import React from "react";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case "NEW":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStyles()}`}
    >
      {status}
    </span>
  );
};
