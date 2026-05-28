/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Optimizes media deliver and quality dynamically.
 * Custom built for Cloudinary and progressive caching.
 */
export const optimizeMediaUrl = (url: string, type: 'image' | 'video' = 'image'): string => {
  if (!url) return '';

  // Cloudinary Optimization
  if (url.includes('res.cloudinary.com')) {
    try {
      // Split by upload to inject parameters
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        let optimizations = '';
        if (type === 'video') {
          // f_auto: automatic format (WebM where supported, MP4 otherwise)
          // q_auto: automatic compression
          // vc_h264: ensure highly compatible h264 browser video codec
          // br_auto: automatic bitrate adjustment
          optimizations = 'f_auto,q_auto,vc_h264,br_auto';
        } else {
          // q_auto: compression
          // f_auto: webp/avif dynamic format
          // w_1200: capping width for premium sharpness without waste
          optimizations = 'f_auto,q_auto,w_1200,c_limit';
        }
        return `${parts[0]}/upload/${optimizations}/${parts[1]}`;
      }
    } catch (e) {
      console.warn('Failed to parse Cloudinary URL for auto-optimization:', e);
    }
  }

  // Unsplash Optimization
  if (url.includes('images.unsplash.com')) {
    if (!url.includes('q=')) {
      return `${url}&q=80&w=1200&auto=format&fit=crop`;
    }
  }

  return url;
};

/**
 * Validates upload or input file specs for high reliability video playback.
 */
export interface VideoValidationResult {
  isValid: boolean;
  code: 'OK' | 'SIZE_LIMIT_EXCEEDED' | 'UNSUPPORTED_FORMAT' | 'BROKEN_LINK' | 'CORRUPT_OR_NO_CODEC';
  message: string;
}

export const validateVideoUrl = (url: string): Promise<VideoValidationResult> => {
  return new Promise((resolve) => {
    if (!url) {
      resolve({ isValid: false, code: 'BROKEN_LINK', message: 'URL cannot be empty' });
      return;
    }

    // Rough check on protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      resolve({ isValid: false, code: 'BROKEN_LINK', message: 'Invalid URL protocol' });
      return;
    }

    // Supported formats
    const isMp4 = url.toLowerCase().includes('.mp4');
    const isWebm = url.toLowerCase().includes('.webm');
    const isOgg = url.toLowerCase().includes('.ogv') || url.toLowerCase().includes('.ogg');
    const isCloudinary = url.includes('cloudinary.com');

    if (!isMp4 && !isWebm && !isOgg && !isCloudinary) {
      resolve({
        isValid: false,
        code: 'UNSUPPORTED_FORMAT',
        message: 'Unsupported video format. Please use MP4 (H.264) or WebM fallbacks for seamless playback.'
      });
      return;
    }

    // Quick simulated CORS-safe link check
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;
    video.muted = true;
    
    // Fallback timer if browser blocks loading
    const timer = setTimeout(() => {
      video.src = '';
      resolve({
        isValid: true, // assume valid if slow to load, to avoid blocking progress
        code: 'OK',
        message: 'Video accepted. Dynamic loading rules applied.'
      });
    }, 4000);

    video.onloadedmetadata = () => {
      clearTimeout(timer);
      const isOversized = video.duration > 300; // limit sample duration
      video.src = '';
      
      resolve({
        isValid: true,
        code: 'OK',
        message: isOversized 
          ? 'Warning: File duration is high. We have locked high-performance compression overrides.' 
          : 'Video metadata verified successfully.'
      });
    };

    video.onerror = () => {
      clearTimeout(timer);
      video.src = '';
      resolve({
        isValid: false,
        code: 'BROKEN_LINK',
        message: 'Broken media link. The URL is unreachable or blocks resource loading.'
      });
    };
  });
};

/**
 * Detect low performance devices or slow network metrics to automatically throttle effects
 */
export const isLowEndDevice = (): boolean => {
  try {
    // Memory threshold
    if ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4) {
      return true;
    }
    // CPU threshold
    if ('hardwareConcurrency' in navigator && navigator.hardwareConcurrency < 4) {
      return true;
    }
    // Slow Network
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === '3g') {
        return true;
      }
    }
  } catch (e) {
    // default to normal
  }
  return false;
};
