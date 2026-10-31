import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Youtube, 
  Play, 
  Save, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Film,
  User,
  Quote,
  Clock,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { VideoItem, VideoCategory } from '../types';
import { extractYouTubeId, getYoutubeThumbnail, getYoutubeEmbedUrl } from '../services/storageService';

interface VideoEditorModalProps {
  isOpen: boolean;
  video: VideoItem | null;
  onClose: () => void;
  onSave: (video: VideoItem) => void;
  onDelete?: (video: VideoItem) => void;
}

const CATEGORIES: VideoCategory[] = [
  'Khotbah',
  'Pujian',
  'Renungan Video',
  'Akhir Zaman',
  'Kesaksian'
];

export const VideoEditorModal: React.FC<VideoEditorModalProps> = ({
  isOpen,
  video,
  onClose,
  onSave,
  onDelete,
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [extractedId, setExtractedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<VideoCategory>('Khotbah');
  const [speaker, setSpeaker] = useState('');
  const [verse, setVerse] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (video) {
      setYoutubeUrl(video.youtubeUrl || `https://www.youtube.com/watch?v=${video.youtubeId}`);
      setExtractedId(video.youtubeId || extractYouTubeId(video.youtubeUrl));
      setTitle(video.title || '');
      setCategory(video.category || 'Khotbah');
      setSpeaker(video.speaker || '');
      setVerse(video.verse || '');
      setDuration(video.duration || '');
      setDescription(video.description || '');
      setIsFeatured(Boolean(video.isFeatured));
      setPreviewPlaying(false);
      setErrorMsg('');
    } else {
      setYoutubeUrl('');
      setExtractedId(null);
      setTitle('');
      setCategory('Khotbah');
      setSpeaker('');
      setVerse('');
      setDuration('');
      setDescription('');
      setIsFeatured(false);
      setPreviewPlaying(false);
      setErrorMsg('');
    }
  }, [video, isOpen]);

  // Handle URL change and extract YouTube ID
  const handleUrlChange = (value: string) => {
    setYoutubeUrl(value);
    const id = extractYouTubeId(value);
    setExtractedId(id);
    if (value.trim() && !id) {
      setErrorMsg('Format link YouTube tidak valid. Gunakan link youtube.com atau youtu.be');
    } else {
      setErrorMsg('');
    }
  };

  const handlePasteSample = (sampleUrl: string, sampleTitle: string, sampleCategory: VideoCategory, sampleSpeaker: string, sampleVerse: string, sampleDesc: string) => {
    setYoutubeUrl(sampleUrl);
    setExtractedId(extractYouTubeId(sampleUrl));
    setTitle(sampleTitle);
    setCategory(sampleCategory);
    setSpeaker(sampleSpeaker);
    setVerse(sampleVerse);
    setDescription(sampleDesc);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalId = extractedId || extractYouTubeId(youtubeUrl);
    
    if (!finalId) {
      setErrorMsg('Harap masukkan link URL YouTube yang valid terlebih dahulu.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Harap masukkan judul video.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Harap masukkan keterangan atau catatan ringkasan video.');
      return;
    }

    const savedVideo: VideoItem = {
      id: video?.id || `vid-${Date.now()}`,
      title: title.trim(),
      youtubeUrl: youtubeUrl.trim(),
      youtubeId: finalId,
      category,
      speaker: speaker.trim() || undefined,
      verse: verse.trim() || undefined,
      duration: duration.trim() || undefined,
      description: description.trim(),
      isFeatured,
      createdAt: video?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(savedVideo);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-dark-card border border-gold/30 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center">
                <Youtube className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white">
                  {video ? 'Edit Video YouTube' : 'Tambah Video YouTube Baru'}
                </h3>
                <p className="text-xs text-white/50">
                  Masukkan tautan video dan berikan keterangan renungan / khotbah
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Input URL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-400" />
                  Link URL YouTube <span className="text-red-400">*</span>
                </span>
                {extractedId && (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> ID: {extractedId}
                  </span>
                )}
              </label>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="Contoh: https://www.youtube.com/watch?v=kJQP7kiw5Fk atau https://youtu.be/..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 focus:border-gold focus:outline-none text-white text-sm placeholder:text-white/30"
                required
              />
              <p className="text-[11px] text-white/40">
                Mendukung link biasa (watch?v=), link pendek (youtu.be/), Shorts, maupun Embed.
              </p>
            </div>

            {/* Error notice */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Live Video Preview Box */}
            {extractedId && (
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gold flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" /> Pratinjau Video Terdeteksi
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewPlaying(!previewPlaying)}
                    className="px-2.5 py-1 rounded-lg bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-gold" />
                    <span>{previewPlaying ? 'Tutup Player' : 'Uji Putar Video'}</span>
                  </button>
                </div>

                {previewPlaying ? (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-white/20">
                    <iframe
                      src={getYoutubeEmbedUrl(extractedId, true)}
                      title="YouTube preview player"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden group cursor-pointer border border-white/10"
                       onClick={() => setPreviewPlaying(true)}>
                    <img
                      src={getYoutubeThumbnail(extractedId)}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/25 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-1 fill-white" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white/90">
                      Klik untuk uji putar
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Sample Links */}
            {!video && !extractedId && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <p className="text-[11px] text-white/60 font-semibold">Contoh video siap pakai (Klik untuk coba):</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handlePasteSample(
                      'https://www.youtube.com/watch?v=y5r_qQjH8G4',
                      'Waktu Tuhan Pasti yang Terbaik - Pujian Rohani',
                      'Pujian',
                      'NDC Worship',
                      'Pengkhotbah 3:11',
                      'Lagu penyembahan yang mengingatkan kita untuk selalu menaruh pengharapan pada waktu dan kedaulatan Tuhan.'
                    )}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-gold/20 hover:text-gold text-xs text-white/80 transition-colors"
                  >
                    🎵 Pujian: Waktu Tuhan
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePasteSample(
                      'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
                      'Khotbah: Jangan Takut Menghadapi Masa Sulit',
                      'Khotbah',
                      'Ps. Philip Mantofa',
                      'Yesaya 41:10',
                      'Pesan firman Tuhan yang membakar iman kita agar tidak gentar saat badai hidup melanda.'
                    )}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-gold/20 hover:text-gold text-xs text-white/80 transition-colors"
                  >
                    📖 Khotbah: Jangan Takut
                  </button>
                </div>
              </div>
            )}

            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-white/80 uppercase tracking-wider">
                  Judul Video <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Khotbah Kuasa Doa di Masa Sukar"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 focus:border-gold focus:outline-none text-white text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/80 uppercase tracking-wider">
                  Kategori Video
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as VideoCategory)}
                  className="w-full px-3 py-2.5 rounded-xl bg-dark-bg border border-white/15 focus:border-gold focus:outline-none text-white text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-dark-card text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Speaker & Bible Verse & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gold" />
                  Pembicara / Pengkhotbah
                </label>
                <input
                  type="text"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  placeholder="Contoh: Ps. Philip Mantofa"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 focus:border-gold focus:outline-none text-white text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                  <Quote className="w-3.5 h-3.5 text-gold" />
                  Ayat Referensi
                </label>
                <input
                  type="text"
                  value={verse}
                  onChange={(e) => setVerse(e.target.value)}
                  placeholder="Contoh: Mazmur 91:1-2"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 focus:border-gold focus:outline-none text-white text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gold" />
                  Perkiraan Durasi
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Contoh: 25 Menit"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 focus:border-gold focus:outline-none text-white text-sm"
                />
              </div>
            </div>

            {/* Description / Keterangan */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center justify-between">
                <span>
                  Keterangan & Catatan Renungan Video <span className="text-red-400">*</span>
                </span>
                <span className="text-[11px] font-normal text-white/40">
                  Ringkasan isi, pesan rohani, atau poin khotbah
                </span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Tuliskan keterangan lengkap tentang video ini, intisari khotbah, aplikasi iman bagi jemaat, atau doa berkat yang disampaikan dalam video..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 focus:border-gold focus:outline-none text-white text-sm leading-relaxed resize-y"
                required
              />
            </div>

            {/* Featured toggle */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-gold/30 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-gold focus:ring-gold bg-dark-bg border-white/30"
              />
              <div className="flex-1">
                <span className="text-xs font-bold text-white block">
                  Tampilkan sebagai Video Unggulan di Halaman Utama (Home)
                </span>
                <span className="text-[11px] text-white/50 block">
                  Video ini akan langsung terlihat dan dapat disetel oleh jemaat saat pertama kali membuka aplikasi.
                </span>
              </div>
            </label>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              {video && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(video);
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-red-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Video Ini</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-dark-bg font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-gold/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{video ? 'Simpan Perubahan' : 'Buat & Terbitkan Video'}</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
