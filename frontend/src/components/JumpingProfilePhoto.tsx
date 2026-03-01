import { useState } from 'react';
import { ProfilePhotoModal } from './ProfilePhotoModal';

interface JumpingProfilePhotoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function JumpingProfilePhoto({ size = 'md' }: JumpingProfilePhotoProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-primary/30 hover:border-primary/60 transition-all duration-300 cursor-pointer group relative focus:outline-none`}
        style={{
          animation: 'profile-bounce 1.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite alternate',
        }}
        title="View profile photo"
        aria-label="View profile photo"
      >
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm scale-110" />
        <img
          src="/assets/WhatsApp Image 2026-01-22 at 8.09.21 PM-1.jpeg"
          alt="Aswin S Nair"
          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300 relative z-10"
          draggable={false}
        />
      </button>

      <ProfilePhotoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
