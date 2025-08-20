import React, { useState, useMemo, useEffect } from 'react';
import { VEO_MODELS } from '../constants';
import { NeonCard } from './NeonCard';

const OptionSelector = ({ label, value, setter, options, modelId, disabled }: { label: string; value: any; setter: (val: any) => void; options: {value: any, label: string}[], modelId: string, disabled: boolean }) => {
    return (
        <div className="option-selector">
            <header>{label}</header>
            <ul>
                {options.map(opt => (
                     <li key={opt.value} className={value === opt.value ? 'selected' : ''}>
                        <input
                            type="radio"
                            id={`${label}-${opt.value}-${modelId}`}
                            name={`${label}-${modelId}`}
                            value={opt.value}
                            checked={value === opt.value}
                            onChange={() => setter(opt.value)}
                            disabled={disabled}
                        />
                        <label htmlFor={`${label}-${opt.value}-${modelId}`}>
                           {opt.label}
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export interface BatchVideoFormData {
    prompts: string;
    imageFiles: File[];
    modelId: string;
    aspectRatio: string;
    duration: number;
    muteAudio: boolean;
}

interface BatchVideoCardProps {
    isApiKeySaved: boolean;
    isLoading: boolean;
    onSubmit: (formData: BatchVideoFormData) => void;
}

export const BatchVideoCard: React.FC<BatchVideoCardProps> = ({ isApiKeySaved, isLoading, onSubmit }) => {
    const [prompts, setPrompts] = useState<string>('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [selectedModelId, setSelectedModelId] = useState<string>(VEO_MODELS[0].id);

    const selectedModel = useMemo(() => VEO_MODELS.find(m => m.id === selectedModelId)!, [selectedModelId]);

    const [aspectRatio, setAspectRatio] = useState<string>(selectedModel.options.aspectRatios[0]);
    const [duration, setDuration] = useState<number>(selectedModel.options.durations[0]);
    const [muteAudio, setMuteAudio] = useState<boolean>(false);

    useEffect(() => {
        setAspectRatio(selectedModel.options.aspectRatios[0]);
        setDuration(selectedModel.options.durations[0]);
    }, [selectedModel]);
    
    const promptLines = useMemo(() => prompts.split('\n').filter(p => p.trim() !== ''), [prompts]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).slice(0, 10);
            setImageFiles(files);
        }
    };
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit({
            prompts,
            imageFiles,
            modelId: selectedModelId,
            aspectRatio,
            duration,
            muteAudio,
        });
    };
    
    return (
        <NeonCard className="model-card batch-card">
            <h2 className="model-card__title">Batch Video VEO</h2>
            <form onSubmit={handleSubmit}>
                <fieldset disabled={!isApiKeySaved || isLoading}>
                    <div className="form-group">
                        <label htmlFor="batch-prompt">
                            Input Prompt (1 per baris, maks 10)
                        </label>
                        <textarea
                            id="batch-prompt"
                            value={prompts}
                            onChange={(e) => setPrompts(e.target.value)}
                            placeholder="Mobil merah melaju kencang...\nPerahu biru di lautan...\nPrompt lain..."
                            required
                            rows={5}
                        />
                        <small>{promptLines.length}/10 prompts</small>
                    </div>

                    <div className="form-group">
                         <label htmlFor="batch-images">Frame Awal (Opsional, maks 10)</label>
                         <input
                            id="batch-images"
                            type="file"
                            multiple
                            accept="image/png, image/jpeg"
                            onChange={handleFileChange}
                            disabled={!isApiKeySaved || isLoading}
                            className="file-input"
                         />
                         {imageFiles.length > 0 && (
                            <div className="file-list">
                                <h4>File Terpilih ({imageFiles.length}/10):</h4>
                                <ul>
                                    {imageFiles.map((file, index) => (
                                        <li key={index}>{file.name}</li>
                                    ))}
                                </ul>
                            </div>
                         )}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="batch-model">Pilihan Model</label>
                        <select
                            id="batch-model"
                            value={selectedModelId}
                            onChange={(e) => setSelectedModelId(e.target.value)}
                            disabled={isLoading}
                        >
                            {VEO_MODELS.map(model => (
                                <option key={model.id} value={model.id}>{model.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="model-card__options">
                        <OptionSelector 
                            label="Rasio Aspek"
                            value={aspectRatio}
                            setter={setAspectRatio}
                            options={selectedModel.options.aspectRatios.map(ar => ({value: ar, label: ar}))}
                            modelId={selectedModel.id}
                            disabled={!isApiKeySaved || isLoading || selectedModel.options.aspectRatios.length <= 1}
                        />
                        <OptionSelector 
                            label="Durasi"
                            value={duration}
                            setter={setDuration}
                            options={selectedModel.options.durations.map(d => ({value: d, label: `${d}s`}))}
                            modelId={selectedModel.id}
                            disabled={!isApiKeySaved || isLoading || selectedModel.options.durations.length <= 1}
                        />
                        {selectedModel.supportsMuteAudio && (
                             <div className="option-selector">
                                 <header>Audio</header>
                                 <div className="toggle-switch">
                                     <input
                                         type="checkbox"
                                         id={`mute-audio-batch`}
                                         checked={muteAudio}
                                         onChange={(e) => setMuteAudio(e.target.checked)}
                                         disabled={isLoading}
                                     />
                                     <label htmlFor={`mute-audio-batch`}>Toggle Mute</label>
                                     <span>Mute Audio</span>
                                 </div>
                             </div>
                         )}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={promptLines.length === 0 || isLoading}
                        className="btn btn--primary btn--full"
                    >
                        {isLoading ? 'Memproses Batch...' : `Buat ${promptLines.length} Video`}
                    </button>
                </fieldset>
            </form>
        </NeonCard>
    );
};
