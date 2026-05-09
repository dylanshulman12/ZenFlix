"use client";

import { useSearchParams } from "next/navigation";
import "@videojs/react/video/skin.css";

import { createPlayer, videoFeatures } from "@videojs/react";
import { VideoSkin } from "@videojs/react/video";
import { HlsVideo } from "@videojs/react/media/hls-video";

export default function Stream() {
  const searchParams = useSearchParams();

  const movie_id = searchParams.get("path");

  

  const Player = createPlayer({
    features: videoFeatures,
  });

  const src = `/api/stream?path=${encodeURIComponent(movie_id)}`;

  return (
    <Player.Provider>
      <VideoSkin>
        <HlsVideo src={src} playsInline />
      </VideoSkin>
    </Player.Provider>
  );
}