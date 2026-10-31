import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ExternalLink, 
  Share2, 
  MessageCircle, 
  Quote, 
  User, 
  Clock, 
  Sparkles, 
  Tag, 
  BookOpen,
  Film
} from 'lucide-react';
import { VideoItem } from '../types';
import { getYoutubeEmbedUrl } from '../services/storageService';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
  whatsappNumber?: string;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  whatsappNumber = '6285191447806',
}) => {
  if (!video) return null;

  const embedUrl = getYoutubeEmbedUrl(video.youtubeId, true);
  const watchUrl = video.youtubeUrl || `https://www.youtube.com/watch?v=${video.youtubeId}`;

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Saksikan video rohani "${video.title}"\n${video.speaker ? 'Pembicara: ' + video.speaker + '\n' : ''}${video.verse ? 'Ayat: ' + video.verse + '\n' : ''}\nTonton di: ${watchUrl}\n\n- Pelita Rohani`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-dark-card border border-gold/30 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-gold/15 text-gold border border-gold/30 text-xs font-bold uppercase tracking-wider">
                {video.category}
              </span>
              {video.duration && (
                <span className="text-white/50 text-xs flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gold" /> {video.duration}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka di YouTube Langsung"
                className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors text-xs flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4 text-red-400" />
                <span className="hidden sm:inline text-xs">Buka di YouTube</span>
              </a>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Embedded YouTube Player */}
          <div className="relative aspect-video w-full bg-black">
            <iframe
              src={embedUrl}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Video Information & Description Body */}
          <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
            {/* Title & Metadata */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white leading-tight">
                {video.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/60">
                {video.speaker && (
                  <div className="flex items-center gap-1.5 text-white/80">
                    <User className="w-4 h-4 text-gold" />
                    <span>{video.speaker}</span>
                  </div>
                )}
                {video.verse && (
                  <div className="flex items-center gap-1.5 text-gold">
                    <Quote className="w-4 h-4" />
                    <span>{video.verse}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Scripture Highlight Box (if available) */}
            {video.verse && (
              <div className="p-4 rounded-xl bg-gold/10 border-l-4 border-gold text-white/90 text-sm italic font-serif">
                "{video.verse}"
              </div>
            )}

            {/* Detailed Description / Keterangan */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Keterangan & Catatan Rohani</span>
              </h4>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                {video.description}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Bagikan ke WhatsApp</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
              >
                Tutup Video
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
