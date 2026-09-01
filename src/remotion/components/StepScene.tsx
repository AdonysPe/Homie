import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { ReactNode } from 'react';

import { VIDEO_THEME } from '../theme';

interface StepSceneProps {
  index: number;
  title: string;
  caption: string;
  icon: ReactNode;
  accent: string;
}

export function StepScene({ index, title, caption, icon, accent }: StepSceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, config: { damping: 16, stiffness: 90, mass: 0.7 } });
  const translateY = interpolate(entrance, [0, 1], [70, 0]);
  const iconPop = spring({ frame: frame - 6, fps, config: { damping: 12, stiffness: 130 } });

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 44,
        padding: 96,
      }}
    >
      <div
        style={{
          transform: `scale(${iconPop})`,
          width: 260,
          height: 260,
          borderRadius: 72,
          background: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: VIDEO_THEME.clayDark,
          boxShadow: '0 30px 60px -30px rgba(42,37,33,0.35)',
        }}
      >
        {icon}
      </div>

      <div
        style={{
          opacity: entrance,
          transform: `translateY(${translateY}px)`,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 34,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: VIDEO_THEME.clay,
            fontWeight: 700,
          }}
        >
          Paso {index}
        </p>
        <h2
          style={{
            margin: '18px 0 0',
            fontSize: 86,
            lineHeight: 1.05,
            letterSpacing: -2,
            color: VIDEO_THEME.ink,
            fontWeight: 700,
          }}
        >
          {title}
        </h2>
        <p style={{ margin: '22px 0 0', fontSize: 40, color: VIDEO_THEME.inkSoft }}>{caption}</p>
      </div>
    </AbsoluteFill>
  );
}
