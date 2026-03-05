import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  audio?: unknown;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'loading' | 'ready' | 'exit'>('loading');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('ready'), 2500);
    const t2 = setTimeout(() => setPhase('exit'), 3200);
    const t3 = setTimeout(() => onComplete(), 3700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  useEffect(() => {
    if (phase !== 'ready') return;
    const handler = () => { setPhase('exit'); setTimeout(onComplete, 500); };
    window.addEventListener('keydown', handler);
    window.addEventListener('click', handler);
    return () => { window.removeEventListener('keydown', handler); window.removeEventListener('click', handler); };
  }, [phase, onComplete]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-wv-black select-none overflow-hidden"
      style={{ transition: 'opacity 0.6s ease-out', opacity: phase === 'exit' ? 0 : 1, pointerEvents: phase === 'exit' ? 'none' : 'auto' }}
    >
      {/* Ambient orbs on splash */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="relative flex flex-col items-center gap-10 z-10">

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative overflow-hidden">
            <h1
              className="font-sora font-semibold text-wv-text splash-reveal"
              style={{ fontSize: '3.5rem', letterSpacing: '0.2em', lineHeight: 1 }}
            >
              RASED
            </h1>
            {/* Beam sweep */}
            <div
              className="absolute inset-y-0 w-16 splash-beam"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(240,192,96,0.35), transparent)',
                width: 80,
                left: 0,
                top: 0,
              }}
            />
          </div>

          {/* Gold accent line */}
          <div
            className="splash-reveal"
            style={{
              width: 60,
              height: 1,
              background: 'linear-gradient(90deg, transparent, #f0c060, transparent)',
              animationDelay: '0.6s',
            }}
          />

          <p
            className="font-sora font-light text-wv-muted splash-reveal text-center"
            style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', animationDelay: '0.8s' }}
          >
            Jordan Situational Awareness
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex flex-col items-center gap-2.5" style={{ minHeight: 40 }}>
          {phase === 'loading' ? (
            <div className="flex items-center gap-2">
              <div
                className="w-1 h-1 rounded-full bg-wv-cyan animate-pulse"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-1 h-1 rounded-full bg-wv-cyan animate-pulse"
                style={{ animationDelay: '200ms' }}
              />
              <div
                className="w-1 h-1 rounded-full bg-wv-cyan animate-pulse"
                style={{ animationDelay: '400ms' }}
              />
            </div>
          ) : (
            <span
              className="font-mono text-wv-cyan text-center"
              style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}
            >
              ↵ &nbsp;press any key to enter
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

