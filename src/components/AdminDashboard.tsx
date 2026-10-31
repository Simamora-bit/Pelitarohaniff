import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sliders, 
  BookOpen, 
  Quote, 
  Heart, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Save, 
  RotateCcw, 
  Check, 
  Users, 
  Download, 
  Search,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  FileText,
  Database,
  Server,
  Wifi,
  Activity,
  RefreshCw,
  Globe,
  HardDrive,
  Link2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Youtube,
  Play,
  Film
} from 'lucide-react';
import { ContentItem, AppConfig, UserAccount, ContentCategory, DatabaseProvider, VideoItem, VideoCategory } from '../types';
import { ContentEditorModal } from './ContentEditorModal';
import { VideoEditorModal } from './VideoEditorModal';
import { VideoPlayerModal } from './VideoPlayerModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { FirebaseConnectCard } from './FirebaseConnectCard';
import { storageService, getYoutubeThumbnail } from '../services/storageService';

interface AdminDashboardProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  content: ContentItem[];
  onUpdateContent: (newContent: ContentItem[]) => void;
  videos: VideoItem[];
  onUpdateVideos: (newVideos: VideoItem[]) => void;
  onViewItem: (item: ContentItem) => void;
}

const PRESET_BANNERS = [
  {
    name: 'Alkitab & Cahaya Terang',
    url: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&q=80&w=2000',
  },
  {
    name: 'Salib & Fajar Emas',
    url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=2000',
  },
  {
    name: 'Langit & Gunung Damai',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000',
  },
  {
    name: 'Lilin & Doa Khusyuk',
    url: 'https://images.unsplash.com/photo-1508672019048-805b876b67e2?auto=format&fit=crop&q=80&w=2000',
  },
  {
    name: 'Bintang & Langit Malam',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=2000',
  },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  config,
  onUpdateConfig,
  content,
  onUpdateContent,
  videos,
  onUpdateVideos,
  onViewItem,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'banner' | 'content' | 'videos' | 'users' | 'database' | 'backup'>('banner');
  
  // Banner & branding form state
  const [bannerForm, setBannerForm] = useState<AppConfig>({ ...config });
  const [bannerNotice, setBannerNotice] = useState('');
  
  // Content manager state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'Semua' | ContentCategory>('Semua');
  const [contentSearchQuery, setContentSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [contentNotice, setContentNotice] = useState('');

  // Video manager state
  const [selectedVideoCategoryFilter, setSelectedVideoCategoryFilter] = useState<'Semua' | VideoCategory>('Semua');
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [isVideoEditorOpen, setIsVideoEditorOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [previewPlayingVideo, setPreviewPlayingVideo] = useState<VideoItem | null>(null);
  const [videoNotice, setVideoNotice] = useState('');
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);

  // User management state
  const [usersList, setUsersList] = useState<UserAccount[]>(storageService.getUsers());

  // Database Connection State
  const [dbConfig, setDbConfig] = useState<{
    provider: DatabaseProvider;
    endpointUrl: string;
    apiKey: string;
    databaseName: string;
    autoSync: boolean;
    status: string;
  }>({
    provider: 'server_api',
    endpointUrl: '',
    apiKey: '',
    databaseName: 'pelita_rohani_cloud_db',
    autoSync: true,
    status: 'connected',
  });
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [dbNotice, setDbNotice] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load database info on mount
  useEffect(() => {
    async function loadDatabaseData() {
      try {
        const [status, cfg] = await Promise.all([
          storageService.getDatabaseStatus(),
          storageService.getDatabaseConfig(),
        ]);
        if (status) setDbStatus(status);
        if (cfg) setDbConfig(cfg);
      } catch (e) {
        console.error('Error fetching database data', e);
      }
    }
    loadDatabaseData();
  }, []);

  // Handle banner image file upload (FileReader -> Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setBannerForm((prev) => ({ ...prev, bannerImage: result }));
        setBannerNotice('Gambar berhasil diunggah! Jangan lupa klik "Simpan Perubahan Tampilan".');
        setTimeout(() => setBannerNotice(''), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBannerConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(bannerForm);
    await storageService.saveConfig(bannerForm);
    setBannerNotice('Tampilan aplikasi dan banner berhasil disimpan di server online!');
    setTimeout(() => setBannerNotice(''), 3000);
  };

  const handleSaveContentItem = async (savedItem: ContentItem) => {
    let updated: ContentItem[];
    const exists = content.some((c) => c.id === savedItem.id);

    if (exists) {
      updated = content.map((c) => (c.id === savedItem.id ? savedItem : c));
      setContentNotice(`Konten "${savedItem.title}" berhasil diperbarui.`);
    } else {
      updated = [savedItem, ...content];
      setContentNotice(`Konten baru "${savedItem.title}" berhasil ditambahkan.`);
    }

    onUpdateContent(updated);
    await storageService.saveContent(updated);
    setTimeout(() => setContentNotice(''), 3500);
  };

  const handleDeleteItem = async (id: string, title: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus konten "${title}"?`)) {
      const updated = content.filter((c) => c.id !== id);
      onUpdateContent(updated);
      await storageService.saveContent(updated);
      setContentNotice(`Konten "${title}" telah dihapus.`);
      setTimeout(() => setContentNotice(''), 3000);
    }
  };

  // Video Management Handlers
  const handleSaveVideoItem = async (savedVideo: VideoItem) => {
    const res = await storageService.saveSingleVideo(savedVideo);
    if (res.data) {
      onUpdateVideos(res.data);
    } else {
      const exists = videos.some((v) => v.id === savedVideo.id);
      const updated = exists
        ? videos.map((v) => (v.id === savedVideo.id ? savedVideo : v))
        : [savedVideo, ...videos];
      onUpdateVideos(updated);
    }
    setVideoNotice(`Video "${savedVideo.title}" berhasil disimpan ke server online!`);
    setTimeout(() => setVideoNotice(''), 3500);
  };

  const requestDeleteVideo = (vid: VideoItem) => {
    setVideoToDelete(vid);
  };

  const handleConfirmDeleteVideo = async () => {
    if (!videoToDelete) return;
    setIsDeletingVideo(true);
    try {
      const updated = await storageService.deleteVideo(videoToDelete.id);
      onUpdateVideos(updated);
      setVideoNotice(`Video "${videoToDelete.title}" berhasil dihapus dari server online!`);
      setTimeout(() => setVideoNotice(''), 3500);
    } catch (e) {
      console.error('Error deleting video:', e);
    } finally {
      setIsDeletingVideo(false);
      setVideoToDelete(null);
    }
  };

  const handleResetToDefaults = async () => {
    if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mengembalikan semua konten, banner, dan video ke bawaan awal? Data kustom akan tereset.')) {
      const { content: defContent, config: defConfig, videos: defVideos } = await storageService.resetDefaults();
      onUpdateContent(defContent);
      onUpdateConfig(defConfig);
      onUpdateVideos(defVideos);
      setBannerForm(defConfig);
      alert('Berhasil mengembalikan ke konten bawaan.');
    }
  };

  const handleExportJSON = () => {
    const backupData = {
      app: 'Pelita Rohani',
      exportedAt: new Date().toISOString(),
      config,
      content,
      videos,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pelita-rohani-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.content && Array.isArray(json.content)) {
          onUpdateContent(json.content);
          await storageService.saveContent(json.content);
          if (json.config) {
            onUpdateConfig(json.config);
            setBannerForm(json.config);
            await storageService.saveConfig(json.config);
          }
          if (json.videos && Array.isArray(json.videos)) {
            onUpdateVideos(json.videos);
            await storageService.saveVideos(json.videos);
          }
          alert('Data berhasil diimpor dan diperbarui!');
        } else {
          alert('Format berkas cadangan JSON tidak sesuai.');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Database Connection Actions
  const handleTestDatabase = async () => {
    setIsTestingDb(true);
    setDbTestResult(null);
    try {
      const result = await storageService.testDatabaseConnection({
        provider: dbConfig.provider,
        endpointUrl: dbConfig.endpointUrl,
        apiKey: dbConfig.apiKey,
      });
      setDbTestResult(result);
      if (result.success) {
        const status = await storageService.getDatabaseStatus();
        setDbStatus(status);
      }
    } catch (e: any) {
      setDbTestResult({
        success: false,
        message: 'Gagal menghubungi server database. Periksa URL atau koneksi jaringan.',
      });
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleSaveDatabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await storageService.saveDatabaseConfig(dbConfig);
      if (res.success) {
        setDbNotice('Konfigurasi database online berhasil disimpan!');
        const status = await storageService.getDatabaseStatus();
        setDbStatus(status);
        setTimeout(() => setDbNotice(''), 3500);
      } else {
        alert(res.message || 'Gagal menyimpan konfigurasi');
      }
    } catch (e) {
      alert('Terjadi kesalahan saat menyimpan pengaturan database.');
    }
  };

  const handleSyncDatabase = async () => {
    setIsSyncingDb(true);
    try {
      const res = await storageService.syncOnlineDatabase();
      if (res.success) {
        setDbNotice(res.message);
        const [freshContent, status] = await Promise.all([
          storageService.syncOnlineContent(),
          storageService.getDatabaseStatus(),
        ]);
        onUpdateContent(freshContent);
        setDbStatus(status);
        setTimeout(() => setDbNotice(''), 4000);
      } else {
        alert(res.message || 'Gagal sinkronisasi data.');
      }
    } catch (e) {
      alert('Gagal melakukan sinkronisasi database.');
    } finally {
      setIsSyncingDb(false);
    }
  };

  // Filter content items
  const filteredContent = content.filter((item) => {
    const matchCat = selectedCategoryFilter === 'Semua' || item.category === selectedCategoryFilter;
    const matchSearch =
      item.title.toLowerCase().includes(contentSearchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(contentSearchQuery.toLowerCase()) ||
      (item.verse && item.verse.toLowerCase().includes(contentSearchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const countByCategory = {
    Renungan: content.filter((c) => c.category === 'Renungan').length,
    Ayat: content.filter((c) => c.category === 'Ayat').length,
    Doa: content.filter((c) => c.category === 'Doa').length,
    'Akhir Zaman': content.filter((c) => c.category === 'Akhir Zaman').length,
  };

  // Filter video items
  const filteredVideos = videos.filter((vid) => {
    const matchCat = selectedVideoCategoryFilter === 'Semua' || vid.category === selectedVideoCategoryFilter;
    const matchSearch =
      vid.title.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
      vid.description.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
      (vid.speaker && vid.speaker.toLowerCase().includes(videoSearchQuery.toLowerCase())) ||
      (vid.verse && vid.verse.toLowerCase().includes(videoSearchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Admin Banner */}
      <div className="glass-card p-6 md:p-8 bg-gradient-to-r from-gold/15 via-white/5 to-transparent border-gold/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Panel Kontrol Admin</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-white">Dashboard Admin Pelita Rohani</h2>
            <p className="text-white/60 text-sm">
              Kelola gambar banner, seluruh konten renungan & doa, hubungkan database online, serta pantau jemaat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setEditingVideo(null);
                setIsVideoEditorOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 font-bold text-xs flex items-center gap-1.5 hover:bg-red-600/30 transition-all cursor-pointer"
            >
              <Youtube className="w-4 h-4 text-red-400" />
              <span>+ Video YouTube</span>
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                setIsEditorOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gold text-dark-bg font-bold text-xs flex items-center gap-1.5 hover:bg-gold-light transition-all shadow-lg shadow-gold/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Konten Renungan</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-gold" />
            <div>
              <p className="text-xs text-white/50">Renungan</p>
              <p className="text-lg font-bold text-white">{countByCategory.Renungan} Item</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
            <Quote className="w-5 h-5 text-gold-light" />
            <div>
              <p className="text-xs text-white/50">Ayat</p>
              <p className="text-lg font-bold text-white">{countByCategory.Ayat} Item</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
            <Heart className="w-5 h-5 text-rose-400" />
            <div>
              <p className="text-xs text-white/50">Doa</p>
              <p className="text-lg font-bold text-white">{countByCategory.Doa} Item</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
            <Youtube className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-xs text-white/50">Video YouTube</p>
              <p className="text-lg font-bold text-white">{videos.length} Video</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs text-white/50">Status Database</p>
              <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Online & Aktif
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto gap-2 pb-1">
        <button
          onClick={() => setActiveAdminTab('banner')}
          className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'banner'
              ? 'border-gold text-gold bg-white/5 rounded-t-xl'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Banner & Tampilan</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('content')}
          className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'content'
              ? 'border-gold text-gold bg-white/5 rounded-t-xl'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Kelola Konten ({content.length})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('videos')}
          className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'videos'
              ? 'border-gold text-gold bg-white/5 rounded-t-xl'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <Youtube className="w-4 h-4 text-red-400" />
          <span>Video YouTube ({videos.length})</span>
        </button>
        <button
          onClick={async () => {
            setActiveAdminTab('users');
            try {
              const onlineUsers = await storageService.syncOnlineUsers();
              setUsersList(onlineUsers);
            } catch (e) {
              setUsersList(storageService.getUsers());
            }
          }}
          className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'users'
              ? 'border-gold text-gold bg-white/5 rounded-t-xl'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar User / Jemaat ({usersList.length})</span>
        </button>
        <button
          onClick={async () => {
            setActiveAdminTab('database');
            try {
              const [status, cfg] = await Promise.all([
                storageService.getDatabaseStatus(),
                storageService.getDatabaseConfig(),
              ]);
              setDbStatus(status);
              setDbConfig(cfg);
            } catch (e) {}
          }}
          className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'database'
              ? 'border-gold text-gold bg-white/5 rounded-t-xl'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Koneksi Database Online</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('backup')}
          className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'backup'
              ? 'border-gold text-gold bg-white/5 rounded-t-xl'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Cadangan & Reset</span>
        </button>
      </div>

      {/* Tab 1: BANNER & TAMPILAN APLIKASI */}
      {activeAdminTab === 'banner' && (
        <div className="space-y-8">
          {bannerNotice && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2"
            >
              <Check className="w-5 h-5 text-emerald-400" />
              <span>{bannerNotice}</span>
            </motion.div>
          )}

          {/* Live Preview of Hero Banner */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gold" />
              <span>Pratinjau Langsung Hero Banner</span>
            </h3>
            <p className="text-xs text-white/50">Tampilan persis yang dilihat jemaat di halaman Beranda.</p>
            
            <div className="relative rounded-3xl overflow-hidden aspect-[21/9] flex items-center justify-center text-center p-6 border border-white/10 shadow-2xl bg-black">
              <img
                src={bannerForm.bannerImage}
                alt="Banner Preview"
                className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent" />
              <div className="relative space-y-3 max-w-xl px-4">
                <span className="text-xs font-semibold tracking-widest uppercase text-gold/90 px-3 py-1 bg-black/40 rounded-full border border-gold/30">
                  {bannerForm.bannerLabel || 'Renungan Hari Ini'}
                </span>
                <h2 className="text-3xl md:text-5xl font-serif italic text-white drop-shadow-md">
                  {bannerForm.bannerTitle || 'Judul Renungan'}
                </h2>
                <p className="text-white/80 text-sm md:text-base font-serif drop-shadow">
                  {bannerForm.bannerSubtitle || 'Subtitle'}
                </p>
              </div>
            </div>
          </div>

          {/* Form to change Banner & App Info */}
          <form onSubmit={handleSaveBannerConfig} className="glass-card p-6 md:p-8 space-y-6">
            <div className="space-y-1 pb-4 border-b border-white/10">
              <h3 className="text-xl font-bold font-serif text-white">Upload Gambar & Konfigurasi Banner</h3>
              <p className="text-xs text-white/60">
                Anda dapat mengunggah file foto dari perangkat Anda atau memilih dari gambar rohani pilihan.
              </p>
            </div>

            {/* File Upload & Preset Options */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-white/80">
                1. Unggah Gambar dari Perangkat (Komputer/HP)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-gold" />
                  <span>Pilih File Gambar dari Perangkat...</span>
                </button>
                <span className="text-xs text-white/40">Mendukung JPG, PNG, WebP (Max 5MB)</span>
              </div>

              {/* Or Direct Image URL */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Atau Masukkan URL Gambar Kustom:
                </label>
                <input
                  type="url"
                  value={bannerForm.bannerImage}
                  onChange={(e) => setBannerForm({ ...bannerForm, bannerImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50"
                />
              </div>

              {/* Preset Quick Picks */}
              <div className="pt-2 space-y-2">
                <label className="block text-xs font-semibold text-white/60">
                  Preset Pilihan Gambar Rohani Beresolusi Tinggi:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {PRESET_BANNERS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setBannerForm({ ...bannerForm, bannerImage: preset.url })}
                      className={`p-2 rounded-xl border text-left text-xs transition-all flex flex-col gap-1.5 cursor-pointer ${
                        bannerForm.bannerImage === preset.url
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      <div className="h-12 w-full rounded-lg overflow-hidden bg-black/40">
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="truncate font-medium">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Banner Titles Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Tagline / Label Banner
                </label>
                <input
                  type="text"
                  value={bannerForm.bannerLabel}
                  onChange={(e) => setBannerForm({ ...bannerForm, bannerLabel: e.target.value })}
                  placeholder="Renungan Hari Ini"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Judul Utama Banner
                </label>
                <input
                  type="text"
                  value={bannerForm.bannerTitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, bannerTitle: e.target.value })}
                  placeholder="Tuhan Selalu Menyertai Hidupmu"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Kutipan / Subtitle Banner
                </label>
                <input
                  type="text"
                  value={bannerForm.bannerSubtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, bannerSubtitle: e.target.value })}
                  placeholder='"Kasih sejati tidak mencari keuntungan diri"'
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50"
                />
              </div>
            </div>

            {/* App General Settings */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-sm font-bold text-gold uppercase tracking-wider">Pengaturan Identitas & Footer</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Nama Aplikasi (Header)
                  </label>
                  <input
                    type="text"
                    value={bannerForm.headerTitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, headerTitle: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Nomor WhatsApp Hubungi Kami (Format: 628...)
                  </label>
                  <div className="relative">
                    <MessageCircle className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={bannerForm.whatsappNumber}
                      onChange={(e) => setBannerForm({ ...bannerForm, whatsappNumber: e.target.value })}
                      placeholder="6285191447806"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Teks Hak Cipta Footer
                  </label>
                  <input
                    type="text"
                    value={bannerForm.copyrightText}
                    onChange={(e) => setBannerForm({ ...bannerForm, copyrightText: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-light text-dark-bg font-bold text-sm flex items-center gap-2 hover:opacity-90 shadow-lg shadow-gold/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Tampilan</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: KELOLA SEMUA KONTEN */}
      {activeAdminTab === 'content' && (
        <div className="space-y-6">
          {contentNotice && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2"
            >
              <Check className="w-5 h-5 text-emerald-400" />
              <span>{contentNotice}</span>
            </motion.div>
          )}

          {/* Filter Bar & Search */}
          <div className="glass-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {(['Semua', 'Renungan', 'Ayat', 'Doa', 'Akhir Zaman'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategoryFilter === cat
                      ? 'bg-gold text-dark-bg shadow-sm'
                      : 'bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  {cat} {cat === 'Semua' ? `(${content.length})` : `(${content.filter((c) => c.category === cat).length})`}
                </button>
              ))}
            </div>

            {/* Search Box & New Button */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={contentSearchQuery}
                  onChange={(e) => setContentSearchQuery(e.target.value)}
                  placeholder="Cari judul atau firman..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-gold/50"
                />
              </div>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsEditorOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-gold text-dark-bg font-bold text-xs flex items-center gap-1.5 hover:bg-gold-light transition-colors whitespace-nowrap shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {filteredContent.length === 0 ? (
              <div className="glass-card p-12 text-center text-white/50 space-y-3">
                <BookOpen className="w-10 h-10 mx-auto text-white/20" />
                <p>Tidak ada konten yang sesuai dengan filter atau kata kunci.</p>
              </div>
            ) : (
              filteredContent.map((item) => (
                <div
                  key={item.id}
                  className="glass-card p-5 hover:border-gold/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.category === 'Renungan'
                          ? 'bg-gold/15 text-gold border border-gold/30'
                          : item.category === 'Ayat'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : item.category === 'Doa'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30'
                      }`}>
                        {item.category}
                      </span>
                      {item.verse && (
                        <span className="text-xs text-white/50 font-serif italic">
                          "{item.verse}"
                        </span>
                      )}
                      <span className="text-[10px] text-white/30">• {item.readTime || '5 Menit'}</span>
                    </div>

                    <h4 className="text-lg font-bold text-white group-hover:text-gold transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-white/60 text-xs line-clamp-2 max-w-2xl leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                    <button
                      onClick={() => onViewItem(item)}
                      title="Lihat Tampilan Pembaca"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-xs flex items-center gap-1.5 px-3 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Lihat</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsEditorOpen(true);
                      }}
                      title="Ubah Konten Ini"
                      className="p-2 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold transition-colors text-xs flex items-center gap-1.5 px-3 font-semibold cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id, item.title)}
                      title="Hapus Konten"
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: KELOLA VIDEO YOUTUBE */}
      {activeAdminTab === 'videos' && (
        <div className="space-y-6">
          {videoNotice && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2"
            >
              <Check className="w-5 h-5 text-emerald-400" />
              <span>{videoNotice}</span>
            </motion.div>
          )}

          {/* Header Controls */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-400" />
                  <span>Daftar Video YouTube Rohani ({videos.length})</span>
                </h3>
                <p className="text-xs text-white/50">
                  Tambahkan link video YouTube khotbah, lagu pujian, renungan, dan berikan keterangan lengkap untuk jemaat.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingVideo(null);
                  setIsVideoEditorOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-red-600/20 cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Video YouTube</span>
              </button>
            </div>

            {/* Filter Pills and Search */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-white/5">
              <div className="flex flex-wrap gap-1.5 flex-1">
                {(['Semua', 'Khotbah', 'Pujian', 'Renungan Video', 'Akhir Zaman', 'Kesaksian'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedVideoCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedVideoCategoryFilter === cat
                        ? 'bg-red-600/20 text-red-300 border border-red-500/40 shadow-sm'
                        : 'bg-white/5 text-white/60 hover:text-white border border-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={videoSearchQuery}
                  onChange={(e) => setVideoSearchQuery(e.target.value)}
                  placeholder="Cari judul / pembicara..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-400 placeholder:text-white/30"
                />
              </div>
            </div>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVideos.length === 0 ? (
              <div className="col-span-full glass-card p-12 text-center space-y-3">
                <Film className="w-12 h-12 mx-auto text-white/20" />
                <h4 className="text-lg font-serif font-bold text-white">Tidak ada video yang ditemukan</h4>
                <p className="text-xs text-white/50 max-w-md mx-auto">
                  Belum ada video dengan filter ini atau sesuai pencarian Anda. Klik tombol Tambah Video YouTube di atas untuk menambahkan.
                </p>
                <button
                  onClick={() => {
                    setEditingVideo(null);
                    setIsVideoEditorOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gold text-dark-bg font-bold text-xs hover:bg-gold-light transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Video Sekarang</span>
                </button>
              </div>
            ) : (
              filteredVideos.map((vid) => (
                <div
                  key={vid.id}
                  className="glass-card overflow-hidden hover:border-gold/30 transition-all flex flex-col justify-between group"
                >
                  {/* Thumbnail with Overlay */}
                  <div 
                    className="relative aspect-video w-full bg-black cursor-pointer overflow-hidden"
                    onClick={() => setPreviewPlayingVideo(vid)}
                  >
                    <img
                      src={getYoutubeThumbnail(vid.youtubeId)}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 flex items-center justify-center transition-colors">
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-1 fill-white" />
                      </div>
                    </div>
                    {vid.duration && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white/90 font-mono">
                        {vid.duration}
                      </span>
                    )}
                    {vid.isFeatured && (
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-gold text-dark-bg text-[10px] font-bold uppercase tracking-wider shadow">
                        ★ Unggulan
                      </span>
                    )}
                  </div>

                  {/* Video Meta & Description */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider">
                          {vid.category}
                        </span>
                        {vid.speaker && (
                          <span className="text-xs text-white/60 truncate max-w-[150px]">
                            {vid.speaker}
                          </span>
                        )}
                      </div>

                      <h4 
                        onClick={() => setPreviewPlayingVideo(vid)}
                        className="text-base font-bold text-white group-hover:text-gold transition-colors line-clamp-2 cursor-pointer leading-snug"
                      >
                        {vid.title}
                      </h4>

                      {vid.verse && (
                        <p className="text-xs text-gold/90 font-serif italic truncate">
                          "{vid.verse}"
                        </p>
                      )}

                      <p className="text-white/60 text-xs line-clamp-3 leading-relaxed">
                        {vid.description}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setPreviewPlayingVideo(vid)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-gold/20 hover:text-gold text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Putar Video</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingVideo(vid);
                            setIsVideoEditorOpen(true);
                          }}
                          title="Edit Video"
                          className="p-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold transition-colors text-xs flex items-center gap-1 px-2.5 font-semibold cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => requestDeleteVideo(vid)}
                          title="Hapus Video"
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-xs flex items-center gap-1 px-2.5 font-semibold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: DAFTAR USER / JEMAAT */}
      {activeAdminTab === 'users' && (
        <div className="glass-card p-6 md:p-8 space-y-6">
          <div className="space-y-1 pb-4 border-b border-white/10">
            <h3 className="text-xl font-bold font-serif text-white">Daftar Pengguna & Jemaat Terdaftar</h3>
            <p className="text-xs text-white/60">
              Pengguna yang telah mendaftar melalui formulir registrasi online aplikasi.
            </p>
          </div>

          <div className="space-y-3">
            {usersList.map((usr) => (
              <div
                key={usr.id}
                className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    usr.role === 'admin' ? 'bg-gold text-dark-bg' : 'bg-white/10 text-white'
                  }`}>
                    {usr.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{usr.name}</h4>
                      {usr.role === 'admin' ? (
                        <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-[10px] font-bold uppercase">
                          Admin Utama
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase">
                          Jemaat Terdaftar
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50">{usr.email}</p>
                  </div>
                </div>

                <div className="text-xs text-white/40">
                  Terdaftar: {new Date(usr.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: KONEKSI DATABASE ONLINE (NEW) */}
      {activeAdminTab === 'database' && (
        <div className="space-y-8">
          {/* Card Sambungkan ke Database Online Gratis (Sesuai Gambar Referensi) */}
          <FirebaseConnectCard
            onSuccess={async () => {
              try {
                const status = await storageService.getDatabaseStatus();
                setDbStatus(status);
              } catch (e) {}
            }}
          />

          {dbNotice && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{dbNotice}</span>
            </motion.div>
          )}

          {/* Live Online Database Monitor Card */}
          <div className="glass-card p-6 md:p-8 space-y-6 border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-[#141414] to-[#141414]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold font-serif text-white">Status Database Online</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Aktif & Online
                    </span>
                  </div>
                  <p className="text-xs text-white/60">
                    Pusat penyimpanan online Pelita Rohani untuk sinkronisasi antar perangkat secara real-time.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestDatabase}
                  disabled={isTestingDb}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isTestingDb ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Activity className="w-3.5 h-3.5 text-gold" />
                  )}
                  <span>Tes Ping & Koneksi</span>
                </button>
                <button
                  type="button"
                  onClick={handleSyncDatabase}
                  disabled={isSyncingDb}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-900/30 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDb ? 'animate-spin' : ''}`} />
                  <span>Sinkronkan Data</span>
                </button>
              </div>
            </div>

            {/* Test connection result pill */}
            {dbTestResult && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
                  dbTestResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {dbTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <div className="flex-1">
                  <span>{dbTestResult.message}</span>
                  {dbTestResult.latencyMs && (
                    <span className="ml-2 font-mono text-[11px] bg-black/40 px-2 py-0.5 rounded text-gold">
                      Latensi: {dbTestResult.latencyMs} ms
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Database metrics cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <Server className="w-3.5 h-3.5 text-gold" />
                  <span>Mesin Database</span>
                </div>
                <p className="text-sm font-bold text-white capitalize">
                  {dbConfig.provider === 'server_api'
                    ? 'Cloud Server Database'
                    : dbConfig.provider === 'supabase'
                    ? 'Supabase / PostgreSQL'
                    : dbConfig.provider === 'firebase'
                    ? 'Firebase Firestore'
                    : 'Custom REST API'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kecepatan Ping</span>
                </div>
                <p className="text-sm font-bold text-emerald-400 font-mono">
                  {dbStatus?.latencyMs || 6} ms (Sangat Cepat)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <HardDrive className="w-3.5 h-3.5 text-gold-light" />
                  <span>Total Data Tersimpan</span>
                </div>
                <p className="text-sm font-bold text-white">
                  {content.length} Artikel & {usersList.length} User
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>Sinkronisasi Terakhir</span>
                </div>
                <p className="text-xs font-semibold text-white/90 truncate">
                  {dbStatus?.lastSync
                    ? new Date(dbStatus.lastSync).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : 'Aktif'}
                </p>
              </div>
            </div>
          </div>

          {/* Database Configuration Form */}
          <form onSubmit={handleSaveDatabaseConfig} className="glass-card p-6 md:p-8 space-y-6">
            <div className="space-y-1 pb-4 border-b border-white/10">
              <h3 className="text-xl font-bold font-serif text-white">Hubungkan / Ubah Database Online</h3>
              <p className="text-xs text-white/60">
                Pilih penyedia database online yang ingin Anda hubungkan (Server Cloud Bawaan, Supabase, Firebase, atau REST API Kustom).
              </p>
            </div>

            {/* Provider Selector Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/80">
                1. Pilih Jenis Database Online:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    id: 'server_api',
                    name: 'Cloud Server Bawaan',
                    desc: 'Database bawaan server live, terhubung otomatis',
                    recommended: true,
                  },
                  {
                    id: 'supabase',
                    name: 'Supabase / PostgreSQL',
                    desc: 'Database relasional SQL cloud',
                    recommended: false,
                  },
                  {
                    id: 'firebase',
                    name: 'Firebase Firestore',
                    desc: 'Database dokumen NoSQL Google Cloud',
                    recommended: false,
                  },
                  {
                    id: 'custom_rest',
                    name: 'Custom REST API / Webhook',
                    desc: 'Endpoint API database kustom Anda',
                    recommended: false,
                  },
                ].map((prov) => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => setDbConfig({ ...dbConfig, provider: prov.id as DatabaseProvider })}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      dbConfig.provider === prov.id
                        ? 'border-gold bg-gold/10 text-white shadow-lg shadow-gold/10 ring-1 ring-gold/30'
                        : 'border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="space-y-1">
                      {prov.recommended && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full inline-block mb-1">
                          Aktif Saat Ini
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-white">{prov.name}</h4>
                      <p className="text-xs text-white/50">{prov.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Details for External Database if chosen */}
            {dbConfig.provider !== 'server_api' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t border-white/10"
              >
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    URL Endpoint / Host Database <span className="text-gold">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                    <input
                      type="url"
                      value={dbConfig.endpointUrl}
                      onChange={(e) => setDbConfig({ ...dbConfig, endpointUrl: e.target.value })}
                      placeholder={
                        dbConfig.provider === 'supabase'
                          ? 'https://your-project.supabase.co/rest/v1'
                          : dbConfig.provider === 'firebase'
                          ? 'https://firestore.googleapis.com/v1/projects/your-project/databases/(default)/documents'
                          : 'https://api.yourdatabase.com/v1'
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      API Key / Anon Token Akses
                    </label>
                    <div className="relative">
                      <Link2 className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={dbConfig.apiKey}
                        onChange={(e) => setDbConfig({ ...dbConfig, apiKey: e.target.value })}
                        placeholder="eyJhbGciOi..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3.5 top-3.5 text-white/40 hover:text-white cursor-pointer"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Nama Database / Schema
                    </label>
                    <input
                      type="text"
                      value={dbConfig.databaseName}
                      onChange={(e) => setDbConfig({ ...dbConfig, databaseName: e.target.value })}
                      placeholder="pelita_rohani_db"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Auto-Sync Toggle */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Sinkronisasi Otomatis</h4>
                <p className="text-xs text-white/50">
                  Sinkronkan konten dan perubahan secara instan setiap kali Anda mengedit aplikasi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDbConfig({ ...dbConfig, autoSync: !dbConfig.autoSync })}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                  dbConfig.autoSync ? 'bg-gold' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-dark-bg absolute top-1 transition-transform ${
                    dbConfig.autoSync ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleTestDatabase}
                disabled={isTestingDb}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                {isTestingDb ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-gold" />}
                <span>Uji Koneksi</span>
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-light text-dark-bg font-bold text-sm flex items-center gap-2 hover:opacity-90 shadow-lg shadow-gold/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Database</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 5: CADANGAN & RESET */}
      {activeAdminTab === 'backup' && (
        <div className="glass-card p-6 md:p-8 space-y-8">
          <div className="space-y-1 pb-4 border-b border-white/10">
            <h3 className="text-xl font-bold font-serif text-white">Cadangan & Pemulihan Data</h3>
            <p className="text-xs text-white/60">
              Amankan konten renungan, ayat, doa, dan banner Anda dalam bentuk berkas JSON.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Ekspor Cadangan (Download JSON)</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Unduh seluruh koleksi konten dan pengaturan banner ke dalam satu file berkas JSON cadangan.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportJSON}
                className="w-full py-2.5 rounded-xl bg-gold text-dark-bg font-bold text-xs hover:bg-gold-light transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Cadangan JSON</span>
              </button>
            </div>

            {/* Import */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Pulihkan Cadangan (Unggah JSON)</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Pulihkan kembali konten aplikasi dari berkas JSON yang telah Anda ekspor sebelumnya.
                </p>
              </div>
              <label className="w-full py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs hover:bg-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-gold" />
                <span>Pilih Berkas JSON untuk Dipulihkan</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Factory Reset */}
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-3">
            <h4 className="text-sm font-bold text-red-300 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-red-400" />
              <span>Reset Data ke Bawaan Sistem</span>
            </h4>
            <p className="text-xs text-red-200/70 leading-relaxed">
              Jika Anda ingin mengembalikan seluruh renungan, doa, ayat, dan banner ke kondisi awal aplikasi, gunakan tombol di bawah ini.
            </p>
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembalikan ke Bawaan Awal</span>
            </button>
          </div>
        </div>
      )}

      {/* Editor Modal for Adding or Editing Items */}
      <ContentEditorModal
        isOpen={isEditorOpen}
        item={editingItem}
        defaultCategory={selectedCategoryFilter === 'Semua' ? 'Renungan' : selectedCategoryFilter}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveContentItem}
      />

      {/* Editor Modal for Adding or Editing Videos */}
      <VideoEditorModal
        isOpen={isVideoEditorOpen}
        video={editingVideo}
        onClose={() => {
          setIsVideoEditorOpen(false);
          setEditingVideo(null);
        }}
        onSave={handleSaveVideoItem}
        onDelete={(vid) => {
          requestDeleteVideo(vid);
        }}
      />

      {/* Video Player Modal for Playback */}
      <VideoPlayerModal
        video={previewPlayingVideo}
        onClose={() => setPreviewPlayingVideo(null)}
        whatsappNumber={config.whatsappNumber}
      />

      {/* Modal Konfirmasi Hapus Video */}
      <DeleteConfirmModal
        isOpen={Boolean(videoToDelete)}
        title="Hapus Video YouTube?"
        message="Video ini akan dihapus secara permanen dari server database online dan tidak akan lagi muncul di aplikasi jemaat."
        itemName={videoToDelete?.title}
        itemCategory={videoToDelete?.category}
        thumbnailUrl={videoToDelete ? getYoutubeThumbnail(videoToDelete.youtubeId) : undefined}
        confirmLabel="Ya, Hapus Video Ini"
        isDeleting={isDeletingVideo}
        onConfirm={handleConfirmDeleteVideo}
        onClose={() => setVideoToDelete(null)}
      />
    </div>
  );
};
