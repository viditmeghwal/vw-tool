import React, { useState, useRef, useEffect } from 'react';

/**
 * VideoDemo Component
 * 
 * Displays autoplay looping videos like brandstrategist.ai
 * Supports MP4 and WebM formats with poster fallback
 */

export function VideoDemo({ 
  src, 
  poster, 
  caption, 
  maxWidth = '700px',
  autoPlay = true,
  controls = false,
  className = ''
}) {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoad = () => setIsLoaded(true);
    const handleError = () => setHasError(true);

    video.addEventListener('loadeddata', handleLoad);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoad);
      video.removeEventListener('error', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className={`video-demo-error ${className}`}>
        <p>Video unavailable</p>
      </div>
    );
  }

  return (
    <figure className={`video-demo ${className}`} style={{ maxWidth }}>
      <div className="video-wrapper">
        {!isLoaded && poster && (
          <div className="video-loading">
            <img src={poster} alt="Video loading..." />
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay={autoPlay}
          loop
          muted
          playsInline
          poster={poster}
          controls={controls}
          className="video-demo-player"
        >
          <source src={`${src}.webm`} type="video/webm" />
          <source src={`${src}.mp4`} type="video/mp4" />
          Your browser doesn't support video playback.
        </video>
      </div>
      
      {caption && (
        <figcaption className="video-caption">{caption}</figcaption>
      )}

      <style jsx>{`
        .video-demo {
          margin: 32px auto;
          text-align: center;
        }
        
        .video-wrapper {
          position: relative;
          width: 100%;
          background: var(--paper-warm);
          border: 0.5px solid var(--rule-strong);
          overflow: hidden;
        }
        
        .video-loading {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        
        .video-loading img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .video-demo-player {
          width: 100%;
          height: auto;
          display: block;
          position: relative;
          z-index: 2;
        }
        
        .video-caption {
          margin-top: 12px;
          font-size: 13px;
          line-height: 1.5;
          color: var(--muted);
          font-family: var(--serif);
          font-style: italic;
        }
        
        .video-demo-error {
          padding: 40px;
          background: var(--paper-warm);
          border: 0.5px solid var(--rule);
          text-align: center;
          color: var(--muted);
          font-size: 13px;
        }
        
        @media (max-width: 720px) {
          .video-demo {
            margin: 24px auto;
          }
        }
      `}</style>
    </figure>
  );
}

/**
 * HeroVideo Component
 * 
 * Large hero video for welcome screen
 */
export function HeroVideo({ src = '/videos/hero-demo' }) {
  return (
    <div className="hero-video-section">
      <VideoDemo
        src={src}
        poster={`${src}-poster.jpg`}
        maxWidth="900px"
        className="hero-video"
      />
      
      <style jsx>{`
        .hero-video-section {
          margin: 60px 0;
        }
        
        @media (max-width: 720px) {
          .hero-video-section {
            margin: 40px 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * FeatureDemo Component
 * 
 * Inline feature demonstration video
 */
export function FeatureDemo({ 
  title, 
  description, 
  videoSrc, 
  poster 
}) {
  return (
    <div className="feature-demo">
      {title && <h3 className="feature-title">{title}</h3>}
      {description && <p className="feature-description">{description}</p>}
      
      <VideoDemo
        src={videoSrc}
        poster={poster}
        maxWidth="600px"
      />
      
      <style jsx>{`
        .feature-demo {
          margin: 40px 0;
          padding: 32px 0;
          border-top: 0.5px solid var(--rule);
          border-bottom: 0.5px solid var(--rule);
        }
        
        .feature-title {
          font-family: var(--serif);
          font-size: 24px;
          font-weight: 400;
          margin-bottom: 12px;
          text-align: center;
        }
        
        .feature-description {
          text-align: center;
          color: var(--muted);
          margin-bottom: 24px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          font-size: 14px;
          line-height: 1.6;
        }
        
        @media (max-width: 720px) {
          .feature-demo {
            margin: 24px 0;
            padding: 24px 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * StepDemo Component
 * 
 * Small inline demo within a step
 */
export function StepDemo({ videoSrc, caption }) {
  return (
    <div className="step-demo">
      <VideoDemo
        src={videoSrc}
        poster={`${videoSrc}-poster.jpg`}
        maxWidth="500px"
        caption={caption}
      />
      
      <style jsx>{`
        .step-demo {
          margin: 20px 0;
          padding: 20px;
          background: var(--paper-warm);
        }
        
        @media (max-width: 720px) {
          .step-demo {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default VideoDemo;
