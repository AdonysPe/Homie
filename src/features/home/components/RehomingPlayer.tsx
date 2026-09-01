'use client';

import { Player } from '@remotion/player';

import { RehomingStory } from '@/remotion/RehomingStory';
import { VIDEO_CONFIG } from '@/remotion/theme';

/**
 * Aislado en su propio módulo para que el bundle de Remotion
 * se cargue solo cuando alguien abre el video.
 */
export default function RehomingPlayer() {
  return (
    <Player
      component={RehomingStory}
      durationInFrames={VIDEO_CONFIG.durationInFrames}
      fps={VIDEO_CONFIG.fps}
      compositionWidth={VIDEO_CONFIG.width}
      compositionHeight={VIDEO_CONFIG.height}
      style={{ width: '100%', borderRadius: 20, overflow: 'hidden' }}
      autoPlay
      loop
      controls
      clickToPlay
    />
  );
}
