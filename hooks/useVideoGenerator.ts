
import { useState, useEffect, useCallback } from 'react';
import { generateVideo } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { LOADING_MESSAGES, VEO_MODELS } from '../constants';
import type { ModelCardFormData } from '../components/ModelCard';

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


export const useVideoGenerator = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const [apiKey, setApiKey] = useState<string>('');
  const [isKeySaved, setIsKeySaved] = useState<boolean>(false);

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
  };
};
