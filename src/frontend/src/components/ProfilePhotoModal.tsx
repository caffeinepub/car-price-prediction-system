import { X } from "lucide-react";
import { useEffect } from "react";

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfilePhotoModal({ isOpen, onClose }: ProfilePhotoModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      open
      className="fixed inset-0 z-[200] flex items-center justify-center photo-modal-backdrop bg-transparent p-0 m-0 max-w-none max-h-none w-full h-full border-0"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      aria-label="Profile photo"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 border border-white/30 flex items-center justify-center text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Photo */}
      <div
        className="relative z-10 photo-modal-image"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <img
          src="/assets/WhatsApp Image 2026-01-22 at 8.09.21 PM-1.jpeg"
          alt="Aswin S Nair"
          className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-2xl object-contain border border-white/20"
          draggable={false}
        />
        <p className="text-center text-white/80 text-sm mt-3 font-medium tracking-wide">
          ASWIN S NAIR
        </p>
      </div>
    </dialog>
  );
}
