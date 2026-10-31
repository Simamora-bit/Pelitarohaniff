import { signup, login as identityLogin, logout as identityLogout, getUser, handleAuthCallback } from '@netlify/identity';
import type { ContentItem, AppConfig, UserAccount, VideoItem } from '../types';
import { DEFAULT_CONTENT, DEFAULT_CONFIG, DEFAULT_VIDEOS } from '../defaults';
export { extractYouTubeId, getYoutubeThumbnail, getYoutubeEmbedUrl } from '../defaults';

async function request(path: string, value?: unknown, method = 'POST'): Promise<any> {
  await getUser();
  let response: Response;
  try {
    response = await fetch(`/api/${path}`, value === undefined ? { cache: 'no-store' } : {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value),
    });
  } catch { throw new Error('Koneksi internet terputus. Perubahan belum tersimpan online. Silakan coba lagi.'); }
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) throw new Error(result?.message || 'Server tidak dapat dihubungi. Perubahan belum tersimpan online.');
  return result;
}
function cache<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(`pelita_online_${key}`) || 'null') ?? fallback; } catch { return fallback; }
}
function remember(key: string, value: unknown) {
  try { localStorage.setItem(`pelita_online_${key}`, JSON.stringify(value)); } catch { /* Optional read cache only. */ }
}
async function read<T>(key: string): Promise<T> {
  const { data } = await request(key); remember(key, data); return data;
}
async function write(key: string, value: unknown) {
  const result = await request(key, value); remember(key, result.data); return result.data;
}
function authError(error: unknown) {
  const status = (error as { status?: number })?.status;
  return status === 400 || status === 401 ? 'Email atau kata sandi tidak cocok, atau email belum dikonfirmasi.' : status === 422 ? 'Email sudah terdaftar atau data belum valid. Gunakan kata sandi minimal 8 karakter.' : 'Layanan akun belum dapat dihubungi. Periksa koneksi lalu coba lagi.';
}
let authInitialization: ReturnType<typeof handleAuthCallback> | undefined;
export const storageService = {
  getContent: (): ContentItem[] => cache('content', DEFAULT_CONTENT),
  getConfig: (): AppConfig => cache('config', DEFAULT_CONFIG),
  getVideos: (): VideoItem[] => cache('videos', DEFAULT_VIDEOS),
  getUsers: (): UserAccount[] => [],
  getSession: (): UserAccount | null => null,
  syncOnlineContent: () => read<ContentItem[]>('content'),
  syncOnlineConfig: () => read<AppConfig>('config'),
  syncOnlineVideos: () => read<VideoItem[]>('videos'),
  syncOnlineUsers: async (): Promise<UserAccount[]> => (await request('users')).data,
  saveContent: (items: ContentItem[]) => write('content', items),
  saveVideos: (items: VideoItem[]) => write('videos', items),
  async saveConfig(config: AppConfig) {
    let bannerImage = config.bannerImage;
    if (bannerImage.startsWith('data:')) {
      const image = await (await fetch(bannerImage)).blob();
      const response = await fetch('/api/media', { method: 'POST', headers: { 'Content-Type': image.type }, body: image });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Unggahan gambar gagal.');
      bannerImage = result.data;
    }
    return write('config', { ...config, bannerImage });
  },
  async restoreSession(): Promise<UserAccount | null> {
    return (await request('auth/session')).user;
  },
  async initializeAuth() {
    return authInitialization ??= handleAuthCallback();
  },
  async registerUser(name: string, email: string, password: string) {
    try {
      await signup(email.trim().toLowerCase(), password, { full_name: name.trim() });
      const session = await getUser();
      if (!session) return { success: true, message: 'Pendaftaran berhasil. Periksa email (termasuk Spam) dan klik tautan konfirmasi, lalu masuk.', user: undefined };
      return { success: true, message: 'Pendaftaran berhasil!', user: await this.restoreSession() };
    } catch (e) { return { success: false, message: authError(e), user: undefined }; }
  },
  async login(email: string, password: string) {
    try {
      await identityLogin(email.trim().toLowerCase(), password);
      const user = await this.restoreSession();
      return { success: Boolean(user), message: user ? 'Selamat datang kembali!' : 'Silakan masuk kembali.', user };
    } catch (e) { return { success: false, message: authError(e), user: undefined }; }
  },
  async logout() { await identityLogout(); },
  async saveSingleVideo(video: VideoItem) {
    const list = await read<VideoItem[]>('videos');
    const updated = list.some(v => v.id === video.id) ? list.map(v => v.id === video.id ? video : v) : [video, ...list];
    const data: VideoItem[] = await write('videos', updated);
    return { success: true, data, video, message: 'Video berhasil diterbitkan online.' };
  },
  async deleteVideo(id: string): Promise<VideoItem[]> {
    const list = await read<VideoItem[]>('videos');
    return write('videos', list.filter(v => v.id !== id));
  },
  async resetDefaults(): Promise<{ content: ContentItem[]; config: AppConfig; videos: VideoItem[] }> {
    const { data } = await request('reset-defaults', {});
    Object.entries(data).forEach(([key, value]) => remember(key, value));
    return data;
  },
  async getDatabaseStatus(): Promise<any> {
    try { return (await request('database/status')).data; }
    catch { return { status: 'disconnected', provider: 'server_api', message: 'Database belum dapat dihubungi.', latencyMs: 0, totalContent: 0, totalUsers: 0, lastSync: '', serverTime: '' }; }
  },
  async getDatabaseConfig(): Promise<any> { return (await request('database/config')).data; },
  async saveDatabaseConfig(_config: unknown): Promise<any> { return { success: false, message: 'Penyimpanan online dikelola otomatis oleh Netlify.' }; },
  async testDatabaseConnection(_params: unknown): Promise<any> { return request('database/test', {}); },
  async syncOnlineDatabase(): Promise<any> { return request('database/sync', {}); },
};
