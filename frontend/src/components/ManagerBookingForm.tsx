import { useState, type FormEvent } from 'react';
import { useCreateBookingMutation } from '@/hooks/useBookings';
import { ErrorMessage } from '@/components/ErrorMessage';
import { extractErrorMessage } from '@/api/errors';
import { validateRequired } from '@/utils/validation';

/**
 * Manager-only "create listing" form. Kept as its own component (rather
 * than inline in ManagerDashboardPage) so the page stays focused on
 * layout/composition and this form's local state/validation logic is
 * independently testable.
 */
export function ManagerBookingForm() {
  const createBooking = useCreateBookingMutation();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSuccessMessage(null);

    const errors: Record<string, string> = {};
    const nameError = validateRequired(name, 'Name');
    if (nameError) errors.name = nameError;
    const locationError = validateRequired(location, 'Location');
    if (locationError) errors.location = locationError;
    if (!date) errors.date = 'Date is required.';
    const priceNumber = Number(price);
    if (!price || Number.isNaN(priceNumber) || priceNumber <= 0) {
      errors.price = 'Price must be a positive number.';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await createBooking.mutateAsync({ name, location, date, price: priceNumber, description });
      setSuccessMessage(`"${name}" was added to the catalog.`);
      setName('');
      setLocation('');
      setDate('');
      setPrice('');
      setDescription('');
    } catch {
      // surfaced via createBooking.isError below
    }
  };

  return (
    <form className="manager-form" onSubmit={handleSubmit} noValidate>
      <h2>Add a new listing</h2>
      <div className="manager-form__grid">
        <div className="form-field">
          <label htmlFor="mb-name">Name</label>
          <input id="mb-name" value={name} onChange={(e) => setName(e.target.value)} />
          {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="mb-location">Location</label>
          <input id="mb-location" value={location} onChange={(e) => setLocation(e.target.value)} />
          {fieldErrors.location && <span className="field-error">{fieldErrors.location}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="mb-date">Date</label>
          <input id="mb-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {fieldErrors.date && <span className="field-error">{fieldErrors.date}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="mb-price">Price</label>
          <input
            id="mb-price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          {fieldErrors.price && <span className="field-error">{fieldErrors.price}</span>}
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="mb-description">Description</label>
        <textarea
          id="mb-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      {createBooking.isError && (
        <ErrorMessage
          message={extractErrorMessage(createBooking.error, 'Could not create listing.')}
        />
      )}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <button type="submit" className="button" disabled={createBooking.isPending}>
        {createBooking.isPending ? 'Adding…' : 'Add listing'}
      </button>
    </form>
  );
}
