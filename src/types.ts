export type ContentCategory = 'Renungan' | 'Doa' | 'Ayat' | 'Akhir Zaman';

export interface ContentItem {
  id: string;
  category: ContentCategory;
  title: string;
  description: string;
  verse?: string;
  content: string;
  explanation?: string;
  author?: string;
  readTime?: string;
  updatedAt?: string;
}

export interface AppConfig {
  headerTitle: string;
  headerTagline: string;
  bannerImage: string;
  bannerLabel: string;
  bannerTitle: string;
  bannerSubtitle: string;
  whatsappNumber: string;
  footerText: string;
  copyrightText: string;
}

export type UserRole = 'admin' | 'user';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string; // stored locally for prototype auth
  role: UserRole;
  createdAt: string;
}

export type DatabaseProvider = 'server_api' | 'supabase' | 'firebase' | 'custom_rest';

export interface DatabaseConfig {
  provider: DatabaseProvider;
  endpointUrl: string;
  apiKey: string;
  databaseName: string;
  autoSync: boolean;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  lastSync?: string;
}

export interface DatabaseStatus {
  status: 'connected' | 'disconnected' | 'degraded';
  provider: DatabaseProvider;
  latencyMs: number;
  totalContent: number;
  totalUsers: number;
  lastSync: string;
  serverTime: string;
  endpointUrl?: string;
  message?: string;
}

export type VideoCategory = 'Khotbah' | 'Pujian' | 'Renungan Video' | 'Akhir Zaman' | 'Kesaksian';

export interface VideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  youtubeId: string;
  category: VideoCategory;
  speaker?: string;
  verse?: string;
  description: string;
  duration?: string;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

