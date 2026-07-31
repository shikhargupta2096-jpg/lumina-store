import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * ImageWithSkeleton - Lazy-loads images with either a blur-up
 * placeholder (LQIP) or a shimmer skeleton.
 * 
 * @param {string} src - Full image URL
 * @param {string} alt - Alt text
 * @param {string} blurSrc - Optional tiny base64 LQIP data URI
 * @param {string} className - CSS class for the container
 * @param {object} style - Additional inline styles
 */
const ImageWithSkeleton = ({ src, alt, blurSrc, className, style }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div 
      style={{ position: 'relative', overflow: 'hidden', ...style }} 
      className={className}
    >
      {/* Layer 1: Blur-up placeholder OR shimmer skeleton */}
      {!loaded && (
        blurSrc ? (
          <img
            src={blurSrc}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(20px)',
              transform: 'scale(1.1)', // Prevent blur edge artifacts
              display: 'block',
            }}
          />
        ) : (
          <div 
            className="skeleton" 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%',
              borderRadius: 'inherit'
            }} 
          />
        )
      )}
      
      {/* Layer 2: Full quality image, fades in once loaded */}
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </div>
  );
};

export default ImageWithSkeleton;
