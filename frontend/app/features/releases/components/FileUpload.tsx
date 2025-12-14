import { useState, useRef, useEffect } from 'react';
import { Button } from '~/components/ui';

interface FileUploadProps {
  label: string;
  accept: string;
  maxSize: number; // in MB
  onUpload: (file: File) => Promise<boolean>;
  currentUrl?: string;
  type: 'image' | 'audio';
}

export function FileUpload({ label, accept, maxSize, onUpload, currentUrl, type }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUrl) {
      setPreview(currentUrl);
    }
  }, [currentUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file size
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const acceptedExts = accept.split(',').map(a => a.trim().replace('.', ''));
    if (!fileExt || !acceptedExts.includes(fileExt)) {
      setError(`Invalid file type. Accepted: ${accept}`);
      return;
    }

    // Show preview for images
    if (type === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Upload file
    setIsUploading(true);
    try {
      const success = await onUpload(file);
      if (!success) {
        setError('Upload failed. Please try again.');
        setPreview(null);
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-neutral-400 uppercase tracking-wider">{label}</label>
      
      {type === 'image' && preview && (
        <div className="mb-3">
          <img
            src={preview}
            alt="Preview"
            className="w-48 h-48 object-cover rounded-lg border border-white/10"
          />
        </div>
      )}

      {type === 'audio' && currentUrl && (
        <div className="mb-3">
          <div className="flex items-center space-x-2 text-sm text-green-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Audio file uploaded successfully</span>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : currentUrl ? 'Change File' : 'Choose File'}
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}
      
      <p className="text-xs text-gray-500">
        Accepted formats: {accept} (Max {maxSize}MB)
      </p>
    </div>
  );
}
