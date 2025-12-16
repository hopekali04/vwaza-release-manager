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
        <label htmlFor="title" className="block text-sm font-medium text-neutral-400 mb-2">
          Release Title *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg px-4 py-2 placeholder-neutral-600 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-colors"
          placeholder="Enter release title"
          disabled={isLoading}
        />
        {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="genre" className="block text-sm font-medium text-neutral-400 mb-2">
          Genre *
        </label>
        <select
          id="genre"
          value={formData.genre}
          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
          className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-colors"
          disabled={isLoading}
        >
          <option className="bg-neutral-900 text-neutral-400" value="">Select a genre</option>
          <option className="bg-neutral-900 text-white" value="Pop">Pop</option>
          <option className="bg-neutral-900 text-white" value="Rock">Rock</option>
          <option className="bg-neutral-900 text-white" value="Hip-Hop">Hip-Hop</option>
          <option className="bg-neutral-900 text-white" value="R&B">R&B</option>
          <option className="bg-neutral-900 text-white" value="Electronic">Electronic</option>
          <option className="bg-neutral-900 text-white" value="Jazz">Jazz</option>
          <option className="bg-neutral-900 text-white" value="Classical">Classical</option>
          <option className="bg-neutral-900 text-white" value="Country">Country</option>
          <option className="bg-neutral-900 text-white" value="Reggae">Reggae</option>
          <option className="bg-neutral-900 text-white" value="Blues">Blues</option>
          <option className="bg-neutral-900 text-white" value="Folk">Folk</option>
          <option className="bg-neutral-900 text-white" value="Alternative">Alternative</option>
          <option className="bg-neutral-900 text-white" value="Other">Other</option>
        </select>
        {errors.genre && <p className="mt-1 text-sm text-red-400">{errors.genre}</p>}
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
