export const LOADING_MESSAGES: string[] = [
  "Memanaskan kursi sutradara digital...",
  "Merakit piksel menjadi sebuah mahakarya...",
  "Mengajari algoritma seni sinema...",
  "Menghasilkan simfoni visual untuk Anda...",
  "Mewujudkan imajinasi Anda menjadi kenyataan...",
  "Ini adalah proses yang rumit, terima kasih atas kesabaran Anda...",
  "Menyelesaikan adegan, hampir selesai...",
];

export interface VeoModel {
  id: string;
  name: string;
  supportsImage: boolean;
  supportsMuteAudio: boolean;
  options: {
    aspectRatios: string[];
    durations: number[];
    videoCounts: number[];
  };
}

export const VEO_MODELS: VeoModel[] = [
    { 
      id: 'veo-2.0-generate-001', 
      name: 'VEO 2',
      supportsImage: true,
      supportsMuteAudio: false,
      options: {
        aspectRatios: ['16:9', '9:16'],
        durations: [5, 8],
        videoCounts: [1, 2],
      }
    },
    { 
      id: 'veo-3.0-generate-preview', 
      name: 'VEO 3 (Preview)',
      supportsImage: true,
      supportsMuteAudio: true,
      options: {
        aspectRatios: ['16:9'],
        durations: [8],
        videoCounts: [1],
      }
    },
    { 
      id: 'veo-3.0-fast-generate-preview', 
      name: 'VEO 3 (Fast Preview)',
      supportsImage: true,
      supportsMuteAudio: true,
      options: {
        aspectRatios: ['16:9'],
        durations: [8],
        videoCounts: [1],
      }
    },
];
