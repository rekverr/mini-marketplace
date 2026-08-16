import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded border bg-white px-3 py-1 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Prev
      </button>
      <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded border bg-white px-3 py-1 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
};
