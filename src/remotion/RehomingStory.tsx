import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import { CameraIcon, ChatIcon, HomeHeartIcon, PawIcon } from '@/components/icons';
import { StepScene } from './components/StepScene';
import { VIDEO_THEME } from './theme';

function Background() {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 330], [0, -40]);

  return (
    <AbsoluteFill style={{ backgroundColor: VIDEO_THEME.cream }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(50% 45% at 25% ${30 + drift / 10}%, ${VIDEO_THEME.clayLight} 0%, transparent 70%),
             radial-gradient(45% 40% at 80% ${70 + drift / 12}%, ${VIDEO_THEME.sageLight} 0%, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
}

function TitleScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  const pawSpin = interpolate(frame, [0, 90], [-12, 6]);

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: 110 }}>
      <div style={{ transform: `rotate(${pawSpin}deg) scale(${enter})`, color: VIDEO_THEME.clay }}>
        <PawIcon size={150} />
      </div>
      <h1
        style={{
          margin: '46px 0 0',
          fontSize: 96,
          lineHeight: 1.02,
          letterSpacing: -3,
          textAlign: 'center',
          color: VIDEO_THEME.ink,
          fontWeight: 700,
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px)`,
        }}
      >
        En 3 pasos,
        <br />
        encuentra un nuevo hogar
      </h1>
    </AbsoluteFill>
  );
}

function ClosingScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 90 } });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 40 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          opacity: enter,
          transform: `scale(${interpolate(enter, [0, 1], [0.9, 1])})`,
          color: VIDEO_THEME.clay,
        }}
      >
        <PawIcon size={84} />
        <span style={{ fontSize: 104, fontWeight: 700, letterSpacing: -3, color: VIDEO_THEME.ink }}>
          Homie
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 46, color: VIDEO_THEME.inkSoft, textAlign: 'center' }}>
        Publicá a tu mascota en 3 minutos
      </p>
      <div
        style={{
          marginTop: 14,
          padding: '28px 62px',
          borderRadius: 999,
          background: VIDEO_THEME.clay,
          color: '#fff',
          fontSize: 44,
          fontWeight: 700,
          opacity: enter,
        }}
      >
        homie.pet
      </div>
    </AbsoluteFill>
  );
}

/** Pieza corta compartible: el mismo mensaje del hero, en 11 segundos. */
export function RehomingStory() {
  return (
    <AbsoluteFill style={{ fontFamily: VIDEO_THEME.fontFamily }}>
      <Background />

      <Sequence durationInFrames={90}>
        <TitleScene />
      </Sequence>

      <Sequence from={90} durationInFrames={60}>
        <StepScene
          index={1}
          title="Contanos cómo es"
          caption="Nombre, edad y carácter"
          accent={VIDEO_THEME.clayLight}
          icon={<ChatIcon size={130} />}
        />
      </Sequence>

      <Sequence from={150} durationInFrames={60}>
        <StepScene
          index={2}
          title="Subí sus fotos"
          caption="Con 2 o 3 alcanza"
          accent={VIDEO_THEME.sageLight}
          icon={<CameraIcon size={130} />}
        />
      </Sequence>

      <Sequence from={210} durationInFrames={60}>
        <StepScene
          index={3}
          title="Elegís su familia"
          caption="Vos decidís con quién sigue"
          accent="#F7E3B8"
          icon={<HomeHeartIcon size={130} />}
        />
      </Sequence>

      <Sequence from={270} durationInFrames={60}>
        <ClosingScene />
      </Sequence>
    </AbsoluteFill>
  );
}
