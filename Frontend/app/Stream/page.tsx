"use client";

import { useSearchParams } from "next/navigation";
import "@videojs/react/video/skin.css";

import '@videojs/react/video/skin.css';
import { createPlayer, videoFeatures } from '@videojs/react';
import { VideoSkin, Video } from '@videojs/react/video';
import { useEffect, useState } from "react";


export default function Stream() {
  const searchParams = useSearchParams();

  const movie_path = searchParams.get("path");
  console.log(movie_path)
  
  
  const videoSrc = movie_path 
    ? `http://127.0.0.1:8000/api/stream?path=${encodeURIComponent(movie_path)}`
    : null;

  const Player = createPlayer({ features: videoFeatures });

  return (
    <Player.Provider>
      <VideoSkin>
        {/* 2. Pass the string URL directly. The browser handles the "fetch" logic internally */}
        {videoSrc && <Video src={videoSrc} playsInline />}
      </VideoSkin>
    </Player.Provider>
    );
  };
    

