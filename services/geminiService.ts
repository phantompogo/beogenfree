
import { GoogleGenAI } from '@google/genai';

interface VideoConfig {
    imageBytes?: string;
    mimeType?: string;
    aspectRatio?: string;
    numberOfVideos?: number;
    // Note: duration and resolution are not directly supported by the VEO API config yet.
    // They are controlled via UI but not passed here.
}

export async function generateVideo(prompt: string, model: string, config: VideoConfig, apiKey: string): Promise<Blob> {
    const ai = new GoogleGenAI({ apiKey });
    
    const { imageBytes, mimeType, aspectRatio, numberOfVideos } = config;
    
    const generateVideosParams: any = {
        model: model,
        prompt: prompt,
        config: {
            numberOfVideos: numberOfVideos || 1, // Default to 1 if not provided
        }
    };
    
    // Add aspect ratio to config if provided. While not officially documented for VEO yet,
    // including it makes the app forward-compatible.
    if (aspectRatio) {
        generateVideosParams.config.aspectRatio = aspectRatio;
    }

    if (imageBytes && mimeType) {
        generateVideosParams.image = {
            imageBytes: imageBytes,
            mimeType: mimeType,
        };
    }
    
    console.log(`Starting video generation with model: ${model} and params:`, generateVideosParams);
    let operation = await ai.models.generateVideos(generateVideosParams);

    console.log("Polling for video result...");
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds before polling again
        operation = await ai.operations.getVideosOperation({ operation: operation });
        console.log("Current operation status:", operation.metadata?.state);
    }

    if (operation.error) {
        throw new Error(`Video generation failed: ${operation.error.message}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was found.");
    }
    
    console.log("Fetching generated video from:", downloadLink);
    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to fetch the generated video. Status: ${response.statusText}. Body: ${errorBody}`);
    }

    const videoBlob = await response.blob();
    return videoBlob;
}
