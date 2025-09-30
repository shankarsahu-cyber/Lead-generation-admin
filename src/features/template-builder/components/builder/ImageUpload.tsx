import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// import axios from 'axios'; // Import axios
import { uploadImage } from '../../services/api';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  isStaticDisplay?: boolean; // New prop to control static display
}

export const ImageUpload = ({ value, onChange, onRemove, isStaticDisplay }: ImageUploadProps) => {
  const [urlInput, setUrlInput] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await uploadImage(file, toast);
        onChange(imageUrl);
      } catch (error) {
        // Errors are already handled by the uploadImage function with toasts
        // We can add additional logging here if needed
        console.error("Image upload failed in component:", error);
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUrlSubmit();
    }
  };

  return (
    <div className="space-y-4 w-full">
      {value ? (
        <div className={`relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border-2 border-gray-300 ${!isStaticDisplay ? 'group' : ''}`}>
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          {!isStaticDisplay && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-25 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Change image"
            >
              <Upload className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onRemove}
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            aria-label="Image file upload"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all duration-200"
             onClick={() => fileInputRef.current?.click()}
             role="button"
             tabIndex={0}
             aria-label="Upload a file"
        >
          <Upload className="h-10 w-10 text-gray-400 mb-3" />
          <p className="text-gray-700 font-semibold mb-1">Upload a File</p>
          <p className="text-sm text-gray-500">Drag and drop files here</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            aria-label="Image file upload"
          />
        </div>
      )}
    </div>
  );
};