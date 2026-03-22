import React, { useState } from 'react';
import { BOT_AVATAR } from '../../configs/constants';

interface Avatar3DProps {
  src?: string;
  className?: string;
  fallback?: React.ReactNode;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({ src, className = '', fallback }) => {
  const [error, setError] = useState(false);

  const imageSrc = src || BOT_AVATAR;

  if (error || !imageSrc) {
    return fallback ? <>{fallback}</> : <div className={`bg-slate-800 ${className}`} />;
  }

  return (
    <img 
      src={imageSrc} 
      alt="Avatar" 
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
};
