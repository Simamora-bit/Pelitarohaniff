import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, BookOpen, Quote, Heart, AlertTriangle, Sparkles } from 'lucide-react';
import { ContentItem, ContentCategory } from '../types';

interface ContentEditorModalProps {
  isOpen: boolean;
  item: ContentItem | null;
  defaultCategory?: ContentCategory;
  onClose: () => void;
  onSave: (savedItem: ContentItem) => void;
}

export const ContentEditorModal: React.FC<ContentEditorModalProps> = ({
  isOpen,
  item,
  defaultCategory = 'Renungan',
  onClose,
  onSave,
}) => {
  const [category, setCategory] = useState<ContentCategory>(defaultCategory);
  const [title, setTitle] = useState('');
  const [verse, setVerse] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [explanation, setExplanation] = useState('');
  const [author, setAuthor] = useState('Rey Simamora');
  const [readTime, setReadTime] = useState('5 Menit');
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setCategory(item.category);
      setTitle(item.title);
      setVerse(item.verse || '');
      setDescription(item.description);
      setContent(item.content);
      setExplanation(item.explanation || '');
      setAuthor(item.author || 'Rey Simamora');
      setReadTime(item.readTime || '5 Menit');
    } else {
      setCategory(defaultCategory);
      setTitle('');
      setVerse('');
      setDescription('');
      setContent('');
      setExplanation('');
      setAuthor('Rey Simamora');
      setReadTime('5 Menit');
    }
    setError('');
  }, [item, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !content.trim()) {
      setError('Judul, ringkasan singkat, dan isi konten wajib diisi.');
      return;
    }

    const savedItem: ContentItem = {
      id: item?.id || 'item_' + Date.now(),
      category,
      title: title.trim(),
      verse: verse.trim() ? verse.trim() : undefined,
      description: description.trim(),
      content: content.trim(),
      explanation: explanation.trim() ? explanation.trim() : undefined,
      author: author.trim() || 'Rey Simamora',
      readTime: readTime.trim() || '5 Menit',
      updatedAt: new Date().toISOString(),
    };

    onSave(savedItem);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-[#141414] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center border border-gold/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-white">
                  {item ? 'Ubah Konten' : 'Tambah Konten Baru'}
                </h3>
                <p className="text-xs text-white/60">
                  {item ? `Mengedit ID: ${item.id}` : 'Tambahkan renungan, doa, ayat, atau bahasan akhir zaman'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Kategori Konten
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Renungan', 'Ayat', 'Doa', 'Akhir Zaman'] as ContentCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      category === cat
                        ? 'bg-gold text-dark-bg border-gold shadow-md shadow-gold/10'
                        : 'bg-white/5 text-white/70 border-white/10 hover:border-gold/30'
                    }`}
                  >
                    {cat === 'Renungan' && <BookOpen className="w-3.5 h-3.5" />}
                    {cat === 'Ayat' && <Quote className="w-3.5 h-3.5" />}
                    {cat === 'Doa' && <Heart className="w-3.5 h-3.5" />}
                    {cat === 'Akhir Zaman' && <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Judul Konten <span className="text-gold">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Berjalan dalam Iman di Tengah Badai"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50"
              />
            </div>

            {/* Verse */}
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Ayat Alkitab / Referensi (Opsional)
              </label>
              <input
                type="text"
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                placeholder="Contoh: Mazmur 119:105 atau Yohanes 14:6"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Deskripsi Singkat / Ringkasan (untuk Kartu Utama) <span className="text-gold">*</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ringkasan 1-2 kalimat..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50"
              />
            </div>

            {/* Content Body */}
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Isi Lengkap Konten <span className="text-gold">*</span>
              </label>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan renungan, doa, atau firman secara lengkap dan mendalam..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50 leading-relaxed"
              />
            </div>

            {/* Explanation & Application */}
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Penjelasan & Aplikasi Praktis
              </label>
              <textarea
                rows={3}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Bagaimana jemaat mempraktikkan firman ini dalam kehidupan sehari-hari..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50 leading-relaxed"
              />
            </div>

            {/* Author & Read Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Penulis / Sumber
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Rey Simamora"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Estimasi Waktu Baca
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="5 Menit"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-light text-dark-bg font-bold text-sm flex items-center gap-2 hover:opacity-90 shadow-lg shadow-gold/20 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Konten</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
