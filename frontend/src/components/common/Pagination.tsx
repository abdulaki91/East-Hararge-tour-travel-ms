import React from "react";
import Button from "../ui/Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex justify-center items-center space-x-4 mt-8">
      <Button
        variant="outline"
        disabled={!hasPrev}
        onClick={() => onPageChange(currentPage - 1)}
        className="shadow-md hover:shadow-lg"
      >
        Previous
      </Button>

      <span className="text-sm text-gray-600 font-medium bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        disabled={!hasNext}
        onClick={() => onPageChange(currentPage + 1)}
        className="shadow-md hover:shadow-lg"
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
