import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, X, Play } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  itemName?: string;
  itemCategory?: string;
  thumbnailUrl?: string;
  confirmLabel?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  message = 'Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen dari server database online.',
  itemName,
  itemCategory,
  thumbnailUrl,
  confirmLabel = 'Ya, Hapus Video Ini',
  isDeleting = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-dark-card border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white leading-tight">
                  {title}
                </h3>
                <p className="text-xs text-red-400/90 font-medium mt-0.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Konfirmasi Penghapusan
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Item Preview Card */}
          {(itemName || thumbnailUrl) && (
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
              {thumbnailUrl && (
                <div className="relative w-20 aspect-video rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                  <img
                    src={thumbnailUrl}
                    alt={itemName || 'Preview'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 fill-white text-white" />
                  </div>
                </div>
              )}
              <div className="min-w-0 flex-1">
                {itemCategory && (
                  <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full inline-block mb-1 border border-red-500/20">
                    {itemCategory}
                  </span>
                )}
                <p className="text-xs font-bold text-white line-clamp-2 leading-snug">
                  {itemName}
                </p>
              </div>
            </div>
          )}

          {/* Warning Message */}
          <p className="text-xs text-white/70 leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/5">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-semibold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-red-600/30 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Menghapus...' : confirmLabel}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
