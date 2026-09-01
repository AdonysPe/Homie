import { Composition } from 'remotion';

import { RehomingStory } from './RehomingStory';
import { VIDEO_CONFIG } from './theme';

export function RemotionRoot() {
  return (
    <Composition
      id="RehomingStory"
      component={RehomingStory}
      durationInFrames={VIDEO_CONFIG.durationInFrames}
      fps={VIDEO_CONFIG.fps}
      width={VIDEO_CONFIG.width}
      height={VIDEO_CONFIG.height}
    />
  );
}
