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
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ease-out ${
        fadeOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
      style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1A237E 50%, #303F9F 100%)', backgroundSize: '200% 200%', animation: 'splashGradient 3s ease infinite' }}
    >
      <style>{`@keyframes splashGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>
      <div className="w-full max-w-md mx-auto h-full max-h-screen flex items-center justify-center overflow-hidden relative">
        {splashData.imageUrl ? (
          <img
            src={splashData.imageUrl}
            alt="Aone Target Institute"
            className="w-full h-full object-cover animate-fade-in"
          />
        ) : (
          <div className="text-center text-white animate-fade-in-up">
            <div className="w-28 h-28 mx-auto mb-6 rounded-3xl overflow-hidden shadow-elevated ring-4 ring-white/10">
              <img
                src="/attached_assets/alonelogo_1770810181717.jpg"
                alt="Aone Target Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Aone Target</h1>
            <p className="text-blue-200/80 mt-1 text-sm font-medium">Institute Pvt. Ltd.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;
