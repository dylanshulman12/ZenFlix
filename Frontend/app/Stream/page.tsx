"use client"

import { useSearchParams } from 'next/navigation';
import '@videojs/react/video/skin.css';
import { createPlayer, videoFeatures } from '@videojs/react';
import { VideoSkin, Video } from '@videojs/react/video';

export default function VideoPage() {
  const searchParams = useSearchParams();
  const moviePath = searchParams.get("path");
  const Player = createPlayer({ features: videoFeatures });
  
  
  
  return (
    <Player.Container style={{ width: 1100, aspectRatio: '16/9' }}>
    <Player.Provider>
      <VideoSkin>
        <Video src={`/api/stream?file_path=${encodeURIComponent(moviePath)}`} playsInline />
      </VideoSkin>
    </Player.Provider>
    </Player.Container>
  );
};

