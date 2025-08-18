
import React, { useState, useRef, useCallback } from 'react';

interface ImageDropzoneProps {
  imageFile: File | null;
  onFileSelect: (file: File | null) => void;
  disabled: boolean;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({ imageFile, onFileSelect, disabled }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const imagePreviewUrl = React.useMemo(() => {
    return imageFile ? URL.createObjectURL(imageFile) : null;
  }, [imageFile]);

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
    e.stopPropagation(); 
    onFileSelect(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleClick = () => {
    if (!disabled && !imageFile) {
        fileInputRef.current?.click();
    }
  };

  const dropzoneClasses = `dropzone ${disabled ? 'disabled' : ''} ${isDraggingOver ? 'dragging' : ''} ${imageFile ? 'has-file' : ''}`;

  return (
    <div>
        <label className="dropzone-label">
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
                <div className="dropzone-preview">
                    <img src={imagePreviewUrl} alt="Pratinjau"/>
                    <p>{imageFile?.name}</p>
                    <button 
                        type="button"
                        onClick={handleRemoveImage}
                        className="btn btn--danger"
                        disabled={disabled}
                    >
                        Hapus
                    </button>
                </div>
            ) : (
                <div className="dropzone-prompt">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <p>Seret & lepas gambar di sini</p>
                    <span>atau klik untuk memilih file (PNG or JPG)</span>
                </div>
            )}
        </div>
    </div>
  );
};
