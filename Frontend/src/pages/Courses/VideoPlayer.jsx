import React, { useState, useEffect } from "react";

/**
 * VideoPlayer Component
 * Reusable component to handle single/multiple video display
 * Supports YouTube, Vimeo, and custom URLs with safe iframe handling
 */
const VideoPlayer = ({ 
  videoUrl, 
  title = "Video", 
  description = "",
  isLoading = false 
}) => {
  const [embedUrl, setEmbedUrl] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!videoUrl) {
      setError(true);
      setEmbedUrl("");
      return;
    }

    setError(false);
    setEmbedUrl(formatVideoUrl(videoUrl));
  }, [videoUrl]);

  /**
   * Extract and format video URL for iframe embedding
   * Handles YouTube (youtube.com, youtu.be) and passthrough for others
   */
  const formatVideoUrl = (url) => {
    if (!url) return "";

    try {
      // YouTube: youtube.com/watch?v=VIDEO_ID
      const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
      const youtubeMatch = url.match(youtubeRegex);
      if (youtubeMatch && youtubeMatch[1]) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`;
      }

      // Vimeo: vimeo.com/VIDEO_ID
      const vimeoRegex = /vimeo\.com\/(\d+)/;
      const vimeoMatch = url.match(vimeoRegex);
      if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      }

      // Already embedded or custom URL
      if (url.includes("embed") || url.startsWith("http")) {
        return url;
      }

      return "";
    } catch (err) {
      console.error("[VideoPlayer] URL format error:", err);
      return "";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center animate-pulse">
        <div className="text-slate-500 dark:text-slate-400">Loading video...</div>
      </div>
    );
  }

  if (error || !embedUrl) {
    return (
      <div className="w-full aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 gap-3">
        <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-600">
          videocam_off
        </span>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium text-center max-w-xs">
          No video available
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Video Container */}
      <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg dark:shadow-premium-gold/5">
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          sandbox="allow-same-origin allow-scripts allow-presentation allow-popups"
          allowFullScreen
        />
      </div>

      {/* Video Metadata */}
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white line-clamp-2">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 line-clamp-3">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
