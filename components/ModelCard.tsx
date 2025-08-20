
import React, { useState } from 'react';
import type { VeoModel } from '../constants';
import { ImageDropzone } from './ImageDropzone';
import { NeonCard } from './NeonCard';

export interface ModelCardFormData {
    prompt: string;
    imageFile: File | null;
    aspectRatio: string;
    duration: number;
    videoCount: number;
    modelId: string;
    muteAudio: boolean;
}

interface ModelCardProps {
    model: VeoModel;
    isApiKeySaved: boolean;
    isLoading: boolean;
    onSubmit: (formData: ModelCardFormData) => void;
}

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

export const ModelCard: React.FC<ModelCardProps> = ({ model, isApiKeySaved, isLoading, onSubmit }) => {
    const [prompt, setPrompt] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [aspectRatio, setAspectRatio] = useState<string>(model.options.aspectRatios[0]);
    const [duration, setDuration] = useState<number>(model.options.durations[0]);
    const [videoCount, setVideoCount] = useState<number>(model.options.videoCounts[0]);
    const [muteAudio, setMuteAudio] = useState<boolean>(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit({
            prompt,
            imageFile,
            aspectRatio,
            duration,
            videoCount,
            modelId: model.id,
            muteAudio,
        });
    };

    return (
        <NeonCard className="model-card">
            <h2 className="model-card__title">{model.name}</h2>
            <form onSubmit={handleSubmit}>
                <fieldset disabled={!isApiKeySaved || isLoading}>
                    <div className="form-group">
                        <label htmlFor={`prompt-${model.id}`}>
                            Prompt
                        </label>
                        <textarea
                            id={`prompt-${model.id}`}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="contoh: Hologram neon seekor kucing..."
                            required
                        />
                    </div>

                    {model.supportsImage && (
                        <div className="form-group">
                            <ImageDropzone
                                imageFile={imageFile}
                                onFileSelect={setImageFile}
                                disabled={!isApiKeySaved || isLoading}
                            />
                        </div>
                    )}

                    <div className="model-card__options">
                        <OptionSelector 
                            label="Rasio Aspek"
                            value={aspectRatio}
                            setter={setAspectRatio}
                            options={model.options.aspectRatios.map(ar => ({value: ar, label: ar}))}
                            modelId={model.id}
                            disabled={!isApiKeySaved || isLoading || model.options.aspectRatios.length <= 1}
                        />
                        <OptionSelector 
                            label="Durasi"
                            value={duration}
                            setter={setDuration}
                            options={model.options.durations.map(d => ({value: d, label: `${d}s`}))}
                            modelId={model.id}
                            disabled={!isApiKeySaved || isLoading || model.options.durations.length <= 1}
                        />
                         <OptionSelector 
                            label="Jumlah"
                            value={videoCount}
                            setter={setVideoCount}
                            options={model.options.videoCounts.map(vc => ({value: vc, label: `${vc}`}))}
                            modelId={model.id}
                            disabled={!isApiKeySaved || isLoading || model.options.videoCounts.length <= 1}
                        />
                        <div className="option-selector">
                           <header>Resolusi</header>
                           <ul>
                                <li className="selected">
                                    <label>720p</label>
                                </li>
                           </ul>
                        </div>
                         {model.supportsMuteAudio && (
                             <div className="option-selector">
                                 <header>Audio</header>
                                 <div className="toggle-switch">
                                     <input
                                         type="checkbox"
                                         id={`mute-audio-${model.id}`}
                                         checked={muteAudio}
                                         onChange={(e) => setMuteAudio(e.target.checked)}
                                         disabled={isLoading}
                                     />
                                     <label htmlFor={`mute-audio-${model.id}`}>Toggle Mute</label>
                                     <span>Mute Audio</span>
                                 </div>
                             </div>
                         )}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={!prompt.trim() || isLoading}
                        className="btn btn--primary btn--full"
                    >
                        {isLoading ? 'Generating...' : 'Buat Video'}
                    </button>
                </fieldset>
            </form>
        </NeonCard>
    );
};
