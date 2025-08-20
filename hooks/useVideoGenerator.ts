

import { useState, useEffect, useCallback } from 'react';
import { generateVideo } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { LOADING_MESSAGES, VEO_MODELS } from '../constants';
import type { ModelCardFormData } from '../components/ModelCard';
import type { BatchVideoFormData } from '../components/BatchVideoCard';

const getFriendlyErrorMessage = (message: string): string => {
    if (message.includes('400 Bad Request') || message.includes('INVALID_ARGUMENT')) {
        return "Prompt Tidak Valid atau Opsi Pilihan Salah. Periksa kembali input Anda.";
    }
    if (message.includes('401 Unauthorized') || message.includes('403 Forbidden') || message.includes('PERMISSION_DENIED')) {
        return "API Key Tidak Valid atau Tidak Punya Izin. Jika menggunakan VEO 3, pastikan Anda memiliki akses.";
    }
    if (message.includes('404 Not Found')) {
        return "Model tidak ditemukan. Kemungkinan Anda belum memiliki akses ke model preview ini.";
    }
    if (message.includes('429 Too Many Requests')) {
        return "Sabar Bang, Kasih Waktu Istirahat Dulu. Anda terlalu sering membuat permintaan.";
    }
    if (message.includes('content policy violation')) {
        return "Prompt Melanggar Kebijakan Bang. Coba gunakan prompt yang berbeda.";
    }
    if (message.includes('internal error occurred during video processing')) {
        return "Terjadi Error Dari Pihak Google Yah, Bukan Aplikasi.";
    }
    if (message.includes('500 Internal Server Error')) {
        return "Google Lagi Error Bang. Coba lagi nanti.";
    }
    if (message.includes('503 Service Unavailable')) {
        return "Layanan Google Lagi Tidur Bang. Coba lagi nanti.";
    }
    if (message.includes('no download link was found')) {
        return "Video berhasil dibuat, tetapi tautan unduhan tidak ditemukan. Coba lagi.";
    }
    // Fallback for other generic errors
    return `Terjadi kesalahan: ${message}`;
};

// Helper to trigger download
const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Helper to sanitize filenames
const sanitizeFilename = (name: string): string => {
    return name.substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase();
}


export const useVideoGenerator = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const [apiKey, setApiKey] = useState<string>('');
  const [isKeySaved, setIsKeySaved] = useState<boolean>(false);
  
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [batchStatus, setBatchStatus] = useState<string>('');

  // Effect to load API key from localStorage on initial render
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini-api-key');
    if (savedKey) {
        setApiKey(savedKey);
        setIsKeySaved(true);
    }
  }, []);


  // Effect to handle loading messages animation
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (isLoading) {
      intervalId = setInterval(() => {
        setLoadingMessage(prevMessage => {
          const currentIndex = LOADING_MESSAGES.indexOf(prevMessage);
          const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
          return LOADING_MESSAGES[nextIndex];
        });
      }, 4000);
    }
    return () => clearInterval(intervalId);
  }, [isLoading]);

  const handleSaveKey = () => {
      if (apiKey.trim()) {
          localStorage.setItem('gemini-api-key', apiKey.trim());
          setIsKeySaved(true);
      }
  };

  const handleClearKey = () => {
      localStorage.removeItem('gemini-api-key');
      setIsKeySaved(false);
  };
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  const handleBatchSubmit = useCallback(async (formData: BatchVideoFormData) => {
      const savedApiKey = localStorage.getItem('gemini-api-key');
      if (!savedApiKey) {
          setError("Harap simpan Kunci API Anda sebelum membuat video.");
          return;
      }

      const prompts = formData.prompts.split('\n').filter(p => p.trim() !== '').slice(0, 10);
      if (prompts.length === 0 || isBatchProcessing) return;

      setIsBatchProcessing(true);
      setError(null);
      setGeneratedVideoUrl(null); 
      
      const totalVideos = prompts.length;

      for (let i = 0; i < totalVideos; i++) {
          const currentPrompt = prompts[i];
          const imageFile = formData.imageFiles?.[i]; 
          
          setBatchStatus(`[${i + 1}/${totalVideos}] Memproses prompt: "${currentPrompt.substring(0, 30)}..."`);
          
          try {
              let imageBase64: string | undefined = undefined;
              let mimeType: string | undefined = undefined;
              
              if (imageFile) {
                  setBatchStatus(`[${i + 1}/${totalVideos}] Mengonversi gambar: ${imageFile.name}...`);
                  imageBase64 = await fileToBase64(imageFile);
                  mimeType = imageFile.type;
              }

              setBatchStatus(`[${i + 1}/${totalVideos}] Menghasilkan video... Ini mungkin memakan waktu beberapa menit.`);
              const videoBlob = await generateVideo(currentPrompt, formData.modelId, {
                  imageBytes: imageBase64,
                  mimeType,
                  aspectRatio: formData.aspectRatio,
                  numberOfVideos: 1, 
              }, savedApiKey);
              
              setBatchStatus(`[${i + 1}/${totalVideos}] Video dibuat! Mengunduh...`);
              const filename = `${i + 1}_${sanitizeFilename(currentPrompt)}.mp4`;
              triggerDownload(videoBlob, filename);

          } catch (err) {
              console.error(`Error on video ${i+1}:`, err);
              const errorMessage = err instanceof Error ? getFriendlyErrorMessage(err.message) : 'Unknown error';
              setBatchStatus(`[${i + 1}/${totalVideos}] Error: ${errorMessage}. Melewati.`);
              setError(`Error pada video ${i + 1} ("${currentPrompt.substring(0, 20)}..."): ${errorMessage}`);
          }

          if (i < totalVideos - 1) {
              setBatchStatus(`[${i + 1}/${totalVideos}] Unduhan selesai. Menunggu 10 detik sebelum video berikutnya...`);
              await new Promise(resolve => setTimeout(resolve, 10000));
          }
      }

      setBatchStatus('Pemrosesan batch selesai!');
      setTimeout(() => {
          setIsBatchProcessing(false);
          setBatchStatus('');
      }, 5000);

  }, [isBatchProcessing]);

  const handleSubmit = useCallback(async (formData: ModelCardFormData) => {
    const savedApiKey = localStorage.getItem('gemini-api-key');
    if (!savedApiKey) {
        setError("Harap simpan Kunci API Anda sebelum membuat video.");
        return;
    }

    if (!formData.prompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setLoadingMessage(LOADING_MESSAGES[0]);

    try {
      const modelDetails = VEO_MODELS.find(m => m.id === formData.modelId);
      let imageBase64: string | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (formData.imageFile && modelDetails?.supportsImage) {
        imageBase64 = await fileToBase64(formData.imageFile);
        mimeType = formData.imageFile.type;
      }

      const videoBlob = await generateVideo(formData.prompt, formData.modelId, {
          imageBytes: imageBase64,
          mimeType,
          aspectRatio: formData.aspectRatio,
          numberOfVideos: formData.videoCount,
      }, savedApiKey);
      const videoUrl = URL.createObjectURL(videoBlob);
      setGeneratedVideoUrl(videoUrl);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(getFriendlyErrorMessage(err.message));
      } else {
        setError('Terjadi kesalahan yang tidak diketahui saat pembuatan video.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return {
    isLoading, loadingMessage,
    error, generatedVideoUrl,
    handleSubmit,
    apiKey, setApiKey,
    isKeySaved,
    handleSaveKey,
    handleClearKey,
    clearError,
    isBatchProcessing, batchStatus, handleBatchSubmit,
  };
};
