/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Sparkles, 
  Heart, 
  AlertTriangle, 
  Send, 
  MessageCircle, 
  ChevronRight,
  Menu,
  X,
  Search,
  Quote,
  ArrowLeft,
  Clock,
  User,
  Shield,
  ShieldCheck,
  LogOut,
  LogIn,
  Sliders,
  Plus,
  Edit,
  UserCheck,
  Youtube,
  Play,
  Film
} from 'lucide-react';
import { askSpiritualAI, searchBibleVerse } from './services/geminiService';
import { ContentItem, AppConfig, UserAccount, ContentCategory, VideoItem, VideoCategory } from './types';
import { storageService, getYoutubeThumbnail } from './services/storageService';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ContentEditorModal } from './components/ContentEditorModal';
import { VideoEditorModal } from './components/VideoEditorModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';

export default function App() {
  // App state & data
  const [appConfig, setAppConfig] = useState<AppConfig>(() => storageService.getConfig());
  const [contentList, setContentList] = useState<ContentItem[]>(() => storageService.getContent());
  const [videosList, setVideosList] = useState<VideoItem[]>(() => storageService.getVideos());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => storageService.getSession());

  // Navigation & View
  const [activeTab, setActiveTab] = useState<string>('Home');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Auth & Admin Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isQuickEditorOpen, setIsQuickEditorOpen] = useState(false);
  const [quickEditorItem, setQuickEditorItem] = useState<ContentItem | null>(null);

  // Video State & Modals
  const [activeVideoModal, setActiveVideoModal] = useState<VideoItem | null>(null);
  const [isVideoEditorOpen, setIsVideoEditorOpen] = useState(false);
  const [videoFilterCategory, setVideoFilterCategory] = useState<'Semua' | VideoCategory>('Semua');
  const [videoSearchTerm, setVideoSearchTerm] = useState('');

  // Search & AI State
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const searchEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.role === 'admin';

  // Sync online data from server on app load
  useEffect(() => {
    async function syncOnlineData() {
      try {
        const [onlineContent, onlineConfig, onlineVideos] = await Promise.all([
          storageService.syncOnlineContent(),
          storageService.syncOnlineConfig(),
          storageService.syncOnlineVideos(),
        ]);
        setContentList(onlineContent);
        setAppConfig(onlineConfig);
        setVideosList(onlineVideos);
      } catch (err) {
        console.error('Failed to sync online data:', err);
      }
    }
    syncOnlineData();
  }, []);

  // AI Ask Handler
  const handleAsk = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setAnswer('');
    const result = await askSpiritualAI(question);
    setAnswer(result);
    setIsLoading(false);
  };

  // Bible Verse Search Handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults('');
    const result = await searchBibleVerse(searchQuery);
    setSearchResults(result);
    setIsSearching(false);
  };

  useEffect(() => {
    if (answer && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [answer]);

  useEffect(() => {
    if (searchResults && searchEndRef.current) {
      searchEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchResults]);

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
    if (activeTab === 'Dashboard Admin') {
      setActiveTab('Home');
    }
  };

  // Content update from quick edit modal
  const handleSaveQuickContent = (savedItem: ContentItem) => {
    let updated: ContentItem[];
    const exists = contentList.some((c) => c.id === savedItem.id);
    if (exists) {
      updated = contentList.map((c) => (c.id === savedItem.id ? savedItem : c));
    } else {
      updated = [savedItem, ...contentList];
    }
    setContentList(updated);
    storageService.saveContent(updated);
    if (selectedItem && selectedItem.id === savedItem.id) {
      setSelectedItem(savedItem);
    }
  };

  const navItems = ['Home', 'Renungan', 'Ayat', 'Doa', 'Akhir Zaman', 'Video'];
  if (isAdmin) {
    navItems.push('Dashboard Admin');
  }

  // Get preview content for Home cards
  const homeRenungan = contentList.find((i) => i.category === 'Renungan') || contentList[0];
  const homeAyat = contentList.find((i) => i.category === 'Ayat') || contentList[1];
  const homeDoa = contentList.find((i) => i.category === 'Doa') || contentList[2];
  const homeAkhirZaman = contentList.find((i) => i.category === 'Akhir Zaman') || contentList[3];

  const filteredContent = contentList.filter((item) => item.category === activeTab);

  // Content Renderer
  const renderContent = () => {
    // If active tab is Admin Dashboard
    if (activeTab === 'Dashboard Admin') {
      if (!isAdmin) {
        return (
          <div className="glass-card p-12 text-center space-y-4">
            <Shield className="w-12 h-12 mx-auto text-gold" />
            <h3 className="text-2xl font-serif font-bold text-white">Akses Khusus Administrator</h3>
            <p className="text-white/60 text-sm max-w-md mx-auto">
              Halaman ini hanya dapat diakses oleh Administrator Pelita Rohani. Silakan masuk terlebih dahulu dengan akun Anda.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-gold text-dark-bg font-bold text-sm hover:bg-gold-light transition-colors"
            >
              Masuk ke Akun
            </button>
          </div>
        );
      }

      return (
        <AdminDashboard
          config={appConfig}
          onUpdateConfig={setAppConfig}
          content={contentList}
          onUpdateContent={setContentList}
          videos={videosList}
          onUpdateVideos={setVideosList}
          onViewItem={(item) => {
            setActiveTab(item.category);
            setSelectedItem(item);
          }}
        />
      );
    }

    // If an item is selected for detailed article reading
    if (selectedItem) {
      return (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSelectedItem(null)}
              className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke {activeTab}
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setQuickEditorItem(selectedItem);
                  setIsQuickEditorOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 transition-colors text-xs font-bold"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Konten Ini</span>
              </button>
            )}
          </div>

          <article className="glass-card p-8 md:p-12 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              {selectedItem.category === 'Renungan' && <BookOpen className="w-64 h-64" />}
              {selectedItem.category === 'Doa' && <Heart className="w-64 h-64" />}
              {selectedItem.category === 'Ayat' && <Quote className="w-64 h-64" />}
              {selectedItem.category === 'Akhir Zaman' && <AlertTriangle className="w-64 h-64" />}
            </div>

            <div className="space-y-4 relative">
              <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-widest border border-gold/20">
                {selectedItem.category}
              </span>
              <h2 className="text-3xl md:text-5xl font-serif leading-tight text-white">{selectedItem.title}</h2>
              <p className="text-white/50 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold" /> {selectedItem.readTime || '5 Menit Membaca'} • {selectedItem.author || 'Rey Simamora'}
              </p>
            </div>

            {selectedItem.verse && (
              <div className="bg-white/5 border-l-4 border-gold p-6 italic text-lg text-white/90 font-serif rounded-r-xl">
                "{selectedItem.verse}"
              </div>
            )}

            <div className="prose prose-invert max-w-none">
              <p className="text-lg md:text-xl text-white/85 leading-relaxed first-letter:text-5xl first-letter:font-serif first-letter:text-gold first-letter:mr-3 first-letter:float-left whitespace-pre-wrap">
                {selectedItem.content}
              </p>

              <div className="mt-12 pt-8 border-t border-white/10 space-y-3">
                <h4 className="text-gold font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Penjelasan & Aplikasi Praktis</span>
                </h4>
                <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
                  {selectedItem.explanation || 
                    'Pesan ini mengingatkan kita bahwa dalam setiap aspek kehidupan, Tuhan memiliki rencana yang indah. Mari kita terapkan nilai-nilai firman ini dalam tindakan nyata sehari-hari.'}
                </p>
              </div>
            </div>
          </article>
        </motion.div>
      );
    }

    // HOME TAB
    if (activeTab === 'Home') {
      return (
        <div className="space-y-12">
          {/* Hero Section with Admin Custom Banner */}
          <section className="relative rounded-3xl overflow-hidden aspect-[21/9] flex items-center justify-center text-center p-6 border border-white/10 shadow-2xl bg-black group">
            <img 
              src={appConfig.bannerImage} 
              alt="Banner Pelita Rohani"
              className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent" />
            
            {isAdmin && (
              <button
                onClick={() => setActiveTab('Dashboard Admin')}
                className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 border border-gold/40 text-gold text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg backdrop-blur-md"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Ganti Banner & Konten</span>
              </button>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative space-y-4 max-w-2xl px-4 z-10"
            >
              <span className="text-xs font-bold tracking-widest uppercase text-gold/90 px-3 py-1 bg-black/50 rounded-full border border-gold/30 backdrop-blur-sm">
                {appConfig.bannerLabel}
              </span>
              <h2 className="text-4xl md:text-5xl font-serif italic text-white drop-shadow-md">
                {appConfig.bannerTitle}
              </h2>
              <p className="text-white/80 max-w-lg mx-auto text-sm md:text-base font-serif drop-shadow">
                {appConfig.bannerSubtitle}
              </p>
            </motion.div>
          </section>

          {/* Quick Welcome for Authenticated Users */}
          {currentUser && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 px-6 flex items-center justify-between border-gold/20 bg-gradient-to-r from-gold/10 via-transparent to-transparent"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                  isAdmin ? 'bg-gold text-dark-bg' : 'bg-white/10 text-white'
                }`}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-white/50">Selamat datang di persekutuan firman,</p>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {currentUser.name}
                    {isAdmin && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-bold uppercase tracking-wider">
                        Administrator
                      </span>
                    )}
                  </h4>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setActiveTab('Dashboard Admin')}
                  className="text-xs font-bold text-gold hover:underline flex items-center gap-1"
                >
                  <span>Buka Dashboard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          )}

          {/* Dynamic Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              icon={<BookOpen className="w-5 h-5" />}
              title="Renungan"
              content={homeRenungan ? homeRenungan.description : 'Apapun yang terjadi, Tuhan tidak pernah meninggalkanmu. Tetap percaya dan berjalan dalam iman.'}
              onClick={() => {
                setActiveTab('Renungan');
                setSelectedItem(null);
              }}
              delay={0.1}
            />
            <Card 
              icon={<Quote className="w-5 h-5" />}
              title="Ayat Hari Ini"
              content={homeAyat ? `${homeAyat.verse ? `${homeAyat.verse} - ` : ''}${homeAyat.description}` : "Mazmur 119:105 - Firman-Mu adalah pelita bagi kakiku dan terang bagi jalanku."}
              highlight
              onClick={() => {
                setActiveTab('Ayat');
                setSelectedItem(null);
              }}
              delay={0.2}
            />
            <Card 
              icon={<Heart className="w-5 h-5" />}
              title="Doa"
              content={homeDoa ? homeDoa.description : 'Tuhan, kuatkan aku hari ini dan tuntun langkahku sesuai kehendak-Mu. Amin.'}
              onClick={() => {
                setActiveTab('Doa');
                setSelectedItem(null);
              }}
              delay={0.3}
            />
            <Card 
              icon={<AlertTriangle className="w-5 h-5" />}
              title="Akhir Zaman"
              content={homeAkhirZaman ? homeAkhirZaman.description : 'Berjaga-jagalah dan tetap setia, karena waktu Tuhan semakin dekat.'}
              onClick={() => {
                setActiveTab('Akhir Zaman');
                setSelectedItem(null);
              }}
              delay={0.4}
            />
          </div>

          {/* Featured Video Section */}
          <section className="glass-card p-6 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-500" />
                  <h3 className="text-xl font-bold font-serif text-white">Video Rohani & Khotbah Pilihan</h3>
                </div>
                <p className="text-white/60 text-xs sm:text-sm">
                  Tayangan khotbah yang meneguhkan, pujian penyembahan, dan pengajaran firman Tuhan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => setIsVideoEditorOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Video</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('Video')}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-gold/15 text-gold hover:text-gold-light border border-gold/30 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Lihat Semua ({videosList.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {videosList.slice(0, 3).map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => setActiveVideoModal(vid)}
                  className="glass-card overflow-hidden hover:border-gold/40 transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-video w-full bg-black overflow-hidden">
                    <img
                      src={getYoutubeThumbnail(vid.youtubeId)}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                      <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 ml-0.5 fill-white" />
                      </div>
                    </div>
                    {vid.duration && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono">
                        {vid.duration}
                      </span>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-600/80 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                      {vid.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      {vid.speaker && (
                        <p className="text-[11px] text-gold/80 flex items-center gap-1 font-semibold mb-1">
                          <User className="w-3 h-3" /> {vid.speaker}
                        </p>
                      )}
                      <h4 className="text-sm font-bold text-white group-hover:text-gold transition-colors line-clamp-2 leading-snug">
                        {vid.title}
                      </h4>
                      <p className="text-white/50 text-xs line-clamp-2 mt-1 leading-relaxed">
                        {vid.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gold font-bold">
                      <span className="flex items-center gap-1">
                        Putar Video <Play className="w-3 h-3 fill-gold" />
                      </span>
                      {vid.verse && (
                        <span className="text-[10px] text-white/40 font-serif italic truncate max-w-[100px]">
                          {vid.verse}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bible Search Section */}
          <section className="glass-card p-8 space-y-6 relative group">
            <div className="absolute top-0 left-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Search className="w-32 h-32" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gold">
                <Search className="w-5 h-5" />
                <h3 className="text-xl font-bold">Cari Ayat Alkitab</h3>
              </div>
              <p className="text-white/60 text-sm">Cari ayat berdasarkan topik, pergumulan, atau kutipan (contoh: "kekhawatiran", "kasih setia", "Yohanes 3:16").</p>
            </div>

            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Masukkan kata kunci atau topik Alkitab..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-gold/50 transition-colors text-white placeholder-white/30"
              />
              <button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-2 top-2 bottom-2 px-4 bg-gold text-dark-bg rounded-lg font-bold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>

            <AnimatePresence>
              {searchResults && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/5 rounded-xl p-6 border-l-4 border-gold-light"
                >
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gold-light/20 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-gold-light" />
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="text-white/90 leading-relaxed whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                        {searchResults.split('\n').map((line, i) => (
                          <p key={i} className={line.startsWith('[') ? 'font-bold text-gold' : ''}>
                            {line}
                          </p>
                        ))}
                      </div>
                      <div ref={searchEndRef} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* AI Guidance Section */}
          <section className="glass-card p-8 space-y-6 relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-32 h-32" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gold">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-xl font-bold">Tanya AI Rohani</h3>
              </div>
              <p className="text-white/60 text-sm">Konsultasikan pergumulan hidup atau pertanyaan Alkitab untuk mendapatkan dorongan rohani.</p>
            </div>

            <div className="relative">
              <input 
                type="text" 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Tanya tentang Alkitab atau pergumulan hidup..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-gold/50 transition-colors text-white placeholder-white/30"
              />
              <button 
                onClick={handleAsk}
                disabled={isLoading || !question.trim()}
                className="absolute right-2 top-2 bottom-2 px-4 bg-gold text-dark-bg rounded-lg font-bold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            <AnimatePresence>
              {answer && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/5 rounded-xl p-6 border-l-4 border-gold"
                >
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-gold" />
                    </div>
                    <div className="space-y-4 flex-1">
                      <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{answer}</p>
                      <div ref={chatEndRef} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      );
    }

    // VIDEO GALLERY PAGE
    if (activeTab === 'Video') {
      const filteredVideos = videosList.filter((vid) => {
        const matchCat = videoFilterCategory === 'Semua' || vid.category === videoFilterCategory;
        const matchSearch =
          vid.title.toLowerCase().includes(videoSearchTerm.toLowerCase()) ||
          vid.description.toLowerCase().includes(videoSearchTerm.toLowerCase()) ||
          (vid.speaker && vid.speaker.toLowerCase().includes(videoSearchTerm.toLowerCase())) ||
          (vid.verse && vid.verse.toLowerCase().includes(videoSearchTerm.toLowerCase()));
        return matchCat && matchSearch;
      });

      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Youtube className="w-7 h-7 text-red-500" />
                <h2 className="text-3xl font-serif text-white">Video & Khotbah Rohani</h2>
              </div>
              <p className="text-white/60 text-sm">
                Saksikan tayangan khotbah firman Tuhan, lagu pujian penyembahan, dan pengajaran akhir zaman.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsVideoEditorOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-red-600/20 shrink-0 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Video YouTube</span>
              </button>
            )}
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-wrap gap-1.5 flex-1">
              {(['Semua', 'Khotbah', 'Pujian', 'Renungan Video', 'Akhir Zaman', 'Kesaksian'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setVideoFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    videoFilterCategory === cat
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
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
                value={videoSearchTerm}
                onChange={(e) => setVideoSearchTerm(e.target.value)}
                placeholder="Cari video / pengkhotbah..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-400 placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredVideos.length === 0 ? (
              <div className="col-span-full glass-card p-12 text-center text-white/50 space-y-3">
                <Film className="w-12 h-12 mx-auto text-white/20" />
                <h4 className="text-lg font-serif font-bold text-white">Tidak ada video yang ditemukan</h4>
                <p className="text-xs text-white/50 max-w-md mx-auto">
                  Belum ada video dengan kategori ini atau sesuai kata kunci Anda.
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setIsVideoEditorOpen(true)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                  >
                    Tambah Video Sekarang
                  </button>
                )}
              </div>
            ) : (
              filteredVideos.map((vid, idx) => (
                <motion.div
                  key={vid.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setActiveVideoModal(vid)}
                  className="glass-card overflow-hidden hover:border-gold/40 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full bg-black overflow-hidden">
                    <img
                      src={getYoutubeThumbnail(vid.youtubeId)}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-0.5 fill-white" />
                      </div>
                    </div>
                    {vid.duration && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white/90 font-mono">
                        {vid.duration}
                      </span>
                    )}
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-red-600/80 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                      {vid.category}
                    </span>
                  </div>

                  {/* Body & Keterangan */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {vid.speaker && (
                          <span className="text-xs text-gold font-semibold flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> {vid.speaker}
                          </span>
                        )}
                        {vid.verse && (
                          <span className="text-xs text-white/50 font-serif italic truncate max-w-[150px]">
                            "{vid.verse}"
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors leading-snug">
                        {vid.title}
                      </h3>

                      <p className="text-white/60 text-xs line-clamp-3 leading-relaxed">
                        {vid.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs font-bold text-gold flex items-center gap-1.5 uppercase tracking-wider">
                        <Play className="w-3.5 h-3.5 fill-gold" /> Putar & Baca Keterangan
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      );
    }

    // CATEGORY LIST PAGES (Renungan, Ayat, Doa, Akhir Zaman)
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div className="space-y-1">
            <h2 className="text-3xl font-serif text-gold">{activeTab}</h2>
            <p className="text-white/60 text-sm">
              Kumpulan {activeTab.toLowerCase()} pilihan untuk menguatkan iman dan langkah perjalanan rohani Anda.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setQuickEditorItem(null);
                setIsQuickEditorOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gold text-dark-bg font-bold text-xs flex items-center gap-2 hover:bg-gold-light transition-all shadow-md shadow-gold/20 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah {activeTab} Baru</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5">
          {filteredContent.length === 0 ? (
            <div className="glass-card p-12 text-center text-white/50 space-y-3">
              <BookOpen className="w-10 h-10 mx-auto text-white/20" />
              <p>Belum ada konten untuk kategori {activeTab}.</p>
              {isAdmin && (
                <button
                  onClick={() => {
                    setQuickEditorItem(null);
                    setIsQuickEditorOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gold text-dark-bg font-bold text-xs"
                >
                  Tambah Konten Sekarang
                </button>
              )}
            </div>
          ) : (
            filteredContent.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={() => setSelectedItem(item)}
                className="glass-card p-6 flex flex-col md:flex-row gap-6 cursor-pointer hover:border-gold/40 transition-all group"
              >
                <div className="w-full md:w-44 h-32 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-gold/10 transition-colors border border-white/5">
                  {item.category === 'Renungan' && <BookOpen className="w-10 h-10 text-gold/40 group-hover:text-gold transition-colors" />}
                  {item.category === 'Doa' && <Heart className="w-10 h-10 text-gold/40 group-hover:text-gold transition-colors" />}
                  {item.category === 'Ayat' && <Quote className="w-10 h-10 text-gold/40 group-hover:text-gold transition-colors" />}
                  {item.category === 'Akhir Zaman' && <AlertTriangle className="w-10 h-10 text-gold/40 group-hover:text-gold transition-colors" />}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20">
                      {item.category}
                    </span>
                    {item.verse && (
                      <span className="text-xs text-white/40 font-serif italic">
                        "{item.verse}"
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-widest">
                      Baca Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs text-white/30">
                      {item.readTime || '5 Menit'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-gold/30">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-dark-bg/85 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => {
              setActiveTab('Home');
              setSelectedItem(null);
            }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-lg shadow-gold/20">
              <Sparkles className="w-4 h-4 text-dark-bg" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight gold-gradient leading-none">
                {appConfig.headerTitle}
              </h1>
              <p className="text-[10px] text-white/40 hidden sm:block">Pelita Rohani</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setActiveTab(item);
                  setSelectedItem(null);
                }}
                className={`text-sm font-medium transition-colors hover:text-gold py-1 ${
                  activeTab === item 
                    ? item === 'Dashboard Admin' 
                      ? 'text-gold font-bold px-3 py-1 rounded-lg bg-gold/15 border border-gold/30'
                      : 'text-gold border-b-2 border-gold font-bold' 
                    : item === 'Dashboard Admin'
                    ? 'text-gold/80 hover:text-gold px-2.5 py-1 rounded-lg bg-white/5 hover:bg-gold/10'
                    : 'text-white/60'
                }`}
              >
                {item === 'Dashboard Admin' ? (
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-gold" />
                    Dashboard Admin
                  </span>
                ) : (
                  item
                )}
              </button>
            ))}
          </nav>

          {/* Auth Status & Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
                  isAdmin 
                    ? 'bg-gold/10 border-gold/30 text-gold' 
                    : 'bg-white/5 border-white/10 text-white/80'
                }`}>
                  {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="font-semibold truncate max-w-[140px]">{currentUser.name}</span>
                </div>
                
                {isAdmin && activeTab !== 'Dashboard Admin' && (
                  <button
                    onClick={() => {
                      setActiveTab('Dashboard Admin');
                      setSelectedItem(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gold text-dark-bg font-bold text-xs hover:bg-gold-light transition-colors shadow-sm"
                  >
                    Dashboard
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  title="Keluar / Logout"
                  className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gold/15 hover:bg-gold text-gold hover:text-dark-bg border border-gold/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk / Daftar</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-white/60 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-dark-bg/95 backdrop-blur-xl pt-20 px-6 lg:hidden flex flex-col justify-between pb-8"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveTab(item);
                    setSelectedItem(null);
                    setIsMenuOpen(false);
                  }}
                  className={`text-xl font-serif text-left border-b border-white/5 pb-3 flex items-center justify-between ${
                    activeTab === item ? 'text-gold' : 'text-white'
                  }`}
                >
                  <span>{item}</span>
                  {item === 'Dashboard Admin' && <ShieldCheck className="w-4 h-4 text-gold" />}
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              {currentUser ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gold text-dark-bg font-bold flex items-center justify-center text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">{currentUser.name}</p>
                      <p className="text-[10px] text-white/50">{currentUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar dari Akun</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-gold text-dark-bg font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk / Daftar Akun</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-12 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 gold-gradient font-serif text-2xl">
            <Sparkles className="w-6 h-6 text-gold" />
            <span>{appConfig.headerTitle}</span>
          </div>
          <p className="text-white/40 text-sm">
            {appConfig.copyrightText}
          </p>
          <div className="flex justify-center gap-6 pt-2">
            {!currentUser && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-gold hover:underline text-xs font-semibold"
              >
                Masuk ke Akun
              </button>
            )}
            {currentUser && !isAdmin && (
              <span className="text-white/40 text-xs">Jemaat: {currentUser.name}</span>
            )}
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab('Dashboard Admin');
                  setSelectedItem(null);
                }}
                className="text-gold hover:underline text-xs font-bold flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Buka Dashboard Admin</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href={`https://wa.me/${appConfig.whatsappNumber || '6285191447806'}`} 
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-30 group"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute right-full mr-4 bg-white text-dark-bg px-3 py-1 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
          Hubungi Kami di WhatsApp
        </span>
      </a>

      {/* Auth Modal (Unified Login & Registration) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'admin') {
            setActiveTab('Dashboard Admin');
          }
        }}
      />

      {/* Quick Content Editor Modal */}
      <ContentEditorModal
        isOpen={isQuickEditorOpen}
        item={quickEditorItem}
        defaultCategory={activeTab === 'Home' || activeTab === 'Dashboard Admin' ? 'Renungan' : (activeTab as ContentCategory)}
        onClose={() => {
          setIsQuickEditorOpen(false);
          setQuickEditorItem(null);
        }}
        onSave={handleSaveQuickContent}
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        video={activeVideoModal}
        onClose={() => setActiveVideoModal(null)}
        whatsappNumber={appConfig.whatsappNumber}
      />

      {/* Video Editor Modal */}
      <VideoEditorModal
        isOpen={isVideoEditorOpen}
        video={null}
        onClose={() => setIsVideoEditorOpen(false)}
        onSave={async (savedVideo) => {
          const res = await storageService.saveSingleVideo(savedVideo);
          if (res.data) {
            setVideosList(res.data);
          } else {
            setVideosList([savedVideo, ...videosList]);
          }
        }}
      />
    </div>
  );
}

function Card({ 
  icon, 
  title, 
  content, 
  highlight = false, 
  delay = 0, 
  onClick 
}: { 
  icon: React.ReactNode, 
  title: string, 
  content: string, 
  highlight?: boolean,
  delay?: number,
  onClick?: () => void
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      onClick={onClick}
      className={`glass-card p-6 space-y-4 hover:border-gold/30 transition-colors group cursor-pointer ${
        highlight ? 'ring-1 ring-gold/20' : ''
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
        highlight ? 'bg-gold text-dark-bg' : 'bg-white/5 text-gold group-hover:bg-gold group-hover:text-dark-bg'
      }`}>
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className={`text-lg font-bold ${highlight ? 'text-gold' : 'text-white'}`}>{title}</h3>
        <p className="text-white/60 text-sm leading-relaxed line-clamp-3">{content}</p>
      </div>
      <div className="flex items-center gap-1 text-xs font-bold text-gold uppercase tracking-widest pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        Buka Halaman <ChevronRight className="w-3 h-3" />
      </div>
    </motion.div>
  );
}
