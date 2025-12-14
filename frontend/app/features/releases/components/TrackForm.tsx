import { useState } from 'react';
import { Button } from '~/components/ui';
import type { CreateTrackData } from '../types';

interface TrackFormProps {
  initialData?: Partial<CreateTrackData>;
  onSubmit: (data: CreateTrackData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  trackCount: number;
}

export function TrackForm({ initialData, onSubmit, onCancel, isLoading, trackCount }: TrackFormProps) {
  const [formData, setFormData] = useState<CreateTrackData>({
    title: initialData?.title || '',
    trackOrder: initialData?.trackOrder || trackCount + 1,
    isrc: initialData?.isrc || '',
  });
  const [errors, setErrors] = useState<Partial<CreateTrackData>>({});

  const validate = (): boolean => {
    const newErrors: any = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.trackOrder < 1) {
      newErrors.trackOrder = 'Track order must be at least 1';
    }
    
    if (formData.isrc && !/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(formData.isrc)) {
      newErrors.isrc = 'Invalid ISRC format (e.g., USRC12345678)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Track Title *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter track title"
          disabled={isLoading}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="trackOrder" className="block text-sm font-medium text-gray-700 mb-2">
          Track Order *
        </label>
        <input
          id="trackOrder"
          type="number"
          min="1"
          value={formData.trackOrder}
          onChange={(e) => setFormData({ ...formData, trackOrder: parseInt(e.target.value) || 1 })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        {errors.trackOrder && <p className="mt-1 text-sm text-red-600">{errors.trackOrder}</p>}
      </div>

      <div>
        <label htmlFor="isrc" className="block text-sm font-medium text-gray-700 mb-2">
          ISRC (Optional)
        </label>
        <input
          id="isrc"
          type="text"
          value={formData.isrc}
          onChange={(e) => setFormData({ ...formData, isrc: e.target.value.toUpperCase() })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="USRC12345678"
          maxLength={12}
          disabled={isLoading}
        />
        {errors.isrc && <p className="mt-1 text-sm text-red-600">{errors.isrc}</p>}
        <p className="mt-1 text-xs text-gray-500">
          Format: 2-letter country code + 3-character registrant code + 7 digits
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Track'}
        </Button>
      </div>
    </form>
  );
}
