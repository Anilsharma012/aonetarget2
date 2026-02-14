import React, { useState, useEffect } from 'react';
import { splashScreenAPI } from '../src/services/apiClient';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [splashData, setSplashData] = useState<any>({
    imageUrl: '/attached_assets/ChatGPT_Image_Feb_8,_2026,_05_51_58_PM_1770553325908.png',
    isActive: true
  });
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      setFadeOut(true);
      setTimeout(onComplete, 200);
    };

    const safetyTimeout = setTimeout(finish, 1500);

    splashScreenAPI.get().then(data => {
      if (completed) return;
      if (data && data.isActive !== false) {
        setSplashData(data);
        setTimeout(finish, Math.min(data.duration || 1200, 1500));
      } else {
        finish();
      }
    }).catch(() => {
      if (!completed) setTimeout(finish, 1000);
    });

    return () => clearTimeout(safetyTimeout);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 transition-opacity duration-200 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="w-full max-w-md mx-auto h-full max-h-screen bg-gradient-to-b from-[#0a1628] to-[#1A237E] flex items-center justify-center overflow-hidden shadow-2xl">
        {splashData.imageUrl ? (
          <img 
            src={splashData.imageUrl} 
            alt="Aone Target Institute" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-white">
            <img 
              src="/attached_assets/alonelogo_1770810181717.jpg" 
              alt="Aone Target Logo" 
              className="w-48 mx-auto mb-6"
            />
            <h1 className="text-3xl font-bold">Aone Target</h1>
            <p className="text-blue-200 mt-2">Institute Pvt. Ltd.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;
