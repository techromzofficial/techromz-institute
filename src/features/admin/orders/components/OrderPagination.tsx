"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface OrderPaginationProps {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function OrderPagination({
  currentPage,
  pageSize,
  totalRecords,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: OrderPaginationProps) {
  const startItem = totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalRecords);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1, 2, 3, 4, 5);
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="order-pagination-bar">
      <div className="pagination-info">
        Showing <strong>{startItem}–{endItem}</strong> of <strong>{totalRecords.toLocaleString()}</strong> orders
      </div>

      <div className="pagination-controls">
        <div className="page-size-selector">
          <label htmlFor="page-size-select">Rows per page</label>
          <select
            id="page-size-select"
            className="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="pagination-buttons">
          <button
            type="button"
            className="pagination-btn icon-btn"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                  ...
                </span>
              );
            }
            const pageNum = Number(p);
            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                className={`pagination-number-btn ${currentPage === pageNum ? "active" : ""}`}
                onClick={() => onPageChange(pageNum)}
                aria-pressed={currentPage === pageNum}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            className="pagination-btn icon-btn"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
