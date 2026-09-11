import { memo, useState, type FormEvent } from 'react';
import type { BookingFilters } from '@/types';

interface BookingFilterBarProps {
  initialFilters: BookingFilters;
  onApply: (filters: BookingFilters) => void;
}

/**
 * Uncontrolled-ish local form state: edits accumulate locally and are
 * only pushed up to the parent (which triggers the debounced query) on
 * submit or field blur, rather than on every keystroke.
 */
function BookingFilterBarImpl({ initialFilters, onApply }: BookingFilterBarProps) {
  const [location, setLocation] = useState(initialFilters.location ?? '');
  const [dateFrom, setDateFrom] = useState(initialFilters.date_from ?? '');
  const [dateTo, setDateTo] = useState(initialFilters.date_to ?? '');
  const [minPrice, setMinPrice] = useState(initialFilters.min_price?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.max_price?.toString() ?? '');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onApply({
      location: location.trim() || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
    });
  };

  const handleReset = () => {
    setLocation('');
    setDateFrom('');
    setDateTo('');
    setMinPrice('');
    setMaxPrice('');
    onApply({});
  };

  return (
    <form className="filter-bar" onSubmit={handleSubmit} aria-label="Filter bookings">
      <div className="filter-bar__field">
        <label htmlFor="filter-location">Location</label>
        <input
          id="filter-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Lisbon"
        />
      </div>
      <div className="filter-bar__field">
        <label htmlFor="filter-date-from">From</label>
        <input
          id="filter-date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
      </div>
      <div className="filter-bar__field">
        <label htmlFor="filter-date-to">To</label>
        <input
          id="filter-date-to"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>
      <div className="filter-bar__field">
        <label htmlFor="filter-min-price">Min price</label>
        <input
          id="filter-min-price"
          type="number"
          min="0"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
      </div>
      <div className="filter-bar__field">
        <label htmlFor="filter-max-price">Max price</label>
        <input
          id="filter-max-price"
          type="number"
          min="0"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>
      <div className="filter-bar__actions">
        <button type="submit" className="button">
          Apply filters
        </button>
        <button type="button" className="button button--secondary" onClick={handleReset}>
          Reset
        </button>
      </div>
    </form>
  );
}

export const BookingFilterBar = memo(BookingFilterBarImpl);
