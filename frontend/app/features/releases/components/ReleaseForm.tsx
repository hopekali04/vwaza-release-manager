import { useState } from 'react';
import { Button } from '~/components/ui';
import type { CreateReleaseData } from '../types';

interface ReleaseFormProps {
  initialData?: CreateReleaseData;
  onSubmit: (data: CreateReleaseData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ReleaseForm({ initialData, onSubmit, onCancel, isLoading }: ReleaseFormProps) {
  const [formData, setFormData] = useState<CreateReleaseData>(
    initialData || { title: '', genre: '' }
  );
  const [errors, setErrors] = useState<Partial<CreateReleaseData>>({});

  const validate = (): boolean => {
    const newErrors: Partial<CreateReleaseData> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.genre.trim()) {
      newErrors.genre = 'Genre is required';
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
          Release Title *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter release title"
          disabled={isLoading}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
          Genre *
        </label>
        <select
          id="genre"
          value={formData.genre}
          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        >
          <option value="">Select a genre</option>
          <option value="Pop">Pop</option>
          <option value="Rock">Rock</option>
          <option value="Hip-Hop">Hip-Hop</option>
          <option value="R&B">R&B</option>
          <option value="Electronic">Electronic</option>
          <option value="Jazz">Jazz</option>
          <option value="Classical">Classical</option>
          <option value="Country">Country</option>
          <option value="Reggae">Reggae</option>
          <option value="Blues">Blues</option>
          <option value="Folk">Folk</option>
          <option value="Alternative">Alternative</option>
          <option value="Other">Other</option>
        </select>
        {errors.genre && <p className="mt-1 text-sm text-red-600">{errors.genre}</p>}
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Release'}
        </Button>
      </div>
    </form>
  );
}
