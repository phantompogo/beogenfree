

import React, { useState, useEffect } from 'react';
import { useVideoGenerator } from './hooks/useVideoGenerator';
import { VEO_MODELS } from './constants';
import { ModelCard } from './components/ModelCard';
import { StatusCard } from './components/StatusCard';
import { NeonCard } from './components/NeonCard';
import { GooeySlider } from './components/GooeySlider';
import { SkateboardLoader } from './components/SkateboardLoader';
import './styles/App.css';

// Icons for status cards
const UploadingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
    </svg>
);

const SuccessIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
);

const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
    </svg>
);

const AnimatedHeader = () => (
  <div className="animated-title-container">
    <svg viewBox="0 0 960 300">
      <symbol id="s-text">
        <text textAnchor="middle" x="50%" y="80%">BEO Gen Free</text>
      </symbol>
      <g className="g-ants">
        <use xlinkHref="#s-text" className="text-copy"></use>
        <use xlinkHref="#s-text" className="text-copy"></use>
        <use xlinkHref="#s-text" className="text-copy"></use>
        <use xlinkHref="#s-text" className="text-copy"></use>
        <use xlinkHref="#s-text" className="text-copy"></use>
      </g>
    </svg>
  </div>
);

// --- Premium Products Modal ---
interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProductButton: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--full">
        {children}
    </a>
);

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <NeonCard className="premium-modal-card">
                    <button
                        onClick={onClose}
                        className="card-close-btn"
                        aria-label="Tutup"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h2>Daftar Produk</h2>
                    <div className="premium-modal__products">
                        <ProductButton href="https://lynk.id/kazokufun/5vq1d6yg54w7">
                            Komisan Prompt Video
                        </ProductButton>
                        <ProductButton href="https://lynk.id/kazokufun/dl098rgl400n">
                            UNIKA All IN One
                        </ProductButton>
                        <ProductButton href="https://lynk.id/kazokufun/xz36w26g92ye">
                            VEO 3 Story
                        </ProductButton>
                        <ProductButton href="https://lynk.id/kazokufun/yqgnp12qepwe">
                            Software PC Veo 3
                        </ProductButton>
                    </div>
                    <p className="premium-modal__voucher">
                        Semua Produk Pakai Voucer <strong>"AKUMAU50"</strong> Diskon 50%
                    </p>
                </NeonCard>
            </div>
        </div>
    );
};

type AppStep = 'settings' | 'model_selection' | 'model_view';

const App: React.FC = () => {
  const {
    isLoading, loadingMessage,
    error, generatedVideoUrl,
    handleSubmit,
    apiKey, setApiKey,
    isKeySaved, handleSaveKey, handleClearKey,
    clearError,
  } = useVideoGenerator();

  const [hue1, setHue1] = useState(255);
  const [hue2, setHue2] = useState(222);
  const [appStep, setAppStep] = useState<AppStep>('settings');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  useEffect(() => {
    const rand1 = 120 + Math.floor(Math.random() * 240);
    const rand2 = rand1 - 80 + (Math.floor(Math.random() * 60) - 30);
    setHue1(rand1);
    setHue2(rand2);
  }, []);

  useEffect(() => {
      document.body.style.setProperty('--hue1', String(hue1));
      document.body.style.setProperty('--hue2', String(hue2));
  }, [hue1, hue2]);

  const handleSettingsSubmit = () => {
      if (!isKeySaved) {
          if (!apiKey.trim()) {
              alert("Harap masukkan Kunci API Anda.");
              return;
          }
          handleSaveKey();
      }
      setAppStep('model_selection');
  };

  const handleModelSelect = (modelId: string) => {
      setSelectedModelId(modelId);
      setAppStep('model_view');
  };

  return (
    <div id="app">
        <header>
            <AnimatedHeader />
            <p>Wi Wok De Tok Not Onli This Is Free</p>
        </header>

        <main>
          {appStep === 'settings' && (
            <NeonCard className="settings-card">
              <div className="settings-card__section">
                <h2>Kunci Api Gemini</h2>
                {isKeySaved ? (
                  <div className="api-card__saved">
                    <p>✓ Kunci API disimpan secara lokal.</p>
                    <button
                      onClick={handleClearKey}
                      type="button"
                      className="btn"
                    >
                      Ubah
                    </button>
                  </div>
                ) : (
                  <div className="api-card__entry">
                    <input
                      id="api-key-input"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Masukkan kunci Anda dan klik OK"
                    />
                  </div>
                )}
                 <div className="premium-prompt-section">
                    <label>Butuh Prompt Generator Premium ?</label>
                    <button
                        onClick={() => setIsPremiumModalOpen(true)}
                        type="button"
                        className="btn"
                    >
                        Klik Disini
                    </button>
                </div>
              </div>
              <div className="settings-card__section">
                <h2>Pick your own colors!</h2>
                <div className="color-sliders">
                    <GooeySlider 
                        value={hue1} 
                        onChange={setHue1}
                        style={{ color: `hsl(${hue1}, 80%, 60%)`, '--slider-stroke-color': `hsl(${hue1}, 90%, 70%)` } as React.CSSProperties}
                    />
                    <GooeySlider
                        value={hue2}
                        onChange={setHue2}
                        style={{ color: `hsl(${hue2}, 80%, 60%)`, '--slider-stroke-color': `hsl(${hue2}, 90%, 70%)` } as React.CSSProperties}
                    />
                </div>
              </div>
              <button onClick={handleSettingsSubmit} disabled={!isKeySaved && !apiKey.trim()} className="btn btn--primary btn--full">
                OK
              </button>
            </NeonCard>
          )}

          {appStep === 'model_selection' && (
             <NeonCard className="model-selection-card">
                <button 
                  onClick={() => setAppStep('settings')} 
                  className="card-close-btn"
                  aria-label="Kembali ke Pengaturan"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2>Pilih Model VEO</h2>
                <div className="model-selection-buttons">
                    {VEO_MODELS.map(model => (
                        <button key={model.id} onClick={() => handleModelSelect(model.id)} className="btn">
                            {model.name}
                        </button>
                    ))}
                </div>
             </NeonCard>
          )}
          
          {appStep === 'model_view' && selectedModelId && (
            <div className='model-view-container'>
                <button 
                  onClick={() => setAppStep('model_selection')} 
                  className="card-close-btn"
                  aria-label="Kembali ke Pemilihan Model"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
                {VEO_MODELS.filter(m => m.id === selectedModelId).map((model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    isApiKeySaved={isKeySaved}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                  />
                ))}

              <div className="status-section">
                {isLoading && (
                  <div className="loading-container">
                    <SkateboardLoader />
                    <div className="loading-message">
                      <h3>Just a minute...</h3>
                      <p>Your video is generating.</p>
                      <p className="animate-pulse">{loadingMessage}</p>
                    </div>
                  </div>
                )}

                {error && (
                    <StatusCard
                        variant="red"
                        icon={<ErrorIcon/>}
                        title="We are so sorry!"
                        message={error}
                    >
                        <button onClick={clearError} className="btn">Cancel</button>
                    </StatusCard>
                )}

                {generatedVideoUrl && !isLoading && (
                    <StatusCard
                        variant="green"
                        icon={<SuccessIcon/>}
                        title="Your video was generated!"
                        message="You can preview your video below or download it."
                    >
                        <a href={generatedVideoUrl} download="generated-video.mp4" className="btn btn--primary">Download</a>
                    </StatusCard>
                )}
              </div>

              {generatedVideoUrl && !isLoading && (
                <div className="video-section">
                  <h2>Video Anda yang Dihasilkan</h2>
                  <div className="video-container">
                    <video src={generatedVideoUrl} controls autoPlay loop />
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
        <PremiumModal 
            isOpen={isPremiumModalOpen} 
            onClose={() => setIsPremiumModalOpen(false)} 
        />
    </div>
  );
};

export default App;
