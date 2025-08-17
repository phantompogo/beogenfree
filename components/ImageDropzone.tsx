import React, { useState, useRef, useCallback } from 'react';

interface ImageDropzoneProps {
  imageFile: File | null;
  onFileSelect: (file: File | null) => void;
  disabled: boolean;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({ imageFile, onFileSelect, disabled }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Create a memoized version of the preview URL to avoid unnecessary re-renders
  const imagePreviewUrl = React.useMemo(() => {
    return imageFile ? URL.createObjectURL(imageFile) : null;
  }, [imageFile]);

  // Clean up the object URL when the component unmounts or the file changes
  React.useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleFile = useCallback((file: File | undefined) => {
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      onFileSelect(file);
    } else {
      // You can add a user-facing error message here if needed
      console.warn("Tipe file tidak valid. Silakan unggah gambar PNG atau JPEG.");
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDraggingOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [disabled, handleFile]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent click from bubbling up, just in case
    onFileSelect(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input to allow re-uploading the same file
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only trigger the file input if the click is on the dropzone background itself,
    // not on its children like the preview image or the remove button.
    if (e.target === e.currentTarget) {
        if (!disabled && !imageFile) {
            fileInputRef.current?.click();
        }
    }
  };

  const dropzoneClasses = `relative w-full p-6 border-2 border-dashed rounded-lg text-center transition-colors duration-200 ${
    disabled ? 'bg-gray-800/50 cursor-not-allowed' : 'bg-gray-900 hover:border-purple-400'
  } ${isDraggingOver ? 'border-purple-500 bg-purple-900/20' : 'border-gray-600'} ${
    !imageFile && !disabled ? 'cursor-pointer' : ''
  }`;

  return (
    <div>
        <label className="block text-lg font-semibold mb-2 text-gray-300">
            Frame Awal (Opsional)
        </label>
        <div 
            className={dropzoneClasses}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            role="button"
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleInputChange}
                disabled={disabled}
                className="hidden"
            />
            {imagePreviewUrl ? (
                <div className="flex flex-col items-center">
                    <img src={imagePreviewUrl} alt="Pratinjau" className="w-32 h-32 rounded-lg object-cover border-2 border-gray-500"/>
                    <p className="mt-2 text-sm text-gray-400 truncate max-w-full px-2">{imageFile?.name}</p>
                    <button 
                        type="button"
                        onClick={handleRemoveImage}
                        className="mt-2 text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-full transition-colors disabled:opacity-50"
                        disabled={disabled}
                    >
                        Hapus Gambar
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 pointer-events-none">
                    <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <p className="font-semibold">Seret & lepas gambar di sini</p>
                    <p className="text-sm">atau klik untuk memilih file</p>
                    <p className="text-xs text-gray-500 mt-2">PNG atau JPG</p>
                </div>
            )}
        </div>
    </div>
  );
};