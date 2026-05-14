import { useState, useEffect } from 'react';
import styles from './SplashScreen.module.css';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0); // 0: Logo reveal, 1: Text fade, 2: Exit

  useEffect(() => {
    // Sequence timing synced with ripple
    const timers = [
      setTimeout(() => setStage(1), 600),  // Show text
      setTimeout(() => setStage(2), 3500), // Start exit after ripple finishes
      setTimeout(() => onComplete(), 4200), // Finalize
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`${styles.splashOverlay} ${stage === 2 ? styles.exit : ''}`}>
      <div className={styles.logoContainer}>
        <div className={`${styles.iconWrapper} ${stage >= 0 ? styles.reveal : ''}`}>
          <img src="/logo-icon.png" alt="Kuditraka" className={styles.brandLogo} />
          <div className={styles.glow} />
        </div>
        <div className={`${styles.textWrapper} ${stage >= 1 ? styles.visible : ''}`}>
          <h1 className={styles.title}>KUDITRAKA.AI</h1>
          <div className={styles.dotTrack}>
            {[...Array(24)].map((_, i) => (
              <div 
                key={i} 
                className={styles.rippleDot} 
                style={{ '--index': i } as React.CSSProperties} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
