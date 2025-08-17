
import React from 'react';
import { useVideoGenerator } from './hooks/useVideoGenerator';
import { Spinner } from './components/Spinner';
import { ErrorMessage } from './components/ErrorMessage';
import { VEO_MODELS } from './constants';
import { ImageDropzone } from './components/ImageDropzone';

const App: React.FC = () => {
  const {
    prompt, setPrompt,
    imageFile, setImageFile,
    isLoading, loadingMessage,
    error, generatedVideoUrl,
    handleSubmit,
    selectedModel, setSelectedModel,
    aspectRatio, setAspectRatio,
    duration, setDuration,
    videoCount, setVideoCount,
    apiKey, setApiKey,
    isKeySaved, handleSaveKey, handleClearKey,
  } = useVideoGenerator();

  const currentModelDetails = VEO_MODELS.find(m => m.id === selectedModel);

  const OptionSelector = ({ label, value, setter, options }: { label: string; value: any; setter: (val: any) => void; options: {value: any, label: string}[] }) => {
    if (options.length <= 1) {
      return (
        <div>
          <p className="block text-lg font-semibold mb-2 text-gray-300">{label}</p>
          <div className="text-center p-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-400">
            {options[0]?.label || 'T/A'}
          </div>
        </div>
      );
    }

    return (
      <div>
        <label className="block text-lg font-semibold mb-3 text-gray-300">{label}</label>
        <div className={`grid grid-cols-${options.length} gap-2`}>
          {options.map(opt => (
            <div key={opt.value}>
              <input
                type="radio"
                id={`${label}-${opt.value}`}
                name={label}
                value={opt.value}
                checked={value === opt.value}
                onChange={(e) => setter(opt.value)}
                disabled={isLoading}
                className="hidden peer"
              />
              <label
                htmlFor={`${label}-${opt.value}`}
                className="block text-center p-3 rounded-lg border border-gray-600 bg-gray-900 cursor-pointer transition-all duration-200 peer-checked:border-purple-500 peer-checked:ring-2 peer-checked:ring-purple-500 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
              >
                {opt.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 selection:bg-purple-500 selection:text-white">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
            BEO GEN Free
          </h1>
          <p className="text-gray-400 mt-2">Web App Ini Masih Versi Pengembangan Dan Bebas Digunakan Secara Gratis</p>
        </header>

        <main className="bg-gray-800/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700">
           <div className="mb-6 pb-6 border-b border-gray-700">
              <label htmlFor="api-key-input" className="block text-lg font-semibold mb-2 text-gray-300">
                  Kunci API Gemini
              </label>
              {isKeySaved ? (
                  <div className="flex items-center justify-between">
                      <p className="text-green-400 font-medium">✓ Kunci API disimpan secara lokal.</p>
                      <button
                          onClick={handleClearKey}
                          type="button"
                          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                          Ubah
                      </button>
                  </div>
              ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                      <input
                          id="api-key-input"
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Masukkan kunci Anda dan klik Simpan"
                          className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      />
                      <button
                          type="button"
                          onClick={handleSaveKey}
                          disabled={!apiKey.trim()}
                          className="w-full sm:w-auto flex-shrink-0 font-bold bg-purple-600 hover:bg-purple-700 text-white py-3 px-5 rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Simpan
                      </button>
                  </div>
              )}
          </div>
          <fieldset disabled={!isKeySaved}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="prompt" className="block text-lg font-semibold mb-2 text-gray-300">
                  Prompt Anda
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="contoh: Hologram neon seekor kucing mengendarai mobil futuristik dengan kecepatan tinggi melewati kota cyberpunk"
                  className="w-full h-32 p-4 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none placeholder-gray-500"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                  <label className="block text-lg font-semibold mb-3 text-gray-300">Pilih Model VEO</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {VEO_MODELS.map((model) => (
                          <div key={model.id}>
                              <input 
                                  type="radio" 
                                  id={model.id} 
                                  name="veo-model" 
                                  value={model.id}
                                  checked={selectedModel === model.id}
                                  onChange={(e) => setSelectedModel(e.target.value)}
                                  disabled={isLoading}
                                  className="hidden peer"
                              />
                              <label 
                                  htmlFor={model.id} 
                                  className="block text-center p-3 rounded-lg border border-gray-600 bg-gray-900 cursor-pointer transition-all duration-200 peer-checked:border-purple-500 peer-checked:ring-2 peer-checked:ring-purple-500 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
                              >
                                  {model.name}
                              </label>
                          </div>
                      ))}
                  </div>
              </div>
              
              {/* --- Advanced Options --- */}
              {currentModelDetails && (
                <div className="space-y-6 pt-4 border-t border-gray-700">
                   {currentModelDetails.supportsImage && (
                       <ImageDropzone
                          imageFile={imageFile}
                          onFileSelect={setImageFile}
                          disabled={isLoading}
                       />
                   )}
                  
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <OptionSelector 
                          label="Rasio Aspek"
                          value={aspectRatio}
                          setter={setAspectRatio}
                          options={currentModelDetails.options.aspectRatios.map(ar => ({value: ar, label: ar}))}
                      />
                       <OptionSelector 
                          label="Durasi"
                          value={duration}
                          setter={setDuration}
                          options={currentModelDetails.options.durations.map(d => ({value: d, label: `${d} detik`}))}
                      />
                      <div>
                        <p className="block text-lg font-semibold mb-2 text-gray-300">Resolusi</p>
                        <div className="text-center p-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-400">720p</div>
                      </div>
                      <OptionSelector 
                          label="Jumlah Video"
                          value={videoCount}
                          setter={setVideoCount}
                          options={currentModelDetails.options.videoCounts.map(vc => ({value: vc, label: `${vc}`}))}
                      />
                   </div>
                </div>
              )}


              <button
                type="submit"
                disabled={isLoading || !prompt}
                className="w-full flex items-center justify-center text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    Membuat...
                  </>
                ) : (
                  'Buat Video'
                )}
              </button>
            </form>
          </fieldset>

          {isLoading && (
            <div className="mt-8 text-center p-4 bg-gray-900/50 rounded-lg">
              <p className="text-lg font-semibold text-purple-400">Harap bersabar, pembuatan video bisa memakan waktu beberapa menit.</p>
              <p className="text-gray-300 mt-2 animate-pulse">{loadingMessage}</p>
            </div>
          )}

          {error && <ErrorMessage message={error} />}

          {generatedVideoUrl && !isLoading && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-center mb-4">Video Anda yang Dihasilkan</h2>
              <div className="bg-gray-900 p-2 rounded-lg shadow-inner border border-gray-700">
                <video src={generatedVideoUrl} controls autoPlay loop className="w-full rounded-md" />
              </div>
              <a
                href={generatedVideoUrl}
                download="generated-video.mp4"
                className="mt-4 w-full block text-center text-lg font-bold bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out"
              >
                Unduh Video
              </a>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
