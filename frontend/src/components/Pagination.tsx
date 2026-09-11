import { memo } from 'react';

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

function PaginationImpl({ page, pages, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ← Prev
      </button>
      <span className="pagination__status">
        Page {page} of {pages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  );
}

export const Pagination = memo(PaginationImpl);
