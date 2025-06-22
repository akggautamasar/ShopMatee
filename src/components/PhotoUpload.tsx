
import React, { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotoUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  folderPrefix?: string;
  label?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  value,
  onChange,
  folderPrefix = "profile",
  label = "Photo"
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Maximum file size: 5MB
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  // Maximum dimensions for compression
  const MAX_WIDTH = 800;
  const MAX_HEIGHT = 800;

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file';
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size too large. Please select an image smaller than ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`;
    }

    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        toast({
          title: "Upload Error",
          description: validationError,
          variant: "destructive"
        });
        return;
      }

      // Compress image if it's large
      let fileToUpload = file;
      if (file.size > 1024 * 1024) { // Compress if larger than 1MB
        toast({
          title: "Compressing image...",
          description: "Optimizing your photo for upload"
        });
        fileToUpload = await compressImage(file);
      }

      const fileExt = fileToUpload.name.split('.').pop() || 'jpg';
      const filePath = `${folderPrefix}/${crypto.randomUUID()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("staff-photos")
        .upload(filePath, fileToUpload, {
          cacheControl: "3600",
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        let errorMessage = "Failed to upload photo. Please try again.";
        
        if (error.message.includes('duplicate')) {
          errorMessage = "Photo already exists. Please try a different image.";
        } else if (error.message.includes('size')) {
          errorMessage = "Photo is too large. Please try a smaller image.";
        } else if (error.message.includes('format')) {
          errorMessage = "Invalid photo format. Please use JPG, PNG, or WEBP.";
        }

        toast({
          title: "Upload Failed",
          description: errorMessage,
          variant: "destructive"
        });
      } else if (data) {
        const { data: urlData } = supabase.storage.from("staff-photos").getPublicUrl(filePath);
        if (urlData?.publicUrl) {
          onChange(urlData.publicUrl);
          toast({
            title: "Photo uploaded successfully",
            description: fileToUpload !== file ? "Image was compressed for optimal loading" : undefined
          });
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-gray-100 overflow-hidden border border-gray-300 flex items-center justify-center">
          {value ? (
            <img
              src={value}
              alt="Profile"
              className="object-cover h-full w-full"
            />
          ) : (
            <ImagePlus className="text-gray-400 h-8 w-8" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="h-8 px-3 text-xs"
          >
            {uploading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              "Upload"
            )}
          </Button>
          <span className="text-xs text-gray-500">Max 5MB</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
    </div>
  );
};

export default PhotoUpload;
