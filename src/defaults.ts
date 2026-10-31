import { ContentItem, AppConfig, VideoItem } from './types';
import { SPIRITUAL_CONTENT as INITIAL_ITEMS } from './constants';

export const DEFAULT_CONFIG: AppConfig = {
  headerTitle: 'Pelita Rohani',
  headerTagline: 'Kasih sejati tidak mencari keuntungan diri',
  bannerImage: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&q=80&w=2000',
  bannerLabel: 'Renungan Hari Ini',
  bannerTitle: 'Tuhan Selalu Menyertai Hidupmu',
  bannerSubtitle: '"Kasih sejati tidak mencari keuntungan diri"',
  whatsappNumber: '6285191447806',
  footerText: 'Membawa Terang dalam Kegelapan',
  copyrightText: '©2026 - Rey Simamora | Pelita Rohani',
};

export const DEFAULT_VIDEOS: VideoItem[] = [
  {
    "id": "vid-1793438158622",
    "title": "Khotbah Hidup Damai",
    "youtubeUrl": "https://youtu.be/kJQP7kiw5Fk",
    "youtubeId": "kJQP7kiw5Fk",
    "category": "Khotbah",
    "speaker": "Ps. Philip Mantofa",
    "verse": "Filipi 4:6-7",
    "description": "Khotbah tentang damai sejahtera Allah yang melampaui segala akal dan memelihara hati dan pikiran.",
    "duration": "",
    "isFeatured": false,
    "createdAt": "2026-10-31T09:15:58.622Z",
    "updatedAt": "2026-10-31T09:15:58.622Z"
  },
  {
    "id": "vid-1",
    "title": "Waktu Tuhan Pasti yang Terbaik - Pujian & Penyembahan Rohani",
    "youtubeUrl": "https://www.youtube.com/watch?v=y5r_qQjH8G4",
    "youtubeId": "y5r_qQjH8G4",
    "category": "Pujian",
    "speaker": "NDC Worship / Symphony Worship",
    "verse": "Pengkhotbah 3:11",
    "description": "Lagu pujian dan penyembahan yang meneguhkan hati, mengingatkan kita bahwa Tuhan menjadikan segala sesuatu indah pada waktu-Nya. Tetaplah berharap dan berserah penuh kepada-Nya.",
    "duration": "5:42",
    "isFeatured": true,
    "createdAt": "2026-10-31T09:15:49.200Z"
  },
  {
    "id": "vid-2",
    "title": "Khotbah: Jangan Takut dan Kuatkan Hatimu di Tengah Badai Hidup",
    "youtubeUrl": "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    "youtubeId": "kJQP7kiw5Fk",
    "category": "Khotbah",
    "speaker": "Ps. Philip Mantofa",
    "verse": "Yesaya 41:10",
    "description": "Renungan dan pesan firman Tuhan yang mendalam mengenai bagaimana orang beriman bangkit melewati masa-masa sukar dengan berpegang pada tangan Tuhan yang setia dan berkuasa.",
    "duration": "28:15",
    "isFeatured": true,
    "createdAt": "2026-10-31T09:15:49.200Z"
  },
  {
    "id": "vid-3",
    "title": "Tanda-Tanda Akhir Zaman & Kesiapan Hati Menyongsong Kedatangan Kristus",
    "youtubeUrl": "https://www.youtube.com/watch?v=9bZkp7q19f0",
    "youtubeId": "9bZkp7q19f0",
    "category": "Akhir Zaman",
    "speaker": "Ps. Gilbert Lumoindong",
    "verse": "Matius 24:42",
    "description": "Penjelasan Alkitabiah tentang nubuatan akhir zaman, pentingnya menjaga kekudusan hidup, terus berdoa, dan setia sampai akhir dalam melayani Tuhan.",
    "duration": "32:40",
    "isFeatured": false,
    "createdAt": "2026-10-31T09:15:49.200Z"
  }
];

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

export function getYoutubeThumbnail(youtubeId: string): string {
  if (!youtubeId) return 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&q=80&w=600';
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

export function getYoutubeEmbedUrl(youtubeId: string, autoplay = false): string {
  if (!youtubeId) return '';
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`;
}

// Seed content with enriched explanations and metadata
export const DEFAULT_CONTENT: ContentItem[] = INITIAL_ITEMS.map((item) => ({
  ...item,
  author: 'Rey Simamora',
  readTime: '5 Menit',
  explanation: item.category === 'Renungan'
    ? 'Renungan ini mengajak kita untuk mengarahkan pandangan kepada janji Allah daripada beban hidup. Luangkan waktu sejenak setiap hari untuk merenungkan kebaikan-Nya.'
    : item.category === 'Doa'
    ? 'Doakan doa ini dengan ketulusan hati. Berbicaralah kepada Tuhan selayaknya seorang anak kepada Bapa yang sangat mengasihinya.'
    : item.category === 'Ayat'
    ? 'Hafalkan dan renungkan firman ini di dalam hati agar menjadi kekuatan dan panduan dalam setiap langkah hidup Anda.'
    : 'Peringatan tentang akhir zaman bertujuan untuk meneguhkan iman dan menjaga kita tetap waspada dalam doa dan perbuatan kasih.',
  updatedAt: new Date().toISOString(),
}));

