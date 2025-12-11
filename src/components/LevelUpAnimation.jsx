import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Star } from 'lucide-react';

const LevelUpAnimation = ({ newLevel, isVisible, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isVisible) {
      // Generate random particles
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        delay: Math.random() * 0.5,
        duration: 1 + Math.random(),
      }));
      setParticles(newParticles);

      // Auto-complete after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background flash */}
          <motion.div
            className="absolute inset-0 bg-xp-green/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.5 }}
          />

          {/* Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 bg-xp-green rounded-full"
              initial={{ 
                x: 0, 
                y: 0, 
                scale: 0,
                opacity: 1 
              }}
              animate={{
                x: particle.x * 5,
                y: particle.y * 5,
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Stars */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute"
              initial={{ 
                scale: 0,
                rotate: 0,
                x: 0,
                y: 0,
              }}
              animate={{
                scale: [0, 1.5, 0],
                rotate: 360,
                x: Math.cos((i * Math.PI * 2) / 8) * 150,
                y: Math.sin((i * Math.PI * 2) / 8) * 150,
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                ease: 'easeOut',
              }}
            >
              <Star size={24} className="text-achievement-gold" fill="currentColor" />
            </motion.div>
          ))}

          {/* Main card */}
          <motion.div
            className="relative z-10 bg-dark-base/95 backdrop-blur-glass border-2 border-xp-green rounded-3xl p-12 shadow-glow-green"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ 
              scale: [0, 1.2, 1],
              rotate: [0, 10, 0],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              duration: 0.6,
              ease: 'easeOut',
            }}
          >
            {/* Lightning bolts */}
            <div className="absolute -top-8 -left-8">
              <motion.div
                animate={{ 
                  rotate: [0, 20, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              >
                <Zap size={48} className="text-xp-green" fill="currentColor" />
              </motion.div>
            </div>

            <div className="absolute -bottom-8 -right-8">
              <motion.div
                animate={{ 
                  rotate: [0, -20, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  delay: 0.25,
                }}
              >
                <Zap size={48} className="text-xp-green" fill="currentColor" />
              </motion.div>
            </div>

            {/* Content */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Trophy size={64} className="text-achievement-gold mx-auto mb-4" />
              </motion.div>

              <motion.h2
                className="text-4xl font-bold text-white"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Level Up!
              </motion.h2>

              <motion.div
                className="text-7xl font-bold text-xp-green"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {newLevel}
              </motion.div>

              <motion.p
                className="text-gray-300 text-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                You've reached level {newLevel}!
              </motion.p>

              <motion.div
                className="pt-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="inline-block px-6 py-2 bg-xp-gradient rounded-full text-white font-medium shadow-glow-green">
                  Keep grinding! 🎮
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpAnimation;
