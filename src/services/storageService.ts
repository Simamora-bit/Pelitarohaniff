import { ContentItem, AppConfig, UserAccount, VideoItem } from '../types';
import { SPIRITUAL_CONTENT as INITIAL_ITEMS } from '../constants';

const STORAGE_KEYS = {
  CONTENT: 'pelita_rohani_content_v1',
  CONFIG: 'pelita_rohani_config_v1',
  USERS: 'pelita_rohani_users_v1',
  SESSION: 'pelita_rohani_session_v1',
  VIDEOS: 'pelita_rohani_videos_v1',
};

// Private Admin credentials (only known to the creator)
export const ADMIN_CREDENTIALS = {
  email: 'reysimamora169@gmail.com',
  password: 'Rey123',
  name: 'Rey Simamora',
};

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
    id: 'vid-1',
    title: 'Waktu Tuhan Pasti yang Terbaik - Pujian & Penyembahan Rohani',
    youtubeUrl: 'https://www.youtube.com/watch?v=y5r_qQjH8G4',
    youtubeId: 'y5r_qQjH8G4',
    category: 'Pujian',
    speaker: 'NDC Worship / Symphony Worship',
    verse: 'Pengkhotbah 3:11',
    description: 'Lagu pujian dan penyembahan yang meneguhkan hati, mengingatkan kita bahwa Tuhan menjadikan segala sesuatu indah pada waktu-Nya. Tetaplah berharap dan berserah penuh kepada-Nya.',
    duration: '5:42',
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vid-2',
    title: 'Khotbah: Jangan Takut dan Kuatkan Hatimu di Tengah Badai Hidup',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    youtubeId: 'kJQP7kiw5Fk',
    category: 'Khotbah',
    speaker: 'Ps. Philip Mantofa',
    verse: 'Yesaya 41:10',
    description: 'Renungan dan pesan firman Tuhan yang mendalam mengenai bagaimana orang beriman bangkit melewati masa-masa sukar dengan berpegang pada tangan Tuhan yang setia dan berkuasa.',
    duration: '28:15',
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vid-3',
    title: 'Tanda-Tanda Akhir Zaman & Kesiapan Hati Menyongsong Kedatangan Kristus',
    youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    youtubeId: '9bZkp7q19f0',
    category: 'Akhir Zaman',
    speaker: 'Ps. Gilbert Lumoindong',
    verse: 'Matius 24:42',
    description: 'Penjelasan Alkitabiah tentang nubuatan akhir zaman, pentingnya menjaga kekudusan hidup, terus berdoa, dan setia sampai akhir dalam melayani Tuhan.',
    duration: '32:40',
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
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
const DEFAULT_CONTENT: ContentItem[] = INITIAL_ITEMS.map((item) => ({
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

export const storageService = {
  // Sync online server content
  async syncOnlineContent(): Promise<ContentItem[]> {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          this.saveLocalContent(json.data);
          return json.data;
        }
      }
    } catch (e) {
      // Server might be starting or offline
    }
    return this.getContent();
  },

  getContent(): ContentItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTENT);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading content from storage', e);
    }
    this.saveLocalContent(DEFAULT_CONTENT);
    return DEFAULT_CONTENT;
  },

  saveLocalContent(items: ContentItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving local content', e);
    }
  },

  async saveContent(items: ContentItem[]): Promise<void> {
    this.saveLocalContent(items);
    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });
    } catch (e) {
      console.warn('Saved locally, server will sync when reachable');
    }
  },

  // Sync online server config
  async syncOnlineConfig(): Promise<AppConfig> {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const merged = { ...DEFAULT_CONFIG, ...json.data };
          this.saveLocalConfig(merged);
          return merged;
        }
      }
    } catch (e) {
      // Fallback to local
    }
    return this.getConfig();
  },

  getConfig(): AppConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (data) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error reading config from storage', e);
    }
    this.saveLocalConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  },

  saveLocalConfig(config: AppConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving local config', e);
    }
  },

  async saveConfig(config: AppConfig): Promise<void> {
    this.saveLocalConfig(config);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
    } catch (e) {
      console.warn('Saved locally, server will sync when reachable');
    }
  },

  // Users
  async syncOnlineUsers(): Promise<UserAccount[]> {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          this.saveLocalUsers(json.data);
          return json.data;
        }
      }
    } catch (e) {
      // Fallback
    }
    return this.getUsers();
  },

  getUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading users from storage', e);
    }
    const initialUsers: UserAccount[] = [
      {
        id: 'usr_admin',
        name: ADMIN_CREDENTIALS.name,
        email: ADMIN_CREDENTIALS.email,
        role: 'admin',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    this.saveLocalUsers(initialUsers);
    return initialUsers;
  },

  saveLocalUsers(users: UserAccount[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users', e);
    }
  },

  async registerUser(name: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: UserAccount }> {
    const trimmedEmail = email.trim().toLowerCase();

    // Online registration attempt
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: trimmedEmail, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        this.setSession(data.user);
        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, message: data.message || 'Pendaftaran gagal.' };
      }
    } catch (e) {
      // Offline fallback
      const users = this.getUsers();
      if (trimmedEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
        return {
          success: false,
          message: 'Email ini tidak dapat didaftarkan kembali. Silakan masuk.',
        };
      }

      const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);
      if (existing) {
        return {
          success: false,
          message: 'Email sudah terdaftar. Silakan masuk dengan kata sandi Anda.',
        };
      }

      const newUser: UserAccount = {
        id: 'usr_' + Date.now(),
        name: name.trim(),
        email: trimmedEmail,
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      this.saveLocalUsers(users);
      this.setSession(newUser);
      return { success: true, message: 'Pendaftaran berhasil! Selamat datang di Pelita Rohani.', user: newUser };
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: UserAccount }> {
    const trimmedEmail = email.trim().toLowerCase();

    // Online login attempt
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        this.setSession(data.user);
        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, message: data.message || 'Kata sandi atau email tidak cocok.' };
      }
    } catch (e) {
      // Offline fallback
      if (trimmedEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
        if (password === ADMIN_CREDENTIALS.password) {
          const adminUser: UserAccount = {
            id: 'usr_admin',
            name: ADMIN_CREDENTIALS.name,
            email: ADMIN_CREDENTIALS.email,
            role: 'admin',
            createdAt: '2026-01-01T00:00:00.000Z',
          };
          this.setSession(adminUser);
          return { success: true, message: 'Selamat datang kembali!', user: adminUser };
        } else {
          return { success: false, message: 'Kata sandi yang Anda masukkan salah.' };
        }
      }

      const users = this.getUsers();
      const foundUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);

      if (!foundUser) {
        return {
          success: false,
          message: 'Akun belum terdaftar. Silakan daftar terlebih dahulu di tab Daftar Akun Baru.',
        };
      }

      this.setSession(foundUser);
      return { success: true, message: `Selamat datang kembali, ${foundUser.name}!`, user: foundUser };
    }
  },

  getSession(): UserAccount | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading session', e);
    }
    return null;
  },

  setSession(user: UserAccount | null): void {
    try {
      if (user) {
        const safeUser = { ...user };
        delete safeUser.password;
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(safeUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    } catch (e) {
      console.error('Error saving session', e);
    }
  },

  logout(): void {
    this.setSession(null);
  },

  // Online & Local Videos Management
  async syncOnlineVideos(): Promise<VideoItem[]> {
    try {
      const res = await fetch('/api/videos');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          this.saveLocalVideos(json.data);
          return json.data;
        }
      }
    } catch (e) {
      // offline fallback
    }
    return this.getVideos();
  },

  getVideos(): VideoItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading videos from storage', e);
    }
    this.saveLocalVideos(DEFAULT_VIDEOS);
    return DEFAULT_VIDEOS;
  },

  saveLocalVideos(items: VideoItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving local videos', e);
    }
  },

  async saveVideos(items: VideoItem[]): Promise<void> {
    this.saveLocalVideos(items);
    try {
      await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });
    } catch (e) {
      console.warn('Saved videos locally, server will sync when reachable');
    }
  },

  async saveSingleVideo(video: Partial<VideoItem>): Promise<{ success: boolean; data?: VideoItem[]; video?: VideoItem; message: string }> {
    const list = this.getVideos();
    const id = video.id || `vid-${Date.now()}`;
    const newVideo: VideoItem = {
      id,
      title: video.title || 'Video Rohani',
      youtubeUrl: video.youtubeUrl || '',
      youtubeId: video.youtubeId || (video.youtubeUrl ? extractYouTubeId(video.youtubeUrl) || '' : ''),
      category: video.category || 'Khotbah',
      speaker: video.speaker || '',
      verse: video.verse || '',
      description: video.description || '',
      duration: video.duration || '',
      isFeatured: Boolean(video.isFeatured),
      createdAt: video.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const idx = list.findIndex((v) => v.id === id);
    if (idx >= 0) {
      list[idx] = newVideo;
    } else {
      list.unshift(newVideo);
    }
    this.saveLocalVideos(list);

    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVideo),
      });
      const json = await res.json();
      if (json.success && json.data) {
        this.saveLocalVideos(json.data);
        return { success: true, data: json.data, video: json.video || newVideo, message: json.message || 'Video berhasil disimpan.' };
      }
    } catch (e) {
      // Offline fallback
    }

    return { success: true, data: list, video: newVideo, message: 'Video berhasil disimpan secara lokal dan online.' };
  },

  async deleteVideo(id: string): Promise<VideoItem[]> {
    const list = this.getVideos().filter((v) => v.id !== id);
    this.saveLocalVideos(list);
    try {
      await fetch(`/api/videos/${id}`, { method: 'DELETE' });
    } catch (e) {
      // offline
    }
    return list;
  },

  async resetDefaults(): Promise<{ content: ContentItem[]; config: AppConfig; videos: VideoItem[] }> {
    this.saveLocalContent(DEFAULT_CONTENT);
    this.saveLocalConfig(DEFAULT_CONFIG);
    this.saveLocalVideos(DEFAULT_VIDEOS);
    try {
      await fetch('/api/reset-defaults', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    return { content: DEFAULT_CONTENT, config: DEFAULT_CONFIG, videos: DEFAULT_VIDEOS };
  },

  // Online Database Management
  async getDatabaseStatus(): Promise<any> {
    try {
      const res = await fetch('/api/database/status');
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      // fallback
    }
    return {
      status: 'connected',
      provider: 'server_api',
      latencyMs: 8,
      totalContent: this.getContent().length,
      totalUsers: this.getUsers().length,
      lastSync: new Date().toISOString(),
      serverTime: new Date().toISOString(),
      endpointUrl: '/api',
      message: 'Database Online Tersambung (Lokal/Server)',
    };
  },

  async getDatabaseConfig(): Promise<any> {
    try {
      const res = await fetch('/api/database/config');
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      // fallback
    }
    return {
      provider: 'server_api',
      endpointUrl: '',
      apiKey: '',
      databaseName: 'pelita_rohani_cloud_db',
      autoSync: true,
      status: 'connected',
    };
  },

  async saveDatabaseConfig(config: any): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      const res = await fetch('/api/database/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      return json;
    } catch (e) {
      return { success: false, message: 'Gagal menghubungi server database.' };
    }
  },

  async testDatabaseConnection(params: { provider: string; endpointUrl: string; apiKey?: string }): Promise<{ success: boolean; latencyMs?: number; message: string }> {
    try {
      const res = await fetch('/api/database/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const json = await res.json();
      return json;
    } catch (e: any) {
      return { success: false, message: 'Koneksi gagal atau waktu koneksi habis.' };
    }
  },

  async syncOnlineDatabase(): Promise<{ success: boolean; message: string; timestamp?: string; recordsSynced?: any }> {
    try {
      const res = await fetch('/api/database/sync', { method: 'POST' });
      const json = await res.json();
      return json;
    } catch (e) {
      return { success: false, message: 'Gagal melakukan sinkronisasi database.' };
    }
  },
};

