import React from "react";

export const LoadingState: React.FC = () => (
  <div className="flex h-32 items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
  </div>
);

export const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="my-4 rounded-md bg-red-50 p-4">
    <div className="text-sm font-medium text-red-700">{message}</div>
  </div>
);

export const EmptyState: React.FC<{ title: string; description?: string }> = ({
  title,
  description,
}) => (
  <div className="py-12 text-center">
    <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
  </div>
);
