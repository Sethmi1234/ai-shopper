'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export const Hero3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate random particles
  const generateParticles = (): Particle[] => {
    return Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
  };

  const particles = generateParticles();

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle, idx) => (
          <motion.div
            key={idx}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              background: `radial-gradient(circle, rgba(167, 139, 250, 0.8), transparent)`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30 animate-pulse" />

      {/* Main content */}
      <div className="relative z-10 h-screen flex flex-col items-center justify-center px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center max-w-4xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-6"
          >
            <div className="px-4 py-2 glass-effect rounded-full border border-primary/40">
              <span className="text-sm font-medium text-primary">✨ Premium 3D Shopping Experience</span>
            </div>
          </motion.div>

          {/* Main heading with gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="gradient-text">
              Discover Your Perfect
            </span>
            <br />
            <span className="text-foreground">Product Today</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-foreground/80 mb-8 leading-relaxed"
          >
            Experience premium shopping with AI-powered recommendations and immersive 3D product views
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-background font-semibold rounded-lg shadow-lg shadow-primary/50 hover:shadow-primary/80 transition-all duration-300"
            >
              Start Shopping
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Floating 3D Card Preview */}
        <motion.div
          animate={{ y: [0, -20, 0], rotateZ: [0, 2, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
        >
          <div className="glass-effect-hover p-6 rounded-2xl w-80 shadow-2xl border border-secondary/30">
            <div className="aspect-square bg-gradient-to-br from-primary/40 to-secondary/40 rounded-xl mb-4 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="text-6xl"
              >
                🛍️
              </motion.div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Featured Product</h3>
            <p className="text-foreground/60 text-sm">Premium quality at amazing prices</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
